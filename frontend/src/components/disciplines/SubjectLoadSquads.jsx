// components/disciplines/SubjectLoadSquads.jsx
import React, { useState } from 'react';
import { disciplineApi } from '../../api/api';

const SubjectLoadSquads = ({ subjectLoadId, squadsData, isEditing, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSquad, setEditingSquad] = useState(null);
  const [formData, setFormData] = useState({
    squad: '',
    officers: []
  });
  const [availableSquads, setAvailableSquads] = useState([]);
  const [availableOfficers, setAvailableOfficers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableData = async () => {
    try {
      setLoading(true);
      const [squads, officers] = await Promise.all([
        disciplineApi.getAvailableSquads(subjectLoadId),
        disciplineApi.getOfficers()
      ]);
      setAvailableSquads(squads);
      setAvailableOfficers(officers);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async () => {
    await loadAvailableData();
    setShowAddForm(true);
    setEditingSquad(null);
    setFormData({ squad: '', officers: [] });
  };

  const handleEditClick = async (squadData) => {
    await loadAvailableData();
    setEditingSquad(squadData);
    setShowAddForm(true);
    setFormData({
      squad: squadData.squad_number,
      officers: squadData.officer_ids || []
    });
  };

  const handleOfficerToggle = (officerId) => {
    setFormData(prev => ({
      ...prev,
      officers: prev.officers.includes(officerId)
        ? prev.officers.filter(id => id !== officerId)
        : [...prev.officers, officerId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.squad || formData.officers.length === 0) {
      alert('Выберите взвод и хотя бы одного преподавателя');
      return;
    }

    try {
      setLoading(true);
      if (editingSquad) {
        await disciplineApi.updateSquadSubjectLoad(subjectLoadId, editingSquad.squad_number, {
          officers: formData.officers
        });
      } else {
        await disciplineApi.addSquadSubjectLoad(subjectLoadId, {
          squad: formData.squad,
          officers: formData.officers
        });
      }
      
      setShowAddForm(false);
      setEditingSquad(null);
      onUpdate();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(error.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (squadNumber) => {
    if (!window.confirm('Отвязать нагрузку от взвода?')) return;
    
    try {
      await disciplineApi.deleteSquadSubjectLoad(subjectLoadId, squadNumber);
      onUpdate();
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка удаления');
    }
  };

  return (
    <div className="section-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="section-title">Привязанные взводы</h3>
        {isEditing && (
          <button
            onClick={handleAddClick}
            className="add-button"
          >
            + Привязать взвод
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-4">
            {editingSquad ? 'Редактирование привязки' : 'Добавление привязки'}
          </h4>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Выбор взвода */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Взвод
                </label>
                <select
                  value={formData.squad}
                  onChange={(e) => setFormData(prev => ({ ...prev, squad: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading || editingSquad}
                  required
                >
                  <option value="">Выберите взвод...</option>
                  {availableSquads.map(squad => (
                    <option key={squad.number} value={squad.number}>
                      {squad.number} ({squad.department_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Преподаватели */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Преподаватели
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {availableOfficers.map(officer => (
                    <div key={officer.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`officer-${officer.id}`}
                        checked={formData.officers.includes(officer.id)}
                        onChange={() => handleOfficerToggle(officer.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`officer-${officer.id}`} className="cursor-pointer">
                        {officer.surname} {officer.first_name} {officer.second_name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingSquad(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Таблица привязанных взводов */}
      <div className="table-container">
        {squadsData.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Номер взвода</th>
                <th>Кафедра</th>
                <th>Преподаватели</th>
                {isEditing && <th>Действия</th>}
              </tr>
            </thead>
            <tbody>
              {squadsData.map(squad => (
                <tr key={squad.squad_number}>
                  <td>{squad.squad_number}</td>
                  <td>{squad.department_name}</td>
                  <td>
                    {squad.officers.map(officer => (
                      <div key={officer.id} className="mb-1">
                        {officer.surname} {officer.first_name} {officer.second_name}
                      </div>
                    ))}
                  </td>
                  {isEditing && (
                    <td className="action-cell">
                      <button
                        onClick={() => handleEditClick(squad)}
                        className="action-button edit-button"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(squad.squad_number)}
                        className="action-button delete-button"
                      >
                        Удалить
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-message">Нет привязанных взводов</div>
        )}
      </div>
    </div>
  );
};

export default SubjectLoadSquads;