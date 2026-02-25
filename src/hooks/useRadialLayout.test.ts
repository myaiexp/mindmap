import { describe, it, expect } from 'vitest'
import { computeRadialLayout } from './useRadialLayout'
import type { VaultNode } from '../data/schema'

function makeNode(id: string, type: VaultNode['type'], parents: string[] = [], related: string[] = []): VaultNode {
  return { id, label: id, type, summary: '', tags: [], parents, related, links: [], content: '' }
}

describe('computeRadialLayout', () => {
  it('places root node at origin', () => {
    const nodes = [makeNode('root', 'root')]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    const root = positioned.find(n => n.id === 'root')!
    expect(root.x).toBeCloseTo(0)
    expect(root.y).toBeCloseTo(0)
  })

  it('places child nodes at ring spacing distance from center', () => {
    const RING_SPACING = 180
    const nodes = [
      makeNode('root', 'root'),
      makeNode('child', 'branch', ['root']),
    ]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    const child = positioned.find(n => n.id === 'child')!
    const dist = Math.sqrt(child.x ** 2 + child.y ** 2)
    expect(dist).toBeCloseTo(RING_SPACING, 0)
  })

  it('generates hierarchy edges between parent and child', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('child', 'branch', ['root']),
    ]
    const { hierarchyEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(hierarchyEdges).toHaveLength(1)
    expect(hierarchyEdges[0].id).toBe('h-root-child')
  })

  it('generates related edges deduplicated', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('a', 'leaf', ['root'], ['b']),
      makeNode('b', 'leaf', ['root'], ['a']),
    ]
    const { relatedEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(relatedEdges).toHaveLength(1)
  })

  it('skips related edge if target node does not exist', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('a', 'leaf', ['root'], ['nonexistent']),
    ]
    const { relatedEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(relatedEdges).toHaveLength(0)
  })

  it('returns empty arrays for empty input', () => {
    const { positioned, hierarchyEdges, relatedEdges } = computeRadialLayout([], '#6366f1')
    expect(positioned).toHaveLength(0)
    expect(hierarchyEdges).toHaveLength(0)
    expect(relatedEdges).toHaveLength(0)
  })

  it('handles vault with only a root node', () => {
    const nodes = [makeNode('root', 'root')]
    const { positioned, hierarchyEdges } = computeRadialLayout(nodes, '#6366f1')
    expect(positioned).toHaveLength(1)
    expect(hierarchyEdges).toHaveLength(0)
  })

  it('assigns correct dimensions per node type', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('b', 'branch', ['root']),
      makeNode('l', 'leaf', ['root']),
    ]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    const r = positioned.find(n => n.id === 'root')!
    const br = positioned.find(n => n.id === 'b')!
    const lf = positioned.find(n => n.id === 'l')!
    expect(r.width).toBeGreaterThan(br.width)
    expect(br.width).toBeGreaterThanOrEqual(lf.width)
  })
  it('uses only the first parent when a node has multiple parents', () => {
    const nodes = [
      makeNode('root', 'root'),
      makeNode('a', 'branch', ['root']),
      makeNode('b', 'branch', ['root']),
      makeNode('child', 'leaf', ['a', 'b']), // multi-parent
    ]
    const { positioned } = computeRadialLayout(nodes, '#6366f1')
    // child should appear exactly once
    const childEntries = positioned.filter(n => n.id === 'child')
    expect(childEntries).toHaveLength(1)
  })
})
