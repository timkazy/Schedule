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
  const [isCollapsed, setIsCollapsed] = useState(false); // Состояние для всех таблиц

  const dayTables =
    activeDay === 0
      ? scheduleData
        .filter(day => day.dayId >= 1 && day.dayId <= 7)
        .sort((a, b) => a.dayId - b.dayId)
        .flatMap(day => day.platoons)
      : scheduleData.find(day => day.dayId === activeDay)?.platoons || [];

  const toggleCollapseAll = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <EditMenu />
      <div className="relative">
        <div className="text-7xl font-bold text-center mt-10">Расписание</div>

          {!isEditing && <DaySelector selectedDay={activeDay} setSelectedDay={setActiveDay} />}

          {dayTables.length > 0 && (
            <div className="flex justify-center mt-3 mb-2">
              <button
                onClick={toggleCollapseAll}
                className="px-3 py-1 bg-green-500 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 flex items-center gap-2"
                aria-label={isCollapsed ? "Показать информацию всех таблиц" : "Скрыть информацию всех таблиц"}
              >
                <svg
                  className={`w-5 h-5 m-0 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {/* <span>{isCollapsed ? "Показать больше" : "Скрыть"}</span> */}
              </button>
            </div>
          )}

        <div className="flex flex-col items-center space-y-8 mt-5">
          {dayTables.map((table) => (
            <div key={table.id} className="w-full max-w-6xl">
              <Table
                isEditing={isEditing}
                columnsData={table.columns}
                infoData={table.info || []}
                activeTableId={activeTableId}
                platoonId={table.platoonId}
                isCollapsed={isCollapsed}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Schedule;