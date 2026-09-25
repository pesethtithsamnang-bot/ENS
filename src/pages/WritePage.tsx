import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useReaderAuth } from '../context/ReaderAuthContext'
import { useCategories } from '../features/categories/hooks'
import { useSiteSettings } from '../features/settings/hooks'
import {
  useMyArticleById,
  useSubmitArticle,
  useUpdateMyArticle,
  useUploadArticleCover,
  useUploadArticleImage,
} from '../features/contributor/hooks'
import { newBlock, newImageBlock, type ArticleReference, type PostBlock } from '../features/posts/blocks'
import { ArticleBody } from '../features/posts/components/ArticleBody'
import { BlockEditorRow } from '../features/contributor/components/BlockEditorRow'
import { ReferencesEditor } from '../features/contributor/components/ReferencesEditor'
import { TagsInput } from '../features/contributor/components/TagsInput'
import { Button } from '../components/ui'
import { FileDropzone } from '../components/ui/FileDropzone'

const BLOCK_BUTTONS: { type: PostBlock['type']; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'heading1', label: 'H1' },
  { type: 'heading2', label: 'H2' },
  { type: 'heading3', label: 'H3' },
  { type: 'quote', label: 'Quote' },
  { type: 'list', label: 'List' },
  { type: 'table', label: 'Table' },
  { type: 'code', label: 'Code' },
  { type: 'callout', label: 'Callout' },
  { type: 'video', label: 'Embed' },
  { type: 'divider', label: 'Divider' },
]

type FormState = {
  title: string
  excerpt: string
  categoryId: string
  coverImageUrl: string
  blocks: PostBlock[]
  tags: string[]
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  references: ArticleReference[]
  scheduledDate: string
}

const EMPTY_FORM: FormState = {
  title: '',
  excerpt: '',
  categoryId: '',
  coverImageUrl: '',
  blocks: [newBlock('text')],
  tags: [],
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  references: [],
  scheduledDate: '',
}

function draftKey(id: string | undefined) {
  return `ens_article_draft_${id ?? 'new'}`
}

