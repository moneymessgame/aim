'use client';

import React, { useState, useRef, useEffect, MouseEvent, useContext } from 'react';
import { DndContext, TouchSensor, MouseSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { Node } from './Node';
import { Connection } from './Connection';
import { BlueprintData, NodeData, ConnectionData } from './types';
import { generateId } from '@/lib/utils';
import Sheet from '../ui/sheet';
import BlueprintSettings from './BlueprintSettings';
import BlueprintPanel from './BlueprintPanel';
import { BlueprintContext } from './BlueprintContext';

interface BlueprintProps {
  initialData?: BlueprintData;
  onDataChange?: (data: BlueprintData) => void;
}

export function Blueprint({ initialData, onDataChange }: BlueprintProps) {
  // Получаем контекст для взаимодействия между разными блупринтами
  const blueprintContext = useContext(BlueprintContext);
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [activeConnection, setActiveConnection] = useState<{ nodeId: string; handleId: string; isInput: boolean } | null>(null);
  // Флаг для подсветки доступных точек соединения
  const [highlightedPoints, setHighlightedPoints] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Состояния для выделения и настроек
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodesIds, setSelectedNodesIds] = useState<string[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Состояние для отслеживания положения курсора над блупринтом
  const [isOverBlueprint, setIsOverBlueprint] = useState(false);
  const [mousePosition, setMousePosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  
  // Предотвращаем ошибку гидратации, инициализируя данные только на клиенте
  useEffect(() => {
    setNodes(initialData?.nodes || []);
    setConnections(initialData?.connections || []);
    setMounted(true);
  }, [initialData]);
  
  // Получаем выбранный узел и соединение по их ID
  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
  const selectedNodes = selectedNodesIds.length > 0 ? nodes.filter(node => selectedNodesIds.includes(node.id)) : [];
  const selectedConnection = selectedConnectionId 
    ? connections.find(conn => conn.id === selectedConnectionId) || null 
    : null;

  // Настраиваем сенсоры для поддержки как мыши, так и touch-событий
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor, touchSensor);

  // Обработка начала соединения
  const [connectionStartPosition, setConnectionStartPosition] = useState<{x: number, y: number} | null>(null);
  
  const handleConnectStart = (nodeId: string, handleId: string, isInput: boolean, event: React.MouseEvent | React.TouchEvent) => {
    // Предотвращаем всплытие события, чтобы не вызывать клик на узле
    if (event) {
      event.stopPropagation();
    }
    
    // Получаем координаты точки соединения
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (!containerRect) return;
    
    // Рассчитываем позицию относительно контейнера
    const x = rect.left + rect.width / 2 - containerRect.left;
    const y = rect.top + rect.height / 2 - containerRect.top;
    
    console.log('handleConnectStart', { nodeId, handleId, isInput, activeConnection });
    
    // Проверяем, есть ли глобальное активное соединение в контексте
    const globalActiveConnection = blueprintContext?.activeConnection;
    
    // Если есть активное соединение (локальное или глобальное), создаем новое соединение между двумя точками
    if (activeConnection || globalActiveConnection) {
      // Используем локальное соединение, если оно есть, иначе глобальное
      const sourceConnection = activeConnection || globalActiveConnection;
      // Определяем источник и цель соединения
      const sourceId = sourceConnection.nodeId;
      const sourceHandle = sourceConnection.handleId;
      const targetId = nodeId;
      const targetHandle = handleId;
      const isFromExternalBlueprint = !activeConnection && globalActiveConnection;
      
      console.log('Creating connection', { sourceId, sourceHandle, targetId, targetHandle });
      
      // Проверяем, что не пытаемся соединить точку с самой собой
      const isSelfConnection = sourceId === targetId && sourceHandle === targetHandle;
      
      if (!isSelfConnection) {
        // Создаем новое соединение
        const newConnection: ConnectionData = {
          id: generateId(),
          sourceId,
          targetId,
          sourceHandle,
          targetHandle,
        };
        
        // Проверяем, что такого соединения еще нет
        const connectionExists = connections.some(
          conn => conn.sourceId === newConnection.sourceId && 
                 conn.targetId === newConnection.targetId && 
                 conn.sourceHandle === newConnection.sourceHandle && 
                 conn.targetHandle === newConnection.targetHandle
        );
        
        console.log('Connection check', { connectionExists, connections });
        
        if (!connectionExists) {
          console.log('Adding new connection', newConnection);
          setConnections(prev => [...prev, newConnection]);
        }
      } else {
        console.log('Self connection detected');
      }
      
      // Сбрасываем активное соединение
      setActiveConnection(null);
      setConnectionStartPosition(null);
      setHighlightedPoints(false);
      
      // Если соединение было из другого блупринта, сбрасываем глобальное активное соединение
      if (isFromExternalBlueprint && blueprintContext) {
        blueprintContext.setActiveConnection(null);
      }
      
      return;
    }
    
    // Начинаем создание нового соединения
    console.log('Starting new connection');
    const newConnection = {
      nodeId,
      handleId,
      isInput
    };
    
    // Устанавливаем локальное активное соединение
    setActiveConnection(newConnection);
    setConnectionStartPosition({x, y});
    setHighlightedPoints(true); // Включаем подсветку доступных точек
    
    // Устанавливаем глобальное активное соединение в контексте для доступа из других блупринтов
    if (blueprintContext) {
      blueprintContext.setActiveConnection(newConnection);
    }
  };

  // Обработка нажатия на узел
  const handleNodeClick = (nodeId: string, e?: React.MouseEvent) => {
    console.log('Node clicked', nodeId);
    
    // Если есть активное соединение, не обрабатываем клик на узел
    // Чтобы не мешать созданию соединений между точками
    if (activeConnection) {
      return;
    }
    
    // Если удерживается клавиша Shift, добавляем/удаляем узел к множественному выделению
    if (e && e.shiftKey) {
      if (selectedNodesIds.includes(nodeId)) {
        setSelectedNodesIds(selectedNodesIds.filter(id => id !== nodeId));
      } else {
        setSelectedNodesIds([...selectedNodesIds, nodeId]);
      }
      return;
    }
    
    // Сбрасываем множественное выделение при обычном клике
    setSelectedNodesIds([]);
    
    // Выделяем узел или снимаем выделение
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    } else {
      setSelectedNodeId(nodeId);
      setSelectedConnectionId(null); // Снимаем выделение с соединения
    }
  };

  // Обработка окончания перетаскивания
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const nodeId = active.id as string;
    
    setNodes(nodes.map(node => 
      node.id === nodeId
        ? {
            ...node,
            position: {
              x: node.position.x + delta.x,
              y: node.position.y + delta.y,
            },
          }
        : node
    ));
    
    // Если есть активное соединение, отменяем его при перетаскивании
    if (activeConnection) {
      setActiveConnection(null);
      setConnectionStartPosition(null);
      
      // Также сбрасываем глобальное активное соединение
      if (blueprintContext) {
        blueprintContext.setActiveConnection(null);
      }
    }
  };

  // Состояния для выделения области
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionRect, setSelectionRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Обработка клика на свободное место и начало выделения области
  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current) {
      // Начинаем выделение области
      const containerRect = containerRef.current.getBoundingClientRect();
      const startPos = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      };
      
      setSelectionStart(startPos);
      setSelectionRect({ x: startPos.x, y: startPos.y, width: 0, height: 0 });
      setIsSelecting(true);
    }
  };
  
  // Обновление выделения при движении мыши
  const handleContainerMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (isSelecting && selectionStart && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const currentPos = {
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      };
      
      // Рассчитываем прямоугольник выделения
      const rect = {
        x: Math.min(selectionStart.x, currentPos.x),
        y: Math.min(selectionStart.y, currentPos.y),
        width: Math.abs(currentPos.x - selectionStart.x),
        height: Math.abs(currentPos.y - selectionStart.y)
      };
      
      setSelectionRect(rect);
    }
  };
  
  // Завершение выделения области
  const handleContainerMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    if (isSelecting && selectionRect && containerRef.current) {
      // Если выделение слишком маленькое, считаем это кликом
      if (selectionRect.width < 5 && selectionRect.height < 5) {
        // Снимаем выделение при клике на пустую область
        if (e.target === containerRef.current) {
          setSelectedNodeId(null);
          setSelectedConnectionId(null);
          setSelectedNodesIds([]);
        }
      } else {
        // Выбираем все узлы, которые попадают в область выделения
        const selectedIds = nodes.filter(node => {
          // Проверяем, пересекается ли узел с областью выделения
          const nodeRect = {
            x: node.position.x,
            y: node.position.y,
            width: 150, // Приблизительная ширина узла, можно уточнить
            height: 60  // Приблизительная высота узла, можно уточнить
          };
          
          return (
            nodeRect.x < selectionRect.x + selectionRect.width &&
            nodeRect.x + nodeRect.width > selectionRect.x &&
            nodeRect.y < selectionRect.y + selectionRect.height &&
            nodeRect.y + nodeRect.height > selectionRect.y
          );
        }).map(node => node.id);
        
        if (selectedIds.length > 0) {
          setSelectedNodesIds(selectedIds);
          setSelectedNodeId(null); // Снимаем одиночное выделение
          setSelectedConnectionId(null); // Снимаем выделение с соединения
        }
      }
    }
    
    // Сбрасываем состояние выделения
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionRect(null);
  };
  
  // Обработчик клика на контейнер
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Если есть активное соединение, отменяем его
    if (activeConnection) {
      setActiveConnection(null);
      setConnectionStartPosition(null);
      setHighlightedPoints(false);
      
      // Также сбрасываем глобальное активное соединение
      if (blueprintContext) {
        blueprintContext.setActiveConnection(null);
      }
      
      return;
    }
    
    // Если клик был непосредственно на контейнер (не на узел или соединение)
    if (e.target === containerRef.current) {
      // Снимаем все выделения
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
      setSelectedNodesIds([]);
    }
  };
  
  // Обработчик нажатия на соединение
  const handleConnectionClick = (connectionId: string) => {
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    } else {
      setSelectedConnectionId(connectionId);
      setSelectedNodeId(null); // Снимаем выделение с узла
    }
  };
  
  // Удаление соединения
  const handleConnectionDelete = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    }
  };
  
  // Открытие боковой панели настроек
  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };
  
  // Обновление узла
  const handleNodeUpdate = (updatedNode: NodeData) => {
    setNodes(nodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));
  };
  
  // Обновление соединения
  const handleConnectionUpdate = (updatedConnection: ConnectionData) => {
    setConnections(connections.map(conn => 
      conn.id === updatedConnection.id ? updatedConnection : conn
    ));
  };

  // Уведомление родительского компонента об изменениях
  const prevNodesRef = useRef<string>('');
  const prevConnectionsRef = useRef<string>('');
  
  // Эффект для обработки изменений глобального активного соединения
  useEffect(() => {
    if (blueprintContext && blueprintContext.activeConnection && !activeConnection) {
      // Если есть глобальное активное соединение, но нет локального - включаем подсветку точек
      setHighlightedPoints(true);
    } else if (!blueprintContext?.activeConnection && !activeConnection) {
      // Если нет ни глобального, ни локального соединения - выключаем подсветку
      setHighlightedPoints(false);
    }
  }, [blueprintContext?.activeConnection, activeConnection]);

  useEffect(() => {
    if (mounted && onDataChange) {
      const blueprintData: BlueprintData = { nodes, connections };
      const nodesJSON = JSON.stringify(nodes);
      const connectionsJSON = JSON.stringify(connections);
      
      // Проверяем, изменились ли данные, чтобы избежать бесконечного цикла
      if (nodesJSON !== prevNodesRef.current || connectionsJSON !== prevConnectionsRef.current) {
        prevNodesRef.current = nodesJSON;
        prevConnectionsRef.current = connectionsJSON;
        onDataChange(blueprintData);
      }
    }
  }, [nodes, connections, mounted, onDataChange]);

  // Показываем контент только после монтирования на клиенте
  if (!mounted) {
    return (
      <div className="relative w-full h-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
        <p>Загрузка редактора блупринтов...</p>
      </div>
    );
  }

  // Обработчик движения мыши для изменения курсора
  const handleMouseOverNode = (isOver: boolean) => {
    setIsOverBlueprint(isOver);
  };
  
  // Обновление позиции мыши
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }
  };

  // Обработчик добавления нового узла из панели блупринтов
  const handleAddNode = (nodeTemplate: Omit<NodeData, 'id' | 'position'>) => {
    const newNode: NodeData = {
      ...nodeTemplate,
      id: generateId(),
      position: { x: 100, y: 100 } // Начальная позиция нового узла
    };
    
    setNodes([...nodes, newNode]);
  };
  
  // Обработчик события перетаскивания на полотно
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const templateData = e.dataTransfer.getData('application/json');
      
      if (templateData) {
        try {
          const nodeTemplate = JSON.parse(templateData) as Omit<NodeData, 'id' | 'position'>;
          const newNode: NodeData = {
            ...nodeTemplate,
            id: generateId(),
            position: {
              x: e.clientX - containerRect.left - 75, // Центрируем узел по горизонтали
              y: e.clientY - containerRect.top - 30   // Центрируем узел по вертикали
            }
          };
          
          setNodes([...nodes, newNode]);
        } catch (error) {
          console.error('Ошибка при добавлении узла:', error);
        }
      }
    }
  };
  
  // Разрешаем перетаскивание на полотно
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="flex h-full">
      {/* Фиксированная панель с блупринтами */}
      <div className="sticky top-0 left-0 h-full z-10">
        <BlueprintPanel onAddNode={handleAddNode} />
      </div>
      
      <div className="flex-1">
        <DndContext 
          sensors={sensors} 
          onDragEnd={handleDragEnd}
        >
        <div 
          ref={containerRef}
          className={`relative w-full h-full min-h-[600px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden ${isOverBlueprint ? 'cursor-grab' : ''}`}
          onMouseDown={handleContainerMouseDown}
          onMouseMove={(e) => {
            handleContainerMouseMove(e);
            handleMouseMove(e);
          }}
          onMouseUp={handleContainerMouseUp}
          onClick={handleContainerClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {connections.map(connection => (
            <Connection 
              key={connection.id} 
              connection={connection} 
              nodes={nodes} 
              isSelected={selectedConnectionId === connection.id}
              onClick={handleConnectionClick}
              onDelete={handleConnectionDelete}
              onSettingsClick={handleSettingsClick}
              onMouseOver={() => handleMouseOverNode(true)}
              onMouseOut={() => handleMouseOverNode(false)}
            />
          ))}
          
          {nodes.map(node => (
            <Node 
              key={node.id} 
              node={node} 
              onConnectStart={handleConnectStart}
              onClick={handleNodeClick}
              isSelected={selectedNodeId === node.id || selectedNodesIds.includes(node.id)}
              onSettingsClick={handleSettingsClick}
              onMouseOver={() => handleMouseOverNode(true)}
              onMouseOut={() => handleMouseOverNode(false)}
              connections={connections}
              highlightPoints={highlightedPoints}
              activeConnection={activeConnection}
            />
          ))}
          
          {activeConnection && (
            <div className="absolute top-5 left-5 bg-blue-100 p-2 rounded text-sm flex items-center">
              <span>Выберите вторую точку для создания соединения</span>
              <button 
                className="ml-2 bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={() => {
                  setActiveConnection(null);
                  setConnectionStartPosition(null);
                  setHighlightedPoints(false);
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Отображение активного соединения */}
          {activeConnection && connectionStartPosition && (
            <svg className="absolute top-0 left-0 w-full h-full z-10">
              <path
                d={`M ${connectionStartPosition.x} ${connectionStartPosition.y} L ${isOverBlueprint ? mousePosition.x : connectionStartPosition.x} ${isOverBlueprint ? mousePosition.y : connectionStartPosition.y}`}
                stroke="#999"
                strokeWidth={2}
                fill="none"
                strokeDasharray="5,3"
              />
            </svg>
          )}
          
          {/* Отображение области выделения */}
          {selectionRect && (
            <div 
              className="absolute border border-blue-500 bg-blue-100 bg-opacity-20 pointer-events-none"
              style={{
                left: `${selectionRect.x}px`,
                top: `${selectionRect.y}px`,
                width: `${selectionRect.width}px`,
                height: `${selectionRect.height}px`,
              }}
            />
          )}
        </div>
        </DndContext>
        
        {/* Боковая панель настроек */}
        <Sheet
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          title={selectedNode ? 'Настройки узла' : selectedConnection ? 'Настройки соединения' : 'Настройки'}
        >
          <BlueprintSettings
            selectedNode={selectedNode}
            selectedConnection={selectedConnection}
            onNodeUpdate={handleNodeUpdate}
            onConnectionUpdate={handleConnectionUpdate}
          />
        </Sheet>
      </div>
    </div>
  );
}
