import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui'
import { CheckIcon } from '../../../components/ui/icons'
import { useSiteSettings } from '../../settings/hooks'
import { useActivePlan, useSubscribe } from '../hooks'

export function SubscribeCard() {
  const { data: settings } = useSiteSettings()
  const { data: plan } = useActivePlan()
  const subscribe = useSubscribe()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    subscribe.mutate({ email: email.trim(), planId: plan?.id }, { onSuccess: () => setDone(true) })
  }

  if (!settings?.subscriptions_enabled || !plan) return null

  return (
    <div className="rounded-lg border-2 border-ink bg-ink p-6 text-white shadow-sm">
      <h4 className="font-serif text-xl font-bold">{plan.name}</h4>
      <ul className="mb-5 mt-3 flex flex-col gap-2">
        {plan.plan_benefits
          ?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          .map((b: { id: string; label: string }) => (
            <li key={b.id} className="flex items-center gap-2 text-sm text-[#EDEBE6]">
              <CheckIcon className="h-3.5 w-3.5 text-amber" /> {b.label}
            </li>
          ))}
      </ul>

      {settings.payment_instructions && (
        <p className="mb-5 rounded-md border border-[#3A3B42] bg-[#1D1E24] p-3 text-xs leading-relaxed text-[#C7C5C0]">
          {settings.payment_instructions}
        </p>
      )}

      {done ? (
        <p className="text-sm font-semibold text-amber">Thanks, we'll follow up with payment details.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="rounded-md border-2 border-[#3A3B42] bg-[#1D1E24] px-3 py-2.5 text-sm text-white outline-none"
          />
          <Button type="submit" disabled={subscribe.isPending} className="w-full justify-center bg-amber text-[#241a05]">
            {subscribe.isPending ? 'Sending...' : "I'm interested"}
          </Button>
        </form>
      )}
    </div>
  )
}
