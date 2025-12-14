// components/subjects/SubjectSelector.jsx
import React, { useState } from 'react';

const SubjectSelector = ({ subjects, selectedSubject, onSelect, disabled, isEditing, onUpdate }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const handleRenameStart = () => {
    if (selectedSubject) {
      setNewName(selectedSubject.name);
      setIsRenaming(true);
    }
  };

  const handleRenameSave = async () => {
    if (!newName.trim() || newName === selectedSubject.name) {
      setIsRenaming(false);
      return;
    }

    try {
      await onUpdate({ name: newName.trim() });
      setIsRenaming(false);
    } catch (error) {
      console.error('Ошибка переименования:', error);
      alert('Не удалось переименовать предмет');
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setNewName(selectedSubject?.name || '');
  };

  return (
    <div className="flex-1 flex items-center space-x-4">
      <select
        value={selectedSubject?.id || ""}
        onChange={(e) => {
          const subject = subjects.find(s => s.id == e.target.value);
          onSelect(subject || null);
        }}
        disabled={disabled || isRenaming}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Выберите предмет...</option>
        {subjects.map(subject => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      {isEditing && selectedSubject && !isRenaming && (
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
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded"
            placeholder="Новое название"
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

export default SubjectSelector;