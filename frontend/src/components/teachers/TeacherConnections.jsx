// components/teachers/TeacherConnections.jsx
import React, { useState } from 'react';
import { teachersApi } from '../../api/api';

const TeacherConnections = ({ teacherId, connections, isEditing, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [availableConnections, setAvailableConnections] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableConnections = async () => {
    try {
      setLoading(true);
      const result = await teachersApi.getAvailableConnections(teacherId);
      setAvailableConnections(result);
    } catch (error) {
      console.error('Ошибка загрузки доступных связок:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async () => {
    await loadAvailableConnections();
    setShowAddForm(true);
  };

  const handleAddToConnection = async (subjectLoadId, squadNumber) => {
    try {
      // Получаем текущих преподавателей для этой связки
      const connection = availableConnections.find(c => 
        c.subject_load_id === subjectLoadId && c.squad === squadNumber
      );
      if (!connection) return;

      // Добавляем текущего преподавателя к списку
      const currentOfficers = connection.officers || [];
      const newOfficers = [...currentOfficers, teacherId.toString()];
      
      await teachersApi.updateConnectionOfficers(subjectLoadId, squadNumber, {
        officers: newOfficers
      });

      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Ошибка добавления преподавателя:', error);
      alert(error.message || 'Ошибка добавления преподавателя');
    }
  };

  const handleRemoveFromConnection = async (subjectLoadId, squadNumber) => {
    try {
      const connection = connections.find(c => 
        c.subject_load_id === subjectLoadId && c.squad === squadNumber
      );
      if (!connection) return;

      // Убираем текущего преподавателя из списка
      const newOfficers = connection.officer_ids.filter(id => id !== teacherId);
      
      await teachersApi.updateConnectionOfficers(subjectLoadId, squadNumber, {
        officers: newOfficers
      });

      onUpdate();
    } catch (error) {
      console.error('Ошибка удаления преподавателя:', error);
      alert(error.message || 'Ошибка удаления преподавателя');
    }
  };

  const formatOfficersList = (officerNames) => {
    if (!officerNames || officerNames.length === 0) return 'Нет преподавателей';
    return officerNames.join(', ');
  };

  return (
    <div className="teacher-info-section">
      <div className="flex justify-between items-center mb-6">
        <h3 className="teacher-info-title">Связки с нагрузками и взводами</h3>
        {isEditing && (
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : '+ Добавить к нагрузке'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-form mb-6">
          <h4 className="font-semibold mb-4">Выберите нагрузку для добавления преподавателя:</h4>
          {availableConnections.length > 0 ? (
            <div className="space-y-3">
              {availableConnections.map(connection => (
                <div key={`${connection.subject_load_id}-${connection.squad}`} 
                     className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">{connection.subject_name}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        Кафедра: {connection.department_name} • 
                        Курс: {connection.type} {connection.course} • 
                        Взвод: {connection.squad}
                      </div>
                      <div className="text-sm text-gray-500">
                        Преподаватели: {formatOfficersList(connection.officer_names || [])}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToConnection(connection.subject_load_id, connection.squad)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-4"
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Нет доступных нагрузок для добавления
            </div>
          )}
          <div className="mt-4 text-right">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {connections.length > 0 ? (
        <div className="space-y-4">
          {connections.map(connection => (
            <div key={`${connection.subject_load_id}-${connection.squad}`} 
                 className="connection-card">
              <div className="connection-header">
                <div>
                  <h4 className="connection-title">{connection.subject_name}</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    Кафедра: {connection.department_name} • 
                    Курс: {connection.type} {connection.course} • 
                    Взвод: {connection.squad}
                  </div>
                </div>
                {isEditing && (
                  <div className="connection-actions">
                    <button
                      onClick={() => handleRemoveFromConnection(connection.subject_load_id, connection.squad)}
                      className="action-button delete-button"
                    >
                      Убрать из этой нагрузки
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Преподаватели этой нагрузки:</div>
                <div className="flex flex-wrap gap-2">
                  {connection.officer_names.map((name, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        connection.officer_ids[index] === teacherId.toString()
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Семестр:</span>
                  <span className="font-medium">{connection.semester === 1 ? 'Весна' : 'Осень'}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Связь создана:</span>
                  <span className="font-medium">
                    {connection.subject_load_id}-{connection.squad}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-message">
          Преподаватель не привязан ни к одной нагрузке
        </div>
      )}
    </div>
  );
};

export default TeacherConnections;