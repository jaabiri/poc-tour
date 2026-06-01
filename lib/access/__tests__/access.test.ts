import { describe, expect, it } from 'vitest'

import type { RbacUser } from '../types'
import { relId } from '../types'
import { getAllowedBranchIds } from '../branches'
import { canPublishOnBranch, isAdmin, isContributeur, isValidateur } from '../roles'
import {
  adminOnly,
  adminOrSelf,
  branchScopedCreate,
  branchScopedDelete,
  branchScopedRead,
  branchScopedUpdate,
} from '../factories'
import { enforceBranchScope, enforcePublishGate } from '../hooks'

/**
 * Unit tests for the branch-scoped ABAC (ADR-0002). The access module has no
 * runtime dependency on the `payload` package (every `payload` import is a
 * type-only import), so we exercise it against a hand-rolled fake request whose
 * `payload.find` / `payload.findByID` return a fixed rubrique tree and groupes.
 *
 * Tree (ids are what the DB would assign; `relId` stringifies them):
 *
 *   1 Sport
 *   └─ 2 Randonner
 *      └─ 3 Subvention
 *   10 Solidarité
 *   ├─ 11 Enfance
 *   └─ 12 Aînés
 */

type Node = { id: number; parent: number | null }

const TREE: Node[] = [
  { id: 1, parent: null },
  { id: 2, parent: 1 },
  { id: 3, parent: 2 },
  { id: 10, parent: null },
  { id: 11, parent: 10 },
  { id: 12, parent: 10 },
]

const GROUPES = {
  gSport: { id: 'gSport', branches: [1], canPublish: true },
  gEnfance: { id: 'gEnfance', branches: [11], canPublish: false },
  gSolidValid: { id: 'gSolidValid', branches: [10], canPublish: false },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any

const makeReq = (
  tree: Node[] = TREE,
  groupes: Record<string, unknown> = GROUPES,
): AnyReq => {
  const req: AnyReq = {
    _finds: 0,
    payload: {
      find: async ({ collection }: { collection: string }) => {
        if (collection === 'rubriques') {
          req._finds++
          return { docs: tree }
        }
        return { docs: [] }
      },
      findByID: async ({ collection, id }: { collection: string; id: string | number }) => {
        if (collection === 'groupes') return groupes[String(id)] ?? null
        if (collection === 'rubriques') return tree.find((n) => String(n.id) === String(id)) ?? null
        return null
      },
    },
  }
  return req
}

// Test users (groupes pre-populated so no findByID is needed, except where noted).
const admin: RbacUser = { id: 'uAdmin', role: 'administrateur-principal' }
const sport: RbacUser = { id: 'uSport', role: 'contributeur', groupes: [GROUPES.gSport] }
const enfance: RbacUser = { id: 'uEnfance', role: 'contributeur', groupes: [GROUPES.gEnfance] }
const validateur: RbacUser = { id: 'uValid', role: 'validateur', groupes: [GROUPES.gSolidValid] }
const noGroup: RbacUser = { id: 'uNo', role: 'contributeur', groupes: [] }

const inOf = (where: unknown): string[] => {
  const w = where as { rubriques?: { in?: string[] } } | null
  return [...(w?.rubriques?.in ?? [])].sort()
}

describe('relId', () => {
  it('normalises ids, populated docs and nullish values', () => {
    expect(relId(5)).toBe('5')
    expect(relId('x')).toBe('x')
    expect(relId({ id: 7 } as never)).toBe('7')
    expect(relId({ id: 'abc' } as never)).toBe('abc')
    expect(relId(null)).toBeNull()
    expect(relId(undefined)).toBeNull()
  })
})

describe('role predicates', () => {
  it('classifies roles and handles nullish users', () => {
    expect(isAdmin(admin)).toBe(true)
    expect(isAdmin(sport)).toBe(false)
    expect(isAdmin(null)).toBe(false)
    expect(isValidateur(validateur)).toBe(true)
    expect(isValidateur(sport)).toBe(false)
    expect(isContributeur(sport)).toBe(true)
    expect(isContributeur(validateur)).toBe(false)
  })
})

describe('getAllowedBranchIds — down-the-tree inheritance', () => {
  it('expands a granted root to all descendants', async () => {
    const allowed = await getAllowedBranchIds(sport, makeReq())
    expect([...allowed].sort()).toEqual(['1', '2', '3'])
  })

  it('expands a higher root to its whole subtree', async () => {
    const allowed = await getAllowedBranchIds(validateur, makeReq())
    expect([...allowed].sort()).toEqual(['10', '11', '12'])
  })

  it('returns an empty set for a user with no groupes', async () => {
    const allowed = await getAllowedBranchIds(noGroup, makeReq())
    expect(allowed.size).toBe(0)
  })

  it('returns an empty set for an anonymous request', async () => {
    const allowed = await getAllowedBranchIds(null, makeReq())
    expect(allowed.size).toBe(0)
  })

  it('resolves groupes passed as bare ids via findByID', async () => {
    const bare = { id: 'uBare', role: 'contributeur' as const, groupes: ['gSport'] }
    const allowed = await getAllowedBranchIds(bare, makeReq())
    expect([...allowed].sort()).toEqual(['1', '2', '3'])
  })

  it('memoises the result per request (the tree is walked once)', async () => {
    const req = makeReq()
    await getAllowedBranchIds(sport, req)
    await getAllowedBranchIds(sport, req)
    expect(req._finds).toBe(1)
  })

  it('terminates on a cyclic tree (visited-guarded BFS)', async () => {
    const cyclic: Node[] = [
      { id: 1, parent: 2 },
      { id: 2, parent: 1 },
    ]
    const req = makeReq(cyclic, { g: { id: 'g', branches: [1], canPublish: false } })
    const user = { id: 'u', role: 'contributeur' as const, groupes: [{ id: 'g', branches: [1] }] }
    const allowed = await getAllowedBranchIds(user, req)
    expect([...allowed].sort()).toEqual(['1', '2'])
  })
})

describe('canPublishOnBranch', () => {
  it('admin may always publish', async () => {
    expect(await canPublishOnBranch(admin, ['11'], makeReq())).toBe(true)
  })

  it('contributeur autonome publishes on a covered branch', async () => {
    expect(await canPublishOnBranch(sport, ['2'], makeReq())).toBe(true)
  })

  it('contributeur cannot publish off its branch', async () => {
    expect(await canPublishOnBranch(sport, ['11'], makeReq())).toBe(false)
  })

  it('contributeur WITHOUT canPublish cannot publish even on its own branch', async () => {
    expect(await canPublishOnBranch(enfance, ['11'], makeReq())).toBe(false)
  })

  it('validateur publishes on any branch its groupe covers (no canPublish needed)', async () => {
    expect(await canPublishOnBranch(validateur, ['11'], makeReq())).toBe(true)
    expect(await canPublishOnBranch(validateur, ['10'], makeReq())).toBe(true)
  })

  it('validateur cannot publish outside its covered branches', async () => {
    expect(await canPublishOnBranch(validateur, ['3'], makeReq())).toBe(false)
  })

  it('no branches / no groupes → false', async () => {
    expect(await canPublishOnBranch(sport, [], makeReq())).toBe(false)
    expect(await canPublishOnBranch(noGroup, ['1'], makeReq())).toBe(false)
  })
})

describe('branchScopedRead', () => {
  it('denies anonymous, allows admin, filters branch-scoped users', async () => {
    expect(await branchScopedRead()({ req: makeReq({} as never[]) } as never)).toBe(false)
    expect(await branchScopedRead()({ req: makeReq() } as never)).toBe(false) // no user on req
    expect(await branchScopedRead()({ req: { ...makeReq(), user: admin } } as never)).toBe(true)

    const where = await branchScopedRead()({ req: { ...makeReq(), user: sport } } as never)
    expect(inOf(where)).toEqual(['1', '2', '3'])
  })

  it('yields an impossible filter for a user with no branches', async () => {
    const where = await branchScopedRead()({ req: { ...makeReq(), user: noGroup } } as never)
    expect(inOf(where)).toEqual(['__none__'])
  })
})

describe('branchScopedCreate', () => {
  const create = branchScopedCreate()

  it('denies anonymous and branch-less users', async () => {
    expect(await create({ req: makeReq(), data: {} } as never)).toBe(false)
    expect(await create({ req: { ...makeReq(), user: noGroup }, data: {} } as never)).toBe(false)
  })

  it('allows admin unconditionally', async () => {
    expect(
      await create({ req: { ...makeReq(), user: admin }, data: { rubriques: [11] } } as never),
    ).toBe(true)
  })

  it('allows creating within branch, denies smuggling onto a foreign branch', async () => {
    expect(
      await create({ req: { ...makeReq(), user: sport }, data: { rubriques: [2] } } as never),
    ).toBe(true)
    expect(
      await create({ req: { ...makeReq(), user: sport }, data: { rubriques: [11] } } as never),
    ).toBe(false)
    expect(
      await create({ req: { ...makeReq(), user: sport }, data: { rubriques: [2, 11] } } as never),
    ).toBe(false)
  })
})

describe('branchScopedUpdate (publish gate at access level)', () => {
  const update = branchScopedUpdate()

  it('returns a row-level filter for a normal (draft) update', async () => {
    const where = await update({ req: { ...makeReq(), user: sport }, data: { _status: 'draft' } } as never)
    expect(inOf(where)).toEqual(['1', '2', '3'])
  })

  it('allows publish for an autonomous contributeur on its branch', async () => {
    const where = await update({
      req: { ...makeReq(), user: sport },
      data: { _status: 'published', rubriques: [2] },
    } as never)
    expect(inOf(where)).toEqual(['1', '2', '3'])
  })

  it('denies publish for a contributeur without the publish right', async () => {
    expect(
      await update({
        req: { ...makeReq(), user: enfance },
        data: { _status: 'published', rubriques: [11] },
      } as never),
    ).toBe(false)
  })

  it('allows publish for a validateur on a covered branch', async () => {
    const where = await update({
      req: { ...makeReq(), user: validateur },
      data: { _status: 'published', rubriques: [11] },
    } as never)
    expect(inOf(where)).toEqual(['10', '11', '12'])
  })
})

describe('branchScopedDelete', () => {
  it('filters to the deletable rows for a branch-scoped user', async () => {
    const where = await branchScopedDelete()({ req: { ...makeReq(), user: sport } } as never)
    expect(inOf(where)).toEqual(['1', '2', '3'])
  })
})

describe('enforceBranchScope (item c — reject incoming rubriques out of branch)', () => {
  const hook = enforceBranchScope()

  it('lets admins and server operations through unchanged', async () => {
    const data = { rubriques: [11] }
    await expect(
      hook({ data, req: { ...makeReq(), user: admin } } as never),
    ).resolves.toBe(data)
    await expect(hook({ data, req: makeReq() } as never)).resolves.toBe(data) // no user
  })

  it('accepts in-branch rubriques', async () => {
    const data = { rubriques: [2] }
    await expect(hook({ data, req: { ...makeReq(), user: sport } } as never)).resolves.toBe(data)
  })

  it('rejects attaching a document to a foreign branch on update', async () => {
    await expect(
      hook({ data: { rubriques: [2, 11] }, req: { ...makeReq(), user: sport } } as never),
    ).rejects.toThrow(/Rattachement refusé/)
  })

  it('rejects any rubrique for a user with no branches', async () => {
    await expect(
      hook({ data: { rubriques: [2] }, req: { ...makeReq(), user: noGroup } } as never),
    ).rejects.toThrow(/Rattachement refusé/)
  })

  it('skips validation when the write does not touch rubriques', async () => {
    const data = { title: 'edit only' }
    await expect(hook({ data, req: { ...makeReq(), user: sport } } as never)).resolves.toBe(data)
  })
})

describe('enforcePublishGate (item b — branch publish right at write time)', () => {
  const hook = enforcePublishGate()

  it('is a no-op for non-published writes', async () => {
    const data = { _status: 'draft', rubriques: [11] }
    await expect(
      hook({ data, req: { ...makeReq(), user: enfance }, operation: 'update' } as never),
    ).resolves.toBe(data)
  })

  it('lets an autonomous contributeur publish on its branch', async () => {
    const data = { _status: 'published', rubriques: [2] }
    await expect(
      hook({ data, req: { ...makeReq(), user: sport }, operation: 'update' } as never),
    ).resolves.toBe(data)
  })

  it('blocks a contributeur without the publish right', async () => {
    await expect(
      hook({
        data: { _status: 'published', rubriques: [11] },
        req: { ...makeReq(), user: enfance },
        operation: 'update',
      } as never),
    ).rejects.toThrow(/Publication refusée/)
  })

  it('lets a validateur publish on a covered branch', async () => {
    const data = { _status: 'published', rubriques: [11] }
    await expect(
      hook({ data, req: { ...makeReq(), user: validateur }, operation: 'update' } as never),
    ).resolves.toBe(data)
  })

  it('lets admins publish anywhere', async () => {
    const data = { _status: 'published', rubriques: [11] }
    await expect(
      hook({ data, req: { ...makeReq(), user: admin }, operation: 'create' } as never),
    ).resolves.toBe(data)
  })
})

describe('adminOnly / adminOrSelf', () => {
  it('adminOnly admits only the Administrateur principal', () => {
    expect(adminOnly({ req: { ...makeReq(), user: admin } } as never)).toBe(true)
    expect(adminOnly({ req: { ...makeReq(), user: sport } } as never)).toBe(false)
    expect(adminOnly({ req: makeReq() } as never)).toBe(false)
  })

  it('adminOrSelf admits admins fully and others to their own row', () => {
    expect(adminOrSelf()({ req: { ...makeReq(), user: admin } } as never)).toBe(true)
    expect(adminOrSelf()({ req: { ...makeReq(), user: sport } } as never)).toEqual({
      id: { equals: 'uSport' },
    })
    expect(adminOrSelf()({ req: makeReq() } as never)).toBe(false)
  })
})
