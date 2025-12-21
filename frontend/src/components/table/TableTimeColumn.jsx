import { useState } from "react";
import TimeCell from "./TimeCell";

function TableTimeColumn({ isActive, isCollapsed }) {
  const [timeMode, setTimeMode] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const timeCells = [
    [
      ["08:30", "10:05"],
      ["10:15", "11:50"],
      ["12:30", "14:05"],
      ["14:15", "15:50"],
    ],
    [
      ["08:30", "09:30"],
      ["09:30", "10:30"],
      ["10:30", "11:30"],
      ["11:30", "12:30"],
    ],
  ];

  const toggleTimeMode = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setTimeMode(prev => prev === 0 ? 1 : 0);
      setIsTransitioning(false);
    }, 150);
  };

  const currentTimeCells = timeCells[timeMode];
  const modeLabels = ["Полные", "Короткие"];

  return (
    <div
      className={`flex flex-col transition-all duration-700 ease-in-out border-l border-l-black ${
        isActive ? "border-dashed" : ""
      } ${
        isCollapsed 
          ? "w-0 opacity-100 pointer-events-none " 
          : "w-[80px] opacity-100 "
      }`}
    >
      {/* Заголовок колонки времени */}
      <div 
        className={`transition-all duration-700 ease-in-out ${
          isCollapsed 
            ? "opacity-0 overflow-hidden" 
            : "opacity-100 h-[32px]"
        }`}
      >
        <div className={`grid items-center text-center px-2 font-semibold h-[32px] border-b border-b-black ${isActive ? "border-dashed" : ""}`}>
          <button
            onClick={toggleTimeMode}
            className="hover:bg-green-200 px-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
            title={`Переключить на ${modeLabels[timeMode === 0 ? 1 : 0]} занятия`}
            disabled={isTransitioning || isCollapsed}
          >
            Время
          </button>
        </div>
      </div>
      
      {/* Ячейки времени */}
      <div 
        className={`transition-all duration-700 ease-in-out h-[208px] ${
          isCollapsed 
            ? "opacity-0 overflow-hidden" 
            : "opacity-100"
        } grid justify-items-center items-center text-center relative`}
      >
        <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
          {currentTimeCells.map((timeData, index) => (
            <TimeCell key={index} timeData={timeData} />
          ))}
        </div>
        
        {isTransitioning && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableTimeColumn;