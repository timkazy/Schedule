// components/disciplines/SubjectLoadActions.jsx
import React, { useState } from 'react';
import { disciplineApi } from '../../api/api';

const SubjectLoadActions = ({ onSubjectLoadAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    department_id: '',
    squad_type_id: '',
    semester: 0
  });
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [squadTypes, setSquadTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [subjectsData, departmentsData, squadTypesData] = await Promise.all([
        disciplineApi.getSubjects(),
        disciplineApi.getDepartments(),
        disciplineApi.getSquadTypes()
      ]);
      setSubjects(subjectsData);
      setDepartments(departmentsData);
      setSquadTypes(squadTypesData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async () => {
    await loadFormData();
    setShowAddForm(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject_id || !formData.department_id || !formData.squad_type_id) {
      alert('Заполните все обязательные поля');
      return;
    }

    try {
      setLoading(true);
      await disciplineApi.addSubjectLoad(formData);
      
      setShowAddForm(false);
      setFormData({ subject_id: '', department_id: '', squad_type_id: '', semester: 0 });
      onSubjectLoadAdded();
    } catch (error) {
      console.error('Ошибка добавления:', error);
      alert(error.message || 'Ошибка добавления нагрузки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-300">
      {!showAddForm ? (
        <button
          onClick={handleAddClick}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-150"
        >
          + Добавить новую нагрузку
        </button>
      ) : (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-semibold mb-4">Добавить новую нагрузку</h4>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Предмет */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Предмет *
                </label>
                <select
                  value={formData.subject_id}
                  onChange={(e) => handleInputChange('subject_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                  required
                >
                  <option value="">Выберите предмет...</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Кафедра */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Кафедра *
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => handleInputChange('department_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                  required
                >
                  <option value="">Выберите кафедру...</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Курс */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Курс *
                </label>
                <select
                  value={formData.squad_type_id}
                  onChange={(e) => handleInputChange('squad_type_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                  required
                >
                  <option value="">Выберите курс...</option>
                  {squadTypes.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.type} (Курс {st.course})
                    </option>
                  ))}
                </select>
              </div>

              {/* Семестр */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Семестр
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value={0}>Осень</option>
                  <option value={1}>Весна</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Добавление...' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubjectLoadActions;