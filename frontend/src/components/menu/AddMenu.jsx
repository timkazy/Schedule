import searchIcon from "../../assets/icons/search.svg";
import editIcon from "../../assets/icons/edit.svg";
import addIcon from "../../assets/icons/add.svg";
import { useEdit } from "../../context/useEdit";

function AddMenu() {
  const { isEditing, setIsEditing } = useEdit();

  const editItems = [
    { id: "search", name: "Поиск", icon: searchIcon, action: () => console.log("Поиск") },
    {
      id: "edit",
      name: isEditing ? "Выйти из режима редактирования" : "Редактировать",
      icon: editIcon,
      action: () => setIsEditing((prev) => !prev),
    },
    { id: "add", name: "Добавить", icon: addIcon, action: () => console.log("Добавить элемент") },
  ];

  return (
    <div className="fixed left-4 top-1/2 transform translate-y-20 z-40">
      <div className="bg-green-400 rounded-xl p-2 shadow-lg">
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
              <div className="absolute left-14 bg-gray-800 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {item.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AddMenu;
