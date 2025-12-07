function TablePlatoonColumn({ platoon, isActive, showBorderRight = false }) {
  return (
    <div
      className={`${
        showBorderRight ? "border-r border-r-black" : ""
      } ${isActive ? "border-dashed" : ""}`}
    >
      <div
        className={`font-semibold grid items-center border-b border-b-black h-[32px] px-4 ${
          isActive ? "border-dashed" : ""
        }`}
      >
        Взвод
      </div>
      <div className="text-[1.1rem] font-semibold grid justify-items-center items-center p-0 m-0 h-[211px] text-center">
        {platoon || "—"}
      </div>
    </div>
  );
}

export default TablePlatoonColumn;