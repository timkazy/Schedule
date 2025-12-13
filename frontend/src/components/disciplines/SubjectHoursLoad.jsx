// components/disciplines/SubjectHoursLoad.jsx
import React, { useState } from 'react';
import { disciplineApi } from '../../api/api';

const SubjectHoursLoad = ({ subjectLoadId, hoursData, isEditing, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHour, setEditingHour] = useState(null);
  const [formData, setFormData] = useState({
    lesson_type_id: '',
    hours_count: '',
    audiences: ''
  });
  const [lessonTypes, setLessonTypes] = useState([]);
  const [availableAudiences, setAvailableAudiences] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableData = async () => {
    try {
      setLoading(true);
      const [types, audiences] = await Promise.all([
        disciplineApi.getLessonTypes(),
        disciplineApi.getAudiences()
      ]);
      setLessonTypes(types);
      setAvailableAudiences(audiences);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async () => {
    await loadAvailableData();
    setShowAddForm(true);
    setEditingHour(null);
    setFormData({ lesson_type_id: '', hours_count: '', audiences: '' });
  };

  const handleEditClick = async (hourData) => {
    await loadAvailableData();
    setEditingHour(hourData);
    setShowAddForm(true);
    setFormData({
      lesson_type_id: hourData.lesson_type_id,
      hours_count: hourData.hours_count,
      audiences: hourData.audiences.join('/')
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lesson_type_id || !formData.hours_count) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        lesson_type_id: parseInt(formData.lesson_type_id),
        hours_count: parseInt(formData.hours_count),
        audiences: formData.audiences || ''
      };

      if (editingHour) {
        await disciplineApi.updateHoursLoad(subjectLoadId, editingHour.lesson_type_id, dataToSend);
      } else {
        await disciplineApi.addHoursLoad(subjectLoadId, dataToSend);
      }
      
      setShowAddForm(false);
      setEditingHour(null);
      onUpdate();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lessonTypeId) => {
    if (!window.confirm('Удалить запись о часах?')) return;
    
    try {
      await disciplineApi.deleteHoursLoad(subjectLoadId, lessonTypeId);
      onUpdate();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления');
    }
  };

  return (
    <div className="section-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="section-title">Часы нагрузки по типам занятий</h3>
        {isEditing && (
          <button
            onClick={handleAddClick}
            className="add-button"
          >
            + Добавить часы
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-4">
            {editingHour ? 'Редактирование часов' : 'Добавление часов'}
          </h4>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Тип занятия */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип занятия
                </label>
                <select
                  value={formData.lesson_type_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, lesson_type_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading || editingHour}
                  required
                >
                  <option value="">Выберите тип...</option>
                  {lessonTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Количество часов */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество часов
                </label>
                <input
                  type="number"
                  value={formData.hours_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours_count: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>

              {/* Аудитории */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Аудитории (через /)
                </label>
                <input
                  type="text"
                  value={formData.audiences}
                  onChange={(e) => setFormData(prev => ({ ...prev, audiences: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="101/102/103"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingHour(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица часов */}
      <div className="table-container">
        {hoursData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Тип занятия</th>
                <th>Часы</th>
                <th>Аудитории</th>
                {isEditing && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {hoursData.map(hour => (
                <tr key={hour.lesson_type_id}>
                  <td>{hour.lesson_type_name}</td>
                  <td>{hour.hours_count}</td>
                  <td>{hour.audiences.join(', ')}</td>
                  {isEditing && (
                    <td className="action-cell">
                      <button
                        onClick={() => handleEditClick(hour)}
                        className="action-button edit-button"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(hour.lesson_type_id)}
                        className="action-button delete-button"
                      >
                        Удалить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-message">Нет данных о часах нагрузки</div>
        )}
      </div>
    </div>
  );
};

export default SubjectHoursLoad;