import { useEdit } from "../context/useEdit";

const DaySelector = () => {
  const { selectedDay, setSelectedDay, isEditing } = useEdit();
  
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
    <div className="flex items-center justify-center p-2 z-20 ">
      <div className="bg-gray-300 rounded-xl flex space-x-1 shadow-lg">
        {days.map((day) => {
          const isSelected = selectedDay === day.id;
          
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              disabled={isEditing} // Все кнопки disabled в режиме редактирования
              className={`
                w-12 h-8 rounded-xl font-semibold transition-all duration-200
                flex items-center justify-center relative
                ${isSelected
                  ? "bg-green-500 scale-105 shadow-md text-white cursor-default"
                  : isEditing
                    ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                    : "text-white hover:bg-gray-400 hover:scale-102"
                }
              `}
              title={isEditing ? "В режиме редактирования нельзя менять день" : day.fullName}
            >
              {day.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelector;