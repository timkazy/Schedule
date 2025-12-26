const API_BASE = 'http://localhost:8000';

export const scheduleApi = {
  // ------ SCHEDULE ------
  async getSubjects(platoon_id) {
    const url = platoon_id
      ? `${API_BASE}/schedule/subjects?platoon_id=${platoon_id}`
      : `${API_BASE}/schedule/subjects`;
    const response = await fetch(url);
    return response.json();
  },

  async getTopics(subject_load_id, lesson_type = null, platoon_id = null) {
    const params = new URLSearchParams();
    if (subject_load_id !== undefined && subject_load_id !== null && subject_load_id !== '') {
      params.append('subject_load_id', subject_load_id);
    }
    if (lesson_type) params.append('lesson_type', lesson_type);
    if (platoon_id !== undefined && platoon_id !== null && platoon_id !== '') {
      params.append('platoon_id', platoon_id);
    }

    const url = `${API_BASE}/schedule/topics${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return response.json();
  },

  async getLessonTypes(subject_load_id, platoon_id = null) {
    const params = new URLSearchParams();
    if (subject_load_id !== undefined && subject_load_id !== null && subject_load_id !== '') {
      params.append('subject_load_id', subject_load_id);
    }
    if (platoon_id !== undefined && platoon_id !== null && platoon_id !== '') {
      params.append('platoon_id', platoon_id);
    }

    const url = `${API_BASE}/schedule/lesson-types${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return response.json();
  },

  async getAudiences(subject_load_id, lesson_type = null, platoon_id = null) {
    const params = new URLSearchParams();
    if (subject_load_id !== undefined && subject_load_id !== null && subject_load_id !== '') {
      params.append('subject_load_id', subject_load_id);
    }
    if (lesson_type) params.append('lesson_type', lesson_type);
    if (platoon_id !== undefined && platoon_id !== null && platoon_id !== '') {
      params.append('platoon_id', platoon_id);
    }

    const url = `${API_BASE}/schedule/audiences${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return response.json();
  },

  async getTeachers(platoon_id = null, subject_load_id = null) {
    const params = new URLSearchParams();
    if (platoon_id !== undefined && platoon_id !== null && platoon_id !== '') {
      params.append('platoon_id', platoon_id);
    }
    if (subject_load_id !== undefined && subject_load_id !== null && subject_load_id !== '') {
      params.append('subject_load_id', subject_load_id);
    }

    const url = `${API_BASE}/schedule/teachers${params.toString() ? `?${params}` : ''}`;
    const response = await fetch(url);
    return response.json();
  },

  async generateSchedule(day = null) {
    try {
      const url = `${API_BASE}/schedule/generate`;
      const params = new URLSearchParams();
      if (day !== null) {
        params.append('day', day);
      }
      // strategy и academic_year по умолчанию не отправляем
      
      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка генерации расписания:', error);
      throw error;
    }
  },

  async saveCell(data) {
    const response = await fetch(`${API_BASE}/schedule/savecell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// ------ PLATOONS ------
export const platoonApi = {
  // Кафедры
  async getDepartments() {
    const response = await fetch(`${API_BASE}/platoons/departments`);
    return response.json();
  },

  // Все взводы (без фильтра)
  async getAllPlatoons() {
    const response = await fetch(`${API_BASE}/platoons`);
    return response.json();
  },

  // Взводы по кафедре
  async getPlatoonsByDepartment(departmentId) {
    const response = await fetch(`${API_BASE}/platoons?department_id=${departmentId}`);
    return response.json();
  },

  // Детали взвода
  async getPlatoonDetails(platoonNumber) {
    const response = await fetch(`${API_BASE}/platoons/${platoonNumber}`);
    return response.json();
  },

  // Обновить взвод
  async updatePlatoon(platoonNumber, data) {
    const response = await fetch(`${API_BASE}/platoons/${platoonNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Переименовать взвод
  async renamePlatoon(oldNumber, newNumber) {
    const response = await fetch(`${API_BASE}/platoons/${oldNumber}/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newNumber }),
    });
    return response.json();
  },

  // Удалить взвод
  async deletePlatoon(platoonNumber) {
    const response = await fetch(`${API_BASE}/platoons/${platoonNumber}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Добавить взвод
  async addPlatoon(data) {
    const response = await fetch(`${API_BASE}/platoons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Типы взводов
  async getSquadTypes() {
    const response = await fetch(`${API_BASE}/platoons/squad-types`);
    return response.json();
  },
};

// ------ DISCIPLINES (для нагрузок) ------
export const disciplinesApi = {
  // Получить нагрузки взвода
  async getPlatoonLoads(platoonNumber) {
    const response = await fetch(`${API_BASE}/disciplines/platoon-loads/${platoonNumber}`);
    return response.json();
  },

  // Получить доступные нагрузки для взвода
  async getAvailableLoadsForPlatoon(platoonNumber) {
    const response = await fetch(`${API_BASE}/disciplines/available-loads-for-platoon?platoon_number=${platoonNumber}`);
    return response.json();
  },

  // Привязать нагрузку к взводу
  async addLoadToPlatoon(platoonNumber, loadId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${loadId}/squads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squad: platoonNumber, ...data }),
    });
    return response.json();
  },

  // Обновить привязку нагрузки к взводу
  async updatePlatoonLoad(platoonNumber, loadId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${loadId}/squads/${platoonNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Отвязать нагрузку от взвода
  async deletePlatoonLoad(platoonNumber, loadId) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${loadId}/squads/${platoonNumber}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Получить преподавателей
  async getOfficers() {
    const response = await fetch(`${API_BASE}/disciplines/officers`);
    return response.json();
  },

  // Получить все нагрузки
  async getAllLoads() {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads`);
    return response.json();
  },

  // Получить детали нагрузки
  async getLoadDetails(loadId) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${loadId}`);
    return response.json();
  },
};

// ------ DISCIPLINES ------
export const disciplineApi = {
  // Основные методы для нагрузок
  async getSubjectLoads() {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads`);
    return response.json();
  },

  async getSubjectLoadDetails(subjectLoadId) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}`);
    return response.json();
  },

  async addSubjectLoad(data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateSubjectLoad(subjectLoadId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteSubjectLoad(subjectLoadId) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Списки для форм
  async getSubjects() {
    const response = await fetch(`${API_BASE}/disciplines/subjects`);
    return response.json();
  },

  async getDepartments() {
    const response = await fetch(`${API_BASE}/disciplines/departments`);
    return response.json();
  },

  async getSquadTypes() {
    const response = await fetch(`${API_BASE}/disciplines/squad-types`);
    return response.json();
  },

  async getLessonTypes() {
    const response = await fetch(`${API_BASE}/disciplines/lesson-types`);
    return response.json();
  },

  async getOfficers() {
    const response = await fetch(`${API_BASE}/disciplines/officers`);
    return response.json();
  },

  async getAudiences() {
    const response = await fetch(`${API_BASE}/disciplines/audiences`);
    return response.json();
  },

  // Привязка взводов к нагрузке
  async getAvailableSquads(subjectLoadId) {
    const response = await fetch(`${API_BASE}/disciplines/available-squads?subject_load_id=${subjectLoadId}`);
    return response.json();
  },

  async addSquadSubjectLoad(subjectLoadId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/squads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateSquadSubjectLoad(subjectLoadId, squadNumber, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/squads/${squadNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteSquadSubjectLoad(subjectLoadId, squadNumber) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/squads/${squadNumber}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Часы нагрузки
  async addHoursLoad(subjectLoadId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/hours`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateHoursLoad(subjectLoadId, lessonTypeId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/hours/${lessonTypeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteHoursLoad(subjectLoadId, lessonTypeId) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/hours/${lessonTypeId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Темы
  async addTheme(subjectLoadId, data) {
    const response = await fetch(`${API_BASE}/disciplines/subject-loads/${subjectLoadId}/themes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateTheme(themeId, data) {
    const response = await fetch(`${API_BASE}/disciplines/themes/${themeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteTheme(themeId) {
    const response = await fetch(`${API_BASE}/disciplines/themes/${themeId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const audienceApi = {
  // Основные методы для аудиторий
  async getAudiences() {
    const response = await fetch(`${API_BASE}/audience/audiences`);
    return response.json();
  },

  async getAudienceDetails(audienceNumber) {
    const response = await fetch(`${API_BASE}/audience/audiences/${audienceNumber}`);
    return response.json();
  },

  async addAudience(audienceNumber) {
    const response = await fetch(`${API_BASE}/audience/audiences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ number: audienceNumber }),
    });
    return response.json();
  },

  async deleteAudience(audienceNumber) {
    const response = await fetch(`${API_BASE}/audience/audiences/${audienceNumber}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Работа с нагрузками часов
  async getAvailableHourLoads(audienceNumber) {
    const response = await fetch(`${API_BASE}/audience/audiences/${audienceNumber}/available-hour-loads`);
    return response.json();
  },

  async updateHourLoadAudiences(subjectLoadId, lessonTypeId, data) {
    const response = await fetch(
      `${API_BASE}/audience/subject-loads/${subjectLoadId}/lesson-types/${lessonTypeId}/audiences`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },
};

export const teachersApi = {
  // Получить всех преподавателей
  async getTeachers() {
    const response = await fetch(`${API_BASE}/teachers`);
    return response.json();
  },

  // Получить детали преподавателя со связками
  async getTeacherDetails(teacherId) {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}`);
    return response.json();
  },

  // Добавить преподавателя
  async addTeacher(teacherData) {
    const response = await fetch(`${API_BASE}/teachers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    return response.json();
  },

  // Обновить преподавателя
  async updateTeacher(teacherId, teacherData) {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teacherData),
    });
    return response.json();
  },

  // Удалить преподавателя
  async deleteTeacher(teacherId) {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Получить доступные связки для добавления преподавателя
  async getAvailableConnections(teacherId) {
    const response = await fetch(`${API_BASE}/teachers/${teacherId}/available-connections`);
    return response.json();
  },

  // Обновить преподавателей в связке
  async updateConnectionOfficers(subjectLoadId, squadNumber, data) {
    const response = await fetch(
      `${API_BASE}/teachers/subject-loads/${subjectLoadId}/squads/${squadNumber}/officers`, 
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return response.json();
  },
};

export const subjectsApi = {
  // Получить все предметы
  async getSubjects() {
    const response = await fetch(`${API_BASE}/subjects`);
    return response.json();
  },

  // Получить детали предмета с нагрузками
  async getSubjectDetails(subjectId) {
    const response = await fetch(`${API_BASE}/subjects/${subjectId}`);
    return response.json();
  },

  // Добавить предмет
  async addSubject(subjectData) {
    const response = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    return response.json();
  },

  // Обновить предмет
  async updateSubject(subjectId, subjectData) {
    const response = await fetch(`${API_BASE}/subjects/${subjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subjectData),
    });
    return response.json();
  },

  // Удалить предмет
  async deleteSubject(subjectId) {
    const response = await fetch(`${API_BASE}/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

export const departmentsApi = {
  // Получить все кафедры
  async getDepartments() {
    const response = await fetch(`${API_BASE}/departments`);
    return response.json();
  },

  // Получить детали кафедры с нагрузками и взводами
  async getDepartmentDetails(departmentId) {
    const response = await fetch(`${API_BASE}/departments/${departmentId}`);
    return response.json();
  },

  // Добавить кафедру
  async addDepartment(departmentData) {
    const response = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(departmentData),
    });
    return response.json();
  },

  // Обновить кафедру
  async updateDepartment(departmentId, departmentData) {
    const response = await fetch(`${API_BASE}/departments/${departmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(departmentData),
    });
    return response.json();
  },

  // Удалить кафедру
  async deleteDepartment(departmentId) {
    const response = await fetch(`${API_BASE}/departments/${departmentId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};