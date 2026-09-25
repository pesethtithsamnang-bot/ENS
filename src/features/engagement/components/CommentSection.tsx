import { useState, type FormEvent } from 'react'
import { useReaderAuth } from '../../../context/ReaderAuthContext'
import { Button } from '../../../components/ui'
import { useAddComment, useComments } from '../hooks'

export function CommentSection({ postId }: { postId: string }) {
  const { session } = useReaderAuth()
  const { data: comments, isLoading } = useComments(postId)
  const addComment = useAddComment(postId)
  const [body, setBody] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!session) {
      window.location.href = '/signin'
      return
    }
    if (!body.trim()) return
    addComment.mutate({ readerId: session.user.id, body: body.trim() }, { onSuccess: () => setBody('') })
  }

  return (
    <div className="mt-10">
      <h3 className="mb-4 font-serif text-xl font-bold">Comments{comments ? ` (${comments.length})` : ''}</h3>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={session ? 'Add a comment...' : 'Sign in to comment'}
          disabled={!session}
          className="min-h-20 w-full rounded-md border-2 border-ink p-3 text-sm outline-none disabled:bg-surface"
        />
        <Button type="submit" disabled={addComment.isPending} className="self-end">
          {addComment.isPending ? 'Posting...' : 'Post comment'}
        </Button>
      </form>

      {isLoading && <p className="text-sm text-grey">Loading comments...</p>}

      <div className="flex flex-col gap-4">
        {comments?.map((c) => (
          <div key={c.id} className="rounded-lg border-2 border-ink bg-white p-4">
            <div className="mb-1 flex items-center gap-2 text-sm font-bold">
              {(c.reader_profiles as { display_name: string } | null)?.display_name ?? 'Reader'}
              <span className="font-mono text-[11px] font-normal text-grey">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-[#232327]">{c.body}</p>
          </div>
        ))}
        {comments?.length === 0 && <p className="text-sm text-grey">No comments yet. Be the first.</p>}
      </div>
    </div>
  )
}
