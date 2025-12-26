import { createContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { tablesData } from "../data/tablesData";
import { scheduleApi } from "../api/api";
import { localDropdownData } from "../data/localDropdownData";
import { appConfig, isLocalMode } from "../config/appConfig";

export const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [dataSource, setDataSource] = useState(appConfig.dataSource); // состояние режима

  const [selectedDay, setSelectedDay] = useState(0); 


  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState(null);


  const [dropdownData, setDropdownData] = useState({
    subjects: [],
    topics: [],
    lessonTypes: [],
    audiences: [],
    teachers: [],
    isLoading: false,
    error: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [copiedCell, setCopiedCell] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTableId, setActiveTableId] = useState(null);

  const [dataCache, setDataCache] = useState({
    subjects: new Map(),
    topics: new Map(),
    lessonTypes: new Map(),
    audiences: new Map(),
  });

  const selectedCount = selectedCells.length;

  const fetchSchedule = useCallback(async () => {
    if (isLocalMode()) {
      try {
        console.log("📁 Загрузка локальных данных расписания");
        setScheduleData(tablesData);
      } catch (err) {
        console.error("Ошибка загрузки локальных данных:", err);
        setScheduleData([]);
      }
    } else {
      try {
        console.log("🌐 Загрузка данных с сервера");
        const res = await fetch(`${appConfig.server.baseUrl}/schedule`);
        const data = await res.json();
        setScheduleData(data);
        console.log("🌐 Все загрузилось!");

      } catch (err) {
        console.error("Ошибка загрузки данных с сервера:", err);
      }
    }
  }, [dataSource]); // Добавляем dataSource в зависимости

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const getFilteredScheduleData = useMemo(() => {
    if (selectedDay === 0) {
      // "Все дни" - возвращаем все данные
      return scheduleData;
    }
    
    // Фильтруем данные по dayId
    return scheduleData.filter(day => {
      // dayId в данных соответствует id дней в DaySelector (1-6)
      return day.dayId === selectedDay;
    });
  }, [scheduleData, selectedDay]);

const handleDayChange = useCallback((dayId) => {
    if (isEditing && dayId !== selectedDay) {
      // В режиме редактирования запрещаем менять день
      console.log("⚠️ В режиме редактирования нельзя менять день");
      return;
    }
    setSelectedDay(dayId);
  }, [isEditing, selectedDay]);



  const loadData = useCallback(async (loaderType, params = {}) => {
    const { platoon_id, subject_load_id, lesson_type } = params;

    let cacheMap = '';
    let cacheKey = null;

    switch (loaderType) {
      case 'subjects':
        cacheKey = platoon_id;
        cacheMap = dataCache.subjects;
        break;
      case 'topics':
        cacheKey = lesson_type ? `${subject_load_id}_${lesson_type}` : `${subject_load_id}`;
        cacheMap = dataCache.topics;
        break;
      case 'lessonTypes':
        cacheKey = subject_load_id;
        cacheMap = dataCache.lessonTypes;
        break;
      case 'audiences':
        cacheKey = lesson_type ? `${subject_load_id}_${lesson_type}` : `${subject_load_id}`;
        cacheMap = dataCache.audiences;
        break;
    }

    // Проверяем кэш (если включен)
    if (cacheKey && cacheMap && cacheMap.has(cacheKey)) {
      return cacheMap.get(cacheKey);
    }

    // Загружаем данные в зависимости от режима
    let data;

    if (isLocalMode()) {
      // Локальные данные
      switch (loaderType) {
        case 'subjects':
          data = localDropdownData.getSubjects(platoon_id);
          break;
        case 'topics':
          data = localDropdownData.getTopics(subject_load_id, lesson_type);
          break;
        case 'lessonTypes':
          data = localDropdownData.getLessonTypes(subject_load_id);
          break;
        case 'audiences':
          data = localDropdownData.getAudiences(subject_load_id, lesson_type);
          break;
        case 'teachers':
          data = localDropdownData.getTeachers(platoon_id, subject_load_id);
          break;
        default:
          data = [];
      }
    } else {
      // Данные с сервера
      try {
        switch (loaderType) {
          case 'subjects':
            data = await scheduleApi.getSubjects(platoon_id);
            break;
          case 'topics':
            data = await scheduleApi.getTopics(subject_load_id, lesson_type);
            break;
          case 'lessonTypes':
            data = await scheduleApi.getLessonTypes(subject_load_id);
            break;
          case 'audiences':
            data = await scheduleApi.getAudiences(subject_load_id, lesson_type);
            break;
          case 'teachers':
            data = await scheduleApi.getTeachers(platoon_id, subject_load_id);
            break;
          default:
            data = [];
        }
      } catch (error) {
        console.error(`Ошибка загрузки ${loaderType} с сервера:`, error);
      }
    }

    // Сохраняем в кэш
    if (cacheKey && data && Array.isArray(data)) {
      setDataCache(prev => ({
        ...prev,
        [loaderType]: new Map(prev[loaderType]).set(cacheKey, data)
      }));
    }

    return data || [];
  }, [dataCache, dataSource]);

  // --- SUBJECTS ---
  const fetchSubjects = useCallback(async (platoon_id) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('subjects', { platoon_id });
      setDropdownData(prev => ({ ...prev, subjects: data }));
      console.log("fetchSubjects data: ", data)
      return data;
    } catch (error) {
      console.error("Ошибка загрузки предметов:", error);
      setDropdownData(prev => ({ ...prev, error: error.message }));
      return [];
    } finally {
      setDropdownData(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadData]);

  // --- TOPICS ---
  const fetchTopics = useCallback(async (subject_load_id, lesson_type = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('topics', { subject_load_id, lesson_type });
      setDropdownData(prev => ({ ...prev, topics: data }));
      return data;
    } catch (error) {
      console.error("Ошибка загрузки тем:", error);
      setDropdownData(prev => ({ ...prev, error: error.message }));
      return [];
    } finally {
      setDropdownData(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadData]);

  // --- LESSON TYPES ---
  const fetchLessonTypes = useCallback(async (subject_load_id = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('lessonTypes', { subject_load_id });
      setDropdownData(prev => ({ ...prev, lessonTypes: data }));
      return data;
    } catch (error) {
      console.error("Ошибка загрузки типов занятий:", error);
      setDropdownData(prev => ({ ...prev, error: error.message }));
      return [];
    } finally {
      setDropdownData(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadData]);

  // --- AUDIENCES ---
  const fetchAudiences = useCallback(async (subject_load_id, lesson_type = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('audiences', { subject_load_id, lesson_type });
      setDropdownData(prev => ({ ...prev, audiences: data }));
      return data;
    } catch (error) {
      console.error("Ошибка загрузки аудиторий:", error);
      setDropdownData(prev => ({ ...prev, error: error.message }));
      return [];
    } finally {
      setDropdownData(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadData]);

  // --- TEACHERS ---
  const fetchTeachers = useCallback(async (platoon_id = null, subject_load_id = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('teachers', { platoon_id, subject_load_id });
      setDropdownData(prev => ({ ...prev, teachers: data }));
      return data;
    } catch (error) {
      console.error("Ошибка загрузки преподавателей:", error);
      setDropdownData(prev => ({ ...prev, error: error.message }));
      return [];
    } finally {
      setDropdownData(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadData]);

  // --- Универсальная функция ---
  const fetchFieldData = useCallback(async (field, params = {}) => {
    const { platoon_id, subject_load_id, lesson_type } = params;

    console.log(`📊 fetchFieldData → field=${field}`, params);

    switch (field) {
      case "subject":
        return await fetchSubjects(platoon_id);

      case "topicNumber":
        return await fetchTopics(subject_load_id, lesson_type);

      case "type":
        return await fetchLessonTypes(subject_load_id);

      case "audience":
        return await fetchAudiences(subject_load_id, lesson_type);

      case "teacher":
        return await fetchTeachers(platoon_id, subject_load_id);

      default:
        console.warn(`Неизвестное поле: ${field}`);
        return [];
    }
  }, [fetchSubjects, fetchTopics, fetchLessonTypes, fetchAudiences, fetchTeachers]);

  // --- получить значение ячейки ---
  const getCellValue = useCallback(
    (tableId, colIndex, cellIndex) => {
      const day = scheduleData.find((d) => d.platoons.some((t) => t.platoonId === tableId));
      if (!day) return null;
      const table = day.platoons.find((t) => t.platoonId === tableId);
      if (!table) return null;
      const column = table.columns[colIndex];
      if (!column) return null;
      return column.cells[cellIndex] || null;
    },
    [scheduleData]
  );

  const getSelectedCellParams = useCallback(() => {
    if (!selectedCells.length) return null;

    const { tableId, columnIndex, cellIndex } = selectedCells[0];
    const cell = getCellValue(tableId, columnIndex, cellIndex);

    const column = scheduleData
      .flatMap(day => day.platoons)
      .find(t => t.platoonId === tableId)
      ?.columns[columnIndex];

    return {
      platoon_id: tableId,
      subject_load_id: cell?.subject_load_id,
      lesson_id: cell?.lesson_id,
      lesson_type: cell?.type,
    };
  }, [selectedCells, getCellValue, scheduleData]);

  // --- обновить ячейку ---
  const updateCellValue = useCallback(async (tableId, colIndex, cellIndex, newValue) => {
    // 1. ЛОКАЛЬНОЕ ОБНОВЛЕНИЕ
    setScheduleData((prev) => {
      const updatedData = prev.map((day) => ({
        ...day,
        platoons: day.platoons.map((table) => {
          if (table.platoonId !== tableId) return table;

          const newCols = [...table.columns];
          if (!newCols[colIndex] || !newCols[colIndex].cells) {
            console.error(`Колонка ${colIndex} или её ячейки не найдены`);
            return table;
          }

          const existingCell = newCols[colIndex].cells[cellIndex] || {};
          const cell = { ...existingCell, ...newValue };

          newCols[colIndex].cells[cellIndex] = cell;
          return { ...table, columns: newCols };
        }),
      }));

      // Сохраняем в localStorage
      try {
        localStorage.setItem('scheduleData', JSON.stringify(updatedData));
        console.log('📁 Данные сохранены в localStorage');
      } catch (err) {
        console.error('❌ Ошибка сохранения в localStorage:', err);
      }

      return updatedData;
    });

    setHasChanges(true);

    // 2. ОТПРАВКА НА СЕРВЕР (только в серверном режиме)
    if (!isLocalMode()) {
      try {
        const column = scheduleData
          .flatMap(day => day.platoons)
          .find(t => t.platoonId === tableId)
          ?.columns[colIndex];

        const result = await scheduleApi.saveCell({
          lesson_id: column?.cells?.[cellIndex]?.lesson_id,
          platoon_id: tableId,
          subject_load_id: newValue.subject_load_id,
          subject: newValue.subject,
          topic: newValue.topic,
          subtopic: newValue.subtopic,
          type: newValue.type,
          audience: newValue.audience,
          teacher: newValue.teacher,
          date: column?.title, // В ваших данных date хранится в title
          time: cellIndex + 1, // Номер пары (1, 2, 3, 4)
        });
        console.log('✅ Сервер ответил:', result);

      } catch (err) {
        console.error("❌ Ошибка при сохранении ячейки на сервере:", err);
      }
    } else {
      console.log('📁 Локальный режим - данные не отправлены на сервер');
    }
  }, [scheduleData, isLocalMode]); // Добавляем isLocalMode в зависимости

  // --- вычисляем, пуста ли выбранная ячейка ---
  const isSingleEmptyCell = useMemo(() => {
    if (selectedCells.length !== 1) return false;
    const { tableId, columnIndex, cellIndex } = selectedCells[0];
    const cell = getCellValue?.(tableId, columnIndex, cellIndex);
    if (!cell) return true;
    return (
      (!cell.subject || cell.subject.trim() === "") &&
      (!cell.topicNumber || cell.topicNumber.trim() === "") &&
      (!cell.type || cell.type.trim() === "") &&
      (!cell.audience || cell.audience.trim() === "") &&
      (!cell.teacher || cell.teacher.trim() === "")
    );
  }, [selectedCells, getCellValue]);

  // --- действия copy / cut / paste / remove ---
  const handleActionRef = useRef();

  const handleAction = useCallback(
    (action, payload = {}) => {
      switch (action) {
        case "copy":
          if (selectedCount === 1) {
            const { tableId, columnIndex, cellIndex } = selectedCells[0];
            setCopiedCell(getCellValue(tableId, columnIndex, cellIndex));
          }
          break;

        case "cut":
          if (selectedCount >= 1) {
            const cell = getCellValue(
              selectedCells[0].tableId,
              selectedCells[0].columnIndex,
              selectedCells[0].cellIndex
            );
            setCopiedCell(cell);
            selectedCells.forEach(({ tableId, columnIndex, cellIndex }) => {
              updateCellValue(tableId, columnIndex, cellIndex, {
                subject_load_id: null,
                // lesson_id: null,
                subject: null,
                topic: null,
                subtopic: null,
                type: null,
                audience: null,
                teacher: null,
              });
            });
            setHasChanges(true);
          }
          break;

        case "paste":
          if (copiedCell && selectedCount >= 1) {
            selectedCells.forEach(({ tableId, columnIndex, cellIndex }) => {
              updateCellValue(tableId, columnIndex, cellIndex, copiedCell);
            });
            setHasChanges(true);
          }
          break;

        case "remove":
          if (selectedCount >= 1) {
            selectedCells.forEach(({ tableId, columnIndex, cellIndex }) => {
              updateCellValue(tableId, columnIndex, cellIndex, {
                subject_load_id: null,
                // lesson_id: null,
                subject: null,
                topic: null,
                subtopic: null,
                type: null,
                audience: null,
                teacher: null,
              });
            });
            setHasChanges(true);
          }
          break;

        case "all":
          if (!activeTableId) return;
          const allCells = [];
          let col = 0;
          while (true) {
            let row = 0;
            let found = false;
            while (true) {
              const cell = getCellValue(activeTableId, col, row);
              if (!cell) break;
              found = true;
              allCells.push({ tableId: activeTableId, columnIndex: col, cellIndex: row });
              row++;
            }
            if (!found) break;
            col++;
          }
          setSelectedCells(allCells);
          break;

        case "updateField": {
          const { tableId, columnIndex, cellIndex, field, value } = payload;
          const currentCell = getCellValue(tableId, columnIndex, cellIndex);

          let updateData = {};

          console.log("value", value)
          console.log("currentCell", currentCell)

          switch (field) {
            case "subject":
              updateData = {
                subject: value.name,
                subject_load_id: value.subject_load_id,
                // lesson_id: null,
                topic: null,
                subtopic: null,
                type: null,
                audience: null,
                teacher: null,
              };
              break;

            case "topicNumber":
              // Для темы сохраняем topic, subtopic и typeOfActivity
              updateData = value === null ? {
                topic: null,
                subtopic: null
              } : {
                topic: value.topic,
                subtopic: value.subtopic,
                type: value.typeOfActivity
              };
              break;

            case "type":
              // Просто тип занятия
              updateData = { type: value };
              break;

            case "audience":
              // Аудитория - сохраняем id
              updateData = { audience: value };
              break;

            case "teacher":
              // Преподаватель
              updateData = { teacher: value };
              break;

            default:
              console.warn(`Неизвестное поле для обновления: ${field}`);
              return;
          }

          // Объединяем с текущими данными ячейки
          const newValue = { ...currentCell, ...updateData };
          console.log('Новое значение ячейки:', newValue);
          // Обновляем ячейку
          updateCellValue(tableId, columnIndex, cellIndex, newValue);
          break;
        }

        case "exit":
          setIsEditing(false);
          setHasChanges(false);
          break;


        case "magic":
          const generateSchedule = async () => {
            setIsGenerating(true);
            setGenerationMessage(null);
            
            console.log("1")
            try {
              console.log(`🎯 Генерация расписания для дня: ${selectedDay}`);
              
              const result = await scheduleApi.generateSchedule(selectedDay === 0 ? null : selectedDay);
              
              if (result.success) {
                setGenerationMessage({
                  type: 'success',
                  text: result.message || 'Расписание успешно сгенерировано'
                });
                
                setTimeout(() => {
                  fetchSchedule();
                }, 500);
                
                console.log('Расписание успешно сгенерировано:', result);
              } else {
                throw new Error(result.message || 'Неизвестная ошибка генерации');
              }
              
            } catch (error) {
              console.error('Ошибка генерации расписания:', error);
              setGenerationMessage({
                type: 'error',
                text: `Ошибка: ${error.message}`
              });
            } finally {
              setIsGenerating(false);
            }
          };
          
          generateSchedule();
          break;

      }
    },
    [selectedCells, copiedCell, selectedCount, getCellValue, updateCellValue, activeTableId, selectedDay, fetchSchedule]
  );

  handleActionRef.current = handleAction;

  return (
    <EditContext.Provider
      value={{
        // Основные данные
        scheduleData,
        fetchSchedule,
        updateCellValue,
        getCellValue,

        // Режим редактирования
        isEditing,
        setIsEditing,
        hasChanges,
        setHasChanges,

        // Режим добавления
        isAdding,
        setIsAdding,

        // Выделение ячеек
        selectedCells,
        setSelectedCells,
        selectedCount,
        isSingleEmptyCell,

        // Копирование/вставка
        copiedCell,
        setCopiedCell,

        // Активная таблица
        activeTableId,
        setActiveTableId,

        // Действия
        handleAction,

        // Cостояние генерации
        isGenerating,
        generationMessage,
        setGenerationMessage,

        // Данные для dropdown
        dropdownData,
        fetchFieldData,
        getSelectedCellParams,

        dataSource,

        filteredScheduleData: getFilteredScheduleData,
        selectedDay,
        setSelectedDay: handleDayChange,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};