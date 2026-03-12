import { Link, useLocation } from "react-router-dom";
import { useEdit } from "../../context/useEdit";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
// import { exportToExcel } from '../../utils/excelExport';

// Импорт иконок
import tableIcon from "../../assets/icons/table.svg";
import platoonIcon from "../../assets/icons/platoon.svg";
import officerIcon from "../../assets/icons/officer.svg";
import subjectIcon from "../../assets/icons/subject.svg";
import subjectLoadIcon from "../../assets/icons/subject_load.svg";
import audienceIcon from "../../assets/icons/audience.svg";
// import settingsIcon from "../../assets/icons/settings.svg";
import departmentsIcon from "../../assets/icons/department.svg";
import editIcon from "../../assets/icons/edit.svg";
import addIcon from "../../assets/icons/add.svg";
import printIcon from "../../assets/icons/print.svg";

function Menu() {
    const location = useLocation();
    const { isEditing, hasChanges, setIsEditing, setHasChanges, scheduleData, isAdding, setIsAdding } = useEdit();
    const { isTeacher } = useContext(AuthContext);
    
    const actionGroups = isTeacher() ? [
        [
            {
                id: "add",
                name: isAdding ? "Выйти из режима добавления" : "Добавить",
                icon: addIcon,
                action: () => setIsAdding((prev) => !prev),
                type: "button",
            },
            {
                id: "edit",
                name: isEditing ? "Выйти из режима редактирования" : "Редактировать",
                icon: editIcon,
                action: () => setIsEditing((prev) => !prev),
                type: "button",
            },
        ],
        // [
        //     {
        //         id: "print",
        //         name: "Экспорт в Excel",
        //         icon: printIcon,
        //         action: () => {
        //             if (!scheduleData || scheduleData.length === 0) {
        //                 alert('Нет данных для экспорта');
        //                 return;
        //             }

        //             const filename = `Расписание.xlsx`;
        //             try {
        //                 const success = exportToExcel(scheduleData, filename);

        //                 if (!success) {
        //                     alert('Ошибка при экспорте. Проверьте консоль для деталей.');
        //                 }
        //             } catch (error) {
        //                 console.error('Ошибка при экспорте:', error);
        //                 alert('Произошла ошибка при экспорте: ' + error.message);
        //             }
        //         },
        //         type: "button",
        //     },
        // ],
    ] : [];

    // const navigationGroups = [
    //     [
    //         { id: 1, name: "Таблица", icon: tableIcon, link: "/", type: "link" },
    //         { id: 2, name: "Нагрузки", icon: subjectLoadIcon, link: "/disciplines", type: "link" },
    //         { id: 3, name: "Взвода", icon: platoonIcon, link: "/platoons", type: "link" },
    //         { id: 4, name: "Кафедры", icon: departmentsIcon, link: "/departments", type: "link" },
    //     ],
    //     [
    //         { id: 5, name: "Офицеры", icon: officerIcon, link: "/teachers", type: "link" },
    //         { id: 6, name: "Предметы", icon: subjectIcon, link: "/subjects", type: "link" },
    //         { id: 7, name: "Аудитории", icon: audienceIcon, link: "/audience", type: "link" },
    //     ],
    //     // [
    //     // { id: 8, name: "Настройки", icon: settingsIcon, link: "/settings", type: "link" },
    //     // ],
    // ];

    const navigationGroups = [
        [
            { id: 1, name: "Таблица", icon: tableIcon, link: "/", type: "link" },
            ...(isTeacher() ? [
                { id: 2, name: "Нагрузки", icon: subjectLoadIcon, link: "/disciplines", type: "link" },
                { id: 3, name: "Взвода", icon: platoonIcon, link: "/platoons", type: "link" },
                { id: 4, name: "Кафедры", icon: departmentsIcon, link: "/departments", type: "link" },
            ] : []),
        ],
        ...(isTeacher() ? [
            [
                { id: 5, name: "Офицеры", icon: officerIcon, link: "/teachers", type: "link" },
                { id: 6, name: "Предметы", icon: subjectIcon, link: "/subjects", type: "link" },
                { id: 7, name: "Аудитории", icon: audienceIcon, link: "/audience", type: "link" },
            ],
        ] : []),
    ];


    const handleNavigation = (e, item) => {
        if ((isEditing || isAdding) && hasChanges && location.pathname !== item.link) {
            e.preventDefault();
            if (window.confirm("У вас есть несохранённые изменения. Выйти без сохранения?")) {
                setIsEditing(false);
                setIsAdding(false);
                setHasChanges(false);
            } else {
                return;
            }
        }

        // Если в режиме редактирования/добавления, разрешаем переход только по активному разделу
        if ((isEditing || isAdding) && location.pathname !== item.link) {
            e.preventDefault();
            alert("Сначала выйдите из режима " + (isEditing ? "редактирования" : "добавления"));
            return;
        }
    };

    // Определяем, активен ли какой-либо режим
    const isAnyModeActive = isEditing || isAdding;

    // Определяем, заблокирована ли кнопка
    const isButtonDisabled = (buttonId) => {
        if (isEditing && buttonId !== "edit") return true;
        if (isAdding && buttonId !== "add") return true;
        return false;
    };

    // Определяем стиль кнопки в зависимости от состояния
    const getButtonStyle = (buttonId) => {
        const isDisabled = isButtonDisabled(buttonId);
        const isActive = (buttonId === "edit" && isEditing) || (buttonId === "add" && isAdding);

        if (isDisabled) {
            return "opacity-70 cursor-not-allowed";
        }

        if (isActive) {
            return "opacity-100";
        }

        return "opacity-85 hover:opacity-100";
    };

    // Определяем стиль для навигационных контейнеров
    const getContainerStyle = () => {
        if (isAnyModeActive) {
            return "bg-opacity-70";
        }
        return "bg-opacity-95";
    };

    return (
        <div className="fixed left-4 top-[54%] transform -translate-y-72 z-50">
            {actionGroups.length > 0 && (
                <div className={`bg-green-400 rounded-2xl p-2 shadow-lg mb-3 transition-all duration-300 ease-in-out transform ${getContainerStyle()} hover:bg-opacity-100`}>
                    <div className="flex flex-col space-y-6 py-1">
                        {actionGroups[0].map((item) => {
                            const isDisabled = isButtonDisabled(item.id);
                            const isActive = (item.id === "edit" && isEditing) || (item.id === "add" && isAdding);

                            return (
                                <button
                                    key={item.id}
                                    onClick={isDisabled ? undefined : item.action}
                                    disabled={isDisabled}
                                    className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 group relative ${getButtonStyle(item.id)}`}
                                    title={isDisabled
                                        ? `Сначала выйдите из режима ${isEditing ? "редактирования" : "добавления"}`
                                        : item.name
                                    }
                                >
                                    <img
                                        src={item.icon}
                                        alt={item.name}
                                        className={`w-6 h-6 ${isDisabled ? 'opacity-70' : ''}`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Первая группа навигации */}
            {navigationGroups[0] && navigationGroups[0].length > 0 && (
                <div className={`bg-green-400 rounded-2xl p-2 shadow-lg mb-3 transition-all duration-300 ease-in-out transform ${getContainerStyle()} hover:bg-opacity-100`}>
                    <div className="flex flex-col space-y-6 py-1">
                        {navigationGroups[0].map((item) => (
                            <Link
                                key={item.id}
                                to={item.link}
                                onClick={(e) => handleNavigation(e, item)}
                                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 group relative
                                    ${location.pathname === item.link
                                        ? "opacity-100"
                                        : isAnyModeActive
                                            ? "opacity-70 cursor-not-allowed"
                                            : "opacity-60 hover:opacity-100"
                                    }`}
                                title={isAnyModeActive && location.pathname !== item.link
                                    ? `Сначала выйдите из режима ${isEditing ? "редактирования" : "добавления"}`
                                    : item.name
                                }
                            >
                                <img src={item.icon} alt={item.name} className="w-6 h-6" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Вторая группа навигации */}
            {navigationGroups[1] && navigationGroups[1].length > 0 && (
                <div className={`bg-green-400 rounded-2xl p-2 shadow-lg mb-3 transition-all duration-300 ease-in-out transform ${getContainerStyle()} hover:bg-opacity-100`}>
                    <div className="flex flex-col space-y-6 py-1">
                        {navigationGroups[1].map((item) => (
                            <Link
                                key={item.id}
                                to={item.link}
                                onClick={(e) => handleNavigation(e, item)}
                                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 group relative
                                    ${location.pathname === item.link
                                        ? "opacity-100"
                                        : isAnyModeActive
                                            ? "opacity-70 cursor-not-allowed"
                                            : "opacity-60 hover:opacity-100"
                                    }`}
                                title={isAnyModeActive && location.pathname !== item.link
                                    ? `Сначала выйдите из режима ${isEditing ? "редактирования" : "добавления"}`
                                    : item.name
                                }
                            >
                                <img src={item.icon} alt={item.name} className="w-6 h-6" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Третья группа навигации (если есть) */}
            {/* {navigationGroups[2] && navigationGroups[2].length > 0 && (
                <div className={`bg-green-400 rounded-2xl p-2 shadow-lg mb-3 transition-all duration-300 ease-in-out transform ${getContainerStyle()} hover:bg-opacity-100`}>
                    <div className="flex flex-col space-y-6">
                        {navigationGroups[2].map((item) => (
                            <Link
                                key={item.id}
                                to={item.link}
                                onClick={(e) => handleNavigation(e, item)}
                                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 group relative
                                    ${location.pathname === item.link
                                        ? "opacity-100"
                                        : isAnyModeActive
                                            ? "opacity-70 cursor-not-allowed"
                                            : "opacity-60 hover:opacity-100"
                                    }`}
                                title={isAnyModeActive && location.pathname !== item.link
                                    ? `Сначала выйдите из режима ${isEditing ? "редактирования" : "добавления"}`
                                    : item.name
                                }
                            >
                                <img src={item.icon} alt={item.name} className="w-6 h-6" />
                            </Link>
                        ))}
                    </div>
                </div>
            )} */}
        </div>
    );
}

export default Menu;