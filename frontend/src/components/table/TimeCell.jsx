const TimeCell = ({ timeData }) => {
  const [start, end] = timeData; // деструктуризация массива

  return (
    <div className="grid grid-flow-row items-center h-[3.25rem]" >
      <div className="text-center hyphens-auto leading-none">
        <span>
          {start}
          <br />
          {end}
        </span>
      </div>
    </div>
  );
};

export default TimeCell;