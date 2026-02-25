import { Link } from 'react-router-dom'
import { loadVaultIndex } from '../lib/vaultLoader'

export default function Home() {
  const vaults = loadVaultIndex()

  return (
    <div className="h-full overflow-y-auto p-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-1">Mind Map Vault</h1>
        <p className="text-zinc-500 text-sm mb-8">Your personal knowledge graph</p>

        {vaults.length === 0 ? (
          <p className="text-zinc-600 text-sm">No vaults found. Add one to <code className="text-zinc-400">src/data/vaults/index.yml</code>.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {vaults.map(v => (
              <Link
                key={v.id}
                to={`/vault/${v.id}`}
                className="group block p-5 rounded-xl border border-zinc-800 hover:border-zinc-600 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all"
                style={{ '--vault-color': v.color } as React.CSSProperties}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ background: v.color + '22' }}
                  >
                    {v.icon}
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white group-hover:text-white/90">
                      {v.label}
                    </h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">{v.id}</p>
                  </div>
                </div>
                <div
                  className="h-0.5 rounded-full"
                  style={{ background: v.color + '66' }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
