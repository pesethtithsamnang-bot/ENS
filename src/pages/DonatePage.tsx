import { useSiteSettings } from '../features/settings/hooks'
import { useLogVisit } from '../hooks/useLogVisit'

export function DonatePage() {
  useLogVisit('/donate')
  const { data: settings, isLoading } = useSiteSettings()

  if (isLoading) return <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-grey">Loading...</div>
  if (!settings?.donate_enabled) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-sm text-grey">Donations aren't open right now.</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <h1 className="mb-3 font-serif text-3xl font-bold">Support this site</h1>
      {settings.donate_note && <p className="mb-6 text-sm text-grey">{settings.donate_note}</p>}

      <div className="rounded-lg border-2 border-ink bg-white p-6 shadow-sm">
        {settings.donate_qr_image_url && (
          <img src={settings.donate_qr_image_url} alt="Donation QR code" className="mx-auto mb-5 h-56 w-56 rounded-md border-2 border-ink object-cover" />
        )}
        <dl className="flex flex-col gap-3 text-sm">
          {settings.donate_bank_name && (
            <div className="flex justify-between border-b border-surface pb-2">
              <dt className="font-semibold text-grey">Bank</dt>
              <dd className="font-bold">{settings.donate_bank_name}</dd>
            </div>
          )}
          {settings.donate_account_name && (
            <div className="flex justify-between border-b border-surface pb-2">
              <dt className="font-semibold text-grey">Account name</dt>
              <dd className="font-bold">{settings.donate_account_name}</dd>
            </div>
          )}
          {settings.donate_account_number && (
            <div className="flex justify-between">
              <dt className="font-semibold text-grey">Account number</dt>
              <dd className="font-mono font-bold">{settings.donate_account_number}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  )
}
