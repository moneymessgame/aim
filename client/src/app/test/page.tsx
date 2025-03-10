'use client';

import React, { useState } from 'react';
import { Blueprint } from '@/components/blueprint';
import { BlueprintData } from '@/components/blueprint/types';
import { BlueprintLibrary } from '@/components/blueprint/BlueprintLibrary';
import { BlueprintProvider } from '@/components/blueprint/BlueprintContext';

// Пример данных для инициализации блупринта
const initialData: BlueprintData = {
  nodes: [
    {
      id: 'node1',
      type: 'Входной узел',
      position: { x: 100, y: 100 },
      content: 'Начало процесса',
      inputs: [],
      outputs: ['данные'],
    },
    {
      id: 'node2',
      type: 'Процесс',
      position: { x: 350, y: 200 },
      content: 'Обработка данных',
      inputs: ['вход'],
      outputs: ['результат'],
    },
    {
      id: 'node3',
      type: 'Вывод',
      position: { x: 600, y: 100 },
      content: 'Конечный результат',
      inputs: ['результат'],
      outputs: [],
    },
  ],
  connections: [
    {
      id: 'conn1',
      sourceId: 'node1',
      targetId: 'node2',
      sourceHandle: 'данные',
      targetHandle: 'вход',
    },
    {
      id: 'conn2',
      sourceId: 'node2',
      targetId: 'node3',
      sourceHandle: 'результат',
      targetHandle: 'результат',
    },
  ],
};

export default function TestPage() {
  const [blueprintData, setBlueprintData] = useState<BlueprintData>(initialData);
  const [currentExport, setCurrentExport] = useState<string>('');
  
  // Обработчик изменения схемы
  const handleBlueprintChange = (data: BlueprintData) => {
    setBlueprintData(data);
    setCurrentExport(JSON.stringify(data, null, 2));
  };
  
  // Обработка выбора шаблона
  const handleSelectTemplate = (templateData: BlueprintData) => {
    // Объединяем новый шаблон с текущими данными
    const updatedData: BlueprintData = {
      nodes: [...blueprintData.nodes, ...templateData.nodes],
      connections: [...blueprintData.connections, ...templateData.connections],
    };
    
    setBlueprintData(updatedData);
    setCurrentExport(JSON.stringify(updatedData, null, 2));
  };
  
  // Очистка полотна
  const handleClear = () => {
    const emptyData: BlueprintData = { nodes: [], connections: [] };
    setBlueprintData(emptyData);
    setCurrentExport(JSON.stringify(emptyData, null, 2));
  };
  
  return (
    <BlueprintProvider>
      <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Тестовая страница блупринтов</h1>
        <p className="text-gray-600 mt-2">
          Интерактивный редактор блупринтов с поддержкой touch-событий и drag-and-drop
        </p>
      </header>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Интерфейс блупринтов</h2>
          <button 
            onClick={handleClear}
            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition-colors"
          >
            Очистить полотно
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Библиотека шаблонов</h3>
          <BlueprintLibrary onSelectTemplate={handleSelectTemplate} />
        </div>
        
        <p className="text-gray-600 mb-6">
          • Нажмите на пустое пространство, чтобы создать новый узел<br />
          • Перетащите узел для изменения его положения<br />
          • Нажмите на выходные точки узла (справа), затем на входные точки другого узла (слева) для создания соединения<br />
          • Выберите узел или соединение для настройки свойств<br />
          • <strong>Теперь можно создавать соединения между разными блупринтами!</strong>
        </p>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Блупринт</h3>
          <div className="w-full border border-gray-200 rounded-lg">
            <div className="h-[600px] overflow-x-auto overflow-y-hidden">
              <div className="w-[2000px] h-full">
                <Blueprint initialData={blueprintData} onDataChange={handleBlueprintChange} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Экспорт схемы (JSON)</h3>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[200px]">
            <pre className="text-sm">{currentExport || 'Нет данных для экспорта'}</pre>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        Создано с использованием Next.js, Tailwind CSS и библиотеки dnd-kit
      </footer>
    </div>
    </BlueprintProvider>
  );
}
