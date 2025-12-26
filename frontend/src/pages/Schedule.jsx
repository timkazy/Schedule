import { useState } from "react";
import "../App.css";
import Table from "../components/table/Table";
import DaySelector from "../components/DaySelector";
import { useEdit } from "../context/useEdit";
import EditMenu from "../components/menu/EditMenu";

function Schedule() {
  const {
    filteredScheduleData,
    isEditing,
    activeTableId,
  } = useEdit();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // Убираем dayTables, используем только filteredScheduleData
  const hasData = filteredScheduleData && filteredScheduleData.length > 0;

  const toggleCollapseAll = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <EditMenu />
      <div className="relative">
        <div className="text-7xl font-bold text-center mt-10">Расписание</div>

        {/* Панель управления - sticky при скролле */}
        <div className="z-20 sticky top-8 py-2 px-4 mb-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            {/* Левая часть - кнопка скрытия/показа */}
            <div className="w-32 flex justify-start">
              {hasData && (
                <button
                  onClick={toggleCollapseAll}
                  className="px-3 py-1 bg-green-500 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 flex items-center gap-2"
                  aria-label={isCollapsed ? "Показать информацию всех таблиц" : "Скрыть информацию всех таблиц"}
                  title={isCollapsed ? "показать" : "скрыть"}
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="hidden sm:inline font-semibold">
                    {isCollapsed ? "показать" : "скрыть"}
                  </span>
                </button>
              )}
            </div>

            {/* Центральная часть - селектор дня */}
            <div className="flex-1 flex justify-center">
              <DaySelector />
            </div>

            {/* Правая часть - кнопка печати */}
            <div className="w-32 flex justify-end">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="min-h-[400px]">
          {hasData ? (
            // Если есть данные для отображения
            <div className="flex flex-col items-center space-y-8 mt-5">
              {filteredScheduleData.map((day) => (
                day.platoons?.map((table) => (
                  <div key={`${day.dayId}-${table.platoonId}`} className="w-full max-w-6xl">
                    <Table
                      isEditing={isEditing}
                      columnsData={table.columns}
                      infoData={table.info || []}
                      activeTableId={activeTableId}
                      platoonId={table.platoonId}
                      isCollapsed={isCollapsed}
                    />
                  </div>
                ))
              ))}
            </div>
          ) : (
            // Если нет данных для отображения
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="text-gray-500 mb-4">
                <svg
                  className="w-24 h-24 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Нет взводов, учащихся в этот день недели
              </h2>
              <p className="text-gray-500 mt-4 text-sm">
                Выберите другой день недели или проверьте наличие данных в системе.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Schedule;