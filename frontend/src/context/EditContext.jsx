import { createContext, useState, useCallback, useMemo, useEffect, useRef } from "react";

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
    try {
      const res = await fetch("http://localhost:8000/api/schedule");
      const data = await res.json();
      setScheduleData(data);
    } catch (err) {
      console.error("Ошибка загрузки расписания:", err);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // --- получить значение ячейки ---
  const getCellValue = useCallback(
    (tableId, colIndex, cellIndex) => {
      const day = scheduleData.find((d) => d.platoons.some((t) => t.id === tableId));
      if (!day) return null;
      const table = day.platoons.find((t) => t.id === tableId);
      if (!table) return null;
      const column = table.columns[colIndex];
      if (!column) return null;
      return column.cells[cellIndex] || null;
    },
    [scheduleData]
  );

  // --- обновить ячейку ---
  const updateCellValue = useCallback(async (tableId, colIndex, cellIndex, newValue) => {
    // 1. Локально обновляем UI
    setScheduleData((prev) =>
      prev.map((day) => ({
        ...day,
        platoons: day.platoons.map((table) => {
          if (String(table.id) !== String(tableId)) return table;
          const newCols = [...table.columns];
          const cell = { ...newCols[colIndex].cells[cellIndex], ...newValue };
          newCols[colIndex].cells[cellIndex] = cell;
          return { ...table, columns: newCols };
        }),
      }))
    );

    setHasChanges(true);

    // 2. Отправляем изменения на сервер
    try {
      const cell = getCellValue(tableId, colIndex, cellIndex);
      if (!cell?.lessonId) return;

      await fetch("http://localhost:8000/api/schedule/savecell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: cell.lessonId,
          subject: newValue.subject,
          type: newValue.type,
          audience: newValue.audience,
        }),
      });
    } catch (err) {
      console.error("Ошибка при сохранении ячейки:", err);
    }
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
                subject: "",
                topicNumber: "",
                type: "",
                audience: "",
                teacher: "",
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
                subject: "",
                topicNumber: "",
                type: "",
                audience: "",
                teacher: "",
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
