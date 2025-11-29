import TablePlatoonColumn from "./TablePlatoonColumn";

function TableInfo({ platoon, isActive }) {
  return (
    <div className="flex gap-1">
      <TablePlatoonColumn platoon={platoon} isActive={isActive} />
    </div>
  );
}

export default TableInfo;