import { useEdit } from "../../context/useEdit";

import humanIcon from "../../assets/icons/human.svg";

function TableCell({
  tableId,
  columnIndex,
  cellIndex,

  subject = "",
  topic = null,
  subtopic = null,
  type = "",
  audience = null,
  teacher = ""
}) {
  const { isEditing, selectedCells, setSelectedCells, activeTableId, setActiveTableId } = useEdit();

  const isSelected = selectedCells.some(
    (c) => c.tableId === tableId && c.columnIndex === columnIndex && c.cellIndex === cellIndex
  );

  const isActive = isEditing && tableId === activeTableId;

  const isEmpty =
    (!subject || subject.trim() === "") &&
    (!topic && !subtopic) && // оба null или undefined
    (!type || type.trim() === "") &&
    (!audience || audience === null || audience === 0) &&
    (!teacher || teacher.trim() === "");

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
    !isEmpty && type?.toLowerCase() === "экзамен" ? "bg-[#fff52e]" : "bg-transparent";

  const textClass = isEmpty ? "text-gray-400" : "text-black";

  return (
    <div
      onClick={handleClick}
      className={`
        leading-none
        h-[3.25rem]
        flex flex-col justify-between items-center text-center select-none cursor-pointer
        flex-shrink-0 w-[100px] aspect-[2/1] p-[0.35rem] relative
        ${textClass} ${bgClass} ${borderClass}

      `}
    >
      {isEmpty ? (
        <div className="leading-none flex items-center justify-center h-full text-[15px] font-semibold text-center">
          нет занятия
        </div>
      ) : (
        <>
          <div className=" w-full flex justify-between text-[11px] leading-none font-medium">
            {(!teacher || teacher.trim() === "")
              ? <div><img src={humanIcon} alt={teacher} className=" w-[0.55rem] h-[0.55rem] opacity-30"/></div>
              : <div title={teacher}><img src={humanIcon} alt={teacher} className=" w-[0.55rem] h-[0.55rem] opacity-65 hover:opacity-100 transition-all duration-300 ease-in-out"/></div>
            }
            <span className=" opacity-65 hover:opacity-100 transition-all duration-300 ease-in-out">
              {(!audience || audience === null || audience === 0)
                ? <i className="opacity-50">-</i>
                : <i>{audience}к</i>
              }
            </span>
          </div>
          <div className=" text-[1rem] font-semibold leading-none truncate w-full opacity-95 hover:opacity-100 transition-all duration-300 ease-in-out">
            {subject && subject.trim() !== "" ? subject : <span className="opacity-50">-</span>}
          </div>
          <div className=" w-full flex justify-between text-[11px] leading-none font-medium">
            <span>
              {/* Для экзамена тему не показываем вообще */}
              {type && type.toLowerCase() === "экзамен"
                ? "" // Пустая строка для экзамена
                : (topic || subtopic
                  ? (topic && subtopic ? `${topic}.${subtopic}` : topic ? `${topic}` : "")
                  : <span className="opacity-50">-</span>
                )
              }
            </span>
            <span>
              {type && type.trim() !== "" ? type : <span className="opacity-50">-</span>}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default TableCell;
