const DaySelector = ({ selectedDay, setSelectedDay }) => {
  const days = [
    { id: 0, name: "все", fullName: "Все дни" },
    { id: 1, name: "пн", fullName: "Понедельник" },
    { id: 2, name: "вт", fullName: "Вторник" },
    { id: 3, name: "ср", fullName: "Среда" },
    { id: 4, name: "чт", fullName: "Четверг" },
    { id: 5, name: "пт", fullName: "Пятница" },
    { id: 6, name: "сб", fullName: "Суббота" },
  ];

  return (
    <div className="flex items-center justify-center p-2 ">
      <div className="bg-gray-300 rounded-xl flex space-x-1 shadow-lg">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`
              w-12 h-8 rounded-xl font-semibold text-white transition-all duration-200
              flex items-center justify-center relative
              ${selectedDay === day.id
                ? "bg-green-500 scale-105 shadow-md"
                : "hover:bg-gray-400 hover:scale-102"
              }
            `}
            title={day.fullName}
          >
            {day.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DaySelector;
