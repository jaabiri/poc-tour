import Link from 'next/link'

import { Icon } from '@/components/ui'
import { isInternalHref } from '@/lib/href'

/**
 * BackToRubrique — « Revenir à : {rubrique} » return link closing the editorial
 * gabarits (article T4, actualité détail T5). The dispatcher's breadcrumb ends
 * on the parent rubrique, so this is a redundant-but-helpful explicit way back
 * up the tree (catalogue #4 « retour à la rubrique »). Left-nudging arrow on
 * hover mirrors the forward ArrowLink affordance; motion is disabled under
 * `prefers-reduced-motion` (global rule in globals.css).
 */
export function BackToRubrique({ title, href }: { title: string; href: string }) {
  if (!isInternalHref(href)) return null
  return (
    <Link
      href={href}
      className="group/back text-brand-primary inline-flex items-center gap-2 text-sm font-semibold no-underline"
    >
      <Icon
        name="arrow-left"
        size={16}
        className="transition-transform duration-300 group-hover/back:-translate-x-1"
      />
      Revenir à&nbsp;: {title}
    </Link>
  )
}

export default BackToRubrique
