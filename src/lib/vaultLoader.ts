/// <reference types="vite/client" />
import yaml from 'js-yaml'
import type { VaultNode, VaultMeta, VaultIndex } from '../data/schema'

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const data = (yaml.load(match[1]) ?? {}) as Record<string, unknown>
  return { data, content: match[2] }
}

// Vite glob imports — all .md files across all vaults
const mdFiles = import.meta.glob('/src/data/vaults/**/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const ymlFiles = import.meta.glob('/src/data/vaults/**/*.yml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export function loadVaultIndex(): VaultIndex[] {
  const indexPath = '/src/data/vaults/index.yml'
  const raw = ymlFiles[indexPath]
  if (!raw) return []
  const parsed = yaml.load(raw) as { vaults: VaultIndex[] }
  return parsed.vaults ?? []
}

export function loadVaultMeta(vaultId: string): VaultMeta | null {
  const path = `/src/data/vaults/${vaultId}/_vault.yml`
  const raw = ymlFiles[path]
  if (!raw) return null
  return yaml.load(raw) as VaultMeta
}

export function loadVaultNodes(vaultId: string): VaultNode[] {
  const prefix = `/src/data/vaults/${vaultId}/`
  const nodes: VaultNode[] = []

  for (const [path, raw] of Object.entries(mdFiles)) {
    if (!path.startsWith(prefix)) continue
    const filename = path.slice(prefix.length)
    if (filename.includes('/')) continue // no subdirs

    try {
      const { data, content } = parseFrontmatter(raw)
      const fallbackId = filename.replace('.md', '')
      nodes.push({
        id: typeof data.id === 'string' ? data.id : fallbackId,
        label: typeof data.label === 'string' ? data.label : (typeof data.id === 'string' ? data.id : fallbackId),
        type: (data.type as VaultNode['type']) ?? 'leaf',
        summary: typeof data.summary === 'string' ? data.summary : '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        parents: Array.isArray(data.parents) ? data.parents : [],
        related: Array.isArray(data.related) ? data.related : [],
        links: Array.isArray(data.links) ? data.links : [],
        content: content.trim(),
      })
    } catch (err) {
      console.warn(`[vaultLoader] Skipping malformed node in ${path}:`, err)
      // just skip — don't push to results
    }
  }

  return nodes
}
