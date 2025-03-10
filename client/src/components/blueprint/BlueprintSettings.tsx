'use client'

import React, { useState, useEffect } from 'react'
import { ConnectionData, NodeData } from './types'
import { HexColorPicker } from 'react-colorful'

interface BlueprintSettingsProps {
  selectedNode: NodeData | null
  selectedConnection: ConnectionData | null
  onNodeUpdate: (updatedNode: NodeData) => void
  onConnectionUpdate: (updatedConnection: ConnectionData) => void
}

export function BlueprintSettings({
  selectedNode,
  selectedConnection,
  onNodeUpdate,
  onConnectionUpdate
}: BlueprintSettingsProps) {
  // Локальное состояние для хранения текущих значений
  const [nodeContent, setNodeContent] = useState<string>('');
  const [nodeType, setNodeType] = useState<string>('');
  const [connectionColor, setConnectionColor] = useState<string>('#999');
  
  // Обновляем локальное состояние при изменении выбранных элементов
  useEffect(() => {
    if (selectedNode) {
      setNodeContent(selectedNode.content);
      setNodeType(selectedNode.type);
    }
    
    if (selectedConnection) {
      setConnectionColor(selectedConnection.color || '#999');
    }
  }, [selectedNode, selectedConnection]);
  
  // Функция для обновления цвета соединения
  const handleConnectionColorChange = (color: string) => {
    setConnectionColor(color);
  }
  
  // Применяем изменения цвета соединения при отпускании мыши
  const handleConnectionColorChangeComplete = () => {
    if (selectedConnection && connectionColor !== selectedConnection.color) {
      onConnectionUpdate({
        ...selectedConnection,
        color: connectionColor
      });
    }
  }

  // Функция для обновления полей узла
  const handleNodeContentChange = (value: string) => {
    setNodeContent(value);
  }
  
  const handleNodeTypeChange = (value: string) => {
    setNodeType(value);
  }
  
  // Применяем изменения узла при потере фокуса
  const handleNodeUpdateBlur = () => {
    if (selectedNode && (nodeContent !== selectedNode.content || nodeType !== selectedNode.type)) {
      onNodeUpdate({
        ...selectedNode,
        content: nodeContent,
        type: nodeType
      });
    }
  }

  return (
    <div className="space-y-4">
      {selectedNode && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Настройка узла</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                value={nodeContent}
                onChange={(e) => handleNodeContentChange(e.target.value)}
                onBlur={handleNodeUpdateBlur}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип
              </label>
              <input
                type="text"
                value={nodeType}
                onChange={(e) => handleNodeTypeChange(e.target.value)}
                onBlur={handleNodeUpdateBlur}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {selectedConnection && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Настройка соединения</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цвет соединения
            </label>
            <div className="mb-2">
              <div
                className="w-full h-6 rounded border border-gray-300"
                style={{ backgroundColor: connectionColor }}
              />
            </div>
            <HexColorPicker
              color={connectionColor}
              onChange={handleConnectionColorChange}
              onMouseUp={handleConnectionColorChangeComplete}
              onTouchEnd={handleConnectionColorChangeComplete}
              className="w-full max-w-[200px] mx-auto"
            />
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Из: {selectedConnection.sourceId} ({selectedConnection.sourceHandle})</p>
            <p>В: {selectedConnection.targetId} ({selectedConnection.targetHandle})</p>
          </div>
        </div>
      )}

      {!selectedNode && !selectedConnection && (
        <div className="text-center text-gray-500 py-10">
          Выберите узел или соединение для редактирования
        </div>
      )}
    </div>
  )
}

export default BlueprintSettings
