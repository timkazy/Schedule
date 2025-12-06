const TimeCell = ({ timeData }) => {
  const [start, end] = timeData; // деструктуризация массива

  return (
    <div className="grid grid-flow-row items-center p-1 m-1 w-[70px] h-[50px] text-lg" >
      <div className="font-medium text-center hyphens-auto leading-none">
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