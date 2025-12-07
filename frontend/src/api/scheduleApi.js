// src/api/scheduleApi.js
const API_BASE = 'http://localhost:8000/api';

export const scheduleApi = {
  // Получить предметы для взвода
  async getSubjects(platoonId) {
    const response = await fetch(`${API_BASE}/subjects?platoonId=${platoonId}`);
    return response.json();
  },

  // Получить темы для предмета и типа занятия
  async getTopics(subjectId, lessonType = null) {
    const params = new URLSearchParams({ subjectId });
    if (lessonType) params.append('lessonType', lessonType);
    
    const response = await fetch(`${API_BASE}/topics?${params}`);
    return response.json();
  },

  // Получить типы занятий для предмета
  async getLessonTypes(subjectId) {
    const response = await fetch(`${API_BASE}/lesson-types?subjectId=${subjectId}`);
    return response.json();
  },

  // Получить аудитории для предмета и типа
  async getAudiences(subjectId, lessonType = null) {
    const params = new URLSearchParams({ subjectId });
    if (lessonType) params.append('lessonType', lessonType);
    
    const response = await fetch(`${API_BASE}/audiences?${params}`);
    return response.json();
  },

  // Получить преподавателей (с параметрами)
  async getTeachers(platoonId = null, subjectId = null) {
    const params = new URLSearchParams();
    if (platoonId) params.append('platoonId', platoonId);
    if (subjectId) params.append('subjectId', subjectId);
    
    const url = params.toString() 
      ? `${API_BASE}/teachers?${params}`
      : `${API_BASE}/teachers`;
    
    const response = await fetch(url);
    return response.json();
  },

  // Сохранить изменение ячейки
  async saveCell(data) {
    const response = await fetch(`${API_BASE}/schedule/savecell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};