import { useState } from "react";
import "../App.css";
import Table from "../components/table/Table";
import DaySelector from "../components/DaySelector";
import { useEdit } from "../context/useEdit";

function Schedule() {
  const {
    scheduleData,
    updateCellValue,
    isEditing,
    setSelectedCells,
    activeTableId,
    setActiveTableId,
  } = useEdit();

  const [activeDay, setActiveDay] = useState(0);

  // const handleCellClick = (tableId, colIndex, cellIndex, e) => {
  //   if (!isEditing) return;

  //   if (e.ctrlKey || e.metaKey) {
  //     setSelectedCells((prev) => {
  //       const exists = prev.some(
  //         (c) =>
  //           c.tableId === tableId &&
  //           c.columnIndex === colIndex &&
  //           c.cellIndex === cellIndex
  //       );
  //       return exists
  //         ? prev.filter(
  //             (c) =>
  //               !(
  //                 c.tableId === tableId &&
  //                 c.columnIndex === colIndex &&
  //                 c.cellIndex === cellIndex
  //               )
  //           )
  //         : [...prev, { tableId, columnIndex: colIndex, cellIndex }];
  //     });
  //   } else {
  //     setActiveTableId(tableId);
  //     setSelectedCells([{ tableId, columnIndex: colIndex, cellIndex }]);
  //   }
  // };

  const dayTables =
    activeDay === 0
      ? scheduleData.flatMap((day) => day.platoons)
      : scheduleData.find((day) => day.dayId === activeDay)?.platoons || [];

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
              infoData={table.info || []}
              onCellChange={updateCellValue}
              // onCellClick={handleCellClick}
              activeTableId={activeTableId}
              platoonId={table.platoonId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule;
