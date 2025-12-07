// src/data/localDropdownData.js
export const localDropdownData = {
  // Функция для получения предметов по ID взвода
  getSubjects(platoonId) {
    // Можете добавить логику фильтрации по platoonId если нужно
    return [
      {id: 1, name: "ОВП (СП)"},
      {id: 2, name: "ОВП (СВ)"},
      {id: 3, name: "ТВВС"},
      {id: 4, name: "ОВП (СН)"},
      {id: 5, name: "ОВП (СД)"},
      {id: 6, name: "ОВП (СМ)"},
    ];
  },

  // Функция для получения тем
  getTopics(subjectId, lessonType = null) {
    // Можете фильтровать по subjectId и lessonType
    const allTopics = [
      {topic: 6, subtopic: 1, typeOfActivity: "лекция"}, 
      {topic: 6, subtopic: 2, typeOfActivity: "лекция"},
      {topic: 6, subtopic: 3, typeOfActivity: "практика"},
      {topic: 7, subtopic: 1, typeOfActivity: "семинар"},
      {topic: 7, subtopic: 2, typeOfActivity: "семинар"},
    ];
    
    if (!lessonType) return allTopics;
    return allTopics.filter(topic => topic.typeOfActivity === lessonType);
  },

  // Функция для получения типов занятий
  getLessonTypes(subjectId) {
    // Можете фильтровать по subjectId если нужно
    return [
      "лекция",
      "практика",
      "семинар",
      "экзамен",
    ];
  },

  // Функция для получения аудиторий
  getAudiences(subjectId, lessonType = null) {
    // Можете фильтровать по параметрам
    return [
      {id: 101, importance: 1},
      {id: 205, importance: 2},
      {id: 206, importance: 3}
    ];
  },

  // Функция для получения преподавателей
  getTeachers(platoonId = null, subjectId = null) {
    // Можете фильтровать по параметрам
    return [
      "Иванов Иван Иванович",
      "Петров Петр Петрович",
      "Сидоров Антон Алексеевич",
      "Кузнецов Виталий Владимирович",
    ];
  },
};