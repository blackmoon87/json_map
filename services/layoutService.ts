import dagre from 'dagre';
import { MarkerType, Position } from 'reactflow';
import { CustomNode, CustomEdge, JsonNodeData, GraphLayout } from '../types';
import { NODE_WIDTH, ROW_HEIGHT, HEADER_HEIGHT } from '../constants';

// Helper to determine value type
const getValueType = (value: any): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

// Recursive function to flatten JSON into Nodes and Edges
const traverse = (
  data: any,
  parentId: string | null,
  keyName: string,
  nodes: CustomNode[],
  edges: CustomEdge[],
  level: number = 0
): string => {
  const nodeId = parentId ? `${parentId}-${keyName}` : 'root';
  const type = Array.isArray(data) ? 'array' : 'object';
  
  const children: JsonNodeData['children'] = [];
  
  const entries = Object.entries(data);

  entries.forEach(([key, value], index) => {
    const valType = getValueType(value);
    const isLink = valType === 'object' || valType === 'array';
    const rowId = `${nodeId}-${key}-${index}`;

    children.push({
      id: rowId,
      key: Array.isArray(data) ? `${index}` : key, // Use index for arrays
      value: isLink ? '' : String(value),
      type: valType as any,
      isLink
    });

    if (isLink) {
      const childNodeId = traverse(value, nodeId, key, nodes, edges, level + 1);
      
      edges.push({
        id: `edge-${nodeId}-${childNodeId}`,
        source: nodeId,
        target: childNodeId,
        sourceHandle: rowId, // Connect from specific row
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#5b5b5b' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#5b5b5b' },
      });
    }
  });

  // Calculate dynamic height based on content
  const height = HEADER_HEIGHT + (children.length * ROW_HEIGHT) + 16; // padding

  nodes.push({
    id: nodeId,
    type: 'custom',
    position: { x: 0, y: 0 }, // Will be set by dagre
    data: {
      label: keyName,
      type,
      children
    },
    width: NODE_WIDTH,
    height: height
  });

  return nodeId;
};

export const getLayoutedElements = (jsonString: string, direction: 'LR' | 'TB' = 'LR'): GraphLayout => {
  let parsedData;
  try {
    parsedData = JSON.parse(jsonString);
  } catch (e) {
    // If invalid JSON, return empty or previous state (handled by caller ideally, but here we return empty)
    return { nodes: [], edges: [] };
  }

  // Allow primitives at root, though typically JSON is an object/array
  if (typeof parsedData !== 'object' || parsedData === null) {
      return { nodes: [], edges: [] };
  }

  const nodes: CustomNode[] = [];
  const edges: CustomEdge[] = [];

  traverse(parsedData, null, 'Root', nodes, edges);

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: node.width ?? NODE_WIDTH, height: node.height ?? 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - (node.width! / 2),
        y: nodeWithPosition.y - (node.height! / 2),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
