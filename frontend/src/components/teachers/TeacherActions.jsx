// components/teachers/TeacherActions.jsx
import React, { useState } from 'react';
import { teachersApi } from '../../api/api';

const TeacherActions = ({ onTeacherAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    second_name: '',
    surname: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await teachersApi.addTeacher(formData);
      
      setFormData({ first_name: '', second_name: '', surname: '' });
      setErrors({});
      setShowAddForm(false);
      onTeacherAdded();
    } catch (error) {
      console.error('Ошибка добавления:', error);
      if (error.message && error.message.includes('уже существует')) {
        alert('Преподаватель с таким ФИО уже существует');
      } else {
        alert(error.message || 'Ошибка добавления преподавателя');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-300">
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
        >
          + Добавить нового преподавателя
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Добавить нового преподавателя</h4>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Фамилия */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Фамилия *
                </label>
                <input
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.surname ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Иванов"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Иван"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.second_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Иванович"
                  disabled={loading}
                />
                {errors.second_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.second_name}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  Преподаватель будет добавлен как: 
                  <span className="font-semibold ml-2">
                    {formData.surname || '?'} {formData.first_name || '?'} {formData.second_name || '?'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Добавление...' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ first_name: '', second_name: '', surname: '' });
                  setErrors({});
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeacherActions;