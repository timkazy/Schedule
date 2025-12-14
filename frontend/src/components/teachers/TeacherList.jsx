// components/teachers/TeacherList.jsx
import React, { useState } from 'react';

const TeacherList = ({ teachers, loading, isEditing, onEdit, onDelete }) => {
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  const toggleTeacherDetails = (teacherId) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  const formatTeacherName = (teacher) => {
    return `${teacher.surname} ${teacher.first_name} ${teacher.second_name}`;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Загрузка преподавателей...</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">👨‍🏫</div>
        <h3 className="text-xl font-semibold mb-2">Нет преподавателей</h3>
        <p className="text-gray-600">Добавьте первого преподавателя, чтобы начать работу</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Список преподавателей</h2>
        <p className="text-gray-600">Всего преподавателей: {teachers.length}</p>
      </div>

      <div className="space-y-4">
        {teachers.map(teacher => (
          <div key={teacher.id} className="teacher-card">
            <div className="teacher-card-header">
              <div>
                <h3 className="teacher-name">{formatTeacherName(teacher)}</h3>
                <div className="teacher-stats">
                  ID: {teacher.id} • Загруженностей: {teacher.loads_count || 0} • Уроков: {teacher.lessons_count || 0}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleTeacherDetails(teacher.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {expandedTeacher === teacher.id ? 'Скрыть детали' : 'Показать детали'}
                </button>
                
                {isEditing && (
                  <div className="teacher-actions">
                    <button
                      onClick={() => onEdit(teacher)}
                      className="action-button edit-button"
                    >
                      Изменить
                    </button>
                    <button
                      onClick={() => onDelete(teacher.id)}
                      className="action-button delete-button"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </div>

            {expandedTeacher === teacher.id && (
              <div className="teacher-details">
                <div className="detail-item">
                  <span className="detail-label">Фамилия:</span>
                  <span className="detail-value">{teacher.surname}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Имя:</span>
                  <span className="detail-value">{teacher.first_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Отчество:</span>
                  <span className="detail-value">{teacher.second_name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ID в системе:</span>
                  <span className="detail-value">{teacher.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Нагрузки:</span>
                  <span className="detail-value">{teacher.loads_count || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Проведено уроков:</span>
                  <span className="detail-value">{teacher.lessons_count || 0}</span>
                </div>
                {teacher.last_lesson_date && (
                  <div className="detail-item">
                    <span className="detail-label">Последний урок:</span>
                    <span className="detail-value">
                      {new Date(teacher.last_lesson_date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherList;