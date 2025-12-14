// components/subjects/SubjectActions.jsx
import React, { useState } from 'react';
import { subjectsApi } from '../../api/api';

const SubjectActions = ({ onSubjectAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subjectName.trim()) {
      setError('Введите название предмета');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await subjectsApi.addSubject({ name: subjectName.trim() });
      
      setSubjectName('');
      setShowAddForm(false);
      onSubjectAdded();
    } catch (err) {
      console.error('Ошибка добавления предмета:', err);
      setError(err.message || 'Ошибка добавления предмета');
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
          + Добавить новый предмет
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Добавить новый предмет</h4>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название предмета *
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите предмет"
                autoFocus
                disabled={loading}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>
            
            <div className="flex space-x-4">
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
                  setSubjectName('');
                  setError('');
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

export default SubjectActions;