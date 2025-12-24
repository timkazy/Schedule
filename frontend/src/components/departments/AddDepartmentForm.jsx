import React, { useState, useEffect } from 'react';
import { departmentsApi } from '../../api/api';

const AddDepartmentForm = ({ onDepartmentAdded, existingDepartments }) => {
  const [departmentName, setDepartmentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Проверяем дубликат при изменении названия кафедры
  useEffect(() => {
    if (!departmentName.trim()) {
      setIsDuplicate(false);
      return;
    }

    const normalizedDepartmentName = departmentName.trim().toLowerCase();
    
    // Проверяем, есть ли кафедра с таким названием (без учета регистра)
    const duplicate = existingDepartments?.some(department => 
      department.name.toLowerCase() === normalizedDepartmentName
    ) || false;
    
    setIsDuplicate(duplicate);
  }, [departmentName, existingDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!departmentName.trim()) {
      setError('Введите название кафедры');
      return;
    }

    // Если дубликат, не отправляем
    if (isDuplicate) {
      setError(`Кафедра "${departmentName.trim()}" уже существует в системе`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await departmentsApi.addDepartment({ name: departmentName.trim() });
      
      setDepartmentName('');
      
      // Уведомляем родительский компонент
      if (onDepartmentAdded) {
        onDepartmentAdded();
      }

    } catch (err) {
      console.error('Ошибка добавления кафедры:', err);
      // Дополнительная проверка на случай, если на сервере тоже есть проверка
      if (err.response?.status === 409 || err.message?.includes('уже существует')) {
        setError(`Кафедра "${departmentName.trim()}" уже существует`);
        setIsDuplicate(true);
      } else {
        setError(err.message || 'Ошибка добавления кафедры');
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения реальных примеров из существующих кафедр
  const getExistingDepartmentExamples = () => {
    if (!existingDepartments || existingDepartments.length === 0) {
      return ['СВиАД', 'БЭ', 'АО', 'РЭО', 'СНОП', 'БПЛА', 'ЭВМ', 'Физика', 'Математика'];
    }
    
    // Берем до 9 случайных кафедр из существующих
    const shuffled = [...existingDepartments].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 9).map(d => d.name);
  };

  const departmentExamples = getExistingDepartmentExamples();

  return (
    <div className="add-department-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Добавление новой кафедры</h3>
        <p className="text-sm text-gray-500 mt-1">
          Кафедра - это структурное подразделение, объединяющее преподавателей и взводы
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название кафедры *
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => {
                setDepartmentName(e.target.value);
                setError(''); // Сбрасываем ошибку при вводе
              }}
              className={`w-full max-w-md px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Например: СВиАД"
              required
              autoFocus
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Например: СВиАД, БЭ, АО, РЭО, СНОП, БПЛА
            </p>
            {isDuplicate && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Кафедра с таким названием уже существует
              </p>
            )}
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
              <h4 className="text-sm font-medium text-blue-800">Что такое кафедра?</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • Кафедра объединяет преподавателей и учебные взводы
                </p>
                <p className="mt-1">
                  • Каждое название должно быть уникальным
                </p>
                <p className="mt-1">
                  • Каждой кафедре принадлежат определенные нагрузки (дисциплины)
                </p>
              </div>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Всего кафедр: {existingDepartments?.length || 0}
        </h4>

        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 transition duration-150 ${
                isDuplicate || !departmentName.trim()
                  ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 focus:ring-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
              disabled={loading || isDuplicate || !departmentName.trim()}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Добавление...
                </span>
              ) : isDuplicate ? 'Кафедра уже существует' : 'Добавить кафедру'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddDepartmentForm;