'use client';

import React, { useState } from 'react';
import { NodeData } from './types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlueprintPanelProps {
  onAddNode: (nodeTemplate: Omit<NodeData, 'id' | 'position'>) => void;
}

// Шаблоны блупринтов, которые можно добавить на полотно
const nodeTemplates: Array<Omit<NodeData, 'id' | 'position'>> = [
  {
    type: 'Ввод',
    content: 'Входные данные',
    inputs: [],
    outputs: ['выход1', 'выход2'],
    color: '#4f46e5'
  },
  {
    type: 'Обработка',
    content: 'Обработка данных',
    inputs: ['вход1', 'вход2'],
    outputs: ['выход1', 'выход2'],
    color: '#10b981'
  },
  {
    type: 'Фильтр',
    content: 'Фильтрация данных',
    inputs: ['вход1'],
    outputs: ['выход1'],
    color: '#f59e0b'
  },
  {
    type: 'Вывод',
    content: 'Результат',
    inputs: ['вход1', 'вход2'],
    outputs: [],
    color: '#ef4444'
  }
];

export function BlueprintPanel({ onAddNode }: BlueprintPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  
  const handleDragStart = (e: React.DragEvent, template: Omit<NodeData, 'id' | 'position'>) => {
    e.dataTransfer.setData('application/json', JSON.stringify(template));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full",
      collapsed ? "w-12" : "w-64"
    )}>
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        {!collapsed && <h3 className="text-sm font-medium">Блупринты</h3>}
        <button 
          className={cn(
            "p-1 rounded-md hover:bg-gray-100 transition-colors",
            collapsed ? "mx-auto" : "ml-auto"
          )}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Развернуть панель" : "Свернуть панель"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      {!collapsed && (
        <div className="p-3 overflow-y-auto flex-1">
          <div className="space-y-3">
            {nodeTemplates.map((template, index) => (
              <div
                key={index}
                className={cn(
                  'p-3 rounded-lg border-2 cursor-grab transition-all',
                  'hover:shadow-md hover:border-blue-500'
                )}
                style={{ borderColor: template.color || '#e5e7eb' }}
                draggable
                onDragStart={(e) => handleDragStart(e, template)}
              >
                <div className="font-bold text-sm mb-1">{template.type}</div>
                <div className="text-xs text-gray-600">{template.content}</div>
                
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <div>
                    Входы: {template.inputs.length}
                  </div>
                  <div>
                    Выходы: {template.outputs.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {collapsed && (
        <div className="p-2 overflow-y-auto flex-1">
          {nodeTemplates.map((template, index) => (
            <div
              key={index}
              className="mb-2 w-8 h-8 rounded-md cursor-grab flex items-center justify-center"
              style={{ backgroundColor: template.color || '#e5e7eb' }}
              title={`${template.type}: ${template.content}`}
              draggable
              onDragStart={(e) => handleDragStart(e, template)}
            >
              <span className="text-white font-bold text-xs">
                {template.type.charAt(0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlueprintPanel;
