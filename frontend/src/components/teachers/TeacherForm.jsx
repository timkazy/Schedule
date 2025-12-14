// components/teachers/TeacherForm.jsx
import React, { useState, useEffect } from 'react';

const TeacherForm = ({ teacher, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    surname: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Заполняем форму при редактировании
  useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.first_name,
        second_name: teacher.second_name,
        surname: teacher.surname
      });
    }
  }, [teacher]);

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

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка сохранения преподавателя');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {teacher ? 'Редактирование преподавателя' : 'Добавление нового преподавателя'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Фамилия */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия *
            </label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) => handleChange('surname', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.surname ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Иванов"
              disabled={submitting}
            />
            {errors.surname && (
              <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
            )}
          </div>

          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя *
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.first_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Иван"
              disabled={submitting}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
            )}
          </div>

          {/* Отчество */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Отчество *
            </label>
            <input
              type="text"
              value={formData.second_name}
              onChange={(e) => handleChange('second_name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.second_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Иванович"
              disabled={submitting}
            />
            {errors.second_name && (
              <p className="mt-1 text-sm text-red-600">{errors.second_name}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Проверьте данные</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Преподаватель будет отображаться как:</p>
                  <p className="font-semibold mt-1">
                    {formData.surname || '?'} {formData.first_name || '?'} {formData.second_name || '?'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150"
            disabled={submitting}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 disabled:bg-blue-400"
            disabled={submitting}
          >
            {submitting ? 'Сохранение...' : teacher ? 'Сохранить изменения' : 'Добавить преподавателя'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;