import TableCell from "./TableCell";

function TableColumn({
  tableId,
  index,
  cells = [],
  date = "",
  onCellChange,
  isActive = false,
  isEditing = false,
}) {
  const totalRows = 4;
  const filledCells = [...cells];
  // while (filledCells.length < totalRows) filledCells.push({}); Должны гарантировать что будут все 4 ячейки в backend

  return (
    <div className="flex flex-col">
      <div
        className={`grid items-center text-center font-bold text-xl h-[28px] border-b border-b-black ${isActive && isEditing ? "border-dashed" : ""
          }`}
      >
        {date}
      </div>

      <div className="grid justify-items-center items-center p-0 m-0 h-[250px]">
        {filledCells.map((cell, rowIndex) => (
          <TableCell
            key={`${tableId}-${index}-${rowIndex}`}
            tableId={tableId}
            columnIndex={index}
            cellIndex={rowIndex}
            // данные
            subject={cell.subject}
            topic={cell.topic}
            subtopic={cell.subtopic}
            type={cell.type}
            audience={cell.audience}
            teacher={cell.teacher}
          />
        ))}
      </div>
    </div>
  );
}

export default TableColumn;
