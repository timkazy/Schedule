import { createContext, useState, useCallback, useMemo, useEffect, useRef } from "react";

export const EditContext = createContext();

export const EditProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [copiedCell, setCopiedCell] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTableId, setActiveTableId] = useState(null);

  const [getCellValue, setGetCellValue] = useState(null);
  const [updateCellValue, setUpdateCellValue] = useState(null);

  const selectedCount = selectedCells.length;

  const isSingleEmptyCell = useMemo(() => {
    if (selectedCells.length !== 1 || !getCellValue) return false;
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

  // useRef чтобы всегда был актуальный handleAction
  const handleActionRef = useRef();

  const handleAction = useCallback(
    (action, payload = {}) => {
      const getVal = getCellValue;
      const updateVal = updateCellValue;

      switch (action) {
        case "copy":
          if (selectedCount === 1 && getVal) {
            const { tableId, columnIndex, cellIndex } = selectedCells[0];
            setCopiedCell(getVal(tableId, columnIndex, cellIndex));
          }
          break;
        case "cut":
          if (selectedCount >= 1 && getVal && updateVal) {
            const cell = getVal(
              selectedCells[0].tableId,
              selectedCells[0].columnIndex,
              selectedCells[0].cellIndex
            );
            setCopiedCell(cell);
            selectedCells.forEach(({ tableId, columnIndex, cellIndex }) => {
              updateVal(tableId, columnIndex, cellIndex, {
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
          if (copiedCell && selectedCount >= 1 && updateVal) {
            selectedCells.forEach(({ tableId, columnIndex, cellIndex }) => {
              updateVal(tableId, columnIndex, cellIndex, copiedCell);
            });
            setHasChanges(true);
          }
          break;
        case "remove":
          if (selectedCount >= 1 && updateVal) {
            selectedCells.forEach(({ tableId, columnIndex, cellIndex }) => {
              updateVal(tableId, columnIndex, cellIndex, {
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
          if (!getVal || !activeTableId) return;
          const allCells = [];
          let col = 0;
          while (true) {
            let row = 0;
            let found = false;
            while (true) {
              const cell = getVal(activeTableId, col, row);
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

  // -----------------------
  // Горячие клавиши
  // -----------------------
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
        setGetCellValue,
        setUpdateCellValue,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};
