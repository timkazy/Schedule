// components/teachers/TeacherSelector.jsx
import React, { useState } from 'react';

const TeacherSelector = ({ teachers, selectedTeacher, onSelect, disabled, isEditing, onUpdate }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameData, setRenameData] = useState({
    first_name: '',
    second_name: '',
    surname: ''
  });

  const formatTeacherName = (teacher) => {
    return `${teacher.surname} ${teacher.first_name} ${teacher.second_name}`;
  };

  const handleRenameStart = () => {
    if (selectedTeacher) {
      setRenameData({
        first_name: selectedTeacher.first_name,
        second_name: selectedTeacher.second_name,
        surname: selectedTeacher.surname
      });
      setIsRenaming(true);
    }
  };

  const handleRenameSave = async () => {
    try {
      await onUpdate(renameData);
      setIsRenaming(false);
    } catch (error) {
      console.error('Ошибка переименования:', error);
      alert('Не удалось обновить данные преподавателя');
    }
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameData({
      first_name: selectedTeacher?.first_name || '',
      second_name: selectedTeacher?.second_name || '',
      surname: selectedTeacher?.surname || ''
    });
  };

  return (
    <div className="flex-1 flex items-center space-x-4">
      <select
        value={selectedTeacher?.id || ""}
        onChange={(e) => {
          const teacher = teachers.find(t => t.id == e.target.value);
          onSelect(teacher || null);
        }}
        disabled={disabled || isRenaming}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">Выберите преподавателя...</option>
        {teachers.map(teacher => (
          <option key={teacher.id} value={teacher.id}>
            {formatTeacherName(teacher)}
          </option>
        ))}
      </select>

      {isEditing && selectedTeacher && !isRenaming && (
        <button
          onClick={handleRenameStart}
          className="px-4 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition duration-150"
        >
          Изменить ФИО
        </button>
      )}

      {isRenaming && (
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-300">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Фамилия:</span>
              <input
                type="text"
                value={renameData.surname}
                onChange={(e) => setRenameData(prev => ({ ...prev, surname: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="Иванов"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Имя:</span>
              <input
                type="text"
                value={renameData.first_name}
                onChange={(e) => setRenameData(prev => ({ ...prev, first_name: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="Иван"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Отчество:</span>
              <input
                type="text"
                value={renameData.second_name}
                onChange={(e) => setRenameData(prev => ({ ...prev, second_name: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
                placeholder="Иванович"
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleRenameSave}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              ✓
            </button>
            <button
              onClick={handleRenameCancel}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSelector;