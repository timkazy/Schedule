import { useState, useEffect } from 'react';
import { useEdit } from '../context/useEdit';
import TeacherSelector from '../components/teachers/TeacherSelector';
import TeacherConnections from '../components/teachers/TeacherConnections';
import TeacherActions from '../components/teachers/TeacherActions';
import { teachersApi } from '../api/api';
import '../components/teachers/Teachers.css';

function Teachers() {
  const { isEditing } = useEdit();
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

  const handleAddTeacher = async (teacherData) => {
    try {
      await teachersApi.addTeacher(teacherData);
      fetchTeachers();
    } catch (err) {
      throw err;
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
        {teacherData && (
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

        {/* Действия с преподавателями (добавление) */}
        <TeacherActions
          onTeacherAdded={() => {
            fetchTeachers();
          }}
        />
      </div>
    </div>
  );
}

export default Teachers;