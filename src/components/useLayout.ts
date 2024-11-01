import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import { ref, Ref } from 'vue'

/**
 * Composable to run the layout algorithm on the graph.
 * It uses the `dagre` library to calculate the layout of the nodes and edges.
 */

interface GraphNode {
    id: string
    position?: { x: number; y: number }
    targetPosition?: Position
    sourcePosition?: Position
}

interface GraphEdge {
    source: string
    target: string
}

export function useLayout() {
    const { findNode } = useVueFlow()

    const graph: Ref<dagre.graphlib.Graph> = ref(new dagre.graphlib.Graph())
    const previousDirection: Ref<string> = ref('LR')

    function layout(nodes: GraphNode[], edges: GraphEdge[], direction: string): GraphNode[] {
        const dagreGraph = new dagre.graphlib.Graph()
        graph.value = dagreGraph

        dagreGraph.setDefaultEdgeLabel(() => ({}))

        const isHorizontal = direction === 'LR'
        dagreGraph.setGraph({ rankdir: direction })

        previousDirection.value = direction

        for (const node of nodes) {
            const graphNode = findNode(node.id)
            if (!graphNode) continue

            dagreGraph.setNode(node.id, { width: graphNode.dimensions.width || 150, height: graphNode.dimensions.height || 50 })
        }

        for (const edge of edges) {
            dagreGraph.setEdge(edge.source, edge.target)
        }

        dagre.layout(dagreGraph)

        return nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id)
            if (!nodeWithPosition) return node

            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
            }
        })
    }

    return { graph, layout, previousDirection }
}
