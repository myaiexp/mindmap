import type { NodeType } from '../../../data/schema'

export interface NodeComponentProps {
  label: string
  vaultColor: string
  type: NodeType
  isSelected: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}
