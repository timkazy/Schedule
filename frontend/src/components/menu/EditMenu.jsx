// import okIcon from "../../assets/icons/ok.svg";
// import crossIcon from "../../assets/icons/cross.svg";
import magicIcon from "../../assets/icons/magic.svg";
import allIcon from "../../assets/icons/all.svg";
// import infoIcon from "../../assets/icons/info.svg";
import editIcon from "../../assets/icons/edit2.svg";
// import lockIcon from "../../assets/icons/lock.svg";
import copyIcon from "../../assets/icons/copy.svg";
import cutIcon from "../../assets/icons/cut.svg";
import pasteIcon from "../../assets/icons/paste.svg";
import removeIcon from "../../assets/icons/remove.svg";
// import trashIcon from "../../assets/icons/trash.svg";

import { useEdit } from "../../context/useEdit";
import { useActionPanel } from "../../context/ActionPanelContext";

import EditSubjectPanel from "../panels/EditSubjectPanel";

function EditMenu() {
  const {
    isEditing,
    selectedCount,
    copiedCell,
    handleAction,
    isGenerating,
  } = useEdit();

  const { openPanel, closePanel } = useActionPanel();

  if (!isEditing) return null;

  const editMenuItems = [
    {
      id: "magic",
      name: "Автозаполнение",
      icon: magicIcon,
      active: true,
    },
    { id: "all", name: "Выбрать всю таблицу", icon: allIcon, active: true },
    {
      id: "edit2",
      name: "Изменить",
      icon: editIcon,
      active: selectedCount === 1,
      panel: () => <EditSubjectPanel />,
    },
    { id: "copy", name: "Копировать", icon: copyIcon, active: selectedCount >= 1 },
    { id: "cut", name: "Вырезать", icon: cutIcon, active: selectedCount >= 1 },
    { id: "paste", name: "Вставить", icon: pasteIcon, active: !!copiedCell && selectedCount >= 1 },
    { id: "remove", name: "Удалить", icon: removeIcon, active: selectedCount >= 1 },
  ];

  const handleMouseEnter = (e, item) => {
    if (!item.panel || isGenerating) return;

    const rect = e.currentTarget.getBoundingClientRect();
    openPanel(rect.left, rect.top - 200, item.panel(), rect);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-green-400 rounded-2xl p-2 shadow-lg">
        <div className="flex space-x-3 flex-wrap justify-center">
          {editMenuItems.map((item) => {
            // Проверяем, активна ли кнопка с учетом генерации
            const isActive = item.active && !isGenerating;
            
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  if (isGenerating) return;
                  
                  if (item.panel) {
                    handleMouseEnter(e, item);
                  } else {
                    handleAction(item.id);
                    closePanel();
                  }
                }}
                onMouseEnter={(e) => !isGenerating && handleMouseEnter(e, item)}
                disabled={!isActive}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200
                  ${isActive
                    ? "hover:bg-green-500 cursor-pointer"
                    : "opacity-40 cursor-not-allowed"
                  }
                  ${isGenerating ? "animate-pulse" : ""}
                `}
                title={isGenerating ? "Идет генерация расписания..." : item.name}
              >
                {item.id === "magic" && isGenerating ? (
                  // Анимация загрузки для кнопки "магии"
                  <div className="relative w-6 h-6">
                    <svg className="animate-spin w-full h-full" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <img 
                      src={magicIcon} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full p-1 opacity-80" 
                    />
                  </div>
                ) : (
                  <img src={item.icon} alt={item.name} className="w-6 h-6" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EditMenu;