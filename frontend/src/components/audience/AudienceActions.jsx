// components/audience/AudienceActions.jsx
import { useState } from 'react';
import { audienceApi } from '../../api/api';

const AudienceActions = ({ onAudienceAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [audienceNumber, setAudienceNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    try {
      setLoading(true);
      setError('');
      
      await audienceApi.addAudience(number);
      
      setAudienceNumber('');
      setShowAddForm(false);
      onAudienceAdded();
    } catch (err) {
      console.error('Ошибка добавления аудитории:', err);
      setError(err.message || 'Ошибка добавления аудитории');
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
          + Добавить
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Добавить новую аудиторию</h4>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер аудитории *
              </label>
              <input
                type="number"
                value={audienceNumber}
                onChange={(e) => setAudienceNumber(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Например: 101"
                min="1"
                required
                autoFocus
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
                  setAudienceNumber('');
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

export default AudienceActions;