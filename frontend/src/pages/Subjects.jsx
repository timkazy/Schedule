import { useState, useEffect } from 'react';
import { useEdit } from '../context/useEdit';
import SubjectSelector from '../components/subjects/SubjectSelector';
import SubjectInfo from '../components/subjects/SubjectInfo';
import AddSubjectForm from '../components/subjects/AddSubjectForm';
import { subjectsApi } from '../api/api';
import '../components/subjects/Subjects.css';

function Subjects() {
  const { isEditing, isAdding } = useEdit();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка всех предметов
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Загрузка данных предмета при выборе
  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectDetails(selectedSubject.id);
    } else {
      setSubjectData(null);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsApi.getSubjects();
      setSubjects(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки предметов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectDetails = async (subjectId) => {
    try {
      setLoading(true);
      const data = await subjectsApi.getSubjectDetails(subjectId);
      setSubjectData(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных предмета');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubject = async (subjectData) => {
    try {
      await subjectsApi.updateSubject(selectedSubject.id, subjectData);
      fetchSubjectDetails(selectedSubject.id);
      fetchSubjects();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteSubject = async () => {
    if (!window.confirm(`Удалить предмет "${selectedSubject.name}"? Все связанные нагрузки будут удалены.`)) return;
    
    try {
      await subjectsApi.deleteSubject(selectedSubject.id);
      setSelectedSubject(null);
      setSubjectData(null);
      fetchSubjects();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleSubjectAdded = () => {
    // После добавления предмета сбрасываем состояние
    setSelectedSubject(null);
    setSubjectData(null);
    fetchSubjects();
  };

  // Если режим добавления - показываем форму добавления
  if (isAdding) {
    return (
      <div className="subjects-page">
        <div className="text-7xl font-bold text-center mt-10 mb-8">Добавление предмета</div>
        
        {error && (
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="subjects-container max-w-4xl mx-auto">
          <AddSubjectForm 
            onSubjectAdded={handleSubjectAdded}
            existingSubjects={subjects} // Передаем список существующих предметов
          />
        </div>
      </div>
    );
  }

  // Обычный режим просмотра/редактирования
  return (
    <div className="subjects-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Предметы</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="subjects-container max-w-6xl mx-auto">
        {/* Выбор предмета */}
        <div className="control-row mb-8">
          <label className="control-label">Предмет:</label>
          <SubjectSelector
            subjects={subjects}
            selectedSubject={selectedSubject}
            onSelect={setSelectedSubject}
            disabled={loading}
            isEditing={isEditing}
            onUpdate={handleUpdateSubject}
          />
        </div>

        {/* Информация о выбранном предмете */}
        {subjectData && selectedSubject && (
          <>
            <SubjectInfo
              data={subjectData}
              isEditing={isEditing}
            />

            {/* Кнопка удаления в режиме редактирования */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteSubject}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Удалить предмет
                </button>
              </div>
            )}
          </>
        )}

        {/* Сообщение, если предмет не выбран */}
        {!selectedSubject && subjects.length > 0 && (
          <div className="mt-8 text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">
              Выберите предмет из списка выше
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subjects;