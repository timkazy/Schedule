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
    <div className="flex flex-col items-center">
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
            timeCells={[
              ["08:30", "10:05"],
              ["10:15", "11:50"],
              ["12:30", "14:05"],
              ["14:15", "15:50"],
            ]}
            isActive={isEditing && platoonId === activeTableId}
          />
        </div>
      </div>
    </div>
  );
}

export default Table;
