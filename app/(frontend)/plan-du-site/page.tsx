import type { Metadata } from 'next'

import { Container, SectionLabel, ArrowLink } from '@/components/ui'
import { getVisibleTree } from '@/lib/payload'
import type { Rubrique } from '@/payload-types'

/**
 * Plan du site — the full VISIBLE rubrique arborescence rendered as a nested
 * list of links. The flat ordered tree from `getVisibleTree()` is rebuilt into
 * a parent/children hierarchy here, then walked recursively.
 *
 * The visible tree is pre-filtered by Payload `read` access, so every node shown
 * is a public, navigable rubrique.
 */

export const metadata: Metadata = {
  title: 'Plan du site',
}

/** A rubrique enriched with its visible children, for nested rendering. */
type TreeNode = Rubrique & { children: TreeNode[] }

/** Front-office href of a rubrique (BlockRenderer `rubriqueHref` pattern). */
const rubriqueHref = (r: Rubrique): string => {
  const crumbs = r.breadcrumbs ?? []
  if (crumbs.length > 0 && crumbs[crumbs.length - 1]?.url) {
    const url = crumbs[crumbs.length - 1]!.url as string
    return url.startsWith('/') ? url : `/${url}`
  }
  return r.slug ? `/${r.slug}` : '#'
}

/** The id of a rubrique's parent, whether populated or a bare id. */
const parentId = (r: Rubrique): number | null => {
  const p = r.parent
  if (p == null) return null
  return typeof p === 'object' ? p.id : p
}

/**
 * Rebuild the parent/children hierarchy from the flat, order-sorted tree.
 * Insertion order is preserved (the source is already sorted by `order`), so
 * siblings keep their authored sequence.
 */
const buildHierarchy = (flat: Rubrique[]): TreeNode[] => {
  const byId = new Map<number, TreeNode>()
  for (const r of flat) byId.set(r.id, { ...r, children: [] })

  const roots: TreeNode[] = []
  for (const r of flat) {
    const node = byId.get(r.id)!
    const pid = parentId(r)
    const parentNode = pid != null ? byId.get(pid) : undefined
    if (parentNode) parentNode.children.push(node)
    else roots.push(node)
  }
  return roots
}

function TreeBranch({ nodes }: { nodes: TreeNode[] }) {
  if (nodes.length === 0) return null
  return (
    <ul className="flex flex-col gap-2">
      {nodes.map((node) => (
        <li key={node.id}>
          <span className="inline-block">
            <ArrowLink href={rubriqueHref(node)} iconSize={15} groupTriggered={false}>
              {node.title}
            </ArrowLink>
          </span>
          {node.children.length > 0 ? (
            <div className="border-border-main mt-2 ml-4 border-l pl-5">
              <TreeBranch nodes={node.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default async function PlanDuSitePage() {
  const flat = await getVisibleTree()
  const tree = buildHierarchy(flat)

  return (
    <>
      <main>
        <Container className="py-16">
          <SectionLabel>Navigation</SectionLabel>
          <h1 className="font-display text-brand-primary-dark mt-2.5 mb-8 text-4xl font-bold leading-tight">
            Plan du site
          </h1>
          {tree.length > 0 ? (
            <nav aria-label="Plan du site">
              <TreeBranch nodes={tree} />
            </nav>
          ) : (
            <p className="text-text-muted max-w-2xl leading-relaxed">
              Aucune rubrique disponible pour le moment.
            </p>
          )}
        </Container>
      </main>
    </>
  )
}
