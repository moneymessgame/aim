'use client';

import React, { useState } from 'react';
import { Blueprint } from '@/components/blueprint';
import { BlueprintData } from '@/components/blueprint/types';
import { BlueprintLibrary } from '@/components/blueprint/BlueprintLibrary';
import { BlueprintProvider } from '@/components/blueprint/BlueprintContext';

// Example data for blueprint initialization
const initialData: BlueprintData = {
  nodes: [
    {
      id: 'node1',
      type: 'Input Node',
      position: { x: 100, y: 100 },
      content: 'Process Start',
      inputs: [],
      outputs: ['data'],
    },
    {
      id: 'node2',
      type: 'Process',
      position: { x: 350, y: 200 },
      content: 'Data Processing',
      inputs: ['input'],
      outputs: ['result'],
    },
    {
      id: 'node3',
      type: 'Output',
      position: { x: 600, y: 100 },
      content: 'Final Result',
      inputs: ['result'],
      outputs: [],
    },
  ],
  connections: [
    {
      id: 'conn1',
      sourceId: 'node1',
      targetId: 'node2',
      sourceHandle: 'data',
      targetHandle: 'input',
    },
    {
      id: 'conn2',
      sourceId: 'node2',
      targetId: 'node3',
      sourceHandle: 'result',
      targetHandle: 'result',
    },
  ],
};

export default function TestPage() {
  const [blueprintData, setBlueprintData] = useState<BlueprintData>(initialData);
  const [currentExport, setCurrentExport] = useState<string>('');
  
  // Blueprint change handler
  const handleBlueprintChange = (data: BlueprintData) => {
    setBlueprintData(data);
    setCurrentExport(JSON.stringify(data, null, 2));
  };
  
  // Template selection handler
  const handleSelectTemplate = (templateData: BlueprintData) => {
    // Merge new template with current data
    const updatedData: BlueprintData = {
      nodes: [...blueprintData.nodes, ...templateData.nodes],
      connections: [...blueprintData.connections, ...templateData.connections],
    };
    
    setBlueprintData(updatedData);
    setCurrentExport(JSON.stringify(updatedData, null, 2));
  };
  
  // Clear canvas
  const handleClear = () => {
    const emptyData: BlueprintData = { nodes: [], connections: [] };
    setBlueprintData(emptyData);
    setCurrentExport(JSON.stringify(emptyData, null, 2));
  };
  
  return (
    <BlueprintProvider>
      <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blueprint Test Page</h1>
        <p className="text-gray-600 mt-2">
          Interactive blueprint editor with touch events and drag-and-drop support
        </p>
      </header>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Blueprint Interface</h2>
          <button 
            onClick={handleClear}
            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition-colors"
          >
            Clear Canvas
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Template Library</h3>
          <BlueprintLibrary onSelectTemplate={handleSelectTemplate} />
        </div>
        
        <p className="text-gray-600 mb-6">
          • Click on empty space to create a new node<br />
          • Drag a node to change its position<br />
          • Click on the output points of a node (right), then on the input points of another node (left) to create a connection<br />
          • Select a node or connection to configure properties<br />
          • <strong>Now you can create connections between different blueprints!</strong>
        </p>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Blueprint</h3>
          <div className="w-full border border-gray-200 rounded-lg">
            <div className="h-[600px] overflow-x-auto overflow-y-hidden">
              <div className="w-[2000px] h-full">
                <Blueprint initialData={blueprintData} onDataChange={handleBlueprintChange} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Schema Export (JSON)</h3>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[200px]">
            <pre className="text-sm">{currentExport || 'No data to export'}</pre>
          </div>
        </div>
      </div>
      
      <footer className="mt-8 text-center text-gray-500 text-sm">
        Created using Next.js, Tailwind CSS and dnd-kit library
      </footer>
    </div>
    </BlueprintProvider>
  );
}
