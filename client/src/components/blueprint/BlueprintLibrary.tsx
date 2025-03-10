'use client';

import React from 'react';
import { BlueprintData } from './types';
import { generateId } from '@/lib/utils';

// Шаблоны блупринтов для быстрого добавления
export const blueprintTemplates: Record<string, BlueprintData> = {
  simple: {
    nodes: [
      {
        id: 'input',
        type: 'Вход',
        position: { x: 50, y: 50 },
        content: 'Входные данные',
        inputs: [],
        outputs: ['данные'],
      },
      {
        id: 'process',
        type: 'Процесс',
        position: { x: 300, y: 50 },
        content: 'Обработка',
        inputs: ['вход'],
        outputs: ['выход'],
      },
      {
        id: 'output',
        type: 'Выход',
        position: { x: 550, y: 50 },
        content: 'Результат',
        inputs: ['результат'],
        outputs: [],
      },
    ],
    connections: [
      {
        id: 'conn1',
        sourceId: 'input',
        targetId: 'process',
        sourceHandle: 'данные',
        targetHandle: 'вход',
      },
      {
        id: 'conn2',
        sourceId: 'process',
        targetId: 'output',
        sourceHandle: 'выход',
        targetHandle: 'результат',
      },
    ],
  },
  conditional: {
    nodes: [
      {
        id: 'start',
        type: 'Старт',
        position: { x: 50, y: 150 },
        content: 'Начало',
        inputs: [],
        outputs: ['выход'],
      },
      {
        id: 'condition',
        type: 'Условие',
        position: { x: 300, y: 150 },
        content: 'Проверка условия',
        inputs: ['вход'],
        outputs: ['да', 'нет'],
      },
      {
        id: 'true-path',
        type: 'Действие',
        position: { x: 550, y: 50 },
        content: 'Если ДА',
        inputs: ['вход'],
        outputs: ['выход'],
      },
      {
        id: 'false-path',
        type: 'Действие',
        position: { x: 550, y: 250 },
        content: 'Если НЕТ',
        inputs: ['вход'],
        outputs: ['выход'],
      },
      {
        id: 'end',
        type: 'Конец',
        position: { x: 800, y: 150 },
        content: 'Завершение',
        inputs: ['вход'],
        outputs: [],
      },
    ],
    connections: [
      {
        id: 'conn1',
        sourceId: 'start',
        targetId: 'condition',
        sourceHandle: 'выход',
        targetHandle: 'вход',
      },
      {
        id: 'conn2',
        sourceId: 'condition',
        targetId: 'true-path',
        sourceHandle: 'да',
        targetHandle: 'вход',
      },
      {
        id: 'conn3',
        sourceId: 'condition',
        targetId: 'false-path',
        sourceHandle: 'нет',
        targetHandle: 'вход',
      },
      {
        id: 'conn4',
        sourceId: 'true-path',
        targetId: 'end',
        sourceHandle: 'выход',
        targetHandle: 'вход',
      },
      {
        id: 'conn5',
        sourceId: 'false-path',
        targetId: 'end',
        sourceHandle: 'выход',
        targetHandle: 'вход',
      },
    ],
  },
  loop: {
    nodes: [
      {
        id: 'init',
        type: 'Инициализация',
        position: { x: 50, y: 150 },
        content: 'Начальное значение',
        inputs: [],
        outputs: ['значение'],
      },
      {
        id: 'condition',
        type: 'Условие',
        position: { x: 300, y: 150 },
        content: 'Проверка условия',
        inputs: ['вход'],
        outputs: ['продолжить', 'завершить'],
      },
      {
        id: 'body',
        type: 'Тело цикла',
        position: { x: 300, y: 350 },
        content: 'Итерация',
        inputs: ['вход'],
        outputs: ['выход'],
      },
      {
        id: 'result',
        type: 'Результат',
        position: { x: 550, y: 150 },
        content: 'Финальный результат',
        inputs: ['вход'],
        outputs: [],
      },
    ],
    connections: [
      {
        id: 'conn1',
        sourceId: 'init',
        targetId: 'condition',
        sourceHandle: 'значение',
        targetHandle: 'вход',
      },
      {
        id: 'conn2',
        sourceId: 'condition',
        targetId: 'body',
        sourceHandle: 'продолжить',
        targetHandle: 'вход',
      },
      {
        id: 'conn3',
        sourceId: 'body',
        targetId: 'condition',
        sourceHandle: 'выход',
        targetHandle: 'вход',
      },
      {
        id: 'conn4',
        sourceId: 'condition',
        targetId: 'result',
        sourceHandle: 'завершить',
        targetHandle: 'вход',
      },
    ],
  },
};

interface TemplateItemProps {
  name: string;
  template: BlueprintData;
  onSelect: (template: BlueprintData) => void;
}

// Компонент для отображения одного шаблона
function TemplateItem({ name, template, onSelect }: TemplateItemProps) {
  // Функция для создания глубокой копии шаблона с новыми ID
  const createTemplateWithNewIds = () => {
    // Карта соответствия старых ID новым
    const idMap: Record<string, string> = {};
    
    // Создаем новые узлы с новыми ID
    const newNodes = template.nodes.map(node => {
      const newId = generateId();
      idMap[node.id] = newId;
      
      return {
        ...node,
        id: newId
      };
    });
    
    // Создаем новые соединения с новыми ID
    const newConnections = template.connections.map(conn => {
      return {
        id: generateId(),
        sourceId: idMap[conn.sourceId] || conn.sourceId,
        targetId: idMap[conn.targetId] || conn.targetId,
        sourceHandle: conn.sourceHandle,
        targetHandle: conn.targetHandle,
      };
    });
    
    return {
      nodes: newNodes,
      connections: newConnections
    };
  };
  
  return (
    <div 
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
      onClick={() => onSelect(createTemplateWithNewIds())}
    >
      <h3 className="font-medium mb-1">{name}</h3>
      <div className="text-xs text-gray-500">
        {template.nodes.length} узлов, {template.connections.length} соединений
      </div>
    </div>
  );
}

interface BlueprintLibraryProps {
  onSelectTemplate: (template: BlueprintData) => void;
}

// Основной компонент библиотеки шаблонов
export function BlueprintLibrary({ onSelectTemplate }: BlueprintLibraryProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Шаблоны блупринтов</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <TemplateItem name="Простая цепочка" template={blueprintTemplates.simple} onSelect={onSelectTemplate} />
        <TemplateItem name="Условное ветвление" template={blueprintTemplates.conditional} onSelect={onSelectTemplate} />
        <TemplateItem name="Цикл" template={blueprintTemplates.loop} onSelect={onSelectTemplate} />
      </div>
    </div>
  );
}

export default BlueprintLibrary;
