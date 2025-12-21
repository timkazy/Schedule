import { useState, useEffect } from 'react';
import { useEdit } from '../context/useEdit';
import DepartmentSelector from '../components/departments/DepartmentSelector';
import DepartmentInfo from '../components/departments/DepartmentInfo';
import AddDepartmentForm from '../components/departments/AddDepartmentForm';
import { departmentsApi } from '../api/api';
import '../components/departments/Departments.css';

function Departments() {
  const { isEditing, isAdding } = useEdit();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка всех кафедр
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Загрузка данных кафедры при выборе
  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentDetails(selectedDepartment.id);
    } else {
      setDepartmentData(null);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentsApi.getDepartments();
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки кафедр');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentDetails = async (departmentId) => {
    try {
      setLoading(true);
      const data = await departmentsApi.getDepartmentDetails(departmentId);
      setDepartmentData(data);
      setError(null);
    } catch (err) {
      setError('Ошибка загрузки данных кафедры');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartment = async (departmentData) => {
    try {
      await departmentsApi.updateDepartment(selectedDepartment.id, departmentData);
      fetchDepartmentDetails(selectedDepartment.id);
      fetchDepartments();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteDepartment = async () => {
    if (!window.confirm(`Удалить кафедру "${selectedDepartment.name}"? Все связанные взводы и нагрузки будут удалены.`)) return;
    
    try {
      await departmentsApi.deleteDepartment(selectedDepartment.id);
      setSelectedDepartment(null);
      setDepartmentData(null);
      fetchDepartments();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleDepartmentAdded = () => {
    // После добавления кафедры сбрасываем состояние
    setSelectedDepartment(null);
    setDepartmentData(null);
    fetchDepartments();
  };

  // Если режим добавления - показываем форму добавления
  if (isAdding) {
    return (
      <div className="departments-page">
        <div className="text-7xl font-bold text-center mt-10 mb-8">Добавление кафедры</div>
        
        {error && (
          <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="departments-container max-w-4xl mx-auto">
          <AddDepartmentForm 
            onDepartmentAdded={handleDepartmentAdded}
            existingDepartments={departments} // Передаем список существующих кафедр
          />
        </div>
      </div>
    );
  }

  // Обычный режим просмотра/редактирования
  return (
    <div className="departments-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Кафедры</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="departments-container max-w-6xl mx-auto">
        {/* Выбор кафедры */}
        <div className="control-row mb-8">
          <label className="control-label">Кафедра:</label>
          <DepartmentSelector
            departments={departments}
            selectedDepartment={selectedDepartment}
            onSelect={setSelectedDepartment}
            disabled={loading}
            isEditing={isEditing}
            onUpdate={handleUpdateDepartment}
          />
        </div>

        {/* Информация о выбранной кафедре */}
        {departmentData && selectedDepartment && (
          <>
            <DepartmentInfo
              data={departmentData}
              isEditing={isEditing}
            />

            {/* Кнопка удаления в режиме редактирования */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeleteDepartment}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Удалить кафедру
                </button>
              </div>
            )}
          </>
        )}

        {/* Сообщение, если кафедра не выбрана */}
        {!selectedDepartment && departments.length > 0 && (
          <div className="mt-8 text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-600 text-lg">
              Выберите кафедру из списка выше
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Departments;