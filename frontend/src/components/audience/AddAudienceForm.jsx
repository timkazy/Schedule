import React, { useState, useEffect } from 'react';
import { audienceApi } from '../../api/api';

const AddAudienceForm = ({ onAudienceAdded, existingAudiences }) => {
  const [audienceNumber, setAudienceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Проверяем дубликат при изменении номера аудитории
  useEffect(() => {
    if (!audienceNumber.trim()) {
      setIsDuplicate(false);
      return;
    }

    const number = parseInt(audienceNumber);
    if (isNaN(number) || number <= 0) {
      setIsDuplicate(false);
      return;
    }

    // Проверяем, есть ли аудитория с таким номером
    const duplicate = existingAudiences?.some(audience => audience.number == number) || false;
    setIsDuplicate(duplicate);
  }, [audienceNumber, existingAudiences]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audienceNumber.trim()) {
      setError('Введите номер аудитории');
      return;
    }

    const number = parseInt(audienceNumber);
    if (isNaN(number) || number <= 0) {
      setError('Введите корректный номер аудитории');
      return;
    }

    // Если дубликат, не отправляем
    if (isDuplicate) {
      setError(`Аудитория №${number} уже существует в системе`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await audienceApi.addAudience(number);

      setAudienceNumber('');

      // Уведомляем родительский компонент
      if (onAudienceAdded) {
        onAudienceAdded();
      }

    } catch (err) {
      console.error('Ошибка добавления аудитории:', err);
      // Дополнительная проверка на случай, если на сервере тоже есть проверка
      if (err.response?.status === 409 || err.message?.includes('уже существует')) {
        setError(`Аудитория №${number} уже существует`);
        setIsDuplicate(true);
      } else {
        setError(err.message || 'Ошибка добавления аудитории');
      }
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения реальных примеров из существующих аудиторий
  const getExistingAudienceExamples = () => {
    if (!existingAudiences || existingAudiences.length === 0) {
      return [208, 210, 227, 305, 110, 104, 209, 313, 212, 123, 226];
    }

    // Берем до 12 случайных аудиторий из существующих
    const shuffled = [...existingAudiences].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 12).map(a => a.number);
  };

  const audienceExamples = getExistingAudienceExamples();

  return (
    <div className="add-audience-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Добавление новой аудитории</h3>
        <p className="text-sm text-gray-500 mt-1">
          Аудитория - это учебное помещение, где проводятся занятия
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
              Номер аудитории
            </label>
            <input
              type="number"
              value={audienceNumber}
              onChange={(e) => {
                setAudienceNumber(e.target.value);
                setError(''); // Сбрасываем ошибку при вводе
              }}
              className={`w-full max-w-md px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              placeholder="Например: 101"
              min="1"
              required
              autoFocus
              disabled={loading}
            />
            {isDuplicate && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Аудитория с таким номером уже существует
              </p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Что такое аудитория?</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • Аудитория - это учебное помещение с уникальным номером
                </p>
                <p className="mt-1">
                  • Каждый номер должен быть уникальным
                </p>
                <p className="mt-1">
                  • К аудитории привязываются нагрузки для проведения занятий
                </p>
              </div>
            </div>
          </div>
        </div>

        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Всего аудиторий: {existingAudiences?.length || 0}
        </h4>

        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 transition duration-150 ${isDuplicate
                  ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 focus:ring-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              disabled={loading || isDuplicate || !audienceNumber.trim()}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Добавление...
                </span>
              ) : isDuplicate ? 'Аудитория уже существует' : 'Добавить аудиторию'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddAudienceForm;