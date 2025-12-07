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
      ? scheduleData.flatMap((day) => day.platoons)
      : scheduleData.find((day) => day.dayId === activeDay)?.platoons || [];

  return (
    <>
      <EditMenu />
      
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
