function TableDisciplineColumn({ isActive, infoData = [] }) {
  return (
    <div
      className={`text-left ${isActive ? "border-dashed" : ""}`}
    >
      <div
        className={`grid items-center font-bold text-lg px-3 mb-3 h-[28px] border-b border-b-black ${
          isActive ? "border-dashed" : ""
        }`}
      >
        <span>Дисциплины</span>
      </div>

      {infoData.map((infoString) => (
        <div key={infoString.id} className="font-normal px-3">
          {infoString.subject}
        </div>
      ))}
    </div>
  );
}

export default TableDisciplineColumn;