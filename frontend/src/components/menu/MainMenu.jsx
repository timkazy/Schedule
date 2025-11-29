import { Link, useLocation } from "react-router-dom";
import { useEdit } from "../../context/useEdit";

import tableIcon from "../../assets/icons/table.svg";
import platoonIcon from "../../assets/icons/platoon.svg";
import officerIcon from "../../assets/icons/officer.svg";
import subjectIcon from "../../assets/icons/subject.svg";
import audienceIcon from "../../assets/icons/audience.svg";
import settingsIcon from "../../assets/icons/settings.svg";

function MainMenu() {
  const location = useLocation();
  const { isEditing, hasChanges, setIsEditing, setHasChanges } = useEdit();

  const menuItems = [
    { id: 1, name: "Таблица", icon: tableIcon, link: "/" },
    { id: 2, name: "Взвода", icon: platoonIcon, link: "/platoons" },
    { id: 3, name: "Офицеры", icon: officerIcon, link: "/teachers" },
    { id: 4, name: "Предметы", icon: subjectIcon, link: "/disciplines" },
    { id: 5, name: "Аудитории", icon: audienceIcon, link: "/audience" },
    { id: 6, name: "Настройки", icon: settingsIcon, link: "/settings" },
  ];

  const handleNavigation = (e, item) => {
    if (isEditing && hasChanges && location.pathname !== item.link) {
      e.preventDefault();
      // например, можно добавить окно подтверждения
      if (window.confirm("У вас есть несохранённые изменения. Выйти без сохранения?")) {
        setIsEditing(false);
        setHasChanges(false);
      } else {
        return;
      }
    }
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-72 z-50">
      <div className="bg-green-400 rounded-2xl p-2 shadow-lg">
        <div className="flex flex-col space-y-5">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              onClick={(e) => handleNavigation(e, item)}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 group relative
                ${
                  location.pathname === item.link
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-100"
                }`}
              title={item.name}
            >
              <img src={item.icon} alt={item.name} className="w-6 h-6" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
