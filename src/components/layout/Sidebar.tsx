import { NavLink, useNavigate } from 'react-router-dom'
import type { VaultIndex } from '../../data/schema'

interface Props {
  vaults: VaultIndex[]
}

export default function Sidebar({ vaults }: Props) {
  const navigate = useNavigate()

  return (
    <aside className="w-14 flex flex-col items-center py-4 gap-3 border-r border-zinc-800/60 bg-zinc-950 flex-shrink-0">
      {/* Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-colors ${
            isActive
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`
        }
        title="Home"
      >
        ⌂
      </NavLink>

      <div className="w-6 border-t border-zinc-800 my-1" />

      {/* Vault list */}
      {vaults.map(v => (
        <NavLink
          key={v.id}
          to={`/vault/${v.id}`}
          title={v.label}
          style={({ isActive }) => ({
            background: isActive ? v.color + '30' : undefined,
            borderColor: isActive ? v.color : 'transparent',
          })}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg border transition-colors hover:bg-zinc-800/60"
        >
          {v.icon}
        </NavLink>
      ))}
    </aside>
  )
}
