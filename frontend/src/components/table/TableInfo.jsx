import { useState } from "react";
import TablePlatoonColumn from "./TablePlatoonColumn";
import TableDisciplineColumn from "./TableDisciplineColumn";
import TableAudienceColumn from "./TableAudienceColumn";
import goToIcon from "../../assets/icons/goTo.svg";

function TableInfo({ platoon, isActive, infoData = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="relative flex">
      {/* Кнопка поверх таблицы */}
<button
  onClick={toggleCollapse}
  className="absolute right-0 top-[139px] transform -translate-y-1/2 translate-x-1/2 z-20 rounded-full bg-green-400 w-6 h-6 flex items-center justify-center shadow-md hover:bg-green-500 transition-all duration-300 hover:scale-110 active:scale-95"
  style={{ top: 'calc(28px + 125px)' }} // 28px header + половина 250px
  aria-label={isCollapsed ? "Показать колонки" : "Скрыть колонки"}
  title={isCollapsed ? "Показать дисциплины и аудитории" : "Скрыть дисциплины и аудитории"}
>
  <img 
    src={goToIcon} 
    alt={isCollapsed ? "показать" : "скрыть"}
    className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}
  />
</button>

      {/* Основное содержимое */}
      <div className="flex">
        <TablePlatoonColumn 
          platoon={platoon} 
          isActive={isActive}
          showBorderRight={isCollapsed}
        />
        
        {/* Контейнер для колонок - просто меняем ширину и opacity */}
        <div className={`flex transition-all duration-500 ${isCollapsed ? "w-0 opacity-0" : "w-[260px] opacity-100"}`}>
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