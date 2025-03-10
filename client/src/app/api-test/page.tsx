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

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    // Проверяем доступность сервера перед загрузкой данных
    checkServerAvailability();
    
    // Обновляем логи каждые 2 секунды
    const logsInterval = setInterval(() => {
      setApiLogs(ZerePyAPI.getApiLogs());
    }, 2000);
    
    // Проверяем доступность сервера каждые 10 секунд
    const availabilityInterval = setInterval(() => {
      checkServerAvailability();
    }, 10000);
    
    return () => {
      clearInterval(logsInterval);
      clearInterval(availabilityInterval);
    };
  }, []);

  // Загрузка действий при выборе подключения
  useEffect(() => {
    if (selectedConnection) {
      fetchConnectionActions(selectedConnection);
    }
  }, [selectedConnection]);

  // Проверка доступности сервера
  const checkServerAvailability = async () => {
    try {
      setLoading((prev) => ({ ...prev, serverAvailability: true }));
      const availability = await ZerePyAPI.checkServerAvailability();
      setServerAvailability(availability);
      
      // Если сервер доступен, загружаем данные
      if (availability.available) {
        fetchServerStatus();
        fetchAgents();
        fetchConnections();
      }
    } catch (error) {
      setServerAvailability({ available: false, message: 'Ошибка при проверке доступности сервера' });
    } finally {
      setLoading((prev) => ({ ...prev, serverAvailability: false }));
    }
  };
  
  // Получение статуса сервера
  const fetchServerStatus = async () => {
    try {
      setLoading((prev) => ({ ...prev, serverStatus: true }));
      const status = await ZerePyAPI.getServerStatus();
      setServerStatus(status);
      setErrors((prev) => ({ ...prev, serverStatus: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, serverStatus: 'Ошибка при получении статуса сервера' }));
      console.error('Ошибка при получении статуса сервера:', error);
    } finally {
      setLoading((prev) => ({ ...prev, serverStatus: false }));
    }
  };

  // Получение списка агентов
  const fetchAgents = async () => {
    try {
      setLoading((prev) => ({ ...prev, agents: true }));
      const agentsList = await ZerePyAPI.getAgents();
      setAgents(agentsList);
      setErrors((prev) => ({ ...prev, agents: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, agents: 'Ошибка при получении списка агентов' }));
      console.error('Ошибка при получении списка агентов:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agents: false }));
    }
  };

  // Загрузка агента
  const handleLoadAgent = async (name: string) => {
    try {
      setLoading((prev) => ({ ...prev, loadAgent: true }));
      const result = await ZerePyAPI.loadAgent(name);
      if (result.success) {
        alert(`Агент ${name} успешно загружен: ${result.message}`);
      } else {
        alert(`Ошибка при загрузке агента ${name}: ${result.message}`);
      }
      setErrors((prev) => ({ ...prev, loadAgent: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, loadAgent: `Ошибка при загрузке агента ${name}` }));
      console.error(`Ошибка при загрузке агента ${name}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, loadAgent: false }));
    }
  };

  // Получение списка подключений
  const fetchConnections = async () => {
    try {
      setLoading((prev) => ({ ...prev, connections: true }));
      const connectionsList = await ZerePyAPI.getConnections();
      setConnections(connectionsList);
      setErrors((prev) => ({ ...prev, connections: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, connections: 'Ошибка при получении списка подключений' }));
      console.error('Ошибка при получении списка подключений:', error);
    } finally {
      setLoading((prev) => ({ ...prev, connections: false }));
    }
  };

  // Получение действий для выбранного подключения
  const fetchConnectionActions = async (connectionName: string) => {
    try {
      setLoading((prev) => ({ ...prev, connectionActions: true }));
      const actions = await ZerePyAPI.getConnectionActions(connectionName);
      setConnectionActions(actions);
      setErrors((prev) => ({ ...prev, connectionActions: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, connectionActions: `Ошибка при получении действий для подключения ${connectionName}` }));
      console.error(`Ошибка при получении действий для подключения ${connectionName}:`, error);
    } finally {
      setLoading((prev) => ({ ...prev, connectionActions: false }));
    }
  };

  // Выполнение действия агента
  const handleExecuteAction = async () => {
    if (!selectedConnection || !selectedAction) {
      alert('Выберите подключение и действие');
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
      setErrors((prev) => ({ ...prev, executeAction: 'Ошибка при выполнении действия' }));
      console.error('Ошибка при выполнении действия:', error);
    } finally {
      setLoading((prev) => ({ ...prev, executeAction: false }));
    }
  };

  // Запуск цикла агента
  const handleStartAgentLoop = async () => {
    try {
      setLoading((prev) => ({ ...prev, agentLoop: true }));
      const status = await ZerePyAPI.startAgentLoop();
      setAgentLoopStatus(status);
      setErrors((prev) => ({ ...prev, agentLoop: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, agentLoop: 'Ошибка при запуске цикла агента' }));
      console.error('Ошибка при запуске цикла агента:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agentLoop: false }));
    }
  };

  // Остановка цикла агента
  const handleStopAgentLoop = async () => {
    try {
      setLoading((prev) => ({ ...prev, agentLoop: true }));
      const status = await ZerePyAPI.stopAgentLoop();
      setAgentLoopStatus(status);
      setErrors((prev) => ({ ...prev, agentLoop: '' }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, agentLoop: 'Ошибка при остановке цикла агента' }));
      console.error('Ошибка при остановке цикла агента:', error);
    } finally {
      setLoading((prev) => ({ ...prev, agentLoop: false }));
    }
  };

  // Обработка изменения параметров действия
  const handleParameterChange = (paramName: string, value: string) => {
    setActionParameters((prev) => ({ ...prev, [paramName]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Тестирование API ZerePy</h1>
          <a 
            href="/createagent" 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Создать агента
          </a>
        </div>
        <p className="text-gray-700 mt-2">
          Интерфейс для взаимодействия с API сервера ZerePy
        </p>
        
        {/* Статус доступности сервера */}
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
                  {loading.serverAvailability ? 'Проверка...' : 'Проверить снова'}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Статус сервера */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Статус сервера</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
            onClick={fetchServerStatus}
            disabled={loading.serverStatus}
          >
            {loading.serverStatus ? 'Загрузка...' : 'Обновить статус'}
          </button>
          
          {errors.serverStatus && <p className="text-red-600 font-medium mb-2">{errors.serverStatus}</p>}
          
          {serverStatus && (
            <div className="border p-4 rounded">
              <p><strong>Статус:</strong> {serverStatus.status}</p>
              <p><strong>Версия:</strong> {serverStatus.version}</p>
              <p><strong>Время работы:</strong> {serverStatus.uptime} секунд</p>
            </div>
          )}
        </div>

        {/* Список агентов */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Доступные агенты</h2>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
            onClick={fetchAgents}
            disabled={loading.agents}
          >
            {loading.agents ? 'Загрузка...' : 'Получить агентов'}
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
                    Загрузить
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Нет доступных агентов</p>
          )}
        </div>

        {/* Подключения и действия */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Подключения и действия</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Список подключений */}
            <div>
              <h3 className="font-medium mb-2">Доступные подключения</h3>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
                onClick={fetchConnections}
                disabled={loading.connections}
              >
                {loading.connections ? 'Загрузка...' : 'Получить подключения'}
              </button>
              
              {errors.connections && <p className="text-red-600 font-medium mb-2">{errors.connections}</p>}
              
              {connections.length > 0 ? (
                <select
                  className="w-full p-2 border rounded"
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                >
                  <option value="">Выберите подключение</option>
                  {connections.map((connection) => (
                    <option key={connection.name} value={connection.name}>
                      {connection.name} ({connection.status})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-600">Нет доступных подключений</p>
              )}
            </div>

            {/* Действия для выбранного подключения */}
            <div>
              <h3 className="font-medium mb-2">Действия</h3>
              
              {errors.connectionActions && (
                <p className="text-red-600 font-medium mb-2">{errors.connectionActions}</p>
              )}
              
              {selectedConnection ? (
                loading.connectionActions ? (
                  <p>Загрузка действий...</p>
                ) : connectionActions.length > 0 ? (
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedAction}
                    onChange={(e) => setSelectedAction(e.target.value)}
                  >
                    <option value="">Выберите действие</option>
                    {connectionActions.map((action) => (
                      <option key={action.name} value={action.name}>
                        {action.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-600">Нет доступных действий</p>
                )
              ) : (
                <p className="text-gray-600">Сначала выберите подключение</p>
              )}
            </div>
          </div>

          {/* Параметры для выбранного действия */}
          {selectedAction && connectionActions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Параметры действия</h3>
              
              {(() => {
                const selectedActionData = connectionActions.find(
                  (action) => action.name === selectedAction
                );
                
                if (!selectedActionData || !selectedActionData.parameters.length) {
                  return <p className="text-gray-600">Нет параметров для этого действия</p>;
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

          {/* Кнопка выполнения действия */}
          {selectedConnection && selectedAction && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleExecuteAction}
              disabled={loading.executeAction}
            >
              {loading.executeAction ? 'Выполнение...' : 'Выполнить действие'}
            </button>
          )}

          {/* Результат выполнения действия */}
          {actionResponse && (
            <div className="mt-6 p-4 border rounded">
              <h3 className="font-medium mb-2">Результат выполнения</h3>
              <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(actionResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Управление циклом агента */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Управление циклом агента</h2>
          
          <div className="flex space-x-4 mb-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleStartAgentLoop}
              disabled={loading.agentLoop}
            >
              Запустить цикл
            </button>
            
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleStopAgentLoop}
              disabled={loading.agentLoop}
            >
              Остановить цикл
            </button>
          </div>
          
          {errors.agentLoop && <p className="text-red-600 font-medium mb-2">{errors.agentLoop}</p>}
          
          {agentLoopStatus && (
            <div className="p-4 border rounded">
              <p>
                <strong>Статус:</strong>{' '}
                <span
                  className={
                    agentLoopStatus.status === 'started'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {agentLoopStatus.status === 'started' ? 'Запущен' : 'Остановлен'}
                </span>
              </p>
              <p><strong>Сообщение:</strong> {agentLoopStatus.message}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Панель логов API */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Логи API</h2>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              onClick={() => setShowApiLogs(!showApiLogs)}
            >
              {showApiLogs ? 'Скрыть логи' : 'Показать логи'}
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              onClick={() => {
                ZerePyAPI.clearApiLogs();
                setApiLogs([]);
              }}
            >
              Очистить логи
            </button>
          </div>
        </div>
        
        {showApiLogs && (
          <div className="mt-4">
            {apiLogs.length === 0 ? (
              <p className="text-gray-700">Нет доступных логов API</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {apiLogs.map((log) => (
                  <div key={log.id} className="border p-4 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">
                        Эндпоинт: <span className="text-blue-600">{log.endpoint}</span>
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
