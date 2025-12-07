// src/utils/excelExport.js
import * as XLSX from 'xlsx';

// Времена занятий
const LESSON_TIMES = [
  "08.30-10.05",
  "10.15-11.50", 
  "12.30-14.05",
  "14.15-15.50"
];

// Русские названия дней недели (в верхнем регистре как в примере)
const DAY_NAMES = [
  "П  О  Н  Е  Д  Е  Л  Ь  Н  И  К",
  "В  Т  О  Р  Н  И  К", 
  "С  Р  Е  Д  А",
  "Ч  Е Т  В  Е  Р  Г",
  "П  Я  Т  Н  И  Ц  А",
  "С  У  Б  Б  О  Т  А"
];

// Сокращения типов занятий (как в примере)
const LESSON_TYPE_ABBR = {
  "лекция": "л.з.",
  "практика": "пр.з.",
  "семинар": "с.з.",
  "групповое": "гр.з.",
  "контрольная": "к.р.",
  "зачет": "зачет",
  "экзамен": "экзамен",
  "практическое": "пр.з.",
  "семинарское": "с.з.",
  "лекционное": "л.з."
};

/**
 * Основная функция экспорта - формат как в example.xlsx
 */
export const exportToExcel = (scheduleData, filename = "Расписание.xlsx") => {
  try {
    // Создаем новую рабочую книгу
    const wb = XLSX.utils.book_new();
    
    // Создаем лист с данными
    const allData = prepareExcelData(scheduleData);
    const ws = XLSX.utils.aoa_to_sheet(allData.data);
    
    // Настраиваем ширину колонок
    ws['!cols'] = calculateColumnWidths(allData.data);
    
    // Добавляем объединения ячеек
    if (allData.merges && allData.merges.length > 0) {
      ws['!merges'] = allData.merges;
    }
    
    // Добавляем лист в книгу
    XLSX.utils.book_append_sheet(wb, ws, "Общее расписание");
    
    // Генерируем и скачиваем файл
    XLSX.writeFile(wb, filename);
    
    console.log(`✅ Файл ${filename} успешно создан`);
    return true;
  } catch (error) {
    console.error("❌ Ошибка при экспорте в Excel:", error);
    return false;
  }
};

/**
 * Подготавливает все данные для Excel в формате как в example.xlsx
 */
const prepareExcelData = (scheduleData) => {
  const data = [];
  const merges = [];
  
  // === ВЕРХНЯЯ ЧАСТЬ ТАБЛИЦЫ ===
  
  // Строка 0: РАСПИСАНИЕ
  data.push(["РАСПИСАНИЕ"]);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 50 } });
  
  // Строка 1: учебных занятий...
  data.push(["учебных занятий и самостоятельной подготовки студентов"]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 50 } });
  
  // Строка 2: На _____________ семестр...
  data.push(["На _____________ семестр _____/_____ учебного года"]);
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 50 } });
  
  // Строка 3: пустая
  data.push([]);
  
  // Строка 4: Подразделение студентов...
  const maxDates = getMaxDatesCount(scheduleData);
  const headerRow4 = ["Подразделение студентов, дисциплина, ФИО ППС проводящих занятия и место проведения занятий"];
  for (let i = 1; i < 5; i++) headerRow4.push("");
  headerRow4.push("Время");
  headerRow4.push("ДАТЫ ПРОВЕДЕНИЯ ЗАНЯТИЙ (учебные недели)");
  
  // Добавляем пустые ячейки для остальных колонок с датами
  for (let i = 1; i < maxDates; i++) {
    headerRow4.push("");
  }
  
  data.push(headerRow4);
  merges.push({ s: { r: 4, c: 0 }, e: { r: 4, c: 4 } });
  merges.push({ s: { r: 4, c: 5 }, e: { r: 4, c: 5 + maxDates - 1 } });
  
  // Строка 5: номера недель (23 (1), 24 (2)...)
  const weekNumbers = generateWeekNumbers(maxDates);
  const row5 = ["", "", "", "", ""];
  row5.push(...weekNumbers);
  data.push(row5);
  
  let currentRow = 6;
  
  // === ОБРАБОТКА КАЖДОГО ДНЯ ===
  const sortedDays = [...scheduleData].sort((a, b) => a.dayId - b.dayId);
  
  sortedDays.forEach(day => {
    const dayIndex = day.dayId - 1;
    if (dayIndex < 0 || dayIndex >= DAY_NAMES.length) return;
    
    // Добавляем название дня
    const dayNameRow = [DAY_NAMES[dayIndex]];
    for (let i = 1; i < 5 + maxDates; i++) dayNameRow.push("");
    data.push(dayNameRow);
    merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 + maxDates } });
    currentRow++;
    
    // Заголовки столбцов для дня
    const columnHeaders = ["Учебные взвода", "Дисциплины", "Аудит.", "Преподаватели", "Время"];
    const dates = getDatesForDay(day, maxDates);
    
    const headerRow = [...columnHeaders, ...dates];
    data.push(headerRow);
    currentRow++;
    
    // Добавляем данные для каждого взвода
    if (day.platoons && day.platoons.length > 0) {
      day.platoons.forEach((platoon, platoonIndex) => {
        // Добавляем данные взвода
        const platoonRows = preparePlatoonRows(platoon, maxDates);
        platoonRows.forEach(row => {
          data.push(row);
          currentRow++;
        });
        
        // Добавляем пустую строку между взводами (кроме последнего)
        if (platoonIndex < day.platoons.length - 1) {
          data.push([]);
          currentRow++;
        }
      });
    }
    
    // Добавляем 2 пустые строки между днями
    data.push([]);
    currentRow++;
    data.push([]);
    currentRow++;
  });
  
  // === НИЖНЯЯ ЧАСТЬ ТАБЛИЦЫ ===
  
  // Расшифровка сокращений
  data.push(["СРС", "Самостоятельная работа студентов"]);
  merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  data.push(["л.з.", "Лекционное занятие"]);
  merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  data.push(["пр.з.", "Практическое занятие"]);
  merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  data.push(["гр.з.", "Групповое занятие"]);
  merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  data.push(["с.з.", "Семинарское занятие"]);
  merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  data.push(["к.р.", "Контрольная работа"]);
  merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  // Пустая строка
  data.push([]);
  currentRow++;
  
  // Подпись начальника
  data.push(["Начальник ____________________________"]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 + maxDates } });
  currentRow++;
  
  data.push(["полковник", "", "", "", "И.Фамилия"]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 3 } });
  currentRow++;
  
  data.push([`"_____" _______________ 2025 г.`]);
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 4 + maxDates } });
  
  return { data, merges };
};

/**
 * Подготавливает строки для одного взвода
 */
const preparePlatoonRows = (platoon, maxDates) => {
  const rows = [];
  
  // Строка с номером взвода
  const platoonRow = [platoon.platoonId];
  for (let i = 1; i < 5 + maxDates; i++) platoonRow.push("");
  rows.push(platoonRow);
  
  // Получаем все дисциплины из info
  const subjects = platoon.info || [];
  
  // Создаем матрицу данных: 4 строки времени × N колонок дат
  const timeSlotData = Array(LESSON_TIMES.length)
    .fill()
    .map(() => Array(maxDates).fill(""));
  
  // Заполняем матрицу данными из cells
  if (platoon.columns && platoon.columns.length > 0) {
    platoon.columns.forEach((column, dateIndex) => {
      if (column.cells && column.cells.length > 0) {
        column.cells.forEach((cell, timeIndex) => {
          if (timeIndex < LESSON_TIMES.length && dateIndex < maxDates) {
            timeSlotData[timeIndex][dateIndex] = formatCellContent(cell);
          }
        });
      }
    });
  }
  
  // Для каждой дисциплины создаем строки (по количеству временных слотов)
  for (let timeIndex = 0; timeIndex < LESSON_TIMES.length; timeIndex++) {
    const timeRow = [];
    
    // Колонка A: пустая (кроме первой строки)
    if (timeIndex === 0 && subjects.length > 0) {
      timeRow.push("");
    } else {
      timeRow.push("");
    }
    
    // Колонка B: Название дисциплины (только для первого времени)
    if (timeIndex === 0 && subjects.length > 0) {
      timeRow.push(subjects[0].subject || "");
    } else if (timeIndex < subjects.length) {
      timeRow.push(subjects[timeIndex].subject || "");
    } else {
      timeRow.push("");
    }
    
    // Колонка C: Аудитории (только для первого времени)
    if (timeIndex === 0 && subjects.length > 0) {
      const audiences = subjects[0].audiences || [];
      timeRow.push(audiences.join('/'));
    } else if (timeIndex < subjects.length) {
      const audiences = subjects[timeIndex].audiences || [];
      timeRow.push(audiences.join('/'));
    } else {
      timeRow.push("");
    }
    
    // Колонка D: Преподаватели (собираем для текущего предмета)
    if (timeIndex < subjects.length) {
      const teachers = getTeachersForSubject(platoon, subjects[timeIndex].id);
      timeRow.push(teachers.join(', '));
    } else {
      timeRow.push("");
    }
    
    // Колонка E: Время
    timeRow.push(LESSON_TIMES[timeIndex]);
    
    // Колонки F и далее: занятия по датам для этого времени
    for (let dateIndex = 0; dateIndex < maxDates; dateIndex++) {
      timeRow.push(timeSlotData[timeIndex][dateIndex]);
    }
    
    rows.push(timeRow);
  }
  
  // Добавляем дополнительные дисциплины, если их больше чем временных слотов
  if (subjects.length > LESSON_TIMES.length) {
    for (let i = LESSON_TIMES.length; i < subjects.length; i++) {
      const extraSubjectRow = [];
      
      extraSubjectRow.push(""); // Колонка A
      extraSubjectRow.push(subjects[i].subject || ""); // Колонка B
      
      const audiences = subjects[i].audiences || [];
      extraSubjectRow.push(audiences.join('/')); // Колонка C
      
      const teachers = getTeachersForSubject(platoon, subjects[i].id);
      extraSubjectRow.push(teachers.join(', ')); // Колонка D
      
      extraSubjectRow.push(""); // Колонка E (нет времени)
      
      // Пустые ячейки для дат
      for (let j = 0; j < maxDates; j++) {
        extraSubjectRow.push("");
      }
      
      rows.push(extraSubjectRow);
    }
  }
  
  return rows;
};

/**
 * Получает преподавателей для предмета
 */
const getTeachersForSubject = (platoon, subjectId) => {
  const teachers = new Set();
  
  if (!platoon.columns) return Array.from(teachers);
  
  // Ищем всех преподавателей для этого subjectId
  platoon.columns.forEach(column => {
    if (column.cells) {
      column.cells.forEach(cell => {
        if (cell.id === subjectId && cell.teacher) {
          // Форматируем ФИО: Фамилия И.О.
          const formattedTeacher = formatTeacherName(cell.teacher);
          teachers.add(formattedTeacher);
        }
      });
    }
  });
  
  return Array.from(teachers);
};

/**
 * Форматирует ФИО преподавателя
 */
const formatTeacherName = (fullName) => {
  if (!fullName) return "";
  
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 3) return fullName;
  
  // Фамилия И.О.
  const lastName = parts[0];
  const firstName = parts[1];
  const middleName = parts[2];
  
  return `${lastName} ${firstName.charAt(0)}.${middleName.charAt(0)}.`;
};

/**
 * Форматирует содержимое ячейки как в example.xlsx
 */
const formatCellContent = (cell) => {
  if (!cell || !cell.subject) return "";
  
  const parts = [];
  
  // Добавляем предмет
  parts.push(cell.subject);
  
  // Добавляем тему если есть
  if (cell.topic && cell.subtopic) {
    parts.push(`Т${cell.topic}-${cell.subtopic}`);
  }
  
  // Добавляем тип занятия (сокращенный)
  if (cell.type) {
    const abbr = LESSON_TYPE_ABBR[cell.type.toLowerCase()] || cell.type;
    parts.push(abbr);
  }
  
  // Форматируем как в примере: ОВП(ОУ)<br>Т8-1, л.з.
  const subject = cell.subject || "";
  const details = parts.slice(1).join(', ');
  
  return details ? `${subject}\n${details}` : subject;
};

/**
 * Определяет максимальное количество дат среди всех дней
 */
const getMaxDatesCount = (scheduleData) => {
  let maxDates = 0;
  
  scheduleData.forEach(day => {
    day.platoons.forEach(platoon => {
      if (platoon.columns && platoon.columns.length > maxDates) {
        maxDates = platoon.columns.length;
      }
    });
  });
  
  // Минимум 17 дат как в примере
  return Math.max(maxDates, 17);
};

/**
 * Генерирует номера недель для заголовка
 */
const generateWeekNumbers = (count) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(`${23 + i} (${i + 1})`);
  }
  return result;
};

/**
 * Получает даты для дня (из первого взвода)
 */
const getDatesForDay = (day, maxDates) => {
  if (!day.platoons || day.platoons.length === 0) {
    return Array(maxDates).fill("");
  }
  
  const firstPlatoon = day.platoons[0];
  if (!firstPlatoon.columns || firstPlatoon.columns.length === 0) {
    return Array(maxDates).fill("");
  }
  
  const dates = firstPlatoon.columns.map(col => col.title || "");
  
  // Если дат меньше чем maxDates, добавляем пустые
  while (dates.length < maxDates) {
    dates.push("");
  }
  
  return dates.slice(0, maxDates);
};

/**
 * Рассчитывает ширину колонок
 */
const calculateColumnWidths = (data) => {
  if (!data || data.length === 0) return [];
  
  // Находим максимальное количество колонок
  let maxCols = 0;
  data.forEach(row => {
    if (row.length > maxCols) {
      maxCols = row.length;
    }
  });
  
  const colWidths = [];
  
  for (let col = 0; col < maxCols; col++) {
    let maxWidth = 8; // Минимальная ширина
    
    for (let row = 0; row < data.length; row++) {
      const cellValue = data[row] && data[row][col];
      if (cellValue) {
        // Для многострочного текста считаем самую длинную строку
        const lines = String(cellValue).split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.length));
        if (maxLineLength > maxWidth) {
          maxWidth = Math.min(maxLineLength, 30);
        }
      }
    }
    
    // Устанавливаем разную ширину для разных колонок
    if (col === 0) maxWidth = Math.max(maxWidth, 10); // Номер взвода
    else if (col === 1) maxWidth = Math.max(maxWidth, 15); // Дисциплины
    else if (col === 2) maxWidth = Math.max(maxWidth, 10); // Аудит.
    else if (col === 3) maxWidth = Math.max(maxWidth, 20); // Преподаватели
    else if (col === 4) maxWidth = Math.max(maxWidth, 12); // Время
    else if (col >= 5) maxWidth = Math.max(maxWidth, 15); // Даты
    
    colWidths.push({ wch: maxWidth + 2 });
  }
  
  return colWidths;
};

/**
 * Простой экспорт в плоском формате (оставлен для совместимости)
 */
export const exportSimpleExcel = (scheduleData, filename = "Расписание_простое.xlsx") => {
  try {
    const flatData = [];
    
    // Заголовки
    flatData.push([
      "День", "Взвод", "Дата", "Время", "Дисциплина", 
      "Тема", "Подтема", "Тип занятия", "Аудитория", "Преподаватель"
    ]);
    
    // Русские названия дней
    const DAY_NAMES_RU = [
      "Понедельник", "Вторник", "Среда", 
      "Четверг", "Пятница", "Суббота"
    ];
    
    // Данные
    scheduleData.forEach(day => {
      const dayName = DAY_NAMES_RU[day.dayId - 1] || `День ${day.dayId}`;
      
      day.platoons.forEach(platoon => {
        platoon.columns.forEach(column => {
          const date = column.title;
          
          column.cells.forEach((cell, timeIndex) => {
            if (cell && cell.subject) {
              const time = LESSON_TIMES[timeIndex] || "";
              
              flatData.push([
                dayName,
                platoon.platoonId,
                date,
                time,
                cell.subject,
                cell.topic || "",
                cell.subtopic || "",
                cell.type || "",
                cell.audience || "",
                cell.teacher || ""
              ]);
            }
          });
        });
      });
    });
    
    // Создаем workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(flatData);
    
    // Настраиваем ширину колонок
    const colWidths = [
      { wch: 15 }, // День
      { wch: 10 }, // Взвод
      { wch: 12 }, // Дата
      { wch: 15 }, // Время
      { wch: 25 }, // Дисциплина
      { wch: 8 },  // Тема
      { wch: 8 },  // Подтема
      { wch: 10 }, // Тип занятия
      { wch: 10 }, // Аудитория
      { wch: 20 }  // Преподаватель
    ];
    ws['!cols'] = colWidths;
    
    // Добавляем стили к заголовкам
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "E0E0E0" } }
        };
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, "Расписание");
    XLSX.writeFile(wb, filename);
    
    console.log(`✅ Простой файл ${filename} создан`);
    return true;
  } catch (error) {
    console.error("❌ Ошибка при создании простого Excel:", error);
    return false;
  }
};