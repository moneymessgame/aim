export const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  SERVER_STATUS: '/',
  AGENTS: '/agents',
  AGENT_LOAD: (name: string) => `/agents/${name}/load`,
  CONNECTIONS: '/connections',
  CONNECTION_ACTIONS: (name: string) => `/connections/${name}/actions`,
  AGENT_ACTION: '/agent/action',
  AGENT_START: '/agent/start',
  AGENT_STOP: '/agent/stop'
};
