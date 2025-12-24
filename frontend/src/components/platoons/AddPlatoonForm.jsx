import React, { useState, useEffect } from 'react';
import { platoonApi } from '../../api/api';

const AddPlatoonForm = ({ departments, onPlatoonAdded, existingPlatoons }) => {
  const [formData, setFormData] = useState({
    number: '',
    departmentId: '',
    squadTypeId: '',
    day: 1,
    start_week: '',
    end_week: ''
  });
  const [squadTypes, setSquadTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const weekDays = [
    { id: 1, name: 'Понедельник' },
    { id: 2, name: 'Вторник' },
    { id: 3, name: 'Среда' },
    { id: 4, name: 'Четверг' },
    { id: 5, name: 'Пятница' },
    { id: 6, name: 'Суббота' },
    { id: 7, name: 'Воскресенье' }
  ];

  // Загрузка типов взводов
  useEffect(() => {
    const loadSquadTypes = async () => {
      try {
        const types = await platoonApi.getSquadTypes();
        setSquadTypes(types);
      } catch (err) {
        console.error('Ошибка загрузки типов взводов:', err);
        setError('Не удалось загрузить типы взводов');
      }
    };

    loadSquadTypes();
  }, []);

  // Проверяем дубликат при изменении номера взвода
  useEffect(() => {
    if (!formData.number.trim()) {
      setIsDuplicate(false);
      return;
    }

    const platoonNumber = formData.number.trim();
    
    // Проверяем, есть ли взвод с таким номером
    const duplicate = existingPlatoons?.some(platoon => 
      platoon.number.toString() === platoonNumber
    ) || false;
    
    setIsDuplicate(duplicate);
  }, [formData.number, existingPlatoons]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Сбрасываем ошибки при изменении полей
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    // Очищаем предыдущие ошибки
    setError(null);
    
    if (!formData.number.trim()) {
      setError('Укажите номер взвода');
      return false;
    }
    
    // Проверка на дубликат
    if (isDuplicate) {
      setError(`Взвод №${formData.number} уже существует`);
      return false;
    }
    
    if (!formData.departmentId) {
      setError('Выберите кафедру');
      return false;
    }
    
    if (!formData.squadTypeId) {
      setError('Выберите тип взвода');
      return false;
    }
    
    // Проверка недель - теперь обязательны
    if (!formData.start_week) {
      setError('Укажите неделю начала обучения');
      return false;
    }
    
    if (!formData.end_week) {
      setError('Укажите неделю окончания обучения');
      return false;
    }
    
    // Валидация числовых значений
    const start = parseInt(formData.start_week);
    const end = parseInt(formData.end_week);
    
    if (isNaN(start) || start < 1 || start > 52) {
      setError('Неделя начала должна быть числом от 1 до 52');
      return false;
    }
    
    if (isNaN(end) || end < 1 || end > 52) {
      setError('Неделя окончания должна быть числом от 1 до 52');
      return false;
    }
    
    if (start >= end) {
      setError('Неделя начала должна быть меньше недели окончания');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Подготавливаем данные для отправки
      const dataToSend = {
        number: formData.number.trim(),
        departmentId: parseInt(formData.departmentId),
        squadTypeId: parseInt(formData.squadTypeId),
        day: parseInt(formData.day),
        start_week: parseInt(formData.start_week),
        end_week: parseInt(formData.end_week)
      };

      console.log('Отправка данных:', dataToSend);
      
      await platoonApi.addPlatoon(dataToSend);
      
      setFormData({
        number: '',
        departmentId: '',
        squadTypeId: '',
        day: 1,
        start_week: '',
        end_week: ''
      });

      // Уведомляем родительский компонент
      if (onPlatoonAdded) {
        onPlatoonAdded();
      }

    } catch (err) {
      console.error('Ошибка добавления взвода:', err);
      if (err.response?.status === 409 || err.message?.includes('уже существует')) {
        setError(`Взвод №${formData.number} уже существует`);
        setIsDuplicate(true);
      } else {
        setError(err.message || 'Не удалось добавить взвод');
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для проверки, можно ли отправить форму
  const canSubmit = () => {
    return !loading && 
           !isDuplicate && 
           formData.number.trim() && 
           formData.departmentId && 
           formData.squadTypeId &&
           formData.start_week && 
           formData.end_week &&
           !error;
  };

  return (
    <div className="add-platoon-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Добавление нового взвода</h3>
        <p className="text-sm text-gray-500 mt-1">
          Все поля обязательны для заполнения
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Номер взвода */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер взвода *
            </label>
            <input
              type="text"
              value={formData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Например: 4342"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Уникальный номер взвода</p>
            {isDuplicate && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Взвод с таким номером уже существует
              </p>
            )}
          </div>

          {/* Кафедра */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кафедра *
            </label>
            <select
              value={formData.departmentId}
              onChange={(e) => handleInputChange('departmentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">Выберите кафедру...</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Тип взвода */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип и курс взвода *
            </label>
            <select
              value={formData.squadTypeId}
              onChange={(e) => handleInputChange('squadTypeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading || squadTypes.length === 0}
            >
              <option value="">Выберите тип...</option>
              {squadTypes.map(st => (
                <option key={st.id} value={st.id}>
                  {st.type} (Курс {st.course})
                </option>
              ))}
            </select>
            {squadTypes.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">Загрузка типов взводов...</p>
            )}
          </div>

          {/* День недели */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              День недели *
            </label>
            <select
              value={formData.day}
              onChange={(e) => handleInputChange('day', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              {weekDays.map(day => (
                <option key={day.id} value={day.id}>
                  {day.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Неделя начала обучения *
            </label>
            <input
              type="number"
              value={formData.start_week}
              onChange={(e) => handleInputChange('start_week', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              min="1"
              max="52"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Номер недели от начала семестра (1-52)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Неделя окончания обучения *
            </label>
            <input
              type="number"
              value={formData.end_week}
              onChange={(e) => handleInputChange('end_week', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="16"
              min="1"
              max="52"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Номер недели от начала семестра (1-52)</p>
          </div>
        </div>

        {/* Информационная панель */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Важная информация</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • Номер взвода должен быть уникальным
                </p>
                <p className="mt-1">
                  • На основе указанных недель будет автоматически создано расписание занятий
                </p>
                <p className="mt-1">
                  • Занятия будут созданы для каждой недели в указанном диапазоне
                </p>
              </div>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Всего взводов: {existingPlatoons?.length || 0}
        </h4>

        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 transition duration-150 ${
                canSubmit()
                  ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 focus:ring-gray-300'
              }`}
              disabled={!canSubmit()}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Добавление...
                </span>
              ) : isDuplicate ? 'Взвод уже существует' : 'Добавить взвод'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPlatoonForm;