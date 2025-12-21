import { useState, useEffect } from 'react';
import { useEdit } from '../context/useEdit';
import TeacherSelector from '../components/teachers/TeacherSelector';
import TeacherConnections from '../components/teachers/TeacherConnections';
import AddTeacherForm from '../components/teachers/AddTeacherForm';
import { teachersApi } from '../api/api';
import '../components/teachers/Teachers.css';

function Teachers() {
  const { isEditing, isAdding } = useEdit();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка всех преподавателей
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Загрузка данных преподавателя при выборе
  useEffect(() => {
    if (selectedTeacher) {
      fetchTeacherDetails(selectedTeacher.id);
    } else {
      setTeacherData(null);
    }
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teachersApi.getTeachers();
      setTeachers(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки преподавателей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherDetails = async (teacherId) => {
    try {
      setLoading(true);
      const data = await teachersApi.getTeacherDetails(teacherId);
      setTeacherData(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных преподавателя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async (teacherData) => {
    try {
      await teachersApi.updateTeacher(selectedTeacher.id, teacherData);
      fetchTeacherDetails(selectedTeacher.id);
      fetchTeachers();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteTeacher = async () => {
    if (!window.confirm(`Удалить преподавателя "${selectedTeacher.full_name}"?`)) return;
    
    try {
      await teachersApi.deleteTeacher(selectedTeacher.id);
      setSelectedTeacher(null);
      setTeacherData(null);
      fetchTeachers();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleTeacherAdded = () => {
    // После добавления преподавателя сбрасываем состояние
    setSelectedTeacher(null);
    setTeacherData(null);
    fetchTeachers();
  };

  // Если режим добавления - показываем форму добавления
  if (isAdding) {
    return (
      <div className="teachers-page">
        <div className="text-7xl font-bold text-center mt-10 mb-8">Добавление преподавателя</div>
        
        {error && (
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="teachers-container max-w-4xl mx-auto">
          <AddTeacherForm 
            onTeacherAdded={handleTeacherAdded}
            existingTeachers={teachers} // Передаем список существующих преподавателей
          />
        </div>
      </div>
    );
  }

  // Обычный режим просмотра/редактирования
  return (
    <div className="teachers-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Преподаватели</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="teachers-container max-w-6xl mx-auto">
        {/* Выбор преподавателя */}
        <div className="control-row mb-8">
          <label className="control-label">Преподаватель:</label>
          <TeacherSelector
            teachers={teachers}
            selectedTeacher={selectedTeacher}
            onSelect={setSelectedTeacher}
            disabled={loading}
            isEditing={isEditing}
            onUpdate={handleUpdateTeacher}
          />
        </div>

        {/* Связки с нагрузками и взводами */}
        {teacherData && selectedTeacher && (
          <>
            <TeacherConnections
              teacherId={selectedTeacher.id}
              connections={teacherData.connections || []}
              isEditing={isEditing}
              onUpdate={() => fetchTeacherDetails(selectedTeacher.id)}
            />

            {/* Кнопка удаления в режиме редактирования */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteTeacher}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Удалить преподавателя
                </button>
              </div>
            )}
          </>
        )}

        {/* Сообщение, если преподаватель не выбран */}
        {!selectedTeacher && teachers.length > 0 && (
          <div className="mt-8 text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">
              Выберите преподавателя из списка выше
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Teachers;