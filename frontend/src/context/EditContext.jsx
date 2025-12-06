import { createContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import { tablesData } from "../data/tablesData";

export const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const [scheduleData, setScheduleData] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [copiedCell, setCopiedCell] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTableId, setActiveTableId] = useState(null);

  const selectedCount = selectedCells.length;

  // --- загрузка расписания с backend ---
  const fetchSchedule = useCallback(async () => {
    // try {
    //   const res = await fetch("http://localhost:8000/api/schedule");
    //   const data = await res.json();
    //   setScheduleData(data);
    // } catch (err) {
    //   console.error("Ошибка загрузки расписания:", err);
    // }

    try {
      // Используем локальные данные вместо запроса к бэкенду
      console.log("Загрузка локальных данных из tablesData.js");
      setScheduleData(tablesData);
    } catch (err) {
      console.error("Ошибка загрузки расписания:", err);
      setScheduleData([]); // На случай ошибки
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

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


    // С СЕРВЕРОМ
    // // 1. Локально обновляем UI
    // setScheduleData((prev) =>
    //   prev.map((day) => ({
    //     ...day,
    //     platoons: day.platoons.map((table) => {
    // if (table.platoonId !== tableId) return table;
    //       const newCols = [...table.columns];
    //       const cell = { ...newCols[colIndex].cells[cellIndex], ...newValue };
    //       newCols[colIndex].cells[cellIndex] = cell;
    //       return { ...table, columns: newCols };
    //     }),
    //   }))
    // );

    // setHasChanges(true);

    // // 2. Отправляем изменения на сервер
    // try {
    //   const cell = getCellValue(tableId, colIndex, cellIndex);
    //   if (!cell?.lessonId) return;

    //   await fetch("http://localhost:8000/api/schedule/savecell", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       lessonId: cell.lessonId,
    //       subject: newValue.subject,
    //       type: newValue.type,
    //       audience: newValue.audience,
    //     }),
    //   });
    // } catch (err) {
    //   console.error("Ошибка при сохранении ячейки:", err);
    // }
  }, [getCellValue]);

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

          // Получаем текущее значение ячейки
          const currentCell = getCellValue(tableId, columnIndex, cellIndex);

          // Подготавливаем обновление в зависимости от поля
          let updateData = {};

          switch (field) {
            case "subject":
              // Для предмета сохраняем имя и id (если нужно)
              updateData = {
                subject: value.name,
                subjectId: value.id,
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
              updateData = {
                topicNumber: `${value.topic}.${value.subtopic}`,
                topic: value.topic,
                subtopic: value.subtopic,
                type: value.typeOfActivity // автоматически обновляем тип занятия
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

  // --- горячие клавиши ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "c":
            e.preventDefault();
            handleAction("copy");
            break;
          case "x":
            e.preventDefault();
            handleAction("cut");
            break;
          case "v":
            e.preventDefault();
            handleAction("paste");
            break;
          case "a":
            e.preventDefault();
            handleAction("all");
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, selectedCells, copiedCell, handleAction]);

  return (
    <EditContext.Provider
      value={{
        scheduleData,
        fetchSchedule,
        updateCellValue,
        getCellValue,
        isEditing,
        setIsEditing,
        hasChanges,
        setHasChanges,
        selectedCells,
        setSelectedCells,
        selectedCount,
        isSingleEmptyCell,
        copiedCell,
        setCopiedCell,
        activeTableId,
        setActiveTableId,
        handleAction,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};
