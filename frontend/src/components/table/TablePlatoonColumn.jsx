function TablePlatoonColumn({ platoon, isActive, showBorderRight = false }) {
  return (
    <div
      className={`grid items-center text-center font-bold transition-all duration-500 ${
        showBorderRight ? "border-r border-r-black" : ""
      } ${isActive ? "border-dashed" : ""}`}
    >
      <div
        className={`text-lg border-b border-b-black h-[28px] px-3 transition-all duration-300 ${
          isActive ? "border-dashed" : ""
        }`}
      >
        Взвод
      </div>
      <div className="text-lg grid justify-items-center items-center p-0 m-0 h-[250px] text-center transition-all duration-300">
        {platoon || "—"}
      </div>
    </div>
  );
}

export default TablePlatoonColumn;