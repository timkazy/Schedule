import React, { useState, useEffect } from 'react';
import { disciplinesApi } from '../../api/api';

const PlatoonLoads = ({ platoonNumber, loads, onLoadAdded, onLoadUpdated, onLoadDeleted }) => {
  const [availableLoads, setAvailableLoads] = useState([]);
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [selectedOfficers, setSelectedOfficers] = useState([]);
  const [officersList, setOfficersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAvailableLoads();
    fetchOfficers();
  }, [platoonNumber]);

  const fetchAvailableLoads = async () => {
    try {
      setLoading(true);
      const data = await disciplinesApi.getAvailableLoadsForPlatoon(platoonNumber);
      setAvailableLoads(data);
    } catch (error) {
      console.error('Ошибка загрузки доступных нагрузок:', error);
      setAvailableLoads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const data = await disciplinesApi.getOfficers();
      setOfficersList(data);
    } catch (error) {
      console.error('Ошибка загрузки преподавателей:', error);
      setOfficersList([]);
    }
  };

  const handleAddLoad = async () => {
    if (!selectedLoad || selectedOfficers.length === 0) {
      alert('Выберите нагрузку и хотя бы одного преподавателя');
      return;
    }

    try {
      setLoading(true);
      await disciplinesApi.addLoadToPlatoon(platoonNumber, selectedLoad.id, {
        officers: selectedOfficers
      });
      
      setSelectedLoad(null);
      setSelectedOfficers([]);
      setShowAddForm(false);
      onLoadAdded();
      alert('Нагрузка привязана к взводу');
    } catch (error) {
      console.error('Ошибка привязки нагрузки:', error);
      alert(error.message || 'Не удалось привязать нагрузку');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLoad = async (loadId, officers) => {
    try {
      await disciplinesApi.updatePlatoonLoad(platoonNumber, loadId, {
        officers: officers
      });
      onLoadUpdated();
      alert('Привязка обновлена');
    } catch (error) {
      console.error('Ошибка обновления привязки:', error);
      alert(error.message || 'Не удалось обновить привязку');
    }
  };

  const handleDeleteLoad = async (loadId) => {
    if (!window.confirm('Отвязать эту нагрузку от взвода?')) return;
    
    try {
      await disciplinesApi.deletePlatoonLoad(platoonNumber, loadId);
      onLoadDeleted();
      alert('Нагрузка отвязана от взвода');
    } catch (error) {
      console.error('Ошибка отвязки нагрузки:', error);
      alert(error.message || 'Не удалось отвязать нагрузку');
    }
  };

  const formatSemester = (semester) => {
    return semester === 1 ? 'Весна' : 'Осень';
  };

  const getOfficerName = (officerId) => {
    const officer = officersList.find(o => o.id === officerId);
    return officer ? `${officer.surname} ${officer.first_name[0]}.${officer.second_name[0]}.` : 'Неизвестно';
  };

  // Функция для преобразования строки аудиторий в массив
  const parseAudiences = (audiencesData) => {
    if (!audiencesData) return [];
    if (Array.isArray(audiencesData)) return audiencesData;
    if (typeof audiencesData === 'string') {
      return audiencesData.split('/').filter(a => a.trim() !== '');
    }
    return [];
  };

  return (
    <div className="platoon-loads-section mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Нагрузки взвода</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
          >
            + Привязать нагрузку
          </button>
        )}
      </div>

      {/* Форма добавления нагрузки */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h4 className="text-lg font-semibold mb-4">Привязать новую нагрузку</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Выберите нагрузку *
              </label>
              <select
                value={selectedLoad?.id || ''}
                onChange={(e) => {
                  const loadId = e.target.value;
                  const load = availableLoads.find(l => l.id == loadId);
                  setSelectedLoad(load);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={loading || availableLoads.length === 0}
              >
                <option value="">Выберите нагрузку...</option>
                {availableLoads.map(load => (
                  <option key={load.id} value={load.id}>
                    {load.subject_name} - {load.department_name} - {load.type} {load.course} ({formatSemester(load.semester)})
                  </option>
                ))}
              </select>
              {availableLoads.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">Нет доступных нагрузок для привязки</p>
              )}
            </div>

            {selectedLoad && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Выберите преподавателей *
                </label>
                <div className="space-y-2">
                  {officersList.map(officer => (
                    <div key={officer.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`officer-${officer.id}`}
                        checked={selectedOfficers.includes(officer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOfficers(prev => [...prev, officer.id]);
                          } else {
                            setSelectedOfficers(prev => prev.filter(id => id !== officer.id));
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`officer-${officer.id}`}>
                        {officer.surname} {officer.first_name} {officer.second_name}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedOfficers.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">Выберите хотя бы одного преподавателя</p>
                )}
              </div>
            )}

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddLoad}
                disabled={loading || !selectedLoad || selectedOfficers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Привязка...' : 'Привязать'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedLoad(null);
                  setSelectedOfficers([]);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Список привязанных нагрузок */}
      <div>
        {loads.length > 0 ? (
          <div className="space-y-4">
            {loads.map(load => (
              <div key={load.id} className="load-card">
                <div className="load-header">
                  <div>
                    <h4 className="load-title">
                      {load.subject_name}
                      <span className="ml-2 text-sm font-normal text-gray-600">
                        (Нагрузка #{load.id})
                      </span>
                    </h4>
                    <div className="load-meta">
                      Кафедра: {load.department_name} • 
                      Тип: {load.type} {load.course} • 
                      Семестр: {formatSemester(load.semester)}
                    </div>
                  </div>
                  <div className="load-actions">
                    <button
                      onClick={() => handleDeleteLoad(load.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Отвязать
                    </button>
                  </div>
                </div>

                <div className="load-details">
                  {/* Преподаватели */}
                  <div className="mb-3">
                    <div className="detail-label mb-2">Преподаватели:</div>
                    <div className="flex flex-wrap gap-2">
                      {load.officers && load.officers.map(officerId => (
                        <div key={officerId} className="flex items-center bg-blue-50 px-3 py-1 rounded">
                          <span>{getOfficerName(officerId)}</span>
                          <button
                            onClick={() => {
                              const newOfficers = load.officers.filter(id => id !== officerId);
                              if (newOfficers.length === 0) {
                                if (!window.confirm('Удалить последнего преподавателя? Это приведет к отвязке нагрузки.')) {
                                  return;
                                }
                                handleDeleteLoad(load.id);
                              } else {
                                handleUpdateLoad(load.id, newOfficers);
                              }
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOfficers = [...(load.officers || [])];
                          const availableOfficers = officersList
                            .filter(o => !newOfficers.includes(o.id))
                            .map(o => ({ id: o.id, name: `${o.surname} ${o.first_name[0]}.${o.second_name[0]}.` }));
                          
                          if (availableOfficers.length === 0) {
                            alert('Все преподаватели уже назначены');
                            return;
                          }
                          
                          const officerName = prompt(
                            `Выберите преподавателя для добавления:\n${availableOfficers.map(o => `${o.id}: ${o.name}`).join('\n')}\nВведите ID преподавателя:`
                          );
                          
                          if (officerName && !isNaN(officerName)) {
                            const officerId = parseInt(officerName);
                            if (officersList.find(o => o.id === officerId)) {
                              if (!newOfficers.includes(officerId)) {
                                handleUpdateLoad(load.id, [...newOfficers, officerId]);
                              } else {
                                alert('Этот преподаватель уже назначен');
                              }
                            } else {
                              alert('Преподаватель с таким ID не найден');
                            }
                          }
                        }}
                        className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        + Добавить
                      </button>
                    </div>
                  </div>

                  {/* Детали нагрузки */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="detail-item">
                      <span className="detail-label">Тип обучения:</span>
                      <span className="detail-value">{load.type}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Курс:</span>
                      <span className="detail-value">{load.course}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Семестр:</span>
                      <span className="detail-value">{formatSemester(load.semester)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Часов всего:</span>
                      <span className="detail-value">{load.total_hours || 0}</span>
                    </div>
                  </div>

                  {/* Типы занятий */}
                  {load.hours_load && load.hours_load.length > 0 && (
                    <div className="mt-3">
                      <div className="detail-label mb-2">Типы занятий:</div>
                      <div className="space-y-2">
                        {load.hours_load.map(hour => {
                          const audiences = parseAudiences(hour.audiences);
                          return (
                            <div key={hour.lesson_type_id} className="text-sm bg-gray-50 p-2 rounded">
                              {hour.lesson_type_name}: {hour.hours_count} часов
                              {audiences.length > 0 && (
                                <span className="ml-2 text-gray-600">
                                  (Аудитории: {audiences.join(', ')})
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-message bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600">Нет привязанных нагрузок</p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Привязать первую нагрузку
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatoonLoads;