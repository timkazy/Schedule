import TablePlatoonColumn from "./TablePlatoonColumn";
import TableDisciplineColumn from "./TableDisciplineColumn"
import TableAudienceColumn from "./TableAudienceColumn"

function TableInfo({ platoon, isActive, infoData = [] }) {
  return (
    <div className="flex">
      <TablePlatoonColumn platoon={platoon} isActive={isActive} />
      <TableDisciplineColumn isActive={isActive} infoData={infoData} />
      <TableAudienceColumn isActive={isActive} infoData={infoData} />
    </div>
  );
}

export default TableInfo;