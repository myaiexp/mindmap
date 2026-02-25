export type NodeType = 'root' | 'branch' | 'leaf' | 'resource' | 'note'

export interface VaultNode {
  id: string
  label: string
  type: NodeType
  summary: string
  tags: string[]
  parents: string[]
  related: string[]
  links: string[]
  content: string // raw markdown body
}

export interface VaultMeta {
  id: string
  label: string
  description: string
  icon: string
  color: string
  root: string
  created: string
}

export interface VaultIndex {
  id: string
  label: string
  icon: string
  color: string
}
