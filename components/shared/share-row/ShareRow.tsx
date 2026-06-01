import { Icon } from '@/components/ui'
import type { IconName } from '@/lib/icons'

/**
 * ShareRow — the « Partager » strip shared by the editorial gabarits (article
 * T4, actualité détail T5). No external SDK / client JS: each entry is a plain
 * anchor to the platform's share endpoint, styled with semantic tokens exactly
 * like the other inline actions in BlockRenderer. Icon-only links carry an
 * explicit `aria-label` so they remain accessible (RGAA).
 */
export function ShareRow({ title, url }: { title: string; url: string }) {
  const enc = encodeURIComponent
  const targets: { key: string; label: string; icon: IconName; href: string }[] = [
    {
      key: 'facebook',
      label: 'Partager sur Facebook',
      icon: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      key: 'linkedin',
      label: 'Partager sur LinkedIn',
      icon: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      key: 'email',
      label: 'Partager par e-mail',
      icon: 'mail',
      href: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
    },
  ]
  return (
    <div className="border-border-main flex flex-wrap items-center gap-3 border-t pt-6">
      <span className="text-text-muted text-sm font-semibold">Partager</span>
      <ul className="flex flex-wrap items-center gap-2">
        {targets.map((t) => (
          <li key={t.key}>
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.label}
              className="bg-surface-main border-border-main text-brand-primary-dark hover:shadow-card-sm inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold no-underline transition-shadow"
            >
              <Icon name={t.icon} size={16} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ShareRow
