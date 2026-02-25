import { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type NodeMouseHandler,
} from '@xyflow/react'
import { RootNode } from './nodes/RootNode'
import { BranchNode } from './nodes/BranchNode'
import { LeafNode } from './nodes/LeafNode'
import { FloatingEdge } from './edges/FloatingEdge'
import NodeDetailPanel from './NodeDetailPanel'
import { useELKLayout } from '../../hooks/useELKLayout'
import type { VaultNode } from '../../data/schema'

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  leaf: LeafNode,
  resource: LeafNode,
  note: LeafNode,
}

const edgeTypes = {
  floating: FloatingEdge,
}

interface Props {
  vaultNodes: VaultNode[]
  vaultColor: string
}

function Inner({ vaultNodes, vaultColor }: Props) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<VaultNode | null>(null)
  const { fitView } = useReactFlow()

  const { nodes: layoutNodes, edges: layoutEdges, loading } = useELKLayout(vaultNodes, collapsedIds, vaultColor)

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes)
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState(layoutEdges)

  useEffect(() => {
    setNodes(layoutNodes)
    setEdges(layoutEdges)
    if (!loading && layoutNodes.length > 0) {
      setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50)
    }
  }, [layoutNodes, layoutEdges, loading])

  const onNodeClick: NodeMouseHandler = useCallback(
    (_evt, node) => {
      const vn = vaultNodes.find(n => n.id === node.id)
      if (!vn) return

      // Toggle collapse if branch/root with children
      const hasChildren = vaultNodes.some(n => n.parents.includes(vn.id))
      if (hasChildren && (vn.type === 'branch' || vn.type === 'root')) {
        setCollapsedIds(prev => {
          const next = new Set(prev)
          if (next.has(vn.id)) next.delete(vn.id)
          else next.add(vn.id)
          return next
        })
      }

      setSelectedNode(prev => (prev?.id === vn.id ? null : vn))
    },
    [vaultNodes]
  )

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-950/60">
          <span className="text-zinc-500 text-sm animate-pulse">Computing layout…</span>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} color="#1a1a1a" gap={24} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={n => {
            const d = n.data as { vaultColor?: string; type?: string }
            if (d?.type === 'root') return d.vaultColor ?? '#6366f1'
            return '#333'
          }}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>

      <NodeDetailPanel
        node={selectedNode}
        vaultColor={vaultColor}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}

export default function MindMapCanvas({ vaultNodes, vaultColor }: Props) {
  return (
    <Inner vaultNodes={vaultNodes} vaultColor={vaultColor} />
  )
}
