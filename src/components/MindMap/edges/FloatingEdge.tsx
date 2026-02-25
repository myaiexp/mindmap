import { memo } from 'react'
import {
  useInternalNode,
  getBezierPath,
  BaseEdge,
  Position,
  type EdgeProps,
  type Edge,
} from '@xyflow/react'

function getBorderPoint(
  cx: number, cy: number,
  hw: number, hh: number,
  tx: number, ty: number
): { x: number; y: number } {
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const scale = Math.min(
    dx !== 0 ? hw / Math.abs(dx) : Infinity,
    dy !== 0 ? hh / Math.abs(dy) : Infinity,
  )
  return { x: cx + dx * scale, y: cy + dy * scale }
}

function getEdgePositions(sx: number, sy: number, tx: number, ty: number) {
  const dx = tx - sx
  const dy = ty - sy
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0
      ? { sourcePosition: Position.Right, targetPosition: Position.Left }
      : { sourcePosition: Position.Left, targetPosition: Position.Right }
  }
  return dy > 0
    ? { sourcePosition: Position.Bottom, targetPosition: Position.Top }
    : { sourcePosition: Position.Top, targetPosition: Position.Bottom }
}

export const FloatingEdge = memo(({ id, source, target, style }: EdgeProps<Edge>) => {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  if (!sourceNode || !targetNode) return null

  const sx = sourceNode.internals.positionAbsolute.x
  const sy = sourceNode.internals.positionAbsolute.y
  const sw = sourceNode.measured.width ?? 120
  const sh = sourceNode.measured.height ?? 40

  const tx = targetNode.internals.positionAbsolute.x
  const ty = targetNode.internals.positionAbsolute.y
  const tw = targetNode.measured.width ?? 120
  const th = targetNode.measured.height ?? 40

  const scx = sx + sw / 2, scy = sy + sh / 2
  const tcx = tx + tw / 2, tcy = ty + th / 2

  const sp = getBorderPoint(scx, scy, sw / 2, sh / 2, tcx, tcy)
  const tp = getBorderPoint(tcx, tcy, tw / 2, th / 2, scx, scy)
  const { sourcePosition, targetPosition } = getEdgePositions(sp.x, sp.y, tp.x, tp.y)

  const [edgePath] = getBezierPath({
    sourceX: sp.x, sourceY: sp.y, sourcePosition,
    targetX: tp.x, targetY: tp.y, targetPosition,
    curvature: 0.25,
  })

  return <BaseEdge id={id} path={edgePath} style={style} />
})

FloatingEdge.displayName = 'FloatingEdge'
