function TablePlatoonColumn({ platoon, isActive }) {
  return (
    <div
      className={`grid items-center text-center font-bold border-r border-r-black w-[70px] ${
        isActive ? "border-dashed" : ""
      }`}
    >
      <div
        className={`text-lg border-b border-b-black h-[28px] ${
          isActive ? "border-dashed" : ""
        }`}
      >
        Взвод
      </div>
      <div className="text-lg grid justify-items-center items-center p-0 m-0 h-[250px] text-center">
        {platoon || "—"}
      </div>
    </div>
  );
}

export default TablePlatoonColumn;