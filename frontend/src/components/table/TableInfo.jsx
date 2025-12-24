import TablePlatoonColumn from "./TablePlatoonColumn";
import TableDisciplineColumn from "./TableDisciplineColumn";
import TableAudienceColumn from "./TableAudienceColumn";

function TableInfo({ platoon, isActive, infoData = [], isCollapsed }) {
  return (
    <div className="relative flex">
      <div className="flex relative h-[240px]">
        <TablePlatoonColumn
          platoon={platoon}
          isActive={isActive}
          showBorderRight={isCollapsed}
        />

        {/* Плавная анимация скрытия/показа с одинаковой длительностью */}
        <div className={`flex transition-all duration-700 ease-in-out overflow-hidden ${
          isCollapsed
            ? "w-0 opacity-0"
            : "w-[261px] opacity-100"
          }`}
        >
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