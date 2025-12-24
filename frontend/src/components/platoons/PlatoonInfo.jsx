import React, { useState, useEffect } from 'react';
import { platoonApi } from '../../api/api';

const PlatoonInfo = ({ data, isEditing, onSave }) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [formData, setFormData] = useState({});
  const [squadTypes, setSquadTypes] = useState([]);
  const [weekDays, setWeekDays] = useState([
    { id: 1, name: 'Понедельник' },
    { id: 2, name: 'Вторник' },
    { id: 3, name: 'Среда' },
    { id: 4, name: 'Четверг' },
    { id: 5, name: 'Пятница' },
    { id: 6, name: 'Суббота' },
    { id: 7, name: 'Воскресенье' }
  ]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка типов взводов
  useEffect(() => {
    const loadSquadTypes = async () => {
      try {
        setLoadingTypes(true);
        setError(null);
        const response = await platoonApi.getSquadTypes();
        
        // Проверяем, что response существует и является массивом
        console.log("Response: ", response)
        if (response && Array.isArray(response)) {
          setSquadTypes(response);
        } else {
          console.error('Некорректный формат данных типов взводов:', response);
          setSquadTypes([]);
          setError('Не удалось загрузить типы взводов');
        }
      } catch (error) {
        console.error('Ошибка загрузки типов взводов:', error);
        setSquadTypes([]);
        setError('Ошибка загрузки типов взводов');
      } finally {
        setLoadingTypes(false);
      }
    };

    loadSquadTypes();
  }, []);

  // Инициализация данных
  useEffect(() => {
    if (data) {
      console.log('(useEffect изза data: PlatoonInfo получены данные:', data);

      setFormData({
        number: data.number,
        squad_type_id: data.squad_type_id || null,
        day: data.day || 1,
        start_week: data.start_week || data.start_week === 0 ? data.start_week : null,
        end_week: data.end_week || data.end_week === 0 ? data.end_week : null
      });

      console.log("В итоге formData: ", {
        number: data.number,
        squad_type_id: data.squad_type_id || null,
        day: data.day || 1,
        start_week: data.start_week || data.start_week === 0 ? data.start_week : null,
        end_week: data.end_week || data.end_week === 0 ? data.end_week : null
      });
    }
  }, [data]);

  const handleInputChange = (field, value) => {
    console.log("Fv: ", field, value );
    setFormData(prev => ({

      ...prev, 
      [field]: field === 'day' || field === 'start_week' || field === 'end_week' || field === 'squad_type_id' 
        ? (value === '' ? null : parseInt(value) || null)
        : value 
    }));
  };

  const handleSave = async () => {
    try {
      // Валидация
      if (formData.start_week && formData.end_week) {
        const start = parseInt(formData.start_week);
        const end = parseInt(formData.end_week);
        
        if (start >= end) {
          alert('Неделя начала должна быть меньше недели окончания');
          return;
        }
      }

      // Формируем данные для отправки
      const saveData = {
        number: formData.number,
        squad_type_id: formData.squad_type_id,
        day: formData.day,
        start_week: formData.start_week === '' ? null : formData.start_week,
        end_week: formData.end_week === '' ? null : formData.end_week
      };

      console.log('Отправляем данные для сохранения:', saveData);
      await onSave(saveData);
      setIsEditingLocal(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка сохранения данных');
    }
  };

  const handleCancel = () => {
    setFormData({
      squad_type_id: data.squad_type_id || null,
      day: data.day || 1,
      start_week: data.start_week || data.start_week === 0 ? data.start_week : null,
      end_week: data.end_week || data.end_week === 0 ? data.end_week : null
    });
    setIsEditingLocal(false);
  };

  if (!data) return null;

  return (
    <div className="platoon-info-section">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Информация о взводе</h3>
        {isEditing && !isEditingLocal && (
          <button
            onClick={() => setIsEditingLocal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
            disabled={loadingTypes || !!error}
          >
            {loadingTypes ? 'Загрузка...' : error ? 'Ошибка загрузки' : 'Редактировать'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Тип взвода */}
      <div className="platoon-field">
        <label>Тип взвода:</label>
        {isEditingLocal ? (
          <div className="flex space-x-4">
            <select
              value={formData.squad_type_id || ''}
              onChange={(e) => handleInputChange('squad_type_id', e.target.value)}
              className="edit-select"
              disabled={loadingTypes || squadTypes.length === 0}
            >
              <option value="">Выберите тип...</option>
              {squadTypes.map(st => (
                <option key={st.id} value={st.id}>
                  {st.type} (Курс {st.course})
                </option>
              ))}
            </select>
            {squadTypes.length === 0 && !loadingTypes && (
              <span className="text-red-500 text-sm">Типы взводов не загружены</span>
            )}
          </div>
        ) : (
          <span className="platoon-value">
            {
              data.type 
                ? `${data.type} (Курс ${data.course})`
                : 'Не указан'
            }
          </span>
        )}
      </div>

      {/* День недели */}
      <div className="platoon-field">
        <label>День недели:</label>
        {isEditingLocal ? (
          <select
            value={formData.day || 1}
            onChange={(e) => handleInputChange('day', parseInt(e.target.value))}
            className="edit-select"
          >
            {weekDays.map(day => (
              <option key={day.id} value={day.id}>
                {day.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="platoon-value">
            {weekDays.find(d => d.id === data.day)?.name || `День ${data.day}`}
          </span>
        )}
      </div>

      {/* Недели обучения */}
      <div className="platoon-field">
        <label>Недели обучения:</label>
        {isEditingLocal ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">с недели</span>
              <input
                type="number"
                value={formData.start_week}
                onChange={(e) => handleInputChange('start_week', e.target.value)}
                className="edit-input w-24"
                min="1"
                max="52"
                placeholder="1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">по неделю</span>
              <input
                type="number"
                value={formData.end_week}
                onChange={(e) => handleInputChange('end_week', e.target.value)}
                className="edit-input w-24"
                min="1"
                max="52"
                placeholder="52"
              />
            </div>
          </div>
        ) : (
          <span className="platoon-value">
            {data.start_week !== null && data.end_week !== null && 
             data.start_week !== undefined && data.end_week !== undefined
              ? `с ${data.start_week} по ${data.end_week} неделю`
              : 'Не указаны'
            }
          </span>
        )}
      </div>

      <div className="platoon-field">
        <label>Кафедра:</label>
        <span className="platoon-value">{data.department_name}</span>
      </div>

      {isEditingLocal && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="save-button"
            disabled={!formData.squad_type_id}
          >
            Сохранить изменения
          </button>
          <button
            onClick={handleCancel}
            className="cancel-button"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
};

export default PlatoonInfo;