// src/components/menu/AddMenu.jsx
// import searchIcon from "../../assets/icons/search.svg";
import editIcon from "../../assets/icons/edit.svg";
import addIcon from "../../assets/icons/add.svg";
import printIcon from "../../assets/icons/print.svg";

import { useEdit } from "../../context/useEdit";
import { exportToExcel } from '../../utils/excelExport'; // Импортируем функцию экспорта

function AddMenu() {
  const { isEditing, setIsEditing, scheduleData } = useEdit();

  const handleExport = () => {
    if (!scheduleData || scheduleData.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }
    
    const filename = `Расписание.xlsx`;
    // const filename = `Расписание_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    try {
      const success = exportToExcel(scheduleData, filename);
      
      if (success) {
        console.log('Экспорт успешно завершен');
      } else {
        alert('Ошибка при экспорте. Проверьте консоль для деталей.');
      }
    } catch (error) {
      console.error('Ошибка при экспорте:', error);
      alert('Произошла ошибка при экспорте: ' + error.message);
    }
  };

  const editItems = [
    // { id: "search", name: "Поиск", icon: searchIcon, action: () => console.log("Поиск") },
    {
      id: "edit",
      name: isEditing ? "Выйти из режима редактирования" : "Редактировать",
      icon: editIcon,
      action: () => setIsEditing((prev) => !prev),
    },
    { id: "add", name: "Добавить", icon: addIcon, action: () => console.log("Добавить элемент") },
    { 
      id: "print", 
      name: "Экспорт в Excel", // Меняем название подсказки
      icon: printIcon, 
      action: handleExport // Меняем действие на экспорт
    },
  ];

  return (
    <div className="fixed left-4 top-[56%] transform translate-y-20 z-40">
      <div className={`bg-green-400 rounded-2xl p-2 shadow-lg transition-all duration-300 ease-in-out transform ${isEditing ? "bg-opacity-65" : "bg-opacity-95"} hover:bg-opacity-100`}>
        <div className="flex flex-col space-y-5">
          {editItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 group relative 
                ${
                  item.id === "edit"
                    ? "opacity-90 hover:opacity-100"
                    : isEditing
                    ? "opacity-50 cursor-not-allowed"
                    : "opacity-80 hover:opacity-100"
                }`}
              disabled={isEditing && item.id !== "edit"}
              title={item.name}
            >
              <img src={item.icon} alt={item.name} className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddMenu;