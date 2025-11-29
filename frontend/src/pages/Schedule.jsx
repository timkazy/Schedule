import { useState, useEffect, useCallback } from "react";
import "../App.css";
import Table from "../components/table/Table";
import DaySelector from "../components/DaySelector";
import { scheduleData as initialData } from "../data/tablesData";
import { useEdit } from "../context/useEdit";

function Schedule() {
  const {
    isEditing,
    setSelectedCells,
    activeTableId,
    setActiveTableId,
    setHasChanges,
    setGetCellValue,
    setUpdateCellValue,
  } = useEdit();

  const [activeDay, setActiveDay] = useState(0);
  const [data, setData] = useState(initialData);

  const getCellValue = useCallback(
    (tableId, colIndex, cellIndex) => {
      const day = data.find((d) => d.platoons.some((t) => t.id === tableId));
      if (!day) return null;
      const table = day.platoons.find((t) => t.id === tableId);
      if (!table) return null;
      const column = table.columns[colIndex];
      if (!column) return null;
      return column.cells[cellIndex] || null;
    },
    [data]
  );

  const updateCellValue = useCallback(
    (tableId, colIndex, cellIndex, newValue) => {
      setData((prev) =>
        prev.map((day) => ({
          ...day,
          platoons: day.platoons.map((table) => {
            // if (table.id !== tableId) return table;
            if (String(table.id) !== String(tableId)) return table;
            const newCols = [...table.columns];
            const cell = { ...newCols[colIndex].cells[cellIndex], ...newValue };
            newCols[colIndex].cells[cellIndex] = cell;
            return { ...table, columns: newCols };
          }),
        }))
      );
      setHasChanges(true);
    },
    [setData, setHasChanges]
  );

  useEffect(() => {
    setGetCellValue(() => getCellValue);
    setUpdateCellValue(() => updateCellValue);
  }, [getCellValue, updateCellValue, setGetCellValue, setUpdateCellValue]);

  const handleCellClick = (tableId, colIndex, cellIndex, e) => {
    if (!isEditing) return;

    if (e.ctrlKey || e.metaKey) {
      setSelectedCells((prev) => {
        const exists = prev.some(
          (c) =>
            c.tableId === tableId &&
            c.columnIndex === colIndex &&
            c.cellIndex === cellIndex
        );
        return exists
          ? prev.filter(
            (c) =>
              !(
                c.tableId === tableId &&
                c.columnIndex === colIndex &&
                c.cellIndex === cellIndex
              )
          )
          : [...prev, { tableId, columnIndex: colIndex, cellIndex }];
      });
    } else {
      setActiveTableId(tableId);
      setSelectedCells([{ tableId, columnIndex: colIndex, cellIndex }]);
    }
  };

  const dayTables =
    activeDay === 0
      ? data.flatMap((day) => day.platoons)
      : data.find((day) => day.dayName === activeDay)?.platoons || [];

  return (
    <div className="relative">
      <div className="text-7xl font-bold text-center mt-11">Расписание</div>
      {!isEditing && <DaySelector selectedDay={activeDay} setSelectedDay={setActiveDay} />}


      <div className="flex flex-col items-center space-y-12 mt-6">
        {dayTables.map((table) => (
          <div key={table.id} className="w-full max-w-6xl">
            <Table
              isEditing={isEditing}
              columnsData={table.columns}
              onCellChange={updateCellValue}
              onCellClick={handleCellClick}
              activeTableId={activeTableId}
              platoonId={table.id}
              platoonName={table.platoonName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
