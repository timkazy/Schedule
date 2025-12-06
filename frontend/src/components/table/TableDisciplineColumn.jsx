function TableDisciplineColumn({ isActive, infoData = [] }) {
    return (
        <div
            className={`text-left w-[130px] ${isActive ? "border-dashed" : ""}`}
        >
            <div
                className={`grid items-center font-bold text-lg mb-3 h-[28px] border-b border-b-black ${isActive ? "border-dashed" : ""}`}
            >
                <span>Дисциплины</span>
            </div>

            {infoData.map((infoString) => (
                <div key={infoString.id} className="font-normal">
                    {infoString.subject}</div>
            ))}

            {/* <div className="text-left">ТВВС</div> */}
            {/* <div className="text-left">ОВП (ОУ)</div> */}
            {/* <div className="text-left">ОВП (СП)</div> */}
            {/* <div className="text-left">ОВП (ОП)</div> */}
            {/* <div className="text-left">ОВП (ОП)</div> */}
            {/* <div className="text-left">ОВП (УПМВ)</div> */}
            {/* <div className="text-left">ТВВС</div> */}
            {/* <div className="text-left">ОВП (ОУ)</div> */}
            {/* <div className="text-left">ОВП (СП)</div> */}
        </div>
    );
};

export default TableDisciplineColumn;