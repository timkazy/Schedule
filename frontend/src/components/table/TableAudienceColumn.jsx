function TableAudienceColumn({ isActive, infoData }) {
  return (
    <div className={`text-left border-r border-r-black ${isActive ? "border-dashed" : ""}`}>
      <div
        className={`grid items-center px-4 mb-3 h-[32px] font-semibold border-b border-b-black ${
          isActive ? "border-dashed" : ""
        }`}
      >
        <span>Аудитории</span>
      </div>

      {infoData.map((infoString) => (
        <div key={infoString.id} className="px-4 truncate">
          {infoString.audiences && infoString.audiences.length > 0
            ? infoString.audiences.join(", ")
            : <span className="opacity-40 font-medium">пусто</span>
          }
        </div>
      ))}
    </div>
  );
}

export default TableAudienceColumn;