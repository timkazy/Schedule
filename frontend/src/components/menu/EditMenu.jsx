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
  } = useEdit();

  const { openPanel, closePanel } = useActionPanel();

  if (!isEditing) return null;

  const editMenuItems = [
    {
      id: "magic",
      name: "Автозаполнение",
      icon: magicIcon,
      active: selectedCount > 1,
      // panel: () => <div>Сгенерировать / Сгенерировать только предметы</div>,
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
    if (!item.panel) return;

    const rect = e.currentTarget.getBoundingClientRect();
    openPanel(rect.left, rect.top - 200, item.panel(), rect);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-green-400 rounded-2xl p-2 shadow-lg">
        <div className="flex space-x-3 flex-wrap justify-center">
          {editMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={(e) => {
                if (item.panel) {
                  handleMouseEnter(e, item);
                } else {
                  handleAction(item.id);
                  closePanel();
                }
              }}
              onMouseEnter={(e) => handleMouseEnter(e, item)}
              disabled={!item.active}
              className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
                item.active
                  ? "hover:bg-green-500"
                  : "opacity-40 cursor-not-allowed"
              }`}
            >
              <img src={item.icon} alt={item.name} className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EditMenu;
