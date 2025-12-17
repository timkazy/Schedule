import { useState, useEffect } from "react";
import { useEdit } from "../context/useEdit";
import PlatoonInfo from "../components/platoons/PlatoonInfo";
import DepartmentSelector from "../components/platoons/DepartmentSelector";
import PlatoonSelector from "../components/platoons/PlatoonSelector";
import PlatoonActions from "../components/platoons/PlatoonActions";
import PlatoonLoads from "../components/platoons/PlatoonLoads";
import { platoonApi, disciplinesApi } from "../api/api";
import "../components/platoons/Platoons.css";

function Platoons() {
  const { isEditing } = useEdit();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [platoons, setPlatoons] = useState([]);
  const [selectedPlatoon, setSelectedPlatoon] = useState(null);
  const [platoonData, setPlatoonData] = useState(null);
  const [platoonLoads, setPlatoonLoads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка кафедр при монтировании
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Загрузка взводов (всех или по кафедре)
  useEffect(() => {
    fetchPlatoons(selectedDepartment?.id);
  }, [selectedDepartment]);

  // Загрузка данных взвода при выборе
  useEffect(() => {
    if (selectedPlatoon) {
      fetchPlatoonData(selectedPlatoon.number);
    } else {
      setPlatoonData(null);
      setPlatoonLoads([]);
    }
  }, [selectedPlatoon]);

  // Загрузка нагрузок взвода
  useEffect(() => {
    if (selectedPlatoon) {
      fetchPlatoonLoads(selectedPlatoon.number);
    }
  }, [selectedPlatoon, isEditing]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await platoonApi.getDepartments();
      setDepartments(data);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки кафедр");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatoons = async (departmentId) => {
    try {
      setLoading(true);
      let data;
      if (departmentId) {
        // Загрузка по кафедре
        data = await platoonApi.getPlatoonsByDepartment(departmentId);
      } else {
        // Загрузка всех взводов
        data = await platoonApi.getAllPlatoons();
      }
      setPlatoons(data);
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки взводов");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatoonData = async (platoonNumber) => {
    try {
      setLoading(true);
      const data = await platoonApi.getPlatoonDetails(platoonNumber);
      setPlatoonData(data);
      
      // Автоматически выбираем кафедру взвода
      if (data.department_id && !selectedDepartment) {
        const dept = departments.find(d => d.id === data.department_id);
        if (dept) {
          setSelectedDepartment(dept);
        }
      }
      
      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных взвода");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlatoonLoads = async (platoonNumber) => {
    try {
      const data = await disciplinesApi.getPlatoonLoads(platoonNumber);
      setPlatoonLoads(data);
    } catch (err) {
      console.error('Ошибка загрузки нагрузок взвода:', err);
      setPlatoonLoads([]);
    }
  };

  const handleSavePlatoon = async (updatedData) => {
    try {
      await platoonApi.updatePlatoon(selectedPlatoon.number, updatedData);
      fetchPlatoonData(selectedPlatoon.number); // Обновляем данные
    } catch (err) {
      setError("Ошибка сохранения");
      throw err;
    }
  };

  const handleDeletePlatoon = async () => {
    if (!window.confirm(`Удалить взвод ${selectedPlatoon.number}?`)) return;
    try {
      await platoonApi.deletePlatoon(selectedPlatoon.number);
      setSelectedPlatoon(null);
      setPlatoonData(null);
      setPlatoonLoads([]);
      fetchPlatoons(selectedDepartment?.id);
    } catch (err) {
      setError("Ошибка удаления");
    }
  };

  const handleLoadAdded = () => {
    fetchPlatoonLoads(selectedPlatoon.number);
  };

  const handleLoadUpdated = () => {
    fetchPlatoonLoads(selectedPlatoon.number);
  };

  const handleLoadDeleted = () => {
    fetchPlatoonLoads(selectedPlatoon.number);
  };

  return (
    <div className="platoons-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Взводы</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="platoons-container max-w-6xl mx-auto">
        {/* Строка 1: Выбор кафедры */}
        <div className="control-row">
          <label className="control-label">Кафедра:</label>
          <DepartmentSelector
            departments={departments}
            selectedDepartment={selectedDepartment}
            onSelect={(dept) => {
              setSelectedDepartment(dept);
              setSelectedPlatoon(null);
              setPlatoonData(null);
              setPlatoonLoads([]);
            }}
            disabled={loading}
            includeAllOption={true}
          />
        </div>

        {/* Строка 2: Выбор взвода */}
        <div className="control-row">
          <label className="control-label">Взвод:</label>
          <PlatoonSelector
            platoons={platoons}
            selectedPlatoon={selectedPlatoon}
            onSelect={setSelectedPlatoon}
            disabled={loading}
            isEditing={isEditing}
            onUpdate={() => fetchPlatoons(selectedDepartment?.id)}
            departmentId={selectedDepartment?.id}
          />
        </div>

        {/* Данные выбранного взвода */}
        {platoonData && (
          <>
            <PlatoonInfo
              data={platoonData}
              isEditing={isEditing}
              onSave={handleSavePlatoon}
            />
            
            {/* Нагрузки взвода */}
            {isEditing && (
              <PlatoonLoads
                platoonNumber={selectedPlatoon.number}
                loads={platoonLoads}
                onLoadAdded={handleLoadAdded}
                onLoadUpdated={handleLoadUpdated}
                onLoadDeleted={handleLoadDeleted}
              />
            )}
            
            {/* Кнопка удаления в режиме редактирования */}
            {isEditing && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleDeletePlatoon}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Удалить взвод
                </button>
              </div>
            )}
          </>
        )}

        {/* Действия с взводами */}
        <PlatoonActions
          departmentId={selectedDepartment?.id}
          onPlatoonAdded={() => {
            fetchPlatoons(selectedDepartment?.id);
          }}
        />
      </div>
    </div>
  );
}

export default Platoons;