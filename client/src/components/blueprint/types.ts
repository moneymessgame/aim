export interface NodeData {
  id: string;
  type: string;
  position: { x: number; y: number };
  content: string;
  inputs: string[];
  outputs: string[];
  color?: string; // Цвет узла
}

export interface ConnectionData {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle: string;
  targetHandle: string;
  color?: string; // Цвет соединения
}

export interface BlueprintData {
  nodes: NodeData[];
  connections: ConnectionData[];
}
