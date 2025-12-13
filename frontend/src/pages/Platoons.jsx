import { useState, useEffect } from "react";
import { useEdit } from "../context/useEdit";
import PlatoonInfo from "../components/platoons/PlatoonInfo";
import DepartmentSelector from "../components/platoons/DepartmentSelector";
import PlatoonSelector from "../components/platoons/PlatoonSelector";
import PlatoonActions from "../components/platoons/PlatoonActions";
import { platoonApi } from "../api/api";
import "../components/platoons/Platoons.css";

function Platoons() {
  const { isEditing } = useEdit();
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [platoons, setPlatoons] = useState([]);
  const [selectedPlatoon, setSelectedPlatoon] = useState(null);
  const [platoonData, setPlatoonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка кафедр при монтировании
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Загрузка взводов при выборе кафедры
  useEffect(() => {
    if (selectedDepartment) {
      fetchPlatoonsByDepartment(selectedDepartment.id);
    } else {
      setPlatoons([]);
      setSelectedPlatoon(null);
      setPlatoonData(null);
    }
  }, [selectedDepartment]);

  // Загрузка данных взвода при выборе
  useEffect(() => {
    if (selectedPlatoon) {
      fetchPlatoonData(selectedPlatoon.number);
    } else {
      setPlatoonData(null);
    }
  }, [selectedPlatoon]);

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

  const fetchPlatoonsByDepartment = async (departmentId) => {
    try {
      setLoading(true);
      const data = await platoonApi.getPlatoonsByDepartment(departmentId);
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
      
      console.log("platoons page data: ", data);

      setError(null);
    } catch (err) {
      setError("Ошибка загрузки данных взвода");
      console.error(err);
    } finally {
      setLoading(false);
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
      fetchPlatoonsByDepartment(selectedDepartment.id); // Обновляем список
    } catch (err) {
      setError("Ошибка удаления");
    }
  };

  return (
    <div className="platoons-page">
      <div className="text-7xl font-bold text-center mt-10 mb-8">Взводы</div>
      
      {error && (
        <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="platoons-container max-w-4xl mx-auto">
        {/* Строка 1: Выбор кафедры */}
        <div className="control-row">
          <label className="control-label">Кафедра:</label>
          <DepartmentSelector
            departments={departments}
            selectedDepartment={selectedDepartment}
            onSelect={setSelectedDepartment}
            disabled={loading}
          />
        </div>

        {/* Строка 2: Выбор взвода */}
        <div className="control-row">
          <label className="control-label">Взвод:</label>
          <PlatoonSelector
            platoons={platoons}
            selectedPlatoon={selectedPlatoon}
            onSelect={setSelectedPlatoon}
            disabled={loading || !selectedDepartment}
            isEditing={isEditing}
            onUpdate={fetchPlatoonsByDepartment}
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
            if (selectedDepartment) {
              fetchPlatoonsByDepartment(selectedDepartment.id);
            }
          }}
        />
      </div>
    </div>
  );
}

export default Platoons;