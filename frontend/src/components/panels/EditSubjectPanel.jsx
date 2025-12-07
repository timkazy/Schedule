import { useState } from "react";
import DropdownList from "./DropdownList";
// import { dropDownOptionsData } from "../../data/dropDownOptionsData";
import { useActionPanel } from "../../context/ActionPanelContext";
import { useEdit } from "../../context/useEdit";

function EditSubjectPanel({ }) {
  const { closePanel } = useActionPanel();
  const [view, setView] = useState("main");
  const [selectedField, setSelectedField] = useState(null);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { handleAction, selectedCells, dropdownData, fetchFieldData, getSelectedCellParams } = useEdit();

  const fieldLabels = {
    subject: "Предмет",
    topicNumber: "Тема",
    type: "Тип занятия",
    audience: "Аудитория",
    teacher: "Преподаватель",
  };

  const openDropdown = async (field) => {
    setSelectedField(field);
    setIsLoading(true);

    try {
      // Получаем параметры выбранной ячейки
      const params = getSelectedCellParams();
      if (!params) {
        console.warn("Нет выбранной ячейки");
        return;
      }

      let options = [];

      switch (field) {
        case "subject":
          // Для предметов нужен только platoonId
          options = await fetchFieldData(field, { platoonId: params.platoonId || selectedCells[0]?.tableId });
          break;

        case "topicNumber":
          // Для тем нужны subjectId и lessonType (если есть)
options = await fetchFieldData(field, { 
            subjectId: params.subjectId, 
            lessonType: params.lessonType 
          });
          break;

        case "type":
          // Для типов занятий нужен subjectId
          options = await fetchFieldData(field, { 
            subjectId: params.subjectId 
          });
          break;

        case "audience":
          // Для аудиторий нужны subjectId и lessonType (если есть)
          options = await fetchFieldData(field, { 
            subjectId: params.subjectId, 
            lessonType: params.lessonType 
          });
          break;

        case "teacher":
          // Преподаватели не требуют параметров
                    options = await fetchFieldData(field, { 
            platoonId: params.platoonId,
            subjectId: params.subjectId
          });
          break;

        default:
          console.warn(`Неизвестное поле: ${field}`);
          options = [];
          return;
      }

      // Форматируем опции для DropdownList
      const formattedOptions = formatOptions(field, options);
      setFieldOptions(formattedOptions);
      setView("dropdown");

    } catch (error) {
      console.error(`Ошибка загрузки данных для ${field}:`, error);
      const formattedOptions = formatOptions(field, []);
      setFieldOptions(formattedOptions);
      setView("dropdown");
    } finally {
      setIsLoading(false);
    }
  };

  const formatOptions = (field, options) => {
    // Базовая опция "Не выбрано"
    const notSelectedOption = {
      id: "not-selected",
      label: "Не выбрано",
      value: null
    };

    let formatted = [];

    if (!options || !Array.isArray(options)) {
      return [notSelectedOption];
    }

    try {
      switch (field) {
        case "subject":
          formatted = options.map(item => ({
            id: item.id,
            label: item.name,
            value: item
          }));
          break;
          
        case "topicNumber":
          formatted = options.map(item => ({
            id: `${item.topic}.${item.subtopic}`,
            label: `${item.topic}.${item.subtopic} (${item.typeOfActivity})`,
            value: item
          }));
          break;
          
        case "type":
          formatted = options.map((item, index) => ({
            id: index,
            label: item,
            value: item
          }));
          break;
          
        case "audience":
          formatted = options.map(item => ({
            id: item.id,
            label: `Ауд. ${item.id} (приоритет: ${item.importance})`,
            value: item.id
          }));
          break;
          
        case "teacher":
          formatted = options.map((item, index) => ({
            id: index,
            label: item,
            value: item
          }));
          break;
          
        default:
          formatted = [];
      }
    } catch (error) {
      console.error(`Ошибка форматирования опций для ${field}:`, error);
      formatted = [];
    }

    // Добавляем "Не выбрано" в начало списка
    return [notSelectedOption, ...formatted];
  };

  const handleSelect = (value) => {
    if (!selectedCells.length) {
      console.warn("⚠️ Нет выделенной ячейки для обновления");
      closePanel();
      return;
    }

    const { tableId, columnIndex, cellIndex } = selectedCells[0];

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

  return (
    <div className="p-2 w-[200px]">
      {view === "main" && (
        <div className="flex flex-col space-y-1">
          {Object.entries(fieldLabels).map(([field, label]) => (
            <button
              key={field}
              onClick={() => openDropdown(field)}
              className="text-left px-2 py-1 hover:bg-gray-100 rounded disabled:opacity-50"
              disabled={isLoading}
            >
              {label}
              {isLoading && selectedField === field && " (загрузка...)"}
            </button>
          ))}
          
          {/* Сообщение об ошибке если есть */}
          {dropdownData.error && (
            <div className="text-xs text-red-500 mt-2 p-1 bg-red-50 rounded">
              Ошибка загрузки данных
            </div>
          )}
        </div>
      )}

      {view === "dropdown" && (
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setView("main")}
            className="text-left text-sm text-gray-600 hover:text-black disabled:opacity-50"
            disabled={isLoading}
          >
            ← Назад
          </button>

          {isLoading ? (
            <div className="py-4 text-center text-gray-500">
              Загрузка...
            </div>
          ) : (
            selectedField && (
              <div>
                <DropdownList
                  options={fieldOptions}
                  onSelect={handleSelect}
                />
                {fieldOptions.length <= 1 && ( // Только "Не выбрано"
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Нет доступных вариантов
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default EditSubjectPanel;