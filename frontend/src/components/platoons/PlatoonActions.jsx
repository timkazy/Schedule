// components/platoons/PlatoonActions.jsx
import React, { useState } from 'react';
import { platoonApi } from '../../api/api';

const PlatoonActions = ({ departmentId, onPlatoonAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlatoonData, setNewPlatoonData] = useState({
    number: null,
    squadTypeId: null,
    day: 1
  });
  const [loading, setLoading] = useState(false);
  const [squadTypes, setSquadTypes] = useState([]);

  const loadSquadTypes = async () => {
    try {
      const types = await platoonApi.getSquadTypes();
      setSquadTypes(types);
    } catch (error) {
      console.error('Ошибка загрузки типов взводов:', error);
    }
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    loadSquadTypes();
  };

  const handleInputChange = (field, value) => {
    console.log("field, value: ", field, value);
    setNewPlatoonData(prev => ({ ...prev, [field]: field === 'number' ? value : parseInt(value)}));
    console.log(newPlatoonData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!departmentId) {
      alert('Сначала выберите кафедру');
      return;
    }

    try {
      setLoading(true);
      await platoonApi.addPlatoon({
        ...newPlatoonData,
        departmentId
      });

      setShowAddForm(false);
      setNewPlatoonData({
        number: '',
        squadTypeId: null,
        day: 1,
        start_week: null,
        end_week: null
      });
      onPlatoonAdded();
    } catch (error) {
      console.error('Ошибка добавления взвода:', error);
      alert(error.message || 'Не удалось добавить взвод');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-300">
      {!showAddForm ? (
        <button
          onClick={handleAddClick}
          disabled={!departmentId}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150"
        >
          + Добавить новый взвод
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Добавить новый взвод</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер взвода
              </label>
              <input
                type="text"
                value={newPlatoonData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Например: 4101"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тип и курс
              </label>
              <select
                value={newPlatoonData.squadTypeId}
                onChange={(e) => handleInputChange('squadTypeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Выберите тип и курс...</option>
                {squadTypes.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.type} (Курс {st.course})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                День недели
              </label>
              <select
                value={newPlatoonData.day}
                onChange={(e) => handleInputChange('day', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value={1}>Понедельник</option>
                <option value={2}>Вторник</option>
                <option value={3}>Среда</option>
                <option value={4}>Четверг</option>
                <option value={5}>Пятница</option>
                <option value={6}>Суббота</option>
                <option value={7}>Воскресенье</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Недели обучения
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Начало (неделя)</label>
                  <input
                    type="number"
                    value={newPlatoonData.start_week || ''}
                    onChange={(e) => handleInputChange('start_week', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    max="52"
                    placeholder="1"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Окончание (неделя)</label>
                  <input
                    type="number"
                    value={newPlatoonData.end_week || ''}
                    onChange={(e) => handleInputChange('end_week', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="1"
                    max="52"
                    placeholder="52"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              onClick={() => console.log("go to add.")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PlatoonActions;