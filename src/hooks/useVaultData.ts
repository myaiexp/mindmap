import { useMemo } from 'react'
import { loadVaultMeta, loadVaultNodes } from '../lib/vaultLoader'

export function useVaultData(vaultId: string) {
  return useMemo(() => {
    const meta = loadVaultMeta(vaultId)
    const nodes = loadVaultNodes(vaultId)
    return { meta, nodes }
  }, [vaultId])
}
