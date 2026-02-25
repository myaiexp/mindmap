import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import { useRadialLayout, NODE_DIMS } from '../../hooks/useRadialLayout'
import { RootNode } from './nodes/RootNode'
import { BranchNode } from './nodes/BranchNode'
import { LeafNode } from './nodes/LeafNode'
import MindMapEdges from './MindMapEdges'
import NodeDetailPanel from './NodeDetailPanel'
import ContextMenu from './ContextMenu'
import type { VaultNode } from '../../data/schema'

interface Props {
  vaultNodes: VaultNode[]
  vaultColor: string
  selectedNodeId?: string | null
}

interface ZoomTransform {
  x: number
  y: number
  k: number
}

interface ContextMenuState {
  x: number
  y: number
  nodeId: string
}

export default function MindMapCanvas({ vaultNodes, vaultColor, selectedNodeId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<HTMLDivElement, unknown> | null>(null)
  const [transform, setTransform] = useState<ZoomTransform>({ x: 0, y: 0, k: 1 })
  const [selectedNode, setSelectedNode] = useState<VaultNode | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const { positioned, hierarchyEdges, relatedEdges } = useRadialLayout(vaultNodes, vaultColor)

  // Set up d3-zoom on mount and when layout changes
  useEffect(() => {
    const el = containerRef.current
    if (!el || positioned.length === 0) return

    const container = d3.select<HTMLDivElement, unknown>(el)

    const zoom = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', event => {
        setTransform(event.transform)
      })

    // Calculate initial zoom: center on root, scale based on graph extent vs viewport
    const graphRadius = Math.max(
      ...positioned.map(n => Math.sqrt(n.x ** 2 + n.y ** 2)),
      1
    )
    const viewportHalf = (el.clientWidth || 1280) / 2
    const initialScale = Math.min(1.0, viewportHalf / (graphRadius + 100))
    const cx = (el.clientWidth || 1280) / 2
    const cy = (el.clientHeight || 720) / 2

    const initialTransform = d3.zoomIdentity.translate(cx, cy).scale(initialScale)

    container.call(zoom).call(zoom.transform, initialTransform)
    zoomRef.current = zoom

    return () => {
      container.on('.zoom', null)
    }
  }, [positioned])

  // Pan to a specific node (used by search)
  const panToNode = useCallback((nodeId: string) => {
    const el = containerRef.current
    if (!el || !zoomRef.current) return
    const node = positioned.find(n => n.id === nodeId)
    if (!node) return

    const currentK = d3.zoomTransform(el).k
    const cx = el.clientWidth / 2
    const cy = el.clientHeight / 2

    d3.select<HTMLDivElement, unknown>(el)
      .transition()
      .duration(600)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(cx - node.x * currentK, cy - node.y * currentK).scale(currentK)
      )
  }, [positioned])

  // When parent provides a selectedNodeId (from search), select it and pan to it
  useEffect(() => {
    if (!selectedNodeId) return
    const vn = vaultNodes.find(n => n.id === selectedNodeId)
    if (vn) {
      setSelectedNode(vn)
      panToNode(selectedNodeId)
    }
  }, [selectedNodeId, vaultNodes, panToNode])

  const handleNodeClick = useCallback((nodeId: string) => {
    const vn = vaultNodes.find(n => n.id === nodeId)
    if (!vn) return
    setSelectedNode(prev => prev?.id === nodeId ? null : vn)
    setContextMenu(null)
  }, [vaultNodes])

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null)
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId })
  }, [])

  const transformCss = `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-zinc-950 cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Canvas backdrop — clicking here closes panel / context menu */}
      <div className="absolute inset-0" onClick={handleCanvasClick} />

      {/* Transformed layer — nodes and edges share this coordinate space */}
      <div
        style={{
          transform: transformCss,
          transformOrigin: '0 0',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {/* SVG edge layer — overflow: visible so edges extend beyond 0×0 box */}
        <svg
          style={{ position: 'absolute', overflow: 'visible', top: 0, left: 0, width: 0, height: 0 }}
          className="pointer-events-none"
        >
          <MindMapEdges
            hierarchyEdges={hierarchyEdges}
            relatedEdges={relatedEdges}
            vaultColor={vaultColor}
          />
        </svg>

        {/* Node layer */}
        {positioned.map(node => {
          const dims = NODE_DIMS[node.data.type] ?? NODE_DIMS.leaf
          const isSelected = selectedNode?.id === node.id
          const NodeComponent =
            node.data.type === 'root' ? RootNode :
            node.data.type === 'branch' ? BranchNode :
            LeafNode

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.x - dims.width / 2,
                top: node.y - dims.height / 2,
                width: dims.width,
                height: dims.height,
              }}
            >
              <NodeComponent
                label={node.data.label}
                type={node.data.type}
                vaultColor={vaultColor}
                isSelected={isSelected}
                onClick={() => handleNodeClick(node.id)}
                onContextMenu={e => handleContextMenu(e, node.id)}
              />
            </div>
          )
        })}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
        />
      )}

      <NodeDetailPanel
        node={selectedNode}
        vaultColor={vaultColor}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
