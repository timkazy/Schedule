function TableAudienceColumn({ isActive, infoData }) {
    return (
        <div
            className={`text-left border-r border-r-black w-[115px] ${isActive ? "border-dashed" : ""}`}
        >
            {/* <div className="font-bold text-lg">Аудитории</div> */}

            <div
                className={`grid items-center mb-3 font-bold text-lg h-[28px] border-b border-b-black ${isActive ? "border-dashed" : ""}`}
            >
                <span>Аудитории</span>
            </div>

            {infoData.map((infoString) => (
                <div key={infoString.id} className="font-normal">
                    {infoString.audiences && infoString.audiences.length > 0
                        ? infoString.audiences.join(", ")
                        : <span className="opacity-60 font-medium">пусто</span>
                    }
                </div>
            ))}
        </div>
    );
};

export default TableAudienceColumn;