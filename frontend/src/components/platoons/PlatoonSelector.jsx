// components/platoons/PlatoonSelector.jsx
import React, { useState } from 'react';
import { platoonApi } from '../../api/api';

const PlatoonSelector = ({ 
  platoons, 
  selectedPlatoon, 
  onSelect, 
  disabled,
  isEditing,
  onUpdate,
  departmentId 
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newNumber, setNewNumber] = useState(selectedPlatoon?.number || '');

  const handleRenameStart = () => {
    setNewNumber(selectedPlatoon.number);
    setIsRenaming(true);
  };

  const handleRenameSave = async () => {
    if (!newNumber.trim() || newNumber === selectedPlatoon.number) {
      setIsRenaming(false);
      return;
    }

    try {
      // обрабатывать если возвращают bad
      const response = await platoonApi.renamePlatoon(selectedPlatoon.number, newNumber.trim());
      console.log(response);
      setIsRenaming(false);
      onSelect({ ...selectedPlatoon, number: newNumber.trim() });
      if (departmentId) onUpdate(departmentId);
    } catch (error) {
      console.error('Ошибка переименования:', error);
      alert('Не удалось переименовать взвод');
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setNewNumber(selectedPlatoon?.number || '');
  };

  return (
    <div className="flex-1 flex items-center space-x-4">
      <select
        value={selectedPlatoon?.number || ""}
        onChange={(e) => {
          const platoon = platoons.find(p => p.number == e.target.value);
          onSelect(platoon || null);
        }}
        disabled={disabled || isRenaming}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Выберите взвод...</option>
        {platoons.map(platoon => (
          <option key={platoon.number} value={platoon.number}>
            {platoon.number}
          </option>
        ))}
      </select>

      {isEditing && selectedPlatoon && !isRenaming && (
        <button
          onClick={handleRenameStart}
          className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition duration-150"
        >
          Переименовать
        </button>
      )}

      {isRenaming && (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded"
            placeholder="Новый номер"
          />
          <button
            onClick={handleRenameSave}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={handleRenameCancel}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatoonSelector;