import React, { useState, useEffect } from 'react';
import { platoonApi } from '../../api/api';

const AddPlatoonForm = ({ departments, onPlatoonAdded }) => {
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
  const [success, setSuccess] = useState(false);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.number.trim()) {
      setError('Укажите номер взвода');
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
    
    // Проверка недель, если они указаны
    if (formData.start_week && formData.end_week) {
      const start = parseInt(formData.start_week);
      const end = parseInt(formData.end_week);
      
      if (start >= end) {
        setError('Неделя начала должна быть меньше недели окончания');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
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
        start_week: formData.start_week ? parseInt(formData.start_week) : null,
        end_week: formData.end_week ? parseInt(formData.end_week) : null
      };

      console.log('Отправка данных:', dataToSend);
      
      await platoonApi.addPlatoon(dataToSend);
      
      setSuccess(true);
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

      // Сбрасываем успех через 3 секунды
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('Ошибка добавления взвода:', err);
      setError(err.message || 'Не удалось добавить взвод');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnother = () => {
    setFormData({
      number: '',
      departmentId: formData.departmentId, // Сохраняем кафедру
      squadTypeId: '',
      day: 1,
      start_week: '',
      end_week: ''
    });
    setSuccess(false);
  };

  return (
    <div className="add-platoon-form">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Взвод успешно добавлен!
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: 4342"
              required
              disabled={loading}
            />
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

          {/* Неделя начала */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Неделя начала обучения
            </label>
            <input
              type="number"
              value={formData.start_week}
              onChange={(e) => handleInputChange('start_week', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
              min="1"
              max="52"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Оставьте пустым, если не определено</p>
          </div>

          {/* Неделя окончания */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Неделя окончания обучения
            </label>
            <input
              type="number"
              value={formData.end_week}
              onChange={(e) => handleInputChange('end_week', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="16"
              min="1"
              max="52"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Оставьте пустым, если не определено</p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="pt-6 border-t border-gray-200 flex justify-between">
          <div>
            {success && (
              <button
                type="button"
                onClick={handleAddAnother}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Добавить еще один взвод
              </button>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Добавление...' : 'Добавить взвод'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPlatoonForm;