import { useState } from "react";
import "../App.css";
import Table from "../components/table/Table";
import DaySelector from "../components/DaySelector";
import { useEdit } from "../context/useEdit";

import EditMenu from "../components/menu/EditMenu";

function Schedule() {
  const {
    scheduleData,
    isEditing,
    activeTableId,
  } = useEdit();

  const [activeDay, setActiveDay] = useState(0);

  const dayTables =
  activeDay === 0
    ? scheduleData
        .filter(day => day.dayId >= 1 && day.dayId <= 7)
        .sort((a, b) => a.dayId - b.dayId) // если нужна сортировка по порядку
        .flatMap(day => day.platoons)
    : scheduleData.find(day => day.dayId === activeDay)?.platoons || [];

  return (
    <>
      <EditMenu />
      {/* Попытка виньетки */}
      {/* {isEditing && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_left,_transparent_30%,_rgba(0,0,0,0.4)_70%)]"></div>
          <div className="absolute  bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,_transparent_30%,_rgba(0,0,0,0.4)_70%)]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_bottom_left,_transparent_30%,_rgba(0,0,0,0.4)_70%)]"></div>
          <div className="absolute top-0 left-0  w-64 h-64 bg-[radial-gradient(circle_at_bottom_right,_transparent_30%,_rgba(0,0,0,0.4)_70%)]"></div>
        </div>
      )}
      */}

      <div className="relative">
        <div className="text-7xl font-bold text-center mt-10">Расписание</div>
        {!isEditing && <DaySelector selectedDay={activeDay} setSelectedDay={setActiveDay} />}

        <div className="flex flex-col items-center space-y-8 mt-5">
          {dayTables.map((table) => (
            <div key={table.id} className="w-full max-w-6xl">
              <Table
                isEditing={isEditing}
                columnsData={table.columns}
                infoData={table.info || []}
                activeTableId={activeTableId}
                platoonId={table.platoonId}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Schedule;
