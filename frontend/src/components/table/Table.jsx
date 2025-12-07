import TableInfo from "./TableInfo";
import TableColumn from "./TableColumn";
import TableTimeColumn from "./TableTimeColumn";

function Table({
  isEditing,
  columnsData,
  infoData,
  activeTableId,
  platoonId,
}) {
  return (
    // Experimental
    <div className={`flex flex-col items-center ${isEditing ? "hover:scale-[101%] transition-transform ease-in-out duration-300" : ""}`}>
    {/* <div className="flex flex-col items-center"> */}
      <div className="relative w-full max-w-6xl flex overflow-hidden rounded-lg">
        <div className="sticky left-0 bg-white z-10">
          <TableInfo
            platoon={platoonId}
            infoData={infoData || []}
            isActive={isEditing && platoonId === activeTableId}
          />
        </div>

        <div className="overflow-x-auto overflow-y-hidden scroll-smooth w-full relative">
          <div className="flex w-max">
            {columnsData.map((column, index) => (
              <TableColumn
                key={index}
                tableId={platoonId}
                index={index}
                date={column.title} // дата
                cells={column.cells || []}
                isActive={platoonId === activeTableId}
                isEditing={isEditing && platoonId === activeTableId}
              />
            ))}
          </div>
        </div>

        <div className="sticky right-0 bg-white z-10">
          <TableTimeColumn
            isActive={isEditing && platoonId === activeTableId}
          />
        </div>
      </div>
    </div>
  );
}

export default Table;
