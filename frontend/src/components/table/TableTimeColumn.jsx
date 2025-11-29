import TimeCell from "./TimeCell";

function TableTimeColumn({ timeCells = [], isActive }) {
  return (
    <div
      className={`flex flex-col border-l border-l-black ${
        isActive ? "border-dashed" : ""
      }`}
    >
      <div
        className={`grid items-center text-center font-bold text-lg h-[28px] border-b border-b-black ${
          isActive ? "border-dashed" : ""
        }`}
      >
        <span>Время</span>
      </div>
      <div className="grid justify-items-center p-0 m-0 items-center h-[250px] text-center">
        {timeCells.map((timeData, index) => (
          <TimeCell key={index} timeData={timeData} isActive={isActive} />
        ))}
      </div>
    </div>
  );
}

export default TableTimeColumn;