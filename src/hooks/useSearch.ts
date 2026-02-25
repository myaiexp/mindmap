import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { VaultNode } from '../data/schema'

export function useSearch(nodes: VaultNode[], query: string) {
  const fuse = useMemo(
    () =>
      new Fuse(nodes, {
        keys: ['label', 'summary', 'tags'],
        threshold: 0.35,
        includeScore: true,
      }),
    [nodes]
  )

  return useMemo(() => {
    if (!query.trim()) return []
    return fuse.search(query).map(r => r.item)
  }, [fuse, query])
}
