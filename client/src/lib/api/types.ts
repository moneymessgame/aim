export interface ServerStatus {
  status: string;
  version: string;
  uptime: number;
}

export interface Agent {
  name: string;
  description: string;
  type: string;
  config?: Record<string, any>;
}

export interface Connection {
  name: string;
  type: string;
  description: string;
  status: 'connected' | 'disconnected';
}

export interface ConnectionAction {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
}

export interface AgentActionRequest {
  action: string;
  connection: string;
  parameters?: Record<string, any>;
}

export interface AgentActionResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export interface AgentLoopStatus {
  status: 'started' | 'stopped';
  message: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  response: any;
}
