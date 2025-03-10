'use client';

import React from 'react';
import { ConnectionData, NodeData } from './types';
import { cn } from '@/lib/utils';
import { Settings, Trash2 } from 'lucide-react';

interface ConnectionProps {
  connection: ConnectionData;
  nodes: NodeData[];
  isSelected?: boolean;
  onClick?: (connectionId: string) => void;
  onDelete?: (connectionId: string) => void;
  onSettingsClick?: () => void;
  onMouseOver?: () => void;
  onMouseOut?: () => void;
}

export function Connection({ connection, nodes, isSelected = false, onClick, onDelete, onSettingsClick, onMouseOver, onMouseOut }: ConnectionProps) {
  const sourceNode = nodes.find(node => node.id === connection.sourceId);
  const targetNode = nodes.find(node => node.id === connection.targetId);

  if (!sourceNode || !targetNode) return null;

  // Расчет позиций соединения
  const sourceOutputIndex = sourceNode.outputs.indexOf(connection.sourceHandle);
  const targetInputIndex = targetNode.inputs.indexOf(connection.targetHandle);
  
  // Точное позиционирование точек соединения
  const sourceX = sourceNode.position.x + 150; // Выходы на правой стороне
  const sourceY = sourceNode.position.y + 40 + (sourceOutputIndex + 1) * 24; // Выравнивание по вертикали с точками
  
  const targetX = targetNode.position.x; // Входы на левой стороне
  const targetY = targetNode.position.y + 40 + (targetInputIndex + 1) * 24; // Выравнивание по вертикали с точками
  
  // Расчет позиции для иконок
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2 - 25; // Немного выше середины

  // Параметры кривой Безье
  const path = `M ${sourceX} ${sourceY} C ${sourceX + 50} ${sourceY}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`;

  return (
    <>
      <svg className="absolute top-0 left-0 w-full h-full z-0">
        <path
          d={path}
          stroke={connection.color || '#999'}
          strokeWidth={isSelected ? 3 : 2}
          fill="none"
          className={cn(
            'cursor-grab transition-all',
            isSelected ? 'stroke-[3px]' : 'stroke-[2px]'
          )}
          onClick={() => onClick?.(connection.id)}
          onMouseOver={() => onMouseOver?.()}
          onMouseOut={() => onMouseOut?.()}
          strokeDasharray={isSelected ? '5,3' : 'none'}
        />
        
        {/* Точки соединения на концах линии */}
        <circle 
          cx={sourceX} 
          cy={sourceY} 
          r={4} 
          fill={connection.color || '#999'} 
        />
        <circle 
          cx={targetX} 
          cy={targetY} 
          r={4} 
          fill={connection.color || '#999'} 
        />
      </svg>
      
      {/* Отображение ID соединения сверху по центру */}
      <div 
        className="absolute z-10 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md whitespace-nowrap"
        style={{ 
          top: `${(sourceY + targetY) / 2 - 25}px`, 
          left: `${(sourceX + targetX) / 2}px`, 
          transform: 'translate(-50%, -50%)' 
        }}
      >
        {connection.id.substring(0, 8)}
      </div>
      
      {/* Точка для выделения соединения по центру */}
      <div 
        className="absolute z-10 w-6 h-6 bg-white border-2 rounded-full cursor-grab hover:border-blue-500"
        style={{ 
          top: `${(sourceY + targetY) / 2}px`, 
          left: `${(sourceX + targetX) / 2}px`, 
          transform: 'translate(-50%, -50%)',
          borderColor: connection.color || (isSelected ? '#3b82f6' : '#d1d5db')
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(connection.id);
        }}
        onMouseOver={() => onMouseOver?.()}
        onMouseOut={() => onMouseOut?.()}
      />
      
      {/* Иконки удаления и настроек снизу по центру */}
      {isSelected && (
        <div 
          className="absolute flex gap-2 z-10 items-center p-1 bg-white shadow-md rounded-md border border-gray-200"
          style={{ 
            top: `${(sourceY + targetY) / 2 + 25}px`, 
            left: `${(sourceX + targetX) / 2}px`, 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          <button 
            className="p-1 rounded-md hover:bg-red-50 text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(connection.id);
            }}
            title="Удалить соединение"
          >
            <Trash2 size={16} />
          </button>
          <button 
            className="p-1 rounded-md hover:bg-blue-50 text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick?.();
            }}
            title="Настройки соединения"
          >
            <Settings size={16} />
          </button>
        </div>
      )}
    </>
  );
}
