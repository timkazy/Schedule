import TableInfo from "./TableInfo";
import TableColumn from "./TableColumn";
import TableTimeColumn from "./TableTimeColumn";

function Table({
  isEditing,
  columnsData,
  infoData,
  activeTableId,
  platoonId,
  isCollapsed, // Принимаем состояние из родителя
}) {
  return (
    <div className="flex flex-col items-center">
      {/* <div className="relative max-w-6xl flex overflow-hidden rounded-lg"> */}
      <div className="relative w-full max-w-6xl flex overflow-hidden rounded-lg">
        <div className="sticky left-0 bg-white z-10">
          <TableInfo
            platoon={platoonId}
            infoData={infoData || []}
            isActive={isEditing && platoonId === activeTableId}
            isCollapsed={isCollapsed} // Передаем дальше
          />
        </div>

        <div className="overflow-x-auto overflow-y-hidden scroll-smooth w-full relative">
          <div className="flex w-max">
            {columnsData.map((column, index) => (
              <TableColumn
                key={index}
                tableId={platoonId}
                index={index}
                date={column.title}
                cells={column.cells || []}
                isActive={platoonId === activeTableId}
                isEditing={isEditing && platoonId === activeTableId}
              />
            ))}
            
            <div 
              className={`relative min-w-[200px] flex-grow h-[32px] border-b border-b-black ${platoonId === activeTableId && isEditing ? "border-dashed" : ""}`}
              style={{
                minWidth: `calc(100vw - ${columnsData.length * 100}px - 295px)`
              }}
            >
              {/* Здесь можно добавить какое-то содержимое или оставить пустым */}
              <span className="opacity-0"></span>
            </div>
          
          </div>

        </div>

        <div className="sticky right-0 bg-white z-10">
          <TableTimeColumn
            isCollapsed={isCollapsed}
            isActive={isEditing && platoonId === activeTableId}
          />
        </div>
      </div>
    </div>
  );
}

export default Table;