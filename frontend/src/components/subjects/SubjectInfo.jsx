// components/subjects/SubjectInfo.jsx
import React from 'react';

const SubjectInfo = ({ data, isEditing }) => {
  if (!data) return null;

  const formatSemester = (semester) => semester === 1 ? 'Весна' : 'Осень';

  return (
    <div className="subject-info-section">
      <div className="subject-info-title">
        <span>Информация о предмете</span>
      </div>

      {/* Основная информация */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
          <h3 className="text-lg font-bold mb-2">Основные данные</h3>
          <div className="detail-item">
            <span className="detail-label">Название:</span>
            <span className="detail-value">{data.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">ID:</span>
            <span className="detail-value">{data.id}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Нагрузок:</span>
            <span className="detail-value">{data.loads_count || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Создан:</span>
            <span className="detail-value">ID: {data.id}</span>
          </div>
        </div>
      </div>

      {/* Нагрузки предмета */}
      <div>
        <h3 className="text-lg font-bold mb-4">Нагрузки этого предмета</h3>
        
        {data.loads && data.loads.length > 0 ? (
          <div className="space-y-4">
            {data.loads.map(load => (
              <div key={load.id} className="load-card">
                <div className="load-header">
                  <div>
                    <h4 className="load-title">Нагрузка #{load.id}</h4>
                    <div className="load-meta">
                      Кафедра: {load.department_name} • 
                      Курс: {load.type} {load.course} • 
                      Семестр: {formatSemester(load.semester)}
                    </div>
                  </div>
                </div>

                <div className="load-details">
                  <div className="detail-item">
                    <span className="detail-label">ID нагрузки:</span>
                    <span className="detail-value">{load.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Тип обучения:</span>
                    <span className="detail-value">{load.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Курс:</span>
                    <span className="detail-value">{load.course}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Кафедра:</span>
                    <span className="detail-value">{load.department_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Семестр:</span>
                    <span className="detail-value">{formatSemester(load.semester)}</span>
                  </div>
                  
                  {load.squads && load.squads.length > 0 && (
                    <div className="mt-3">
                      <div className="detail-label mb-2">Взводы с этой нагрузкой:</div>
                      <div className="squads-list">
                        {load.squads.map((squad, index) => (
                          <span key={index} className="squad-badge">
                            {squad.number} ({squad.department_name})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Тем:</span>
                        <span className="font-medium">{load.themes_count || 0}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Типов занятий:</span>
                        <span className="font-medium">{load.lesson_types_count || 0}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>Всего часов:</span>
                        <span className="font-medium">{load.total_hours || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-message">
            Нет нагрузок для этого предмета
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectInfo;