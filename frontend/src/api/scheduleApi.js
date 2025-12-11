const API_BASE = 'http://localhost:8000';

export const scheduleApi = {
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

  async saveCell(data) {
    const response = await fetch(`${API_BASE}/schedule/savecell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
