import React from 'react';

const DepartmentInfo = ({ data, isEditing }) => {
  if (!data) return null;

  const formatSemester = (semester) => semester === 1 ? 'Весна' : 'Осень';

  return (
    <div className="department-info-section">
      <div className="department-info-title">
        <span>Информация о кафедре</span>
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
            <span className="detail-label">Взводов:</span>
            <span className="detail-value">{data.squads_count || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Нагрузок:</span>
            <span className="detail-value">{data.loads_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Взводы кафедры */}
      {data.squads && data.squads.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">Взводы этой кафедры</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.squads.map(squad => (
              <div key={squad.number} className="squad-card">
                <div className="squad-header">
                  <h4 className="squad-title">Взвод {squad.number}</h4>
                </div>
                <div className="squad-details">
                  <div className="detail-item">
                    <span className="detail-label">Тип обучения:</span>
                    <span className="detail-value">{squad.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Курс:</span>
                    <span className="detail-value">{squad.course}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">День:</span>
                    <span className="detail-value">{squad.day}</span>
                  </div>
                  {squad.start_week && squad.end_week && (
                    <div className="detail-item">
                      <span className="detail-label">Недели:</span>
                      <span className="detail-value">{squad.start_week} - {squad.end_week}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Нагрузки кафедры */}
      <div>
        <h3 className="text-lg font-bold mb-4">Нагрузки этой кафедры</h3>
        
        {data.loads && data.loads.length > 0 ? (
          <div className="space-y-4">
            {data.loads.map(load => (
              <div key={load.id} className="load-card">
                <div className="load-header">
                  <div>
                    <h4 className="load-title">Нагрузка #{load.id}</h4>
                    <div className="load-meta">
                      Предмет: {load.subject_name} • 
                      Тип: {load.type} {load.course} • 
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
                    <span className="detail-label">Предмет:</span>
                    <span className="detail-value">{load.subject_name}</span>
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
                    <span className="detail-label">Семестр:</span>
                    <span className="detail-value">{formatSemester(load.semester)}</span>
                  </div>
                  
                  {load.squads && load.squads.length > 0 && (
                    <div className="mt-3">
                      <div className="detail-label mb-2">Взводы с этой нагрузкой:</div>
                      <div className="squads-list">
                        {load.squads.map((squad, index) => (
                          <span key={index} className="squad-badge">
                            {squad}
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
            Нет нагрузок для этой кафедры
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentInfo;