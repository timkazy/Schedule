import React, { useState, useEffect } from 'react';
import { disciplineApi } from '../../api/api';

const AddSubjectLoadForm = ({ onSubjectLoadAdded, existingSubjectLoads }) => {
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
  const [error, setError] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  // Загрузка данных для формы
  useEffect(() => {
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
        
        // Логируем данные для отладки
        console.log('Загруженные предметы:', subjectsData);
        console.log('Загруженные кафедры:', departmentsData);
        console.log('Загруженные типы взводов:', squadTypesData);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные для формы');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, []);

  // Проверка уникальности при изменении полей формы
  useEffect(() => {
    // Сбрасываем состояние дубликата при пустых полях
    if (!formData.subject_id || !formData.department_id || !formData.squad_type_id) {
      setIsDuplicate(false);
      setDuplicateMessage('');
      return;
    }

    const subjectId = parseInt(formData.subject_id);
    const departmentId = parseInt(formData.department_id);
    const squadTypeId = parseInt(formData.squad_type_id);
    const semester = parseInt(formData.semester);

    console.log("Проверяемая нагрузка:", { subjectId, departmentId, squadTypeId, semester });
    console.log("Существующие нагрузки:", existingSubjectLoads);

    // Чтобы найти дубликат, нам нужно:
    // 1. Найти предмет по ID и получить его имя
    const subject = subjects.find(s => s.id === subjectId);
    const subjectName = subject?.name;
    
    // 2. Найти кафедру по ID и получить ее имя
    const department = departments.find(d => d.id === departmentId);
    const departmentName = department?.name;
    
    // 3. Найти тип взвода по ID и получить его тип и курс
    const squadType = squadTypes.find(st => st.id === squadTypeId);
    const squadTypeName = squadType?.type;
    const squadTypeCourse = squadType?.course;
    
    if (!subjectName || !departmentName || !squadTypeName || squadTypeCourse === undefined) {
      // Данные еще не загружены полностью
      setIsDuplicate(false);
      setDuplicateMessage('');
      return;
    }

    console.log("Ищем по:", { 
      subjectName, 
      departmentName, 
      type: squadTypeName, 
      course: squadTypeCourse, 
      semester 
    });

    // Находим существующую нагрузку с такой же комбинацией
    const duplicateLoad = existingSubjectLoads?.find(load => {
      // Проверяем по всем параметрам
      const matchesSubject = load.subject_name === subjectName;
      const matchesDepartment = load.department_name === departmentName;
      const matchesType = load.type === squadTypeName;
      const matchesCourse = load.course === squadTypeCourse;
      const matchesSemester = load.semester === semester;
      
      const isDuplicate = matchesSubject && matchesDepartment && matchesType && matchesCourse && matchesSemester;
      
      if (isDuplicate) {
        console.log("Найден дубликат:", load);
      }
      
      return isDuplicate;
    });

    if (duplicateLoad) {
      setIsDuplicate(true);
      
      // Формируем сообщение о дубликате
      const semesterName = semester === 0 ? 'осеннем' : 'весеннем';
      
      setDuplicateMessage(
        `Нагрузка "${subjectName}" уже существует для кафедры "${departmentName}", ` +
        `типа взвода "${squadTypeName}" (курс ${squadTypeCourse}) в ${semesterName} семестре.`
      );
    } else {
      setIsDuplicate(false);
      setDuplicateMessage('');
    }
  }, [formData, existingSubjectLoads, subjects, departments, squadTypes]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Сбрасываем ошибку при изменении полей
  };

  const validateForm = () => {
    setError(null);

    if (!formData.subject_id) {
      setError('Выберите предмет');
      return false;
    }
    if (!formData.department_id) {
      setError('Выберите кафедру');
      return false;
    }
    if (!formData.squad_type_id) {
      setError('Выберите тип и курс взвода');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Если дубликат, не отправляем
    if (isDuplicate) {
      return;
    }

    try {
      setLoading(true);

      const dataToSend = {
        subject_id: parseInt(formData.subject_id),
        department_id: parseInt(formData.department_id),
        squad_type_id: parseInt(formData.squad_type_id),
        semester: parseInt(formData.semester)
      };

      console.log('Отправка данных:', dataToSend);

      await disciplineApi.addSubjectLoad(dataToSend);

      setFormData({
        subject_id: '',
        department_id: '',
        squad_type_id: '',
        semester: 0
      });

      // Уведомляем родительский компонент
      if (onSubjectLoadAdded) {
        onSubjectLoadAdded();
      }

    } catch (err) {
      console.error('Ошибка добавления нагрузки:', err);
      if (err.response?.status === 409 || err.message?.includes('уже существует')) {
        setError('Такая нагрузка уже существует');
        setIsDuplicate(true);
      } else {
        setError(err.message || 'Не удалось добавить нагрузку');
      }
    } finally {
      setLoading(false);
    }
  };

  // Проверка, можно ли отправить форму
  const canSubmit = () => {
    return !loading &&
      !isDuplicate &&
      formData.subject_id &&
      formData.department_id &&
      formData.squad_type_id &&
      !error;
  };

  return (
    <div className="add-subject-load-form">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">Добавление новой нагрузки</h3>
        <p className="text-sm text-gray-500 mt-1">
          Все поля обязательны для заполнения. Комбинация предмет/кафедра/тип взвода/семестр должна быть уникальной.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {isDuplicate && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="font-medium">Нагрузка уже существует!</p>
                <p className="mt-1">{duplicateMessage}</p>
                <p className="mt-2 text-sm">Измените один из параметров, чтобы создать новую нагрузку.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Предмет *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => handleInputChange('subject_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              required
              disabled={loading || subjects.length === 0}
            >
              <option value="">Выберите предмет...</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            {subjects.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">Загрузка предметов...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кафедра *
            </label>
            <select
              value={formData.department_id}
              onChange={(e) => handleInputChange('department_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              required
              disabled={loading || departments.length === 0}
            >
              <option value="">Выберите кафедру...</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {departments.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">Загрузка кафедр...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип и курс взвода *
            </label>
            <select
              value={formData.squad_type_id}
              onChange={(e) => handleInputChange('squad_type_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              required
              disabled={loading || squadTypes.length === 0}
            >
              <option value="">Выберите тип и курс...</option>
              {squadTypes.map(st => (
                <option key={st.id} value={st.id}>
                  {st.type} (Курс {st.course})
                </option>
              ))}
            </select>
            {squadTypes.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">Загрузка типов взводов...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Семестр *
            </label>
            <select
              value={formData.semester}
              onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${isDuplicate
                  ? 'border-yellow-400 focus:ring-yellow-500'
                  : 'border-gray-300 focus:ring-blue-500'
                }`}
              required
              disabled={loading}
            >
              <option value={0}>Осенний семестр</option>
              <option value={1}>Весенний семестр</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {formData.semester == 0
                ? 'Осенний семестр: сентябрь-декабрь'
                : 'Весенний семестр: февраль-июнь'}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">Статистика нагрузок</h4>
              <p className="text-xs text-gray-500 mt-1">
                Всего нагрузок в системе: <span className="font-semibold">{existingSubjectLoads?.length || 0}</span>
              </p>
            </div>
            <div className="text-right">
              {isDuplicate ? (
                <div className="flex items-center text-yellow-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Дубликат обнаружен</span>
                </div>
              ) : (
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">Нагрузка уникальна</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Что такое нагрузка?</h4>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • Нагрузка должна быть уникальной по комбинации:
                </p>
                <ul className="ml-5 mt-1 list-disc">
                  <li>Предмет</li>
                  <li>Кафедра</li>
                  <li>Тип взвода (с курсом)</li>
                  <li>Семестр</li>
                </ul>
                <p className="mt-2">
                  • Например: "СРС" для кафедры "СВиАД" для взводов типа "ВУС" (курс 4) в осеннем семестре
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              type="submit"
              className={`px-6 py-2 rounded-md focus:outline-none focus:ring-2 transition duration-150 ${canSubmit()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-300'
                }`}
              disabled={!canSubmit()}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Добавление...
                </span>
              ) : isDuplicate ? 'Нагрузка уже существует' : 'Добавить нагрузку'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddSubjectLoadForm;