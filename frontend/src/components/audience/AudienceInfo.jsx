// components/audience/AudienceInfo.jsx
import React, { useState, useEffect } from 'react';
import { audienceApi } from '../../api/api';
import './Audience.css';

const AudienceInfo = ({ data, isEditing, onUpdate }) => {
  const [hourLoads, setHourLoads] = useState(data?.hour_loads || []);
  const [availableHourLoads, setAvailableHourLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (data) {
      setHourLoads(data.hour_loads || []);
    }
  }, [data]);

  const loadAvailableHourLoads = async () => {
    try {
      setLoading(true);
      const result = await audienceApi.getAvailableHourLoads(data.audience_number);
      console.log("Доступные нагрузки:", result);
      setAvailableHourLoads(result);
    } catch (error) {
      console.error('Ошибка загрузки доступных нагрузок:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async () => {
    await loadAvailableHourLoads();
    setShowAddForm(true);
  };

  const handleAddToHourLoad = async (subjectLoadId, lessonTypeId) => {
    try {
      const hourLoad = availableHourLoads.find(h =>
        h.subject_load_id === subjectLoadId && h.lesson_type_id === lessonTypeId
      );
      if (!hourLoad) return;

      const currentAudiences = hourLoad.audiences || [];
      if (currentAudiences.length >= 3) {
        alert('Лимит аудиторий (3) достигнут');
        return;
      }

      const newAudiences = [...currentAudiences, data.audience_number.toString()];
      console.log("Новые аудитории:", newAudiences);

      await audienceApi.updateHourLoadAudiences(
        subjectLoadId, 
        lessonTypeId, 
        { audiences: newAudiences }
      );

      setShowAddForm(false);
      onUpdate();
    } catch (error) {
      console.error('Ошибка добавления аудитории:', error);
      alert(error.message || 'Ошибка добавления аудитории');
    }
  };

  const handleRemoveFromHourLoad = async (subjectLoadId, lessonTypeId) => {
    try {
      const hourLoad = hourLoads.find(h => 
        h.subject_load_id === subjectLoadId && h.lesson_type_id === lessonTypeId
      );
      if (!hourLoad) return;

      // Убираем текущую аудиторию из списка
      const newAudiences = hourLoad.audiences.filter(a => a !== data.audience_number.toString());
      
      await audienceApi.updateHourLoadAudiences(
        subjectLoadId, 
        lessonTypeId, 
        { audiences: newAudiences }
      );

      onUpdate();
    } catch (error) {
      console.error('Ошибка удаления аудитории:', error);
      alert(error.message || 'Ошибка удаления аудитории');
    }
  };

  if (!data) return null;

  return (
    <div className="audience-info-section">
      <div className="audience-title">
        <span>Информация об аудитории №{data.audience_number}</span>
      </div>

      {/* Основная информация */}
      <div className="info-grid">
        <div className="info-card">
          <h3 className="info-card-title">Статистика</h3>
          <div className="info-item">
            <span className="info-label">Всего нагрузок:</span>
            <span className="info-value">{hourLoads.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Включена в:</span>
            <span className="info-value">
              {hourLoads.reduce((sum, h) => sum + (h.audiences || []).length, 0)} наборов
            </span>
          </div>
        </div>

        <div className="info-card">
          <h3 className="info-card-title">Уроки</h3>
          <div className="info-item">
            <span className="info-label">Запланировано:</span>
            <span className="info-value">{data.lessons_count || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Последний урок:</span>
            <span className="info-value">
              {data.last_lesson_date ? new Date(data.last_lesson_date).toLocaleDateString('ru-RU') : 'Нет уроков'}
            </span>
          </div>
        </div>
      </div>

      {/* Нагрузки, связанные с аудиторией */}
      <div className="info-card mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="info-card-title">Нагрузки с этой аудиторией</h3>
          {isEditing && (
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : '+ Добавить в нагрузку'}
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="add-form mb-4">
            <h4 className="font-semibold mb-3">Выберите нагрузку для добавления аудитории:</h4>
            {availableHourLoads.length > 0 ? (
              <div className="space-y-2">
                {availableHourLoads.map(hourLoad => (
                  <div key={`${hourLoad.subject_load_id}-${hourLoad.lesson_type_id}`} 
                       className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">{hourLoad.subject_name}</div>
                      <div className="text-sm text-gray-600">
                        {hourLoad.lesson_type_name} • {hourLoad.hours_count} часов
                      </div>
                      <div className="text-sm text-gray-500">
                        Аудитории: {hourLoad.audiences?.join(', ') || 'нет'} ({hourLoad.audiences?.length || 0}/3)
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToHourLoad(hourLoad.subject_load_id, hourLoad.lesson_type_id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={(hourLoad.audiences?.length || 0) >= 3}
                    >
                      Добавить
                    </button>
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

        {hourLoads.length > 0 ? (
          <div className="space-y-3">
            {hourLoads.map(hourLoad => (
              <div key={`${hourLoad.subject_load_id}-${hourLoad.lesson_type_id}`} 
                   className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-lg">{hourLoad.subject_name}</div>
                    <div className="text-gray-600">
                      Кафедра: {hourLoad.department_name} •
                      Курс: {hourLoad.type} {hourLoad.course} •
                      Семестр: {hourLoad.semester === 1 ? 'Весна' : 'Осень'}
                    </div>
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveFromHourLoad(hourLoad.subject_load_id, hourLoad.lesson_type_id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Отвязать
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700">
                      <strong>Тип занятия:</strong> {hourLoad.lesson_type_name}
                    </div>
                    <div className="text-gray-700">
                      <strong>Часы:</strong> {hourLoad.hours_count}
                    </div>
                  </div>

                  <div className="mt-2">
                    <strong>Аудитории в этом наборе:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hourLoad.audiences.map((aud, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm ${aud === data.audience_number.toString()
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          №{aud}
                        </span>
                      ))}
                      {hourLoad.audiences.length === 0 && (
                        <span className="text-gray-500 italic">Нет назначенных аудиторий</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Аудитория не используется ни в одной нагрузке
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceInfo;