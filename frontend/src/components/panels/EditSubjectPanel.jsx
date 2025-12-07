import { useState } from "react";
import DropdownList from "./DropdownList";
// import { dropdownOptions } from "./dropdownOptions";
import { dropDownOptionsData } from "../../data/dropDownOptionsData";
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
      value: value === null ? null : value,
    });

    closePanel();
  };

const getOptionsForField = (field) => {
    // Базовая опция "Не выбрано"
    const notSelectedOption = {
      id: "not-selected",
      label: "Не выбрано",
      value: null // значение null для очистки поля
    };

    let options = [];

    switch (field) {
      case "subject":
        options = dropDownOptionsData.subjects.map(item => ({
          id: item.id,
          label: item.name,
          value: item
        }));
        break;
      case "topicNumber":
        options = dropDownOptionsData.topicNumbers.map(item => ({
          id: `${item.topic}.${item.subtopic}`,
          label: `${item.topic}.${item.subtopic} (${item.typeOfActivity})`,
          value: item
        }));
        break;
      case "type":
        options = dropDownOptionsData.types.map((item, index) => ({
          id: index,
          label: item,
          value: item
        }));
        break;
      case "audience":
        options = dropDownOptionsData.audiences.map(item => ({
          id: item.id,
          label: `Ауд. ${item.id} (приоритет: ${item.importance})`,
          value: item.id
        }));
        break;
      case "teacher":
        options = dropDownOptionsData.teachers.map((item, index) => ({
          id: index,
          label: item,
          value: item
        }));
        break;
      default:
        options = [];
    }

    // Добавляем "Не выбрано" в начало списка
    return [notSelectedOption, ...options];
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

          {selectedField && (
            <DropdownList
              options={getOptionsForField(selectedField)}
              onSelect={handleSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default EditSubjectPanel;