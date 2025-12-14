// components/disciplines/SubjectLoadInfo.jsx
import React, { useState, useEffect } from 'react';
import { disciplineApi } from '../../api/api';

const SubjectLoadInfo = ({ data, isEditing, onSave }) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [formData, setFormData] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [squadTypes, setSquadTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        subject_id: data.subject_id,
        department_id: data.department_id,
        squad_type_id: data.squad_type_id,
        semester: data.semester
      });
    }
  }, [data]);

  useEffect(() => {
    if (isEditingLocal) {
      loadFormData();
    }
  }, [isEditingLocal]);

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onSave(formData);
      setIsEditingLocal(false);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка сохранения данных');
    }
  };

  const handleCancel = () => {
    setFormData({
      subject_id: data.subject_id,
      department_id: data.department_id,
      squad_type_id: data.squad_type_id,
      semester: data.semester
    });
    setIsEditingLocal(false);
  };

  if (!data) return null;

  const semesterText = data.semester === 1 ? 'Весна' : 'Осень';

  return (
    <div className="section-card">
      <div className="flex justify-between items-center mb-6">
        <h3 className="section-title">Информация о нагрузке</h3>
        {isEditing && !isEditingLocal && (
          <button
            onClick={() => setIsEditingLocal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Редактировать
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Предмет */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Предмет:</label>
          {isEditingLocal ? (
            <select
              value={formData.subject_id || ''}
              onChange={(e) => handleInputChange('subject_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">Выберите предмет...</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-lg font-semibold text-gray-900">{data.subject_name}</div>
          )}
        </div>

        {/* Кафедра */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Кафедра:</label>
          {isEditingLocal ? (
            <select
              value={formData.department_id || ''}
              onChange={(e) => handleInputChange('department_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">Выберите кафедру...</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-lg font-semibold text-gray-900">{data.department_name}</div>
          )}
        </div>

        {/* Курс */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Курс:</label>
          {isEditingLocal ? (
            <select
              value={formData.squad_type_id || ''}
              onChange={(e) => handleInputChange('squad_type_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">Выберите курс...</option>
              {squadTypes.map(st => (
                <option key={st.id} value={st.id}>
                  {st.type} (Курс {st.course})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-lg font-semibold text-gray-900">
              {data.type} (Курс {data.course})
            </div>
          )}
        </div>

        {/* Семестр */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Семестр:</label>
          {isEditingLocal ? (
            <select
              value={formData.semester || 0}
              onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={0}>Осень</option>
              <option value={1}>Весна</option>
            </select>
          ) : (
            <div className="text-lg font-semibold text-gray-900">{semesterText}</div>
          )}
        </div>
      </div>

      {isEditingLocal && (
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={!formData.subject_id || !formData.department_id || !formData.squad_type_id}
          >
            Сохранить изменения
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
};

export default SubjectLoadInfo;