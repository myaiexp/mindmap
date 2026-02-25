export interface NodeComponentProps {
  label: string
  vaultColor: string
  type: string
  isSelected: boolean
  onClick: () => void
  onContextMenu: (e: React.MouseEvent) => void
}