export function WritePage() {
  const { id } = useParams()
  const isEditing = !!id
  const { session } = useReaderAuth()
  const navigate = useNavigate()
  const { data: categories } = useCategories()
  const { data: settings } = useSiteSettings()
  const uploadCover = useUploadArticleCover()
  const uploadImage = useUploadArticleImage()
  const submitArticle = useSubmitArticle()
  const updateArticle = useUpdateMyArticle()
  const { data: existing } = useMyArticleById(id)

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [showSeo, setShowSeo] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [done, setDone] = useState<'pending' | 'published' | 'scheduled' | 'draft' | null>(null)
  const [loadedExisting, setLoadedExisting] = useState(false)

  // ---------- load an existing article for editing, or restore an autosaved local draft ----------
  useEffect(() => {
    if (isEditing) {
      if (existing && !loadedExisting) {
        setForm({
          title: existing.title_en,
          excerpt: existing.excerpt ?? '',
          categoryId: existing.category_id,
          coverImageUrl: existing.cover_image_url ?? '',
          blocks: Array.isArray(existing.content_blocks) && existing.content_blocks.length > 0 ? (existing.content_blocks as PostBlock[]) : [newBlock('text')],
          tags: existing.tags ?? [],
          seoTitle: existing.seo_title ?? '',
          seoDescription: existing.seo_description ?? '',
          canonicalUrl: existing.canonical_url ?? '',
          references: Array.isArray(existing.references) ? (existing.references as ArticleReference[]) : [],
          scheduledDate: existing.scheduled_at ? existing.scheduled_at.slice(0, 16) : '',
        })
        setLoadedExisting(true)
      }
    } else {
      const saved = localStorage.getItem(draftKey(undefined))
      if (saved) {
        try {
          setForm(JSON.parse(saved))
        } catch {
          // ignore corrupted draft
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, isEditing])

  // ---------- autosave to the browser every couple seconds ----------
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(id), JSON.stringify(form))
        setLastSaved(new Date())
      } catch {
        // storage full or disabled - not critical, just skip
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [form, id])

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-sm text-grey">
        <Link to="/signin" className="font-semibold text-red-dark">Sign in</Link> to write an article.
      </div>
    )
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateBlock(blockId: string, changes: Partial<PostBlock>) {
    update('blocks', form.blocks.map((b) => (b.id === blockId ? ({ ...b, ...changes } as PostBlock) : b)))
  }
  function moveBlock(index: number, dir: -1 | 1) {
    const next = [...form.blocks]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    update('blocks', next)
  }
  function duplicateBlock(index: number) {
    const copy = { ...form.blocks[index], id: crypto.randomUUID?.() ?? String(Math.random()) } as PostBlock
    const next = [...form.blocks]
    next.splice(index + 1, 0, copy)
    update('blocks', next)
  }
  function removeBlock(blockId: string) {
    update('blocks', form.blocks.filter((b) => b.id !== blockId))
  }

  function validate(): string | null {
    if (!form.title.trim()) return 'Give your article a title.'
    if (!form.categoryId) return 'Choose a category.'
    if (!form.coverImageUrl) return 'A featured image is required.'
    return null
  }

  async function handleSave(mode: 'draft' | 'publish') {
    setError(null)
    if (!session) return
    if (mode === 'publish') {
      const validationError = validate()
      if (validationError) return setError(validationError)
    } else if (!form.title.trim()) {
      return setError('Give your article a title before saving.')
    }

    const autoApprove = settings?.auto_approve_contributor_posts ?? false
    const scheduledAt = form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null
    const input = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      categoryId: form.categoryId,
      coverImageUrl: form.coverImageUrl,
      contentBlocks: form.blocks,
      tags: form.tags,
      seoTitle: form.seoTitle.trim(),
      seoDescription: form.seoDescription.trim(),
      canonicalUrl: form.canonicalUrl.trim(),
      references: form.references,
      scheduledAt: mode === 'publish' ? scheduledAt : null,
    }

    setSaving(mode)
    try {
      if (isEditing && id) {
        const status = mode === 'draft' ? 'draft' : scheduledAt ? 'scheduled' : autoApprove ? 'published' : 'pending_review'
        await updateArticle.mutateAsync({ id, input, status })
        setDone(mode === 'draft' ? 'draft' : status === 'scheduled' ? 'scheduled' : status === 'published' ? 'published' : 'pending')
      } else {
        if (mode === 'draft') {
          await submitArticle.mutateAsync({ ...input, authorReaderId: session.user.id, autoApprove: false, scheduledAt: null })
          setDone('draft')
        } else {
          const result = await submitArticle.mutateAsync({ ...input, authorReaderId: session.user.id, autoApprove })
          setDone(result.status === 'scheduled' ? 'scheduled' : result.status === 'published' ? 'published' : 'pending')
        }
      }
      localStorage.removeItem(draftKey(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your article.')
    } finally {
      setSaving(null)
    }
  }

  if (done) {
    const messages = {
      draft: { title: 'Saved as draft', body: "You'll find it on your profile whenever you're ready to keep working on it." },
      pending: { title: 'Submitted for review', body: "Your article is waiting for a quick review before it goes live." },
      published: { title: 'Published', body: 'Your article is live on the site now.' },
      scheduled: { title: 'Scheduled', body: 'Your article will go live automatically at the time you chose.' },
    }
    const m = messages[done]
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-ink">{m.title}</h1>
        <p className="mb-6 text-sm text-grey">{m.body}</p>
        <Button onClick={() => navigate('/profile')}>Go to your profile</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ---------- top header ---------- */}
      <div className="sticky top-0 z-30 border-b border-[#e5e5e5] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
          <Link to="/profile" className="text-sm font-medium text-grey hover:text-ink">&larr; Back to articles</Link>
          <div className="flex items-center gap-3 text-xs text-grey">
            {lastSaved && <span>Saved {lastSaved.toLocaleTimeString()}</span>}
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="rounded-full border border-[#d8dbe2] bg-white px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface"
            >
              {showPreview ? 'Back to editing' : 'Preview'}
            </button>
            <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving !== null}>
              {saving === 'draft' ? 'Saving...' : 'Save draft'}
            </Button>
            <Button onClick={() => handleSave('publish')} disabled={saving !== null}>
              {saving === 'publish' ? 'Publishing...' : isEditing ? 'Update' : 'Publish'}
            </Button>
          </div>
        </div>
        {error && <div className="border-t border-red-dark/20 bg-[#FBEAEC] px-6 py-2 text-center text-sm font-medium text-red-dark">{error}</div>}
      </div>

      {showPreview ? (
        <div className="mx-auto max-w-3xl px-6 py-12">
          {form.coverImageUrl && <img src={form.coverImageUrl} alt="" className="mb-6 aspect-video w-full rounded-lg object-cover" />}
          <h1 className="mb-2 text-3xl font-bold text-ink md:text-4xl">{form.title || 'Untitled article'}</h1>
          {form.excerpt && <p className="mb-6 text-lg text-grey">{form.excerpt}</p>}
          <ArticleBody blocks={form.blocks} />
        </div>
      ) : (
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
          {/* ---------- main writing canvas ---------- */}
          <div className="mx-auto w-full max-w-[720px]">
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Article title"
              className="mb-3 w-full border-none bg-transparent text-4xl font-bold text-ink outline-none placeholder:text-[#c4c4c4]"
            />
            <input
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              placeholder="Add a one-line subtitle or excerpt..."
              className="mb-6 w-full border-none bg-transparent text-lg text-grey outline-none placeholder:text-[#c4c4c4]"
            />

            <div className="mb-8">
              {form.coverImageUrl ? (
                <div className="relative">
                  <img src={form.coverImageUrl} alt="" className="aspect-video w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => update('coverImageUrl', '')}
                    className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-sm"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <FileDropzone
                  accept="image/*"
                  label="Featured image (required)"
                  onFile={async (file) => update('coverImageUrl', await uploadCover.mutateAsync(file))}
                />
              )}
            </div>

            <div className="flex flex-col gap-3">
              {form.blocks.map((block, i) => (
                <BlockEditorRow
                  key={block.id}
                  block={block}
                  isFirst={i === 0}
                  isLast={i === form.blocks.length - 1}
                  onChange={(changes) => updateBlock(block.id, changes)}
                  onMoveUp={() => moveBlock(i, -1)}
                  onMoveDown={() => moveBlock(i, 1)}
                  onDuplicate={() => duplicateBlock(i)}
                  onRemove={() => removeBlock(block.id)}
                  uploadImage={(file) => uploadImage.mutateAsync(file)}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {BLOCK_BUTTONS.map((b) => (
                <button
                  key={b.type}
                  type="button"
                  onClick={() => update('blocks', [...form.blocks, newBlock(b.type)])}
                  className="rounded-lg border border-[#d8dbe2] bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface"
                >
                  + {b.label}
                </button>
              ))}
              <label className="cursor-pointer rounded-lg border border-[#d8dbe2] bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface">
                + Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = await uploadImage.mutateAsync(file)
                    update('blocks', [...form.blocks, newImageBlock(url)])
                  }}
                />
              </label>
            </div>
          </div>

          {/* ---------- settings sidebar ---------- */}
          <aside className="flex flex-col gap-6">
            <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Category</h3>
              <select
                value={form.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                <option value="">Select a category</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Tags</h3>
              <TagsInput tags={form.tags} onChange={(tags) => update('tags', tags)} />
            </div>

            <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Schedule (optional)</h3>
              <input
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => update('scheduledDate', e.target.value)}
                className="w-full rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
              <p className="mt-1.5 text-xs text-grey">Leave blank to publish immediately when you click Publish.</p>
            </div>

            <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">References &amp; sources</h3>
              <ReferencesEditor references={form.references} onChange={(refs) => update('references', refs)} />
            </div>

            <div className="rounded-lg border border-[#e5e5e5] bg-white p-4">
              <button type="button" onClick={() => setShowSeo((v) => !v)} className="flex w-full items-center justify-between text-sm font-semibold text-ink">
                SEO settings
                <span className="text-grey">{showSeo ? '-' : '+'}</span>
              </button>
              {showSeo && (
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    value={form.seoTitle}
                    onChange={(e) => update('seoTitle', e.target.value)}
                    placeholder="SEO title (optional)"
                    className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) => update('seoDescription', e.target.value)}
                    placeholder="SEO description (optional)"
                    className="min-h-16 rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                  <input
                    value={form.canonicalUrl}
                    onChange={(e) => update('canonicalUrl', e.target.value)}
                    placeholder="Canonical URL (optional)"
                    className="rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
