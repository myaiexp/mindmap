import { useMemo } from 'react'
import { loadVaultMeta, loadVaultNodes } from '../lib/vaultLoader'
import type { VaultMeta, VaultNode } from '../data/schema'

export function useVaultData(vaultId: string): { meta: VaultMeta | null; nodes: VaultNode[] } {
  return useMemo(() => {
    const meta = loadVaultMeta(vaultId)
    const nodes = loadVaultNodes(vaultId)
    return { meta, nodes }
  }, [vaultId])
}
