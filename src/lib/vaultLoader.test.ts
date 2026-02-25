import { describe, it, expect } from 'vitest'

describe('vaultLoader', () => {
  it('module imports without error', async () => {
    // Smoke test: if the module loads, the parsing setup is stable
    const mod = await import('./vaultLoader')
    expect(mod.loadVaultNodes).toBeDefined()
    expect(mod.loadVaultMeta).toBeDefined()
    expect(mod.loadVaultIndex).toBeDefined()
  })
})
