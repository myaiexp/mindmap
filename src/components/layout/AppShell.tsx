import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { loadVaultIndex } from '../../lib/vaultLoader'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  const vaults = loadVaultIndex()

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <Sidebar vaults={vaults} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
