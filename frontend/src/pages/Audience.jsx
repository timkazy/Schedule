import { useState, useEffect } from 'react';
import { useEdit } from '../context/useEdit';
import AudienceSelector from '../components/audience/AudienceSelector';
import AudienceInfo from '../components/audience/AudienceInfo';
import AudienceActions from '../components/audience/AudienceActions';
import { audienceApi } from '../api/api';
import '../components/audience/Audience.css';

function Audience() {
  const { isEditing } = useEdit();
  const [audiences, setAudiences] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [audienceData, setAudienceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка всех аудиторий при монтировании
  useEffect(() => {
    fetchAudiences();
  }, []);

  // Загрузка данных аудитории при выборе
  useEffect(() => {
    if (selectedAudience) {
      fetchAudienceDetails(selectedAudience.number);
    } else {
      setAudienceData(null);
    }
  }, [selectedAudience]);

  const fetchAudiences = async () => {
    try {
      setLoading(true);
      const data = await audienceApi.getAudiences();
      console.log("fetchAudiences: ", data);
      setAudiences(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки аудиторий');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudienceDetails = async (audienceNumber) => {
    try {
      setLoading(true);
      const data = await audienceApi.getAudienceDetails(audienceNumber);
      console.log("fetchAudienceDetails: ", data);
      setAudienceData(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных аудитории');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudience = async () => {
    if (!window.confirm(`Удалить аудиторию №${selectedAudience.number}?`)) return;
    
    try {
      await audienceApi.deleteAudience(selectedAudience.number);
      setSelectedAudience(null);
      setAudienceData(null);
      fetchAudiences();
      console.log("handleDeleteAudience");
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  return (
    <div className="audience-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Аудитории</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="audience-container max-w-6xl mx-auto">
        {/* Выбор аудитории */}
        <div className="control-row mb-8">
          <label className="control-label">Аудитория:</label>
          <AudienceSelector
            audiences={audiences}
            selectedAudience={selectedAudience}
            onSelect={setSelectedAudience}
            disabled={loading}
            isEditing={isEditing}
          />
        </div>

        {/* Информация о выбранной аудитории */}
        {audienceData && (
          <>
            <AudienceInfo
              data={audienceData}
              isEditing={isEditing}
              onUpdate={() => fetchAudienceDetails(selectedAudience.number)}
            />

            {/* Кнопка удаления в режиме редактирования */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteAudience}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Удалить аудиторию
                </button>
              </div>
            )}
          </>
        )}

        {/* Действия с аудиториями (добавление) */}
        <AudienceActions
          onAudienceAdded={() => {
            fetchAudiences();
          }}
        />
      </div>
    </div>
  );
}

export default Audience;