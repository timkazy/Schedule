function TableDisciplineColumn({ isActive, infoData = [] }) {
  return (
    <div
      className={`${isActive ? "border-dashed" : ""}`}
    >
      <div
        className={`font-semibold grid items-center px-4 mb-3 h-[32px] border-b border-b-black ${
          isActive ? "border-dashed" : ""
        }`}
      >
        <span>Дисциплины</span>
      </div>

      {infoData.map((infoString) => (
        <div key={infoString.id} className="px-4 text-left">
          {infoString.subject}
        </div>
      ))}
    </div>
  );
}

export default TableDisciplineColumn;