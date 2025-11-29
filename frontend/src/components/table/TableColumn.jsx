import TableCell from "./TableCell";

function TableColumn({
  tableId,
  columnIndex,
  cells = [],
  columnTitle = "",
  onCellClick,
  onCellChange,
  isActive = false,
  isEditing = false,
}) {
  const totalRows = 4;
  const filledCells = [...cells];
  while (filledCells.length < totalRows) filledCells.push({});

  return (
    <div className="flex flex-col">
      <div
        className={`grid items-center text-center font-bold text-xl h-[28px] border-b border-b-black ${
          isActive && isEditing ? "border-dashed" : ""
        }`}
      >
        {columnTitle}
      </div>

      <div className="grid justify-items-center items-center p-0 m-0 h-[250px]">
        {filledCells.map((cell, rowIndex) => (
          <TableCell
            tableId={tableId}
            columnIndex={columnIndex}
            cellIndex={rowIndex}
            subject={cell.subject}
            topicNumber={cell.topicNumber}
            type={cell.type}
            audience={cell.audience}
          />
        ))}
      </div>
    </div>
  );
}

export default TableColumn;
