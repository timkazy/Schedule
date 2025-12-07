import { createContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { tablesData } from "../data/tablesData";
import { scheduleApi } from "../api/scheduleApi";
import { localDropdownData } from "../data/localDropdownData";
import { appConfig, isLocalMode } from "../config/appConfig";

export const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [dataSource, setDataSource] = useState(appConfig.dataSource); // состояние режима

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

  // --- загрузка расписания ---
  const fetchSchedule = useCallback(async () => {
    if (isLocalMode()) {
      // Локальный режим
      try {
        console.log("📁 Загрузка локальных данных расписания");
        setScheduleData(tablesData);
      } catch (err) {
        console.error("Ошибка загрузки локальных данных:", err);
        setScheduleData([]);
      }
    } else {
      // Серверный режим
      try {
        console.log("🌐 Загрузка данных с сервера");
        const res = await fetch(`${appConfig.server.baseUrl}/schedule`);
        const data = await res.json();
        setScheduleData(data);
      } catch (err) {
        console.error("Ошибка загрузки данных с сервера:", err);
      }
    }
  }, [dataSource]); // Добавляем dataSource в зависимости

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // 👇 Универсальная функция загрузки данных
  const loadData = useCallback(async (loaderType, params = {}) => {
    const { platoonId, subjectId, lessonType } = params;

    // Создаем ключ для кэша
    let cacheKey = '';
    let cacheMap = null;

    switch (loaderType) {
      case 'subjects':
        cacheKey = platoonId;
        cacheMap = dataCache.subjects;
        break;
      case 'topics':
        cacheKey = lessonType ? `${subjectId}_${lessonType}` : `${subjectId}`;
        cacheMap = dataCache.topics;
        break;
      case 'lessonTypes':
        cacheKey = subjectId;
        cacheMap = dataCache.lessonTypes;
        break;
      case 'audiences':
        cacheKey = lessonType ? `${subjectId}_${lessonType}` : `${subjectId}`;
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
          data = localDropdownData.getSubjects(platoonId);
          break;
        case 'topics':
          data = localDropdownData.getTopics(subjectId, lessonType);
          break;
        case 'lessonTypes':
          data = localDropdownData.getLessonTypes(subjectId);
          break;
        case 'audiences':
          data = localDropdownData.getAudiences(subjectId, lessonType);
          break;
        case 'teachers':
          data = localDropdownData.getTeachers(platoonId, subjectId);
          break;
        default:
          data = [];
      }
    } else {
      // Данные с сервера
      try {
        switch (loaderType) {
          case 'subjects':
            data = await scheduleApi.getSubjects(platoonId);
            break;
          case 'topics':
            data = await scheduleApi.getTopics(subjectId, lessonType);
            break;
          case 'lessonTypes':
            data = await scheduleApi.getLessonTypes(subjectId);
            break;
          case 'audiences':
            data = await scheduleApi.getAudiences(subjectId, lessonType);
            break;
          case 'teachers':
            data = await scheduleApi.getTeachers(platoonId, subjectId);
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

  // 👇 Функции загрузки для каждого типа данных
  const fetchSubjects = useCallback(async (platoonId) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('subjects', { platoonId });
      setDropdownData(prev => ({ ...prev, subjects: data }));
      return data;
    } catch (error) {
      console.error("Ошибка загрузки предметов:", error);
      setDropdownData(prev => ({ ...prev, error: error.message }));
      return [];
    } finally {
      setDropdownData(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadData]);

  const fetchTopics = useCallback(async (subjectId, lessonType = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('topics', { subjectId, lessonType });
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

  const fetchLessonTypes = useCallback(async (subjectId) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('lessonTypes', { subjectId });
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

  const fetchAudiences = useCallback(async (subjectId, lessonType = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('audiences', { subjectId, lessonType });
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

  const fetchTeachers = useCallback(async (platoonId = null, subjectId = null) => {
    setDropdownData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await loadData('teachers', { platoonId, subjectId });
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

  // 👇 Универсальная функция для получения данных поля
  const fetchFieldData = useCallback(async (field, params = {}) => {
    const { platoonId, subjectId, lessonType } = params;

    switch (field) {
      case "subject":
        return await fetchSubjects(platoonId);

      case "topicNumber":
        return await fetchTopics(subjectId, lessonType);

      case "type":
        return await fetchLessonTypes(subjectId);

      case "audience":
        return await fetchAudiences(subjectId, lessonType);

      case "teacher":
        return await fetchTeachers(platoonId, subjectId);

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
      platoonId: tableId,
      subjectId: cell?.subjectId,
      lessonType: cell?.type,
      date: column?.date,
      time: column?.time,
      cellData: cell,
    };
  }, [selectedCells, getCellValue, scheduleData]);

  // --- обновить ячейку ---
  const updateCellValue = useCallback(async (tableId, colIndex, cellIndex, newValue) => {
    // ЛОКАЛЬНО
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
        console.log('Данные сохранены в localStorage');
      } catch (err) {
        console.error('Ошибка сохранения в localStorage:', err);
      }

      return updatedData;
    });

    setHasChanges(true);

    // 2. Отправляем на сервер

    // try {
    //   const cell = getCellValue(tableId, colIndex, cellIndex);
    //   const column = scheduleData
    //     .flatMap(day => day.platoons)
    //     .find(t => t.platoonId === tableId)
    //     ?.columns[colIndex];

    //   if (!cell?.lessonId) return;

    //   await scheduleApi.saveCell({
    //     lessonId: cell.lessonId,
    //     platoonId: tableId,
    //     subjectId: newValue.subjectId,
    //     subject: newValue.subject,
    //     topic: newValue.topic,
    //     subtopic: newValue.subtopic,
    //     type: newValue.type,
    //     audience: newValue.audience,
    //     teacher: newValue.teacher,
    //     date: column?.date,
    //     time: column?.time,
    //   });
    // } catch (err) {
    //   console.error("Ошибка при сохранении ячейки:", err);
    //   // Можно добавить уведомление пользователю
    // }
  }, [getCellValue, scheduleData]);

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
                id: null,
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
                id: null,
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

          switch (field) {
            case "subject":
              // Для предмета сохраняем имя и id (если нужно)
              updateData = {
                subject: value === null ? null : value.name,
                subjectId: value === null ? null : value.id,
                topicNumber: null,
                topic: null,
                subtopic: null,
                type: null,
                teacher: null,
                audience: null,
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
      }
    },
    [selectedCells, copiedCell, selectedCount, getCellValue, updateCellValue, activeTableId]
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

        // Данные для dropdown
        dropdownData,
        fetchFieldData,
        getSelectedCellParams,

        // 👇 НОВОЕ: управление режимом данных
        dataSource,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};