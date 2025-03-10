'use client';

import React, { useState, useEffect } from 'react';
import { ZerePyAPI } from '@/lib/api';
import type { 
  ServerStatus, 
  Agent, 
  Connection, 
  ConnectionAction, 
  AgentActionRequest, 
  AgentLoopStatus,
  ApiLog
} from '@/lib/api/types';

export default function ApiTestPage() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [connectionActions, setConnectionActions] = useState<ConnectionAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionParameters, setActionParameters] = useState<Record<string, string>>({});
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [actionResponse, setActionResponse] = useState<any>(null);
  const [agentLoopStatus, setAgentLoopStatus] = useState<AgentLoopStatus | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [showApiLogs, setShowApiLogs] = useState<boolean>(false);
  const [serverAvailability, setServerAvailability] = useState<{ available: boolean; message: string } | null>(null);

  // Load data when component mounts
  useEffect(() => {
    // Check server availability before loading data
    checkServerAvailability();
    
    // Update logs every 2 seconds
    const logsInterval = setInterval(() => {
      setApiLogs(ZerePyAPI.getApiLogs());
    }, 2000);
    
    // Check server availability every 10 seconds
    const availabilityInterval = setInterval(() => {
      checkServerAvailability();
    }, 10000);
    
    return () => {
      clearInterval(logsInterval);
      clearInterval(availabilityInterval);
    };
  }, []);

  // Load actions when connection is selected
  useEffect(() => {
    if (selectedConnection) {
      fetchConnectionActions(selectedConnection);
    }
  }, [selectedConnection]);

  // Check server availability
  const checkServerAvailability = async () => {
    try {
      setLoading((prev) => ({ ...prev, serverAvailability: true }));
      const availability = await ZerePyAPI.checkServerAvailability();
      setServerAvailability(availability);
      
      // If server is available, load data
      if (availability.available) {
        fetchServerStatus();
        fetchAgents();
        fetchConnections();
      }
    } catch (error) {
      setServerAvailability({ available: false, message: 'Error checking server availability' });
    } finally {
      setLoading((prev) => ({ ...prev, serverAvailability: false }));
    }
  };
  
  // Get server status
  const fetchServerStatus = async () => {
    try {
      setLoading((prev) => ({ ...prev, serverStatus: true }));
      const status = await ZerePyAPI.getServerStatus();
      setServerStatus(status);
      setErrors((prev) => ({ ...prev, serverStatus: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, serverStatus: 'Error getting server status' }));
      console.error('Error getting server status:', error);
    } finally {
      setLoading((prev) => ({ ...prev, serverStatus: false }));
    }
  };

  // Get agents list
  const fetchAgents = async () => {
    try {
      setLoading((prev) => ({ ...prev, agents: true }));
      const agentsList = await ZerePyAPI.getAgents();
      setAgents(agentsList);
      setErrors((prev) => ({ ...prev, agents: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, agents: 'Error getting agents list' }));
      console.error('Error getting agents list:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  };

  // Load agent
  const handleLoadAgent = async (name: string) => {
    try {
      setLoading((prev) => ({ ...prev, loadAgent: true }));
      const result = await ZerePyAPI.loadAgent(name);
      if (result.success) {
        alert(`Agent ${name} successfully loaded: ${result.message}`);
      } else {
        alert(`Error loading agent ${name}: ${result.message}`);
      }
      setErrors((prev) => ({ ...prev, loadAgent: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, loadAgent: `Error loading agent ${name}` }));
      console.error(`Error loading agent ${name}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, loadAgent: false }));
    }
  };

  // Get connections list
  const fetchConnections = async () => {
    try {
      setLoading((prev) => ({ ...prev, connections: true }));
      const connectionsList = await ZerePyAPI.getConnections();
      setConnections(connectionsList);
      setErrors((prev) => ({ ...prev, connections: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, connections: 'Error getting connections list' }));
      console.error('Error getting connections list:', error);
    } finally {
      setLoading((prev) => ({ ...prev, connections: false }));
    }
  };

  // Get actions for selected connection
  const fetchConnectionActions = async (connectionName: string) => {
    try {
      setLoading((prev) => ({ ...prev, connectionActions: true }));
      const actions = await ZerePyAPI.getConnectionActions(connectionName);
      setConnectionActions(actions);
      setErrors((prev) => ({ ...prev, connectionActions: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, connectionActions: `Error getting actions for connection ${connectionName}` }));
      console.error(`Error getting actions for connection ${connectionName}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, connectionActions: false }));
    }
  };

  // Execute agent action
  const handleExecuteAction = async () => {
    if (!selectedConnection || !selectedAction) {
      alert('Select a connection and action');
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, executeAction: true }));
      
      const actionRequest: AgentActionRequest = {
        action: selectedAction,
        connection: selectedConnection,
        parameters: actionParameters
      };
      
      const response = await ZerePyAPI.executeAgentAction(actionRequest);
      setActionResponse(response);
      setErrors((prev) => ({ ...prev, executeAction: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, executeAction: 'Error executing action' }));
      console.error('Error executing action:', error);
    } finally {
      setLoading((prev) => ({ ...prev, executeAction: false }));
    }
  };

  // Start agent loop
  const handleStartAgentLoop = async () => {
    try {
      setLoading((prev) => ({ ...prev, agentLoop: true }));
      const status = await ZerePyAPI.startAgentLoop();
      setAgentLoopStatus(status);
      setErrors((prev) => ({ ...prev, agentLoop: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, agentLoop: 'Error starting agent loop' }));
      console.error('Error starting agent loop:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agentLoop: false }));
    }
  };

  // Stop agent loop
  const handleStopAgentLoop = async () => {
    try {
      setLoading((prev) => ({ ...prev, agentLoop: true }));
      const status = await ZerePyAPI.stopAgentLoop();
      setAgentLoopStatus(status);
      setErrors((prev) => ({ ...prev, agentLoop: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, agentLoop: 'Error stopping agent loop' }));
      console.error('Error stopping agent loop:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agentLoop: false }));
    }
  };

  // Handle action parameter changes
  const handleParameterChange = (paramName: string, value: string) => {
    setActionParameters((prev) => ({ ...prev, [paramName]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">ZerePy API Testing</h1>
          <a 
            href="/createagent" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create Agent
          </a>
        </div>
        <p className="text-gray-700 mt-2">
          Interface for interacting with ZerePy server API
        </p>
        
        {/* Server availability status */}
        {serverAvailability && (
          <div className={`mt-4 p-3 rounded ${serverAvailability.available ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${serverAvailability.available ? 'bg-green-600' : 'bg-red-600'}`} />
              <p className="font-medium">{serverAvailability.message}</p>
            </div>
            {!serverAvailability.available && (
              <div className="mt-2">
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button 
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  onClick={checkServerAvailability}
                  disabled={loading.serverAvailability}
                >
                  {loading.serverAvailability ? 'Checking...' : 'Check again'}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Server Status</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
            onClick={fetchServerStatus}
            disabled={loading.serverStatus}
          >
            {loading.serverStatus ? 'Loading...' : 'Update Status'}
          </button>
          
          {errors.serverStatus && <p className="text-red-600 font-medium mb-2">{errors.serverStatus}</p>}
          
          {serverStatus && (
            <div className="border p-4 rounded">
              <p><strong>Status:</strong> {serverStatus.status}</p>
              <p><strong>Version:</strong> {serverStatus.version}</p>
              <p><strong>Uptime:</strong> {serverStatus.uptime} seconds</p>
            </div>
          )}
        </div>

        {/* Agents list */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Available Agents</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
            onClick={fetchAgents}
            disabled={loading.agents}
          >
            {loading.agents ? 'Loading...' : 'Get Agents'}
          </button>
          
          {errors.agents && <p className="text-red-600 font-medium mb-2">{errors.agents}</p>}
          
          {agents.length > 0 ? (
            <ul className="border rounded divide-y">
              {agents.map((agent) => (
                <li key={agent.name} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-gray-600">{agent.description}</p>
                  </div>
                  <button
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    onClick={() => handleLoadAgent(agent.name)}
                    disabled={loading.loadAgent}
                  >
                    Load
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No available agents</p>
          )}
        </div>

        {/* Connections and actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Connections and Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Connections list */}
            <div>
              <h3 className="font-medium mb-2">Available Connections</h3>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
                onClick={fetchConnections}
                disabled={loading.connections}
              >
                {loading.connections ? 'Loading...' : 'Get Connections'}
              </button>
              
              {errors.connections && <p className="text-red-600 font-medium mb-2">{errors.connections}</p>}
              
              {connections.length > 0 ? (
                <select
                  className="w-full p-2 border rounded"
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                >
                  <option value="">Select a connection</option>
                  {connections.map((connection) => (
                    <option key={connection.name} value={connection.name}>
                      {connection.name} ({connection.status})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600">No available connections</p>
              )}
            </div>

            {/* Actions for selected connection */}
            <div>
              <h3 className="font-medium mb-2">Actions</h3>
              
              {errors.connectionActions && (
                <p className="text-red-600 font-medium mb-2">{errors.connectionActions}</p>
              )}
              
              {selectedConnection ? (
                loading.connectionActions ? (
                  <p>Loading actions...</p>
                ) : connectionActions.length > 0 ? (
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  >
                    <option value="">Select an action</option>
                    {connectionActions.map((action) => (
                      <option key={action.name} value={action.name}>
                        {action.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-600">No available actions</p>
                )
              ) : (
                <p className="text-gray-600">Select a connection first</p>
              )}
            </div>
          </div>

          {/* Parameters for selected action */}
          {selectedAction && connectionActions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Action Parameters</h3>
              
              {(() => {
                const selectedActionData = connectionActions.find(
                  (action) => action.name === selectedAction
                );
                
                if (!selectedActionData || !selectedActionData.parameters.length) {
                  return <p className="text-gray-600">No parameters for this action</p>;
                }
                
                return (
                  <div className="space-y-4">
                    {selectedActionData.parameters.map((param) => (
                      <div key={param.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {param.name}
                          {param.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border rounded"
                          placeholder={param.description}
                          value={actionParameters[param.name] || ''}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Execute action button */}
          {selectedConnection && selectedAction && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleExecuteAction}
              disabled={loading.executeAction}
            >
              {loading.executeAction ? 'Executing...' : 'Execute Action'}
            </button>
          )}

          {/* Action execution result */}
          {actionResponse && (
            <div className="mt-6 p-4 border rounded">
              <h3 className="font-medium mb-2">Execution Result</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(actionResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Agent loop control */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Agent Loop Control</h2>
          
          <div className="flex space-x-4 mb-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleStartAgentLoop}
              disabled={loading.agentLoop}
            >
              Start Loop
            </button>
            
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleStopAgentLoop}
              disabled={loading.agentLoop}
            >
              Stop Loop
            </button>
          </div>
          
          {errors.agentLoop && <p className="text-red-600 font-medium mb-2">{errors.agentLoop}</p>}
          
          {agentLoopStatus && (
            <div className="p-4 border rounded">
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={
                    agentLoopStatus.status === 'started'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {agentLoopStatus.status === 'started' ? 'Running' : 'Stopped'}
                </span>
              </p>
              <p><strong>Message:</strong> {agentLoopStatus.message}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* API logs panel */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">API Logs</h2>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              onClick={() => setShowApiLogs(!showApiLogs)}
            >
              {showApiLogs ? 'Hide Logs' : 'Show Logs'}
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              onClick={() => {
                ZerePyAPI.clearApiLogs();
                setApiLogs([]);
              }}
            >
              Clear Logs
            </button>
          </div>
        </div>
        
        {showApiLogs && (
          <div className="mt-4">
            {apiLogs.length === 0 ? (
              <p className="text-gray-700">No API logs available</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {apiLogs.map((log) => (
                  <div key={log.id} className="border p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">
                        Endpoint: <span className="text-blue-600">{log.endpoint}</span>
                      </h3>
                      <span className="text-xs text-gray-700">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <pre className="bg-gray-200 p-3 rounded overflow-x-auto text-sm text-gray-900">
                      {JSON.stringify(log.response, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
