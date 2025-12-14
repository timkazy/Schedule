// components/disciplines/SubjectThemes.jsx
import React, { useState } from 'react';
import { disciplineApi } from '../../api/api';

const SubjectThemes = ({ subjectLoadId, themesData, isEditing, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null);
  const [formData, setFormData] = useState({
    lesson_type_id: '',
    topic: '',
    subtopic: '',
    hours_count: '',
    topic_name: '',
    subtopic_name: ''
  });
  const [lessonTypes, setLessonTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLessonTypes = async () => {
    try {
      setLoading(true);
      const types = await disciplineApi.getLessonTypes();
      setLessonTypes(types);
    } catch (error) {
      console.error('Ошибка загрузки типов занятий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async () => {
    await loadLessonTypes();
    setShowAddForm(true);
    setEditingTheme(null);
    setFormData({
      lesson_type_id: '',
      topic: '',
      subtopic: '',
      hours_count: '',
      topic_name: '',
      subtopic_name: ''
    });
  };

  const handleEditClick = async (themeData) => {
    await loadLessonTypes();
    setEditingTheme(themeData);
    setShowAddForm(true);
    setFormData({
      lesson_type_id: themeData.lesson_type_id,
      topic: themeData.topic,
      subtopic: themeData.subtopic,
      hours_count: themeData.hours_count,
      topic_name: themeData.topic_name || '',
      subtopic_name: themeData.subtopic_name || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lesson_type_id || !formData.topic || !formData.subtopic || !formData.hours_count) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const dataToSend = {
        lesson_type_id: parseInt(formData.lesson_type_id),
        topic: parseInt(formData.topic),
        subtopic: parseInt(formData.subtopic),
        hours_count: parseInt(formData.hours_count),
        topic_name: formData.topic_name || null,
        subtopic_name: formData.subtopic_name || null
      };

      if (editingTheme) {
        await disciplineApi.updateTheme(editingTheme.id, dataToSend);
      } else {
        await disciplineApi.addTheme(subjectLoadId, dataToSend);
      }
      
      setShowAddForm(false);
      setEditingTheme(null);
      onUpdate();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (themeId) => {
    if (!window.confirm('Удалить тему?')) return;
    
    try {
      await disciplineApi.deleteTheme(themeId);
      onUpdate();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления');
    }
  };

  return (
    <div className="section-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="section-title">Темы нагрузки</h3>
        {isEditing && (
          <button
            onClick={handleAddClick}
            className="add-button"
          >
            + Добавить тему
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-4">
            {editingTheme ? 'Редактирование темы' : 'Добавление темы'}
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
                  disabled={loading}
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

              {/* Номер темы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер темы
                </label>
                <input
                  type="number"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>

              {/* Номер подтемы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Номер подтемы
                </label>
                <input
                  type="number"
                  value={formData.subtopic}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtopic: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Часы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Часы
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

              {/* Название темы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название темы
                </label>
                <input
                  type="text"
                  value={formData.topic_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Необязательно"
                />
              </div>

              {/* Название подтемы */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название подтемы
                </label>
                <input
                  type="text"
                  value={formData.subtopic_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtopic_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Необязательно"
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
                  setEditingTheme(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица тем */}
      <div className="table-container">
        {themesData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Тип</th>
                <th>Тема</th>
                <th>Подтема</th>
                <th>Часы</th>
                <th>Название темы</th>
                <th>Название подтемы</th>
                {isEditing && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {themesData.map(theme => (
                <tr key={theme.id}>
                  <td>{theme.lesson_type_name}</td>
                  <td>{theme.topic}</td>
                  <td>{theme.subtopic}</td>
                  <td>{theme.hours_count}</td>
                  <td>{theme.topic_name || '-'}</td>
                  <td>{theme.subtopic_name || '-'}</td>
                  {isEditing && (
                    <td className="action-cell">
                      <button
                        onClick={() => handleEditClick(theme)}
                        className="action-button edit-button"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(theme.id)}
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
          <div className="empty-message">Нет тем</div>
        )}
      </div>
    </div>
  );
};

export default SubjectThemes;