'use client';

import axios, { AxiosError, AxiosResponse } from 'axios';
import { 
  ServerStatus, 
  Agent, 
  Connection, 
  ConnectionAction, 
  AgentActionRequest, 
  AgentActionResponse, 
  AgentLoopStatus,
  ApiLog
} from './types';
import { API_BASE_URL, API_ENDPOINTS } from './config';

// Настройка Axios с базовым URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Глобальный массив для хранения логов API
let apiLogs: ApiLog[] = [];

// Максимальное количество логов для хранения
const MAX_LOGS = 50;

// Вывод информации о запросе и ответе для отладки
const logApiResponse = (endpoint: string, response: any) => {
  console.log(`API Response [${endpoint}]:`, response);
  
  // Добавляем лог в массив
  const timestamp = new Date().toISOString();
  const newLog: ApiLog = {
    id: `${timestamp}-${endpoint}`,
    timestamp,
    endpoint,
    response,
  };
  
  // Добавляем новый лог в начало массива и ограничиваем размер
  apiLogs = [newLog, ...apiLogs].slice(0, MAX_LOGS);
  
  return response;
};

// Обработка ошибок
const handleError = (error: any, endpoint: string): never => {
  // Определяем тип ошибки и формируем информативное сообщение
  let errorMessage = '';
  let errorDetails = null;
  
  if (axios.isAxiosError(error)) {
    // Это ошибка Axios
    if (error.response) {
      // Сервер ответил с кодом ошибки
      errorMessage = `Ошибка сервера ${error.response.status}: ${error.response.statusText}`;
      errorDetails = error.response.data;
    } else if (error.request) {
      // Запрос был сделан, но ответа не получено
      errorMessage = 'Сервер недоступен. Убедитесь, что сервер ZerePy запущен на порту 8000';
    } else {
      // Ошибка при настройке запроса
      errorMessage = `Ошибка запроса: ${error.message}`;
    }
  } else {
    // Это не ошибка Axios
    errorMessage = `Неизвестная ошибка: ${error.message || 'Нет деталей'}`;
  }
  
  // Логируем ошибку в консоль
  console.error(`API Error [${endpoint}]:`, errorMessage, errorDetails);
  
  // Добавляем лог ошибки в массив логов API
  const timestamp = new Date().toISOString();
  const newLog: ApiLog = {
    id: `${timestamp}-${endpoint}-error`,
    timestamp,
    endpoint: `${endpoint} (ОШИБКА)`,
    response: { error: errorMessage, details: errorDetails },
  };
  
  // Добавляем новый лог в начало массива и ограничиваем размер
  apiLogs = [newLog, ...apiLogs].slice(0, MAX_LOGS);
  
  // Создаем объект ошибки с понятным сообщением
  const enhancedError = new Error(errorMessage);
  throw enhancedError;
};

// API функции для взаимодействия с сервером
export const ZerePyAPI = {
  /**
   * Получение всех логов API
   */
  getApiLogs: (): ApiLog[] => {
    return apiLogs;
  },
  
  /**
   * Очистка логов API
   */
  clearApiLogs: (): void => {
    apiLogs = [];
  },
  
  /**
   * Проверка доступности сервера
   * @returns Объект с информацией о доступности сервера
   */
  checkServerAvailability: async (): Promise<{ available: boolean; message: string }> => {
    try {
      // Устанавливаем короткий таймаут для быстрой проверки
      const response = await apiClient.get(API_ENDPOINTS.SERVER_STATUS, { 
        timeout: 3000 
      });
      return { 
        available: true, 
        message: `Сервер доступен. Статус: ${response.data.status || 'OK'}` 
      };
    } catch (error) {
      let message = 'Сервер недоступен';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          message = 'Превышено время ожидания ответа от сервера';
        } else if (error.response) {
          message = `Ошибка сервера: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          message = 'Сервер не отвечает. Убедитесь, что сервер ZerePy запущен на порту 8000';
        } else {
          message = `Ошибка запроса: ${error.message}`;
        }
      }
      
      return { available: false, message };
    }
  },
  /**
   * Получение статуса сервера
   */
  getServerStatus: async (): Promise<ServerStatus> => {
    try {
      const response: AxiosResponse<ServerStatus> = await apiClient.get(API_ENDPOINTS.SERVER_STATUS);
      return logApiResponse('SERVER_STATUS', response.data);
    } catch (error) {
      return handleError(error as AxiosError, 'SERVER_STATUS');
    }
  },

  /**
   * Получение списка доступных агентов
   */
  getAgents: async (): Promise<Agent[]> => {
    try {
      const response: AxiosResponse<Agent[]> = await apiClient.get(API_ENDPOINTS.AGENTS);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Загрузка конкретного агента
   */
  loadAgent: async (name: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = 
        await apiClient.post(API_ENDPOINTS.AGENT_LOAD(name));
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Получение списка доступных подключений
   * Примечание: требуется предварительно загрузить агента
   */
  getConnections: async (): Promise<Connection[]> => {
    try {
      // Получаем список агентов, чтобы загрузить первого, если ни один не загружен
      const agentsResponse = await apiClient.get(API_ENDPOINTS.AGENTS);
      const agentsList = agentsResponse.data.agents || [];
      logApiResponse('AGENTS (from getConnections)', agentsResponse.data);
      
      if (agentsList.length > 0) {
        try {
          // Пробуем загрузить первого агента из списка, если ни один не загружен
          // Это необходимо, потому что эндпоинт /connections требует загруженного агента
          const loadResponse = await apiClient.post(API_ENDPOINTS.AGENT_LOAD(agentsList[0]));
          logApiResponse(`AGENT_LOAD(${agentsList[0]}) (from getConnections)`, loadResponse.data);
        } catch (loadError) {
          console.warn('Не удалось автоматически загрузить агента, возможно он уже загружен');
          console.warn(loadError);
        }
      }
      
      const response = await apiClient.get(API_ENDPOINTS.CONNECTIONS);
      logApiResponse('CONNECTIONS', response.data);
      
      // Преобразование ответа сервера в ожидаемый формат
      // Сервер возвращает {"connections": {name: {configured: bool, is_llm_provider: bool}}}
      const connectionsData = response.data.connections || {};
      const connectionsList: Connection[] = Object.keys(connectionsData).map(name => ({
        name,
        type: connectionsData[name].is_llm_provider ? 'llm' : 'tool',
        description: `Соединение ${name}`,
        status: connectionsData[name].configured ? 'connected' : 'disconnected'
      }));
      
      console.log('Преобразованные данные соединений:', connectionsList);
      return connectionsList;
    } catch (error) {
      return handleError(error as AxiosError, 'CONNECTIONS');
    }
  },

  /**
   * Получение списка действий для конкретного подключения
   */
  getConnectionActions: async (name: string): Promise<ConnectionAction[]> => {
    try {
      const response: AxiosResponse<ConnectionAction[]> = 
        await apiClient.get(API_ENDPOINTS.CONNECTION_ACTIONS(name));
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Выполнение одиночного действия агента
   */
  executeAgentAction: async (actionRequest: AgentActionRequest): Promise<AgentActionResponse> => {
    try {
      const response: AxiosResponse<AgentActionResponse> = 
        await apiClient.post(API_ENDPOINTS.AGENT_ACTION, actionRequest);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError);
    }
  },

  /**
   * Запуск цикла агента
   */
  startAgentLoop: async (): Promise<AgentLoopStatus> => {
    try {
      const response: AxiosResponse<AgentLoopStatus> = await apiClient.post(API_ENDPOINTS.AGENT_START);
      return logApiResponse('AGENT_START', response.data);
    } catch (error) {
      return handleError(error as AxiosError, 'AGENT_START');
    }
  },

  /**
   * Остановка цикла агента
   */
  stopAgentLoop: async (): Promise<AgentLoopStatus> => {
    try {
      const response: AxiosResponse<AgentLoopStatus> = await apiClient.post(API_ENDPOINTS.AGENT_STOP);
      return logApiResponse('AGENT_STOP', response.data);
    } catch (error) {
      return handleError(error as AxiosError, 'AGENT_STOP');
    }
  }
};
