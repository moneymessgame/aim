'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { NodeData, ConnectionData } from './types';
import { Settings } from 'lucide-react';

interface NodeProps {
  node: NodeData;
  onConnectStart?: (nodeId: string, handleId: string, isInput: boolean, event: React.MouseEvent | React.TouchEvent) => void;
  onClick?: (nodeId: string, e?: React.MouseEvent) => void;
  isSelected?: boolean;
  onSettingsClick?: (nodeId: string) => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
  connections?: ConnectionData[];
  highlightPoints?: boolean;
  activeConnection?: { nodeId: string; handleId: string; isInput: boolean } | null;
}

export function Node({ 
  node, 
  onConnectStart, 
  onClick, 
  isSelected = false, 
  onSettingsClick, 
  onMouseOver, 
  onMouseOut, 
  connections = [], 
  highlightPoints = false, 
  activeConnection = null 
}: NodeProps) {
  // Состояния для подсветки точек входа/выхода
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);
  const [hoveredOutput, setHoveredOutput] = useState<string | null>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    left: `${node.position.x}px`,
    top: `${node.position.y}px`,
  };

  // Обработчик клика на точку соединения
  const handlePointClick = (handleId: string, isInput: boolean, e: React.MouseEvent) => {
    e.stopPropagation(); // Останавливаем всплытие события
    console.log(`${isInput ? 'Input' : 'Output'} point clicked`, node.id, handleId);
    
    // Вызываем обработчик начала соединения
    if (onConnectStart) {
      onConnectStart(node.id, handleId, isInput, e);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute p-4 rounded-lg bg-white shadow-md border-2 min-w-[150px] transition-all cursor-grab',
        isDragging ? 'border-blue-500 opacity-50 z-50' : isSelected ? 'border-blue-500 z-30' : 'border-gray-200',
      )}
      style={style}
      onClick={(e) => onClick?.(node.id, e)}
      onMouseOver={() => onMouseOver?.()}
      onMouseOut={() => onMouseOut?.()}
      {...attributes}
      {...listeners}
    >
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-t-md whitespace-nowrap">
        {node.id.substring(0, 8)}
      </div>
      
      {isSelected && (
        <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-1 cursor-pointer z-50"
             onClick={(e) => {
               e.stopPropagation();
               onSettingsClick?.(node.id);
             }}>
          <Settings size={16} />
        </div>
      )}
      
      <div className="font-bold text-sm mb-2">{node.type}</div>
      <div className="text-sm">{node.content}</div>
      
      {/* Input handles */}
      <div className="mt-4">
        {node.inputs.map((input) => {
          // Находим соединение, которое подключено к этому входу
          const connection = connections.find(conn => 
            conn.targetId === node.id && conn.targetHandle === input
          );
          
          return (
            <div 
              key={input}
              className="flex items-center mb-2 relative"
            >
              <div 
                className={cn(
                  "w-3 h-3 rounded-full cursor-pointer mr-2",
                  hoveredInput === input && "ring-2 ring-blue-500 ring-opacity-75",
                  highlightPoints && "animate-pulse ring-2 ring-green-500 ring-opacity-75"
                )}
                style={{
                  backgroundColor: connection?.color || '#d1d5db',
                  position: 'absolute',
                  left: '-5px',
                  transform: 'translateX(-50%)'
                }}
                onMouseEnter={() => setHoveredInput(input)}
                onMouseLeave={() => setHoveredInput(null)}
                onClick={(e) => handlePointClick(input, true, e)}
              />
              <span className="text-xs ml-4">{input}</span>
            </div>
          );
        })}
      </div>
      
      {/* Output handles */}
      <div className="mt-2">
        {node.outputs.map((output) => {
          // Находим соединение, которое подключено к этому выходу
          const connection = connections.find(conn => 
            conn.sourceId === node.id && conn.sourceHandle === output
          );
          
          return (
            <div 
              key={output}
              className="flex items-center justify-end mb-2"
            >
              <span className="text-xs mr-4">{output}</span>
              <div 
                className={cn(
                  "w-3 h-3 rounded-full cursor-pointer",
                  hoveredOutput === output && "ring-2 ring-blue-500 ring-opacity-75",
                  highlightPoints && "animate-pulse ring-2 ring-green-500 ring-opacity-75"
                )}
                style={{
                  backgroundColor: connection?.color || '#d1d5db',
                  position: 'absolute',
                  right: '-5px',
                  transform: 'translateX(50%)'
                }}
                onMouseEnter={() => setHoveredOutput(output)}
                onMouseLeave={() => setHoveredOutput(null)}
                onClick={(e) => handlePointClick(output, false, e)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
