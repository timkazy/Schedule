import React, { useState, useEffect } from 'react';
import { teachersApi } from '../../api/api';

const AddTeacherForm = ({ onTeacherAdded, existingTeachers }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    surname: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Проверяем дубликат при изменении полей ФИО
  useEffect(() => {
    if (!formData.surname.trim() || !formData.first_name.trim() || !formData.second_name.trim()) {
      setIsDuplicate(false);
      return;
    }

    const fullName = getFullName(formData);
    const normalizedFullName = fullName.toLowerCase().trim();
    
    // Проверяем, есть ли преподаватель с таким ФИО (без учета регистра)
    const duplicate = existingTeachers?.some(teacher => {
      const existingFullName = `${teacher.surname} ${teacher.first_name} ${teacher.second_name}`.toLowerCase().trim();
      return existingFullName === normalizedFullName;
    }) || false;
    
    setIsDuplicate(duplicate);
  }, [formData, existingTeachers]);

  const getFullName = (data) => {
    return `${data.surname} ${data.first_name} ${data.second_name}`.trim();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    setError(''); // Сбрасываем общую ошибку
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Фамилия обязательна';
    }
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Имя обязательно';
    }
    
    if (!formData.second_name.trim()) {
      newErrors.second_name = 'Отчество обязательно';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    // Если дубликат, не отправляем
    if (isDuplicate) {
      setError(`Преподаватель "${getFullName(formData)}" уже существует`);
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        first_name: formData.first_name.trim(),
        second_name: formData.second_name.trim(),
        surname: formData.surname.trim()
      };

      console.log('Отправка данных:', dataToSend);
      
      await teachersApi.addTeacher(dataToSend);
      
      setFormData({
        first_name: '',
        second_name: '',
        surname: ''
      });
      setErrors({});

      // Уведомляем родительский компонент
      if (onTeacherAdded) {
        onTeacherAdded();
      }

    } catch (err) {
      console.error('Ошибка добавления преподавателя:', err);
      if (err.message && err.message.includes('уже существует')) {
        setError(`Преподаватель "${getFullName(formData)}" уже существует`);
        setIsDuplicate(true);
      } else {
        setError(err.message || 'Не удалось добавить преподавателя');
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для проверки, можно ли отправить форму
  const canSubmit = () => {
    return !loading && 
           !isDuplicate && 
           formData.surname.trim() && 
           formData.first_name.trim() && 
           formData.second_name.trim() &&
           Object.keys(errors).length === 0;
  };

  return (
    <div className="add-teacher-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Добавление нового преподавателя</h3>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Фамилия */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия *
            </label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) => handleInputChange('surname', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.surname ? 'border-red-500' : 
                isDuplicate ? 'border-yellow-400 focus:ring-yellow-500' : 
                'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Иванов"
              required
              disabled={loading}
            />
            {errors.surname && (
              <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
            )}
          </div>

          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.first_name ? 'border-red-500' : 
                isDuplicate ? 'border-yellow-400 focus:ring-yellow-500' : 
                'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Иван"
              required
              disabled={loading}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
            )}
          </div>

          {/* Отчество */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отчество *
            </label>
            <input
              type="text"
              value={formData.second_name}
              onChange={(e) => handleInputChange('second_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.second_name ? 'border-red-500' : 
                isDuplicate ? 'border-yellow-400 focus:ring-yellow-500' : 
                'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Иванович"
              required
              disabled={loading}
            />
            {errors.second_name && (
              <p className="mt-1 text-sm text-red-600">{errors.second_name}</p>
            )}
          </div>
        </div>

        {/* Предварительный просмотр */}
        <div className={`border rounded-md p-4 mt-4 ${
          isDuplicate ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${isDuplicate ? 'text-yellow-400' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className={`text-sm font-medium ${isDuplicate ? 'text-yellow-800' : 'text-blue-800'}`}>
                {isDuplicate ? 'Внимание: Дубликат' : 'Проверьте данные'}
              </h4>
              <div className={`mt-2 text-sm ${isDuplicate ? 'text-yellow-700' : 'text-blue-700'}`}>
                <p>Преподаватель будет отображаться как:</p>
                <p className={`font-semibold mt-1 ${isDuplicate ? 'text-yellow-800' : ''}`}>
                  {getFullName(formData) || '? ? ?'}
                </p>
                {isDuplicate && (
                  <p className="mt-2 flex items-center text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Преподаватель с таким ФИО уже существует в системе
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Важная информация */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-gray-800">Важная информация</h4>
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  • Убедитесь, что преподаватель с таким ФИО еще не существует
                </p>
                <p className="mt-1">
                  • После добавления преподавателя можно будет привязать его к нагрузкам
                </p>
                <p className="mt-1">
                  • ФИО должно быть указано полностью и правильно
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
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
              ) : isDuplicate ? 'Преподаватель уже существует' : 'Добавить преподавателя'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTeacherForm;