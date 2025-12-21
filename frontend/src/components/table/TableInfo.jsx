import { useState } from "react";
import TablePlatoonColumn from "./TablePlatoonColumn";
import TableDisciplineColumn from "./TableDisciplineColumn";
import TableAudienceColumn from "./TableAudienceColumn";
import goToIcon from "../../assets/icons/goTo.svg";

function TableInfo({ platoon, isActive, infoData = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleCollapse = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsCollapsed(!isCollapsed);

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative flex">
      <button
        onClick={toggleCollapse}
        disabled={isAnimating}
        className="absolute right-0 top-[136px] transform -translate-y-1/2 translate-x-1/2 z-20 rounded-full bg-green-400 w-6 h-6 flex items-center justify-center shadow-md hover:bg-green-500 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label={isCollapsed ? "Показать колонки" : "Скрыть колонки"}
        title={isCollapsed ? "Показать дополнительные данные" : "Скрыть дополнительные данные"}
      >
        <img
          src={goToIcon}
          alt={isCollapsed ? "показать" : "скрыть"}
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}
        />
      </button>

      <div className="flex relative h-[240px]">
        <TablePlatoonColumn
          platoon={platoon}
          isActive={isActive}
          showBorderRight={isCollapsed}
        />

        <div className={`flex transition-all duration-700 ease-in-out ${isCollapsed
            ? "w-0 opacity-0 pointer-events-none "
            : "w-[261px] opacity-100"
          }`}>
          <TableDisciplineColumn
            isActive={isActive}
            infoData={infoData}
          />
          <TableAudienceColumn
            isActive={isActive}
            infoData={infoData}
          />
        </div>
      </div>
    </div>
  );
}

export default TableInfo;