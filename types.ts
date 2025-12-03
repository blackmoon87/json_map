import { Edge, Node } from 'reactflow';

export interface JsonNodeData {
  label: string; // The key name or 'ROOT'
  type: string; // 'object' | 'array'
  children: Array<{
    id: string; // unique key for the row
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
    isLink: boolean;
  }>;
}

export type CustomNode = Node<JsonNodeData>;
export type CustomEdge = Edge;

export interface GraphLayout {
  nodes: CustomNode[];
  edges: CustomEdge[];
}
