import { useState } from "react";
import DropdownList from "./DropdownList";
import { dropdownOptions } from "./dropdownOptions";
import { useActionPanel } from "../../context/ActionPanelContext";
import { useEdit } from "../../context/useEdit";

function EditSubjectPanel({ }) {
  const { closePanel } = useActionPanel();
  const [view, setView] = useState("main");

  const { handleAction, selectedCells } = useEdit();
  const [selectedField, setSelectedField] = useState(null);

  const fieldLabels = {
    subject: "Предмет",
    topicNumber: "Тема",
    type: "Тип занятия",
    audience: "Аудитория",
    teacher: "Преподаватель",
  };

  const openDropdown = (field) => {
    setSelectedField(field);
    setView("dropdown");
  };

  const handleSelect = (value) => {
    if (!selectedCells.length) {
      console.warn("⚠️ Нет выделенной ячейки для обновления");
      closePanel();
      return;
    }

    const { tableId, columnIndex, cellIndex } = selectedCells[0];

    console.log(`✅ Выбрано: ${selectedField} = ${value}`);

    // 👉 Отправляем в EditContext команду на обновление
    handleAction("updateField", {
      tableId,
      columnIndex,
      cellIndex,
      field: selectedField,
      value,
    });

    closePanel();
  };
  return (
    <div className="p-2 w-[200px]">
      {view === "main" && (
        <div className="flex flex-col space-y-1">
          {Object.entries(fieldLabels).map(([field, label]) => (
            <button
              key={field}
              onClick={() => openDropdown(field)}
              className="text-left px-2 py-1 hover:bg-gray-100 rounded"
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {view === "dropdown" && (
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setView("main")}
            className="text-left text-sm text-gray-600 hover:text-black"
          >
            ← Назад
          </button>

          <DropdownList
            options={dropdownOptions[selectedField ? selectedField + "s" : "subjects"] || []}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}

export default EditSubjectPanel;
