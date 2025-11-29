import { useEdit } from "../../context/useEdit";

function TableCell({
  tableId,
  columnIndex,
  cellIndex,
  subject = "",
  topicNumber = "",
  type = "",
  audience = "",
}) {
  const { isEditing, selectedCells, setSelectedCells, activeTableId, setActiveTableId } = useEdit();

  const isSelected = selectedCells.some(
    (c) => c.tableId === tableId && c.columnIndex === columnIndex && c.cellIndex === cellIndex
  );

  const isActive = isEditing && tableId === activeTableId;

  const isEmpty =
    (!subject || subject.trim() === "") &&
    (!topicNumber || topicNumber.trim() === "") &&
    (!type || type.trim() === "") &&
    (!audience || audience.trim() === "");

  const handleClick = (e) => {
    if (!isEditing) return;
    setActiveTableId(tableId);

    // SHIFT: выделить диапазон
    if (e.shiftKey && selectedCells.length > 0) {
      const last = selectedCells[selectedCells.length - 1];
      if (last.tableId === tableId) {
        const minCol = Math.min(last.columnIndex, columnIndex);
        const maxCol = Math.max(last.columnIndex, columnIndex);
        const minRow = Math.min(last.cellIndex, cellIndex);
        const maxRow = Math.max(last.cellIndex, cellIndex);

        const newSelection = [];
        for (let c = minCol; c <= maxCol; c++) {
          for (let r = minRow; r <= maxRow; r++) {
            newSelection.push({ tableId, columnIndex: c, cellIndex: r });
          }
        }
        setSelectedCells(newSelection);
      }
      return;
    }

    // CTRL (или повторный клик по выделенной ячейке): toggle
    if (e.ctrlKey || e.metaKey) {
      setSelectedCells((prev) => {
        const already = prev.some(
          (c) =>
            c.tableId === tableId &&
            c.columnIndex === columnIndex &&
            c.cellIndex === cellIndex
        );
        return already
          ? prev.filter(
            (c) =>
              !(
                c.tableId === tableId &&
                c.columnIndex === columnIndex &&
                c.cellIndex === cellIndex
              )
          )
          : [...prev, { tableId, columnIndex, cellIndex }];
      });
      return;
    }

    // 🔹 обычный клик: если клик по уже выделенной — снять выделение
    setSelectedCells((prev) => {
      const already = prev.some(
        (c) =>
          c.tableId === tableId &&
          c.columnIndex === columnIndex &&
          c.cellIndex === cellIndex
      );
      return already ? [] : [{ tableId, columnIndex, cellIndex }];
    });
  };


  const borderClass =
    isActive && isSelected
      ? "border-[0.05rem] border-dashed border-black"
      : "border border-transparent border-dashed";

  const bgClass =
    !isEmpty && type?.toLowerCase() === "экзамен" ? "bg-yellow-200" : "bg-transparent";

  const textClass = isEmpty ? "text-gray-400" : "text-black";

  return (
    <div
      onClick={handleClick}
      className={`
        flex flex-col justify-between items-center text-center select-none cursor-pointer
        flex-shrink-0 w-[110px] aspect-[2/1] p-1 relative
        ${textClass} ${bgClass} ${borderClass}
      `}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-[15px] font-semibold leading-none text-center">
          нет занятия
        </div>
      ) : (
        <>
          <div className="w-full text-right text-[11px] font-medium leading-none">
            <i>{audience}{audience ? "к" : ""}</i>
          </div>
          <div className="text-[18px] font-bold leading-none truncate w-full px-1">
            {subject}
          </div>
          <div className="w-full flex justify-between text-[11px] leading-none font-medium">
            <span>{topicNumber}</span>
            <span>{type}</span>
          </div>
        </>
      )}
    </div>
  );
}

export default TableCell;
