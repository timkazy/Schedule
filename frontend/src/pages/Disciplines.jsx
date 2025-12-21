import { useState, useEffect } from 'react';
import { useEdit } from '../context/useEdit';
import SubjectLoadSelector from '../components/disciplines/SubjectLoadSelector';
import SubjectLoadInfo from '../components/disciplines/SubjectLoadInfo';
import SubjectLoadSquads from '../components/disciplines/SubjectLoadSquads';
import SubjectHoursLoad from '../components/disciplines/SubjectHoursLoad';
import SubjectThemes from '../components/disciplines/SubjectThemes';
import AddSubjectLoadForm from '../components/disciplines/AddSubjectLoadForm';
import { disciplineApi } from '../api/api';
import '../components/disciplines/Disciplines.css';

function Disciplines() {
  const { isEditing, isAdding } = useEdit();
  const [subjectLoads, setSubjectLoads] = useState([]);
  const [selectedSubjectLoad, setSelectedSubjectLoad] = useState(null);
  const [subjectLoadData, setSubjectLoadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка всех нагрузок при монтировании
  useEffect(() => {
    fetchSubjectLoads();
  }, []);

  // Загрузка деталей нагрузки при выборе
  useEffect(() => {
    if (selectedSubjectLoad) {
      fetchSubjectLoadDetails(selectedSubjectLoad.id);
    } else {
      setSubjectLoadData(null);
    }
  }, [selectedSubjectLoad]);

  const fetchSubjectLoads = async () => {
    try {
      setLoading(true);
      const data = await disciplineApi.getSubjectLoads();
      setSubjectLoads(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки нагрузок');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectLoadDetails = async (subjectLoadId) => {
    try {
      setLoading(true);
      const data = await disciplineApi.getSubjectLoadDetails(subjectLoadId);
      setSubjectLoadData(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных нагрузки');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSubjectLoad = async (updatedData) => {
    try {
      await disciplineApi.updateSubjectLoad(selectedSubjectLoad.id, updatedData);
      fetchSubjectLoadDetails(selectedSubjectLoad.id);
      fetchSubjectLoads(); // Обновляем список
    } catch (err) {
      setError('Ошибка сохранения');
      throw err;
    }
  };

  const handleDeleteSubjectLoad = async () => {
    if (!window.confirm(`Удалить нагрузку "${selectedSubjectLoad.subject_name}"?`)) return;
    
    try {
      await disciplineApi.deleteSubjectLoad(selectedSubjectLoad.id);
      setSelectedSubjectLoad(null);
      setSubjectLoadData(null);
      fetchSubjectLoads();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleSubjectLoadAdded = () => {
    // После добавления нагрузки сбрасываем состояние
    setSelectedSubjectLoad(null);
    setSubjectLoadData(null);
    fetchSubjectLoads();
  };

  // Если режим добавления - показываем форму добавления
  if (isAdding) {
    return (
      <div className="disciplines-page">
        <div className="text-7xl font-bold text-center mt-10 mb-8">Добавление нагрузки</div>
        
        {error && (
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="disciplines-container max-w-6xl mx-auto">
          <AddSubjectLoadForm 
            onSubjectLoadAdded={handleSubjectLoadAdded}
            existingSubjectLoads={subjectLoads} // Передаем список существующих нагрузок
          />
        </div>
      </div>
    );
  }

  // Обычный режим просмотра/редактирования
  return (
    <div className="disciplines-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Дисциплины</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="disciplines-container max-w-6xl mx-auto">
        {/* Выбор нагрузки */}
        <div className="control-row mb-8">
          <label className="control-label">Нагрузка:</label>
          <SubjectLoadSelector
            subjectLoads={subjectLoads}
            selectedSubjectLoad={selectedSubjectLoad}
            onSelect={setSelectedSubjectLoad}
            disabled={loading}
            isEditing={isEditing}
          />
        </div>

        {/* Информация о выбранной нагрузке */}
        {subjectLoadData && selectedSubjectLoad && (
          <>
            <SubjectLoadInfo
              data={subjectLoadData}
              isEditing={isEditing}
              onSave={handleSaveSubjectLoad}
            />

            {/* Взводы, связанные с нагрузкой */}
            <SubjectLoadSquads
              subjectLoadId={selectedSubjectLoad.id}
              squadsData={subjectLoadData.squads || []}
              isEditing={isEditing}
              onUpdate={() => fetchSubjectLoadDetails(selectedSubjectLoad.id)}
            />

            {/* Часы нагрузки по типам занятий */}
            <SubjectHoursLoad
              subjectLoadId={selectedSubjectLoad.id}
              hoursData={subjectLoadData.hours_load || []}
              isEditing={isEditing}
              onUpdate={() => fetchSubjectLoadDetails(selectedSubjectLoad.id)}
            />

            {/* Темы нагрузки */}
            <SubjectThemes
              subjectLoadId={selectedSubjectLoad.id}
              themesData={subjectLoadData.themes || []}
              isEditing={isEditing}
              onUpdate={() => fetchSubjectLoadDetails(selectedSubjectLoad.id)}
            />

            {/* Кнопка удаления в режиме редактирования */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteSubjectLoad}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Удалить нагрузку
                </button>
              </div>
            )}
          </>
        )}

        {/* Сообщение, если нагрузка не выбрана */}
        {!selectedSubjectLoad && subjectLoads.length > 0 && (
          <div className="mt-8 text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">
              Выберите нагрузку из списка выше
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Disciplines;