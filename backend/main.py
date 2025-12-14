# '''
from dotenv import load_dotenv
import os

from repository import database, queries

dbCreator = database.DatabaseCreator()
dbCreator.init_database()

dbInitializer = database.DatabaseInitializer()
dbInitializer.fill_data()

print(queries.get_input_data())
# '''

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from pathlib import Path

app = FastAPI(title="Schedule API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Прямой путь к БД
DB_PATH = "/home/user/programming/university/semester7/Schedule/databases/database.db"
print(f"📂 Путь к БД: {DB_PATH}")

# Функция для подключения к БД
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ---------------------------------------------------------------------------
# Вспомогательные функции
# ---------------------------------------------------------------------------
def convert_date_format(date_str: str) -> str:
    """Конвертирует дату из формата 'дд.мм' в 'YYYY-MM-DD' (используя текущий год)"""
    try:
        day, month = date_str.split('.')
        year = datetime.now().year
        return f"{year}-{int(month):02d}-{int(day):02d}"
    except:
        return date_str

# ---------------------------------------------------------------------------
# 🔹 GET /subjects
# ---------------------------------------------------------------------------
@app.get("/schedule/subjects")
def get_subjects(platoon_id: Optional[int] = Query(None)):
    """
    Получить предметы для взвода
    Пример запроса: /subjects?platoonId=4342
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if platoon_id:
            # Получаем предметы для конкретного взвода
            cursor.execute("""
                SELECT DISTINCT 
                    sl.id as subjectId,
                    s.name as subjectName
                FROM squads sq
                JOIN squad_subject_loads ssl ON sq.number = ?
                JOIN subject_loads sl ON ssl.subject_load_id = sl.id
                JOIN subjects s ON sl.subject_id = s.id
                ORDER BY s.name
            """, (platoon_id,))
        # else:
        #     # Получаем все предметы (если platoonId не указан)
        #     cursor.execute("""
        #         SELECT DISTINCT 
        #             s.id as subjectId,
        #             s.name as subjectName
        #         FROM subjects s
        #         ORDER BY s.name
        #     """)
        
        subjects = cursor.fetchall()
        conn.close()
        
        result = []
        for row in subjects:
            result.append({
                "subject_load_id": row["subjectId"],
                "name": row["subjectName"]
            })
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения предметов: {str(e)}")

@app.get("/schedule/topics")
def get_topics(
    subject_load_id: Optional[int] = Query(None),
    lesson_type: Optional[str] = Query(None)
):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if lesson_type:
            cursor.execute("""
                SELECT t.topic, t.subtopic, lt.name AS typeOfActivity
                FROM themes t
                JOIN lesson_types lt ON t.lesson_type_id = lt.id
                WHERE t.subject_load_id = ? AND lt.name = ?
                ORDER BY t.topic, t.subtopic
            """, (subject_load_id, lesson_type))
        else:
            cursor.execute("""
                SELECT t.topic, t.subtopic, lt.name AS typeOfActivity
                FROM themes t
                JOIN lesson_types lt ON t.lesson_type_id = lt.id
                WHERE t.subject_load_id = ?
                ORDER BY t.topic, t.subtopic
            """, (subject_load_id,))

        topics = cursor.fetchall()
        conn.close()

        print(f"✅ Найдено тем: {len(topics)}")
        return [
            {"topic": row["topic"], "subtopic": row["subtopic"], "typeOfActivity": row["typeOfActivity"]}
            for row in topics
        ]

    except Exception as e:
        print(f"❌ Ошибка в get_topics: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения тем: {e}")


@app.get("/schedule/lesson-types")
def get_lesson_types(subject_load_id: Optional[int] = Query(None)):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT DISTINCT lt.name
            FROM subject_hours_load_count shlc
            JOIN lesson_types lt ON shlc.lesson_type_id = lt.id
            WHERE shlc.subject_load_id = ?
            UNION
            SELECT DISTINCT lt.name
            FROM themes t
            JOIN lesson_types lt ON t.lesson_type_id = lt.id
            WHERE t.subject_load_id = ?
            ORDER BY lt.name
        """, (subject_load_id, subject_load_id))

        rows = cursor.fetchall()
        conn.close()

        result = [row["name"] for row in rows]
        print(f"✅ Найдено типов занятий: {result}")
        return result

    except Exception as e:
        print(f"❌ Ошибка в get_lesson_types: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов занятий: {e}")

@app.get("/schedule/audiences")
def get_audiences(
    subject_load_id: Optional[int] = Query(None),
    lesson_type: Optional[str] = Query(None)
):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 2️⃣ Определяем ID типа занятия (если указан)
        lesson_type_id = None
        if lesson_type:
            cursor.execute("SELECT id FROM lesson_types WHERE name = ?", (lesson_type,))
            lt = cursor.fetchone()
            if lt:
                lesson_type_id = lt["id"]
                print(f"📘 ID lesson_type={lesson_type_id}")
            else:
                print("⚠️ Тип занятия не найден")
                conn.close()
                return []

        # 3️⃣ Получаем аудитории
        if lesson_type_id:
            cursor.execute("""
                SELECT audiences 
                FROM subject_hours_load_count
                WHERE subject_load_id = ? AND lesson_type_id = ?
            """, (subject_load_id, lesson_type_id))
        else:
            cursor.execute("""
                SELECT audiences 
                FROM subject_hours_load_count
                WHERE subject_load_id = ?
            """, (subject_load_id,))

        rows = cursor.fetchall()
        conn.close()

        audience_set = set()
        for r in rows:
            if r["audiences"]:
                for a in r["audiences"].split("/"):
                    a = a.strip()
                    if a.isdigit():
                        audience_set.add(int(a))

        result = [{"id": a, "importance": 1} for a in sorted(audience_set)]
        print(f"✅ Найдено аудиторий: {result}")
        return result

    except Exception as e:
        print(f"❌ Ошибка в get_audiences: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения аудиторий: {e}")

@app.get("/schedule/teachers")
def get_teachers(
    platoon_id: Optional[str] = Query(None),
    subject_load_id: Optional[int] = Query(None)
):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if platoon_id and subject_load_id:
            print("📘 Фильтруем по взводу и subject_load_id")
            cursor.execute("""
                SELECT DISTINCT o.id,
                    o.first_name || ' ' || o.second_name || ' ' || o.surname AS full_name
                FROM squad_subject_loads ssl
                JOIN officers o ON o.id IN (
                    SELECT TRIM(value)
                    FROM json_each('[' || REPLACE(ssl.officers, '/', ',') || ']')
                )
                WHERE ssl.squad = ? AND ssl.subject_load_id = ?
                ORDER BY full_name
            """, (platoon_id, subject_load_id))

        # elif platoon_id:
        #     print("📗 Фильтруем только по взводу (без конкретного предмета)")
        #     cursor.execute("""
        #         SELECT DISTINCT o.id,
        #             o.first_name || ' ' || o.second_name || ' ' || o.surname AS full_name
        #         FROM squad_subject_loads ssl
        #         JOIN officers o ON o.id IN (
        #             SELECT TRIM(value)
        #             FROM json_each('[' || REPLACE(ssl.officers, '/', ',') || ']')
        #         )
        #         WHERE ssl.squad = ?
        #         ORDER BY full_name
        #     """, (platoon_id,))

        # else:
        #     print("📙 Без фильтра — все преподаватели")
        #     cursor.execute("""
        #         SELECT id, first_name || ' ' || second_name || ' ' || surname AS full_name
        #         FROM officers
        #         ORDER BY full_name
        #     """)

        teachers = cursor.fetchall()
        conn.close()

        result = [row["full_name"] for row in teachers]
        print(f"✅ Найдено преподавателей: {result}")
        return result

    except Exception as e:
        print(f"❌ Ошибка в get_teachers: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения преподавателей: {e}")
  
@app.get("/schedule")
def get_schedule():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        print("📊 Формирование расписания...")

        # Получаем все взвода
        cursor.execute("SELECT DISTINCT number AS platoonId, day FROM squads ORDER BY day, number")
        squads = cursor.fetchall()

        result = []
        day_counter = 1
        current_day = None
        day_platoons = []

        for squad in squads:
            platoon_id = squad["platoonId"]
            day_name = squad["day"]

            if day_name != current_day:
                if current_day is not None:
                    # Сохраняем предыдущий день
                    result.append({
                        "dayId": day_counter,
                        "platoons": day_platoons.copy()
                    })
                    day_counter += 1
                    day_platoons = []

                current_day = day_name

            print(f"📋 Обработка взвода {platoon_id}")

            # ===== INFO: предметы и аудитории =====
            cursor.execute("""
                SELECT DISTINCT
                    sl.id AS subject_load_id,
                    s.name AS subject
                FROM squad_subject_loads ssl
                JOIN subject_loads sl ON ssl.subject_load_id = sl.id
                JOIN subjects s ON sl.subject_id = s.id
                WHERE ssl.squad = ?
            """, (platoon_id,))
            info_rows = cursor.fetchall()

            info = []
            for row in info_rows:
                subject_load_id = row["subject_load_id"]

                # Получаем аудитории для предмета
                cursor.execute("""
                    SELECT audiences 
                    FROM subject_hours_load_count
                    WHERE subject_load_id = ?
                """, (subject_load_id,))
                audience_rows = cursor.fetchall()

                audience_set = set()
                for aud in audience_rows:
                    if aud["audiences"]:
                        for a in aud["audiences"].split("/"):
                            a = a.strip()
                            if a.isdigit():
                                audience_set.add(int(a))

                info.append({
                    "subject_load_id": subject_load_id,
                    "subject": row["subject"],
                    "audiences": sorted(audience_set)
                })

            # ===== LESSONS =====
            cursor.execute("""
                SELECT 
                    l.id AS lesson_id,
                    l.date,
                    l.sequence_number,
                    l.audience,
                    l.subject_load_id,
                    COALESCE(s.name, '') AS subject,
                    COALESCE(t.topic, 0) AS topic,
                    COALESCE(t.subtopic, 0) AS subtopic,
                    COALESCE(lt.name, '') AS type,
                    COALESCE(o.first_name || ' ' || o.second_name || ' ' || o.surname, '') AS teacher
                FROM lessons l
                LEFT JOIN subject_loads sl ON l.subject_load_id = sl.id
                LEFT JOIN subjects s ON sl.subject_id = s.id
                LEFT JOIN officers o ON l.officer_id = o.id
                LEFT JOIN themes t ON l.theme_id = t.id
                LEFT JOIN lesson_types lt ON t.lesson_type_id = lt.id
                WHERE l.squad = ?
                ORDER BY l.date, l.sequence_number
            """, (platoon_id,))
            lessons = cursor.fetchall()

            # ===== Группируем по дате =====
            columns_map = {}
            for lesson in lessons:
                date_str = str(lesson["date"]).split(" ")[0]
                try:
                    # форматируем в DD.MM
                    if "-" in date_str:
                        parts = date_str.split("-")
                        if len(parts) >= 3:
                            date_display = f"{parts[2]}.{parts[1]}"
                        else:
                            date_display = date_str
                    else:
                        date_display = date_str
                except:
                    date_display = date_str

                if date_display not in columns_map:
                    columns_map[date_display] = {
                        "title": date_display,
                        "cells": []
                    }

                columns_map[date_display]["cells"].append({
                    "lesson_id": lesson["lesson_id"],
                    "subject_load_id": lesson["subject_load_id"],
                    "subject": lesson["subject"],
                    "topic": int(lesson["topic"]) if str(lesson["topic"]).isdigit() else None,
                    "subtopic": int(lesson["subtopic"]) if str(lesson["subtopic"]).isdigit() else None,
                    "type": lesson["type"],
                    "audience": lesson["audience"],
                    "teacher": lesson["teacher"]
                })

            platoon_obj = {
                "platoonId": platoon_id,
                "info": info,
                "columns": list(columns_map.values())
            }

            day_platoons.append(platoon_obj)

        # Добавляем последний день
        if day_platoons:
            result.append({
                "dayId": day_counter,
                "platoons": day_platoons
            })

        conn.close()

        print(f"✅ Сформировано расписание: {len(result)} дней, {sum(len(d['platoons']) for d in result)} взводов:")

        return result

    except Exception as e:
        import traceback
        print(f"❌ Ошибка в get_schedule: {e}")
        print(traceback.format_exc())
        return []

@app.post("/schedule/savecell")
def save_cell(data: dict):
    """
    Обновить данные ячейки по lesson_id (с фронта).
    """
    try:
        print(f"📦 Получены данные: {data}")

        conn = get_db_connection()
        cursor = conn.cursor()

        lesson_id = data.get("lesson_id")
        platoon_id = data.get("platoon_id")  # squad
        subject_load_id = data.get("subject_load_id")
        topic = data.get("topic")
        subtopic = data.get("subtopic")
        lesson_type = data.get("type")
        audience = data.get("audience")
        teacher = data.get("teacher")

        if not lesson_id:
            return {"success": False, "error": "❌ Не указан lesson_id"}

        # --- Проверяем, существует ли занятие ---
        cursor.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,))
        lesson = cursor.fetchone()
        if not lesson:
            print(f"⚠️ Урок с ID={lesson_id} не найден")
            return {"success": False, "error": f"Занятие с ID={lesson_id} не найдено"}

        print(f"🧩 Найден урок ID={lesson_id} для взвода {lesson['squad']}")

        updates = []
        params = []

        # === 1. subject_load_id ===
        if subject_load_id and subject_load_id != "null":
            cursor.execute("SELECT id FROM subject_loads WHERE id = ?", (subject_load_id,))
            if cursor.fetchone():
                updates.append("subject_load_id = ?")
                params.append(int(subject_load_id))
            else:
                print(f"⚠️ subject_load_id {subject_load_id} не найден в БД")
        elif subject_load_id in ("null", None):
            updates.append("subject_load_id = NULL")

        # === 2. audience ===
        if audience and audience != "null":
            cursor.execute("SELECT number FROM audiences WHERE number = ?", (audience,))
            if cursor.fetchone():
                updates.append("audience = ?")
                params.append(int(audience))
            else:
                print(f"⚠️ Аудитория {audience} не найдена — пропускаем")
        elif audience in ("null", None):
            updates.append("audience = NULL")

        # === 3. преподаватель ===
        if teacher and teacher != "null" and teacher.strip():
            name_parts = teacher.strip().split()
            if len(name_parts) == 3:
                cursor.execute("""
                    SELECT id FROM officers 
                    WHERE first_name = ? AND second_name = ? AND surname = ?
                """, (name_parts[0], name_parts[1], name_parts[2]))
                officer = cursor.fetchone()
                if officer:
                    updates.append("officer_id = ?")
                    params.append(officer["id"])
                else:
                    print(f"⚠️ Преподаватель {teacher} не найден — пропускаем")
            else:
                print(f"⚠️ Формат ФИО некорректный: {teacher}")
        elif teacher in ("null", "", None):
            updates.append("officer_id = NULL")

        # === 4. тема ===
        if (
            subject_load_id and subject_load_id != "null"
            and topic and topic != "null"
            and subtopic and subtopic != "null"
        ):
            cursor.execute("""
                SELECT id FROM themes
                WHERE subject_load_id = ? AND topic = ? AND subtopic = ?
            """, (int(subject_load_id), int(topic), int(subtopic)))
            theme = cursor.fetchone()
            if theme:
                updates.append("theme_id = ?")
                params.append(theme["id"])
            else:
                print(f"⚠️ Тема subject_load_id={subject_load_id}, topic={topic}, subtopic={subtopic} не найдена")
        elif topic in ("null", None) or subtopic in ("null", None):
            updates.append("theme_id = NULL")

        # === 5. тип занятия (пока не обновляем напрямую) ===
        if lesson_type and lesson_type != "null":
            cursor.execute("SELECT id FROM lesson_types WHERE name = ?", (lesson_type,))
            lt = cursor.fetchone()
            if lt:
                print(f"ℹ️ Тип занятия найден: {lt['id']} ({lesson_type})")
            else:
                print(f"⚠️ Тип занятия '{lesson_type}' не найден")

        # --- Применяем обновления ---
        if updates:
            params.append(lesson_id)
            query = f"UPDATE lessons SET {', '.join(updates)} WHERE id = ?"
            print(f"📝 SQL: {query}")
            print(f"📝 Параметры: {params}")
            cursor.execute(query, params)
            conn.commit()
            print(f"✅ Урок {lesson_id} обновлён")
        else:
            print("⚠️ Нет данных для обновления")

        # --- Проверка ---
        cursor.execute("SELECT * FROM lessons WHERE id = ?", (lesson_id,))
        updated = cursor.fetchone()
        conn.close()

        return {
            "success": True,
            "lessonId": lesson_id,
            "updatedData": dict(updated) if updated else {}
        }

    except Exception as e:
        import traceback
        print("❌ Ошибка в save_cell:", e)
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}


@app.get("/health")
def health_check():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}



# ------------------------ PLATOONS ------------------------

# ---------------------------------------------------------------------------
# 🔹 GET /platoons/departments
# ---------------------------------------------------------------------------
@app.get("/platoons/departments")
def get_departments():
    """
    Получить все кафедры
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, name FROM departments ORDER BY name")
        departments = cursor.fetchall()
        conn.close()
        
        return [{"id": row["id"], "name": row["name"]} for row in departments]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения кафедр: {str(e)}")


# ---------------------------------------------------------------------------
# 🔹 GET /platoons/squad-types
# ---------------------------------------------------------------------------
@app.get("/platoons/squad-types")
def get_squad_types():
    """
    Получить все типы взводов
    """
    try:
        print("@app.get(/platoons/squad-types)")

        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, type, course FROM squad_types ORDER BY type, course")
        types = cursor.fetchall()
        conn.close()
        
        return [{"id": row["id"], "type": row["type"], "course": row["course"]} for row in types]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов взводов: {str(e)}")


# ---------------------------------------------------------------------------
# 🔹 GET /platoons
# ---------------------------------------------------------------------------
@app.get("/platoons")
def get_platoons(department_id: Optional[int] = Query(None)):
    """
    Получить взводы (с фильтром по кафедре)
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                sq.number,
                d.name as department_name
            FROM squads sq
            JOIN departments d ON sq.department_id = d.id
        """
        params = []
        
        if department_id:
            query += " WHERE sq.department_id = ?"
            params.append(department_id)
        
        query += " ORDER BY sq.number"
        
        cursor.execute(query, params)
        platoons = cursor.fetchall()
        conn.close()
        
        return [{"number": row["number"], "department_name": row["department_name"]} for row in platoons]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения взводов: {str(e)}")

# ---------------------------------------------------------------------------
# 🔹 GET /platoons/{platoon_number}
# ---------------------------------------------------------------------------
@app.get("/platoons/{platoon_number}")
def get_platoon_details(platoon_number: str):
    """
    Получить детальную информацию о взводе
    """
    try:
        print(f"🔍 Получение данных взвода: {platoon_number}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                sq.number,
                sq.day,
                sq.start_week,
                sq.end_week,
                sq.department_id,
                d.name as department_name,
                st.id as squad_type_id,
                st.type,
                st.course
            FROM squads sq
            JOIN departments d ON sq.department_id = d.id
            JOIN squad_types st ON sq.squad_type_id = st.id
            WHERE sq.number = ?
        """, (platoon_number,))
        
        platoon = cursor.fetchone()
        conn.close()
        
        if not platoon:
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        result = dict(platoon)
        print(f"✅ Данные взвода: {result}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения данных взвода: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных взвода: {str(e)}")
    
# ---------------------------------------------------------------------------
# 🔹 PUT /platoons/{platoon_number}
# ---------------------------------------------------------------------------
@app.put("/platoons/{platoon_number}")
def update_platoon(platoon_number: str, data: dict):
    """
    Обновить данные взвода
    """
    try:
        print(f"🔄 Обновление взвода {platoon_number}: {data}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверяем существование взвода
        cursor.execute("SELECT squad_type_id FROM squads WHERE number = ?", (platoon_number,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Взвод не найден")
        print("t1")

        updates = []
        params = []
        
        # Обновление типа взвода
        if "squad_type_id" in data:
            cursor.execute("SELECT id FROM squad_types WHERE id = ?", (data["squad_type_id"],))
            if cursor.fetchone():
                updates.append("squad_type_id = ?")
                params.append(data["squad_type_id"])
            else:
                raise HTTPException(status_code=400, detail="Тип взвода не найден")
        print("t2")
        

        # Обновление дня недели
        if "day" in data:
            if 1 <= data["day"] <= 7:
                updates.append("day = ?")
                params.append(data["day"])
            else:
                raise HTTPException(status_code=400, detail="День недели должен быть от 1 до 7")
        print("t3")

        # Обновление недели начала
        if "start_week" in data:
            if data["start_week"] is None:
                updates.append("start_week = NULL")
            elif 1 <= data["start_week"] <= 52:
                updates.append("start_week = ?")
                params.append(data["start_week"])
            else:
                raise HTTPException(status_code=400, detail="Неделя начала должна быть от 1 до 52")
        print("t4")
        

        # Обновление недели окончания
        if "end_week" in data:
            if data["end_week"] is None:
                updates.append("end_week = NULL")
            elif 1 <= data["end_week"] <= 52:
                updates.append("end_week = ?")
                params.append(data["end_week"])
            else:
                raise HTTPException(status_code=400, detail="Неделя окончания должна быть от 1 до 52")
        print("t5")

        # Валидация: неделя начала должна быть меньше недели окончания
        if ("start_week" in data and data["start_week"] is not None and 
            "end_week" in data and data["end_week"] is not None and
            data["start_week"] >= data["end_week"]):
            raise HTTPException(status_code=400, detail="Неделя начала должна быть меньше недели окончания")
        print("t6")

        if updates:
            params.append(platoon_number)
            query = f"UPDATE squads SET {', '.join(updates)} WHERE number = ?"
            print(f"📝 SQL запрос: {query}")
            print(f"📝 Параметры: {params}")
            
            cursor.execute(query, params)
            conn.commit()
            print(f"✅ Взвод {platoon_number} обновлен")
        
        conn.close()
        return {"success": True, "message": "Данные обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления взвода: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления взвода: {str(e)}")
    
# ---------------------------------------------------------------------------
# 🔹 POST /platoons/{platoon_number}/rename
# ---------------------------------------------------------------------------
@app.post("/platoons/{platoon_number}/rename")
def rename_platoon(platoon_number: str, data: dict):
    """
    Переименовать взвод
    """
    try:

        new_number = data.get("newNumber")
        if not new_number:
            raise HTTPException(status_code=400, detail="Не указан новый номер")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        print(new_number)
        
        # Проверяем существование старого взвода
        cursor.execute("SELECT number FROM squads WHERE number = ?", (platoon_number,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Взвод не найден")
        print(new_number)
        
        # Проверяем, не занят ли новый номер
        cursor.execute("SELECT number FROM squads WHERE number = ?", (new_number,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Взвод с таким номером уже существует")
        print(new_number)
        
        # Обновляем номер во всех связанных таблицах
        conn.execute("BEGIN TRANSACTION")
        
        try:
            print("try1")
            # 1. Обновляем squads
            cursor.execute("UPDATE squads SET number = ? WHERE number = ?", (new_number, platoon_number))
            print("try2")
            
            # 2. Обновляем squad_subject_loads
            cursor.execute("UPDATE squad_subject_loads SET squad = ? WHERE squad = ?", (new_number, platoon_number))
            
            print("try3")
            # 3. Обновляем lessons
            cursor.execute("UPDATE lessons SET squad = ? WHERE squad = ?", (new_number, platoon_number))
            
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            raise
        
        conn.close()
        return {"success": True, "message": f"Взвод переименован в {new_number}"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка переименования: {str(e)}")

# ---------------------------------------------------------------------------
# 🔹 DELETE /platoons/{platoon_number}
# ---------------------------------------------------------------------------
@app.delete("/platoons/{platoon_number}")
def delete_platoon(platoon_number: str):
    """
    Удалить взвод
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверяем существование взвода
        cursor.execute("SELECT number FROM squads WHERE number = ?", (platoon_number,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        # Удаляем связанные данные
        conn.execute("BEGIN TRANSACTION")
        try:
            # 1. Удаляем уроки взвода
            cursor.execute("DELETE FROM lessons WHERE squad = ?", (platoon_number,))
            
            # 2. Удаляем связи с предметами
            cursor.execute("DELETE FROM squad_subject_loads WHERE squad = ?", (platoon_number,))
            
            # 3. Удаляем сам взвод
            cursor.execute("DELETE FROM squads WHERE number = ?", (platoon_number,))
            
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            raise
        
        conn.close()
        return {"success": True, "message": "Взвод удален"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка удаления: {str(e)}")

# ---------------------------------------------------------------------------
# 🔹 POST /platoons
# ---------------------------------------------------------------------------
@app.post("/platoons")
def add_platoon(data: dict):
    """
    Добавить новый взвод
    """
    try:
        print(f"📦 Получены данные: {data}")

        number = data.get("number")
        department_id = data.get("departmentId")
        squad_type_id = data.get("squadTypeId")
        day = data.get("day", 1)
        start_week = data.get("start_week")
        end_week = data.get("end_week")
        
        if not all([number, department_id, squad_type_id]):
            raise HTTPException(status_code=400, detail="Не указаны обязательные поля")
        
        # Валидация недель
        if start_week and (start_week < 1 or start_week > 52):
            raise HTTPException(status_code=400, detail="Неделя начала должна быть от 1 до 52")
        
        if end_week and (end_week < 1 or end_week > 52):
            raise HTTPException(status_code=400, detail="Неделя окончания должна быть от 1 до 52")
        
        if start_week and end_week and start_week >= end_week:
            raise HTTPException(status_code=400, detail="Неделя начала должна быть меньше недели окончания")
        print("1")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        print("2")
        
        # Проверяем, не существует ли уже взвод с таким номером
        cursor.execute("SELECT number FROM squads WHERE number = ?", (number,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Взвод с таким номером уже существует")
        print("3")
        
        # Проверяем существование кафедры
        cursor.execute("SELECT id FROM departments WHERE id = ?", (department_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Кафедра не найдена")
        print("4")
        
        # Проверяем существование типа взвода
        cursor.execute("SELECT id FROM squad_types WHERE id = ?", (squad_type_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Тип взвода не найден")
        print("5")

        # Добавляем взвод
        cursor.execute("""
            INSERT INTO squads (number, department_id, squad_type_id, day, start_week, end_week)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (number, department_id, squad_type_id, day, start_week, end_week))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Взвод добавлен", "number": number}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления взвода: {str(e)}")


# ============================================================================
# ДИСЦИПЛИНЫ (НАГРУЗКИ)
# ============================================================================

@app.get("/disciplines/subject-loads")
def get_subject_loads():
    """
    Получить все нагрузки
    """
    try:
        print("🔄 Получение всех нагрузок")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                sl.id,
                s.name as subject_name,
                d.name as department_name,
                st.type,
                st.course,
                sl.semester
            FROM subject_loads sl
            JOIN subjects s ON sl.subject_id = s.id
            JOIN departments d ON sl.department_id = d.id
            JOIN squad_types st ON sl.squad_type_id = st.id
            ORDER BY s.name, st.course, sl.semester
        """)
        
        loads = cursor.fetchall()
        conn.close()
        
        result = [dict(row) for row in loads]
        print(f"✅ Найдено нагрузок: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения нагрузок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения нагрузок: {str(e)}")

@app.get("/disciplines/subject-loads/{subject_load_id}")
def get_subject_load_details(subject_load_id: int):
    """
    Получить детальную информацию о нагрузке
    """
    try:
        print(f"🔄 Получение деталей нагрузки ID={subject_load_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Основная информация
        cursor.execute("""
            SELECT 
                sl.id,
                sl.subject_id,
                sl.department_id,
                sl.squad_type_id,
                sl.semester,
                s.name as subject_name,
                d.name as department_name,
                st.type,
                st.course
            FROM subject_loads sl
            JOIN subjects s ON sl.subject_id = s.id
            JOIN departments d ON sl.department_id = d.id
            JOIN squad_types st ON sl.squad_type_id = st.id
            WHERE sl.id = ?
        """, (subject_load_id,))
        
        load = cursor.fetchone()
        if not load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Привязанные взводы
        cursor.execute("""
            SELECT 
                ssl.squad as squad_number,
                d.name as department_name,
                ssl.officers
            FROM squad_subject_loads ssl
            JOIN squads sq ON ssl.squad = sq.number
            JOIN departments d ON sq.department_id = d.id
            WHERE ssl.subject_load_id = ?
        """, (subject_load_id,))
        
        squads_rows = cursor.fetchall()
        squads = []
        for row in squads_rows:
            officer_ids = []
            officers = []
            if row["officers"]:
                officer_ids = [int(id.strip()) for id in row["officers"].split("/") if id.strip()]
                
                if officer_ids:
                    placeholders = ','.join('?' * len(officer_ids))
                    cursor.execute(f"""
                        SELECT id, first_name, second_name, surname
                        FROM officers
                        WHERE id IN ({placeholders})
                    """, officer_ids)
                    officers = [dict(officer) for officer in cursor.fetchall()]
            
            squads.append({
                "squad_number": row["squad_number"],
                "department_name": row["department_name"],
                "officer_ids": officer_ids,
                "officers": officers
            })
        
        # Часы нагрузки
        cursor.execute("""
            SELECT 
                shlc.lesson_type_id,
                lt.name as lesson_type_name,
                shlc.hours_count,
                shlc.audiences
            FROM subject_hours_load_count shlc
            JOIN lesson_types lt ON shlc.lesson_type_id = lt.id
            WHERE shlc.subject_load_id = ?
        """, (subject_load_id,))
        
        hours_rows = cursor.fetchall()
        hours_load = []
        for row in hours_rows:
            audiences = [a.strip() for a in row["audiences"].split("/")] if row["audiences"] else []
            hours_load.append({
                "lesson_type_id": row["lesson_type_id"],
                "lesson_type_name": row["lesson_type_name"],
                "hours_count": row["hours_count"],
                "audiences": audiences
            })
        
        # Темы
        cursor.execute("""
            SELECT 
                t.id,
                t.lesson_type_id,
                lt.name as lesson_type_name,
                t.topic,
                t.subtopic,
                t.hours_count,
                t.topic_name,
                t.subtopic_name
            FROM themes t
            JOIN lesson_types lt ON t.lesson_type_id = lt.id
            WHERE t.subject_load_id = ?
            ORDER BY t.topic, t.subtopic
        """, (subject_load_id,))
        
        themes = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        result = {
            **dict(load),
            "squads": squads,
            "hours_load": hours_load,
            "themes": themes
        }
        
        print(f"✅ Данные нагрузки загружены")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей нагрузки: {str(e)}")

@app.post("/disciplines/subject-loads")
def add_subject_load(data: dict):
    """
    Добавить новую нагрузку
    """
    try:
        print(f"📦 Добавление новой нагрузки: {data}")
        
        subject_id = data.get("subject_id")
        department_id = data.get("department_id")
        squad_type_id = data.get("squad_type_id")
        semester = data.get("semester", 0)
        
        if not all([subject_id, department_id, squad_type_id]):
            raise HTTPException(status_code=400, detail="Не указаны обязательные поля")
        
        # Проверка уникальности
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id FROM subject_loads
            WHERE subject_id = ? AND department_id = ? AND squad_type_id = ? AND semester = ?
        """, (subject_id, department_id, squad_type_id, semester))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Такая нагрузка уже существует")
        
        # Проверка существования предмета
        cursor.execute("SELECT id FROM subjects WHERE id = ?", (subject_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Предмет не найден")
        
        # Проверка существования кафедры
        cursor.execute("SELECT id FROM departments WHERE id = ?", (department_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Кафедра не найден")
        
        # Проверка существования типа взвода
        cursor.execute("SELECT id FROM squad_types WHERE id = ?", (squad_type_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Тип взвода не найден")
        
        # Добавление нагрузки
        cursor.execute("""
            INSERT INTO subject_loads (subject_id, department_id, squad_type_id, semester)
            VALUES (?, ?, ?, ?)
        """, (subject_id, department_id, squad_type_id, semester))
        
        load_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ Нагрузка добавлена, ID={load_id}")
        return {"success": True, "message": "Нагрузка добавлена", "id": load_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления нагрузки: {str(e)}")

@app.put("/disciplines/subject-loads/{subject_load_id}")
def update_subject_load(subject_load_id: int, data: dict):
    """
    Обновить нагрузку
    """
    try:
        print(f"🔄 Обновление нагрузки ID={subject_load_id}: {data}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования нагрузки
        cursor.execute("SELECT id FROM subject_loads WHERE id = ?", (subject_load_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        updates = []
        params = []
        
        if "subject_id" in data:
            cursor.execute("SELECT id FROM subjects WHERE id = ?", (data["subject_id"],))
            if cursor.fetchone():
                updates.append("subject_id = ?")
                params.append(data["subject_id"])
            else:
                raise HTTPException(status_code=400, detail="Предмет не найден")
        
        if "department_id" in data:
            cursor.execute("SELECT id FROM departments WHERE id = ?", (data["department_id"],))
            if cursor.fetchone():
                updates.append("department_id = ?")
                params.append(data["department_id"])
            else:
                raise HTTPException(status_code=400, detail="Кафедра не найдена")
        
        if "squad_type_id" in data:
            cursor.execute("SELECT id FROM squad_types WHERE id = ?", (data["squad_type_id"],))
            if cursor.fetchone():
                updates.append("squad_type_id = ?")
                params.append(data["squad_type_id"])
            else:
                raise HTTPException(status_code=400, detail="Тип взвода не найден")
        
        if "semester" in data:
            updates.append("semester = ?")
            params.append(data["semester"])
        
        if updates:
            # Проверка уникальности после обновления
            if "subject_id" in data or "department_id" in data or "squad_type_id" in data or "semester" in data:
                cursor.execute("""
                    SELECT id FROM subject_loads
                    WHERE subject_id = ? AND department_id = ? AND squad_type_id = ? AND semester = ?
                    AND id != ?
                """, (
                    data.get("subject_id") or (cursor.execute("SELECT subject_id FROM subject_loads WHERE id = ?", (subject_load_id,))).fetchone()[0],
                    data.get("department_id") or (cursor.execute("SELECT department_id FROM subject_loads WHERE id = ?", (subject_load_id,))).fetchone()[0],
                    data.get("squad_type_id") or (cursor.execute("SELECT squad_type_id FROM subject_loads WHERE id = ?", (subject_load_id,))).fetchone()[0],
                    data.get("semester") or (cursor.execute("SELECT semester FROM subject_loads WHERE id = ?", (subject_load_id,))).fetchone()[0],
                    subject_load_id
                ))
                
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Такая нагрузка уже существует")
            
            params.append(subject_load_id)
            query = f"UPDATE subject_loads SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        conn.close()
        return {"success": True, "message": "Нагрузка обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления нагрузки: {str(e)}")

@app.delete("/disciplines/subject-loads/{subject_load_id}")
def delete_subject_load(subject_load_id: int):
    """
    Удалить нагрузку
    """
    try:
        print(f"🗑️ Удаление нагрузки ID={subject_load_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования нагрузки
        cursor.execute("SELECT id FROM subject_loads WHERE id = ?", (subject_load_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Удаление связанных данных
        conn.execute("BEGIN TRANSACTION")
        try:
            # Удаляем темы
            cursor.execute("DELETE FROM themes WHERE subject_load_id = ?", (subject_load_id,))
            
            # Удаляем часы нагрузки
            cursor.execute("DELETE FROM subject_hours_load_count WHERE subject_load_id = ?", (subject_load_id,))
            
            # Удаляем привязки к взводам
            cursor.execute("DELETE FROM squad_subject_loads WHERE subject_load_id = ?", (subject_load_id,))
            
            # Удаляем уроки, связанные с этой нагрузкой
            cursor.execute("DELETE FROM lessons WHERE subject_load_id = ?", (subject_load_id,))
            
            # Удаляем саму нагрузку
            cursor.execute("DELETE FROM subject_loads WHERE id = ?", (subject_load_id,))
            
            conn.commit()
            
        except Exception as e:
            conn.rollback()
            raise
        
        conn.close()
        return {"success": True, "message": "Нагрузка удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления нагрузки: {str(e)}")

# Списки для форм
@app.get("/disciplines/subjects")
def get_subjects_list():
    """Получить все предметы"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM subjects ORDER BY name")
        subjects = [{"id": row["id"], "name": row["name"]} for row in cursor.fetchall()]
        conn.close()
        return subjects
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения предметов: {str(e)}")

@app.get("/disciplines/departments")
def get_departments_list():
    """Получить все кафедры"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM departments ORDER BY name")
        departments = [{"id": row["id"], "name": row["name"]} for row in cursor.fetchall()]
        conn.close()
        return departments
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения кафедр: {str(e)}")

@app.get("/disciplines/squad-types")
def get_squad_types_list():
    """Получить все типы взводов"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, type, course FROM squad_types ORDER BY type, course")
        squad_types = [{"id": row["id"], "type": row["type"], "course": row["course"]} for row in cursor.fetchall()]
        conn.close()
        return squad_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов взводов: {str(e)}")

@app.get("/disciplines/lesson-types")
def get_lesson_types_list():
    """Получить все типы занятий"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, name FROM lesson_types ORDER BY name")
        lesson_types = [{"id": row["id"], "name": row["name"]} for row in cursor.fetchall()]
        conn.close()
        return lesson_types
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов занятий: {str(e)}")

@app.get("/disciplines/officers")
def get_officers_list():
    """Получить всех преподавателей"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, first_name, second_name, surname FROM officers ORDER BY surname, first_name")
        officers = [{"id": row["id"], "first_name": row["first_name"], "second_name": row["second_name"], "surname": row["surname"]} for row in cursor.fetchall()]
        conn.close()
        return officers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения преподавателей: {str(e)}")

@app.get("/disciplines/audiences")
def get_audiences_list():
    """Получить все аудитории"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT number FROM audiences ORDER BY number")
        audiences = [{"id": row["number"], "number": row["number"]} for row in cursor.fetchall()]
        conn.close()
        return audiences
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения аудиторий: {str(e)}")

# Работа с привязанными взводами
@app.get("/disciplines/available-squads")
def get_available_squads(subject_load_id: int = Query(...)):
    """Получить доступные для привязки взводы"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Получаем тип взвода из нагрузки
        cursor.execute("""
            SELECT st.id as squad_type_id
            FROM subject_loads sl
            JOIN squad_types st ON sl.squad_type_id = st.id
            WHERE sl.id = ?
        """, (subject_load_id,))
        
        load = cursor.fetchone()
        if not load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Получаем взводы с таким же типом, которые еще не привязаны к этой нагрузке
        cursor.execute("""
            SELECT 
                sq.number,
                d.name as department_name
            FROM squads sq
            JOIN departments d ON sq.department_id = d.id
            WHERE sq.squad_type_id = ?
            AND sq.number NOT IN (
                SELECT squad FROM squad_subject_loads WHERE subject_load_id = ?
            )
            ORDER BY sq.number
        """, (load["squad_type_id"], subject_load_id))
        
        squads = [{"number": row["number"], "department_name": row["department_name"]} for row in cursor.fetchall()]
        conn.close()
        
        return squads
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных взводов: {str(e)}")

@app.post("/disciplines/subject-loads/{subject_load_id}/squads")
def add_squad_to_subject_load(subject_load_id: int, data: dict):
    """Привязать взвод к нагрузке"""
    try:
        print(f"🔗 Привязка взвода к нагрузке {subject_load_id}: {data}")
        
        squad = data.get("squad")
        officers = data.get("officers", [])
        
        if not squad:
            raise HTTPException(status_code=400, detail="Не указан взвод")
        
        if not officers:
            raise HTTPException(status_code=400, detail="Не указаны преподаватели")
        
        # Проверка существования нагрузки
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT id FROM subject_loads WHERE id = ?", (subject_load_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Проверка существования взвода
        cursor.execute("SELECT number FROM squads WHERE number = ?", (squad,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        # Проверка, не привязан ли уже этот взвод
        cursor.execute("SELECT squad FROM squad_subject_loads WHERE subject_load_id = ? AND squad = ?", (subject_load_id, squad))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Взвод уже привязан к этой нагрузке")
        
        # Проверка преподавателей
        for officer_id in officers:
            cursor.execute("SELECT id FROM officers WHERE id = ?", (officer_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail=f"Преподаватель с ID={officer_id} не найден")
        
        # Формируем строку преподавателей
        officers_str = "/".join(str(officer_id) for officer_id in officers)
        
        # Добавляем привязку
        cursor.execute("""
            INSERT INTO squad_subject_loads (subject_load_id, squad, officers)
            VALUES (?, ?, ?)
        """, (subject_load_id, squad, officers_str))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Взвод привязан к нагрузке"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка привязки взвода: {str(e)}")

@app.put("/disciplines/subject-loads/{subject_load_id}/squads/{squad_number}")
def update_squad_subject_load(subject_load_id: int, squad_number: str, data: dict):
    """Обновить привязку взвода к нагрузке"""
    try:
        print(f"🔄 Обновление привязки взвода {squad_number} к нагрузке {subject_load_id}")
        
        officers = data.get("officers", [])
        
        if not officers:
            raise HTTPException(status_code=400, detail="Не указаны преподаватели")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования привязки
        cursor.execute("""
            SELECT squad FROM squad_subject_loads 
            WHERE subject_load_id = ? AND squad = ?
        """, (subject_load_id, squad_number))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Привязка не найдена")
        
        # Проверка преподавателей
        for officer_id in officers:
            cursor.execute("SELECT id FROM officers WHERE id = ?", (officer_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail=f"Преподаватель с ID={officer_id} не найден")
        
        # Формируем строку преподавателей
        officers_str = "/".join(str(officer_id) for officer_id in officers)
        
        # Обновляем привязку
        cursor.execute("""
            UPDATE squad_subject_loads 
            SET officers = ?
            WHERE subject_load_id = ? AND squad = ?
        """, (officers_str, subject_load_id, squad_number))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Привязка обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления привязки: {str(e)}")

@app.delete("/disciplines/subject-loads/{subject_load_id}/squads/{squad_number}")
def delete_squad_subject_load(subject_load_id: int, squad_number: str):
    """Отвязать взвод от нагрузки"""
    try:
        print(f"🔓 Отвязка взвода {squad_number} от нагрузки {subject_load_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования привязки
        cursor.execute("""
            SELECT squad FROM squad_subject_loads 
            WHERE subject_load_id = ? AND squad = ?
        """, (subject_load_id, squad_number))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Привязка не найдена")
        
        # Удаляем привязку
        cursor.execute("""
            DELETE FROM squad_subject_loads 
            WHERE subject_load_id = ? AND squad = ?
        """, (subject_load_id, squad_number))
        
        # Удаляем уроки, связанные с этой привязкой
        cursor.execute("""
            DELETE FROM lessons 
            WHERE subject_load_id = ? AND squad = ?
        """, (subject_load_id, squad_number))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Взвод отвязан от нагрузки"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка отвязки взвода: {str(e)}")

# Работа с часами нагрузки
@app.post("/disciplines/subject-loads/{subject_load_id}/hours")
def add_hours_load(subject_load_id: int, data: dict):
    """Добавить часы нагрузки для типа занятия"""
    try:
        print(f"➕ Добавление часов для нагрузки {subject_load_id}: {data}")
        
        lesson_type_id = data.get("lesson_type_id")
        hours_count = data.get("hours_count")
        audiences = data.get("audiences", "")
        
        if not lesson_type_id or not hours_count:
            raise HTTPException(status_code=400, detail="Не указаны обязательные поля")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования нагрузки
        cursor.execute("SELECT id FROM subject_loads WHERE id = ?", (subject_load_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Проверка существования типа занятия
        cursor.execute("SELECT id FROM lesson_types WHERE id = ?", (lesson_type_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Тип занятия не найден")
        
        # Проверка, не добавлены ли уже часы для этого типа
        cursor.execute("""
            SELECT lesson_type_id FROM subject_hours_load_count 
            WHERE subject_load_id = ? AND lesson_type_id = ?
        """, (subject_load_id, lesson_type_id))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Часы для этого типа занятия уже добавлены")
        
        # Добавляем часы
        cursor.execute("""
            INSERT INTO subject_hours_load_count (subject_load_id, lesson_type_id, hours_count, audiences)
            VALUES (?, ?, ?, ?)
        """, (subject_load_id, lesson_type_id, hours_count, audiences))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Часы добавлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления часов: {str(e)}")

@app.put("/disciplines/subject-loads/{subject_load_id}/hours/{lesson_type_id}")
def update_hours_load(subject_load_id: int, lesson_type_id: int, data: dict):
    """Обновить часы нагрузки для типа занятия"""
    try:
        print(f"🔄 Обновление часов для нагрузки {subject_load_id}, тип {lesson_type_id}: {data}")
        
        hours_count = data.get("hours_count")
        audiences = data.get("audiences", "")
        
        if not hours_count:
            raise HTTPException(status_code=400, detail="Не указано количество часов")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования записи
        cursor.execute("""
            SELECT subject_load_id FROM subject_hours_load_count 
            WHERE subject_load_id = ? AND lesson_type_id = ?
        """, (subject_load_id, lesson_type_id))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Запись о часах не найдена")
        
        # Обновляем запись
        cursor.execute("""
            UPDATE subject_hours_load_count 
            SET hours_count = ?, audiences = ?
            WHERE subject_load_id = ? AND lesson_type_id = ?
        """, (hours_count, audiences, subject_load_id, lesson_type_id))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Часы обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления часов: {str(e)}")

@app.delete("/disciplines/subject-loads/{subject_load_id}/hours/{lesson_type_id}")
def delete_hours_load(subject_load_id: int, lesson_type_id: int):
    """Удалить часы нагрузки для типа занятия"""
    try:
        print(f"🗑️ Удаление часов для нагрузки {subject_load_id}, тип {lesson_type_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования записи
        cursor.execute("""
            SELECT subject_load_id FROM subject_hours_load_count 
            WHERE subject_load_id = ? AND lesson_type_id = ?
        """, (subject_load_id, lesson_type_id))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Запись о часах не найдена")
        
        # Удаляем запись
        cursor.execute("""
            DELETE FROM subject_hours_load_count 
            WHERE subject_load_id = ? AND lesson_type_id = ?
        """, (subject_load_id, lesson_type_id))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Часы удалены"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка удаления часов: {str(e)}")

# Работа с темами
@app.post("/disciplines/subject-loads/{subject_load_id}/themes")
def add_theme(subject_load_id: int, data: dict):
    """Добавить тему для нагрузки"""
    try:
        print(f"➕ Добавление темы для нагрузки {subject_load_id}: {data}")
        
        lesson_type_id = data.get("lesson_type_id")
        topic = data.get("topic")
        subtopic = data.get("subtopic")
        hours_count = data.get("hours_count")
        topic_name = data.get("topic_name")
        subtopic_name = data.get("subtopic_name")
        
        if not all([lesson_type_id, topic, subtopic, hours_count]):
            raise HTTPException(status_code=400, detail="Не указаны обязательные поля")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования нагрузки
        cursor.execute("SELECT id FROM subject_loads WHERE id = ?", (subject_load_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Проверка существования типа занятия
        cursor.execute("SELECT id FROM lesson_types WHERE id = ?", (lesson_type_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=400, detail="Тип занятия не найден")
        
        # Проверка уникальности темы
        cursor.execute("""
            SELECT id FROM themes 
            WHERE subject_load_id = ? AND topic = ? AND subtopic = ?
        """, (subject_load_id, topic, subtopic))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Тема с таким номером уже существует")
        
        # Добавляем тему
        cursor.execute("""
            INSERT INTO themes (subject_load_id, lesson_type_id, topic, subtopic, hours_count, topic_name, subtopic_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (subject_load_id, lesson_type_id, topic, subtopic, hours_count, topic_name, subtopic_name))
        
        theme_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Тема добавлена", "id": theme_id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления темы: {str(e)}")

@app.put("/disciplines/themes/{theme_id}")
def update_theme(theme_id: int, data: dict):
    """Обновить тему"""
    try:
        print(f"🔄 Обновление темы ID={theme_id}: {data}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования темы
        cursor.execute("SELECT id FROM themes WHERE id = ?", (theme_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Тема не найдена")
        
        updates = []
        params = []
        
        if "lesson_type_id" in data:
            cursor.execute("SELECT id FROM lesson_types WHERE id = ?", (data["lesson_type_id"],))
            if cursor.fetchone():
                updates.append("lesson_type_id = ?")
                params.append(data["lesson_type_id"])
            else:
                raise HTTPException(status_code=400, detail="Тип занятия не найден")
        
        if "topic" in data:
            updates.append("topic = ?")
            params.append(data["topic"])
        
        if "subtopic" in data:
            updates.append("subtopic = ?")
            params.append(data["subtopic"])
        
        if "hours_count" in data:
            updates.append("hours_count = ?")
            params.append(data["hours_count"])
        
        if "topic_name" in data:
            updates.append("topic_name = ?")
            params.append(data["topic_name"])
        
        if "subtopic_name" in data:
            updates.append("subtopic_name = ?")
            params.append(data["subtopic_name"])
        
        if updates:
            # Проверка уникальности при изменении номера темы
            if "topic" in data or "subtopic" in data:
                cursor.execute("SELECT subject_load_id FROM themes WHERE id = ?", (theme_id,))
                subject_load_id = cursor.fetchone()["subject_load_id"]
                
                cursor.execute("""
                    SELECT id FROM themes 
                    WHERE subject_load_id = ? AND topic = ? AND subtopic = ? AND id != ?
                """, (
                    subject_load_id,
                    data.get("topic") or (cursor.execute("SELECT topic FROM themes WHERE id = ?", (theme_id,))).fetchone()[0],
                    data.get("subtopic") or (cursor.execute("SELECT subtopic FROM themes WHERE id = ?", (theme_id,))).fetchone()[0],
                    theme_id
                ))
                
                if cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Тема с таким номером уже существует")
            
            params.append(theme_id)
            query = f"UPDATE themes SET {', '.join(updates)} WHERE id = ?"
            cursor.execute(query, params)
            conn.commit()
        
        conn.close()
        return {"success": True, "message": "Тема обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления темы: {str(e)}")

@app.delete("/disciplines/themes/{theme_id}")
def delete_theme(theme_id: int):
    """Удалить тему"""
    try:
        print(f"🗑️ Удаление темы ID={theme_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования темы
        cursor.execute("SELECT id FROM themes WHERE id = ?", (theme_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Тема не найдена")
        
        # Удаляем тему
        cursor.execute("DELETE FROM themes WHERE id = ?", (theme_id,))
        
        # Удаляем уроки, связанные с этой темой
        cursor.execute("DELETE FROM lessons WHERE theme_id = ?", (theme_id,))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Тема удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка удаления темы: {str(e)}")


# ------------------------ AUDIENCES ------------------------

# ============================================================================
# АУДИТОРИИ
# ============================================================================

@app.get("/audience/audiences")
def get_audiences():
    """
    Получить все аудитории
    """
    try:
        print("🔄 Получение всех аудиторий")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                a.number,
                COUNT(DISTINCT shlc.subject_load_id) as load_count,
                COUNT(DISTINCT l.id) as lessons_count,
                MAX(l.date) as last_lesson_date
            FROM audiences a
            LEFT JOIN subject_hours_load_count shlc ON shlc.audiences LIKE '%' || a.number || '%'
            LEFT JOIN lessons l ON l.audience = a.number
            GROUP BY a.number
            ORDER BY a.number
        """)
        
        audiences = cursor.fetchall()
        conn.close()
        
        result = [dict(row) for row in audiences]
        print(f"✅ Найдено аудиторий: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения аудиторий: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения аудиторий: {str(e)}")

@app.get("/audience/audiences/{audience_number}")
def get_audience_details(audience_number: int):
    """
    Получить детальную информацию об аудитории
    """
    try:
        print(f"🔄 Получение деталей аудитории №{audience_number}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования аудитории
        cursor.execute("SELECT number FROM audiences WHERE number = ?", (audience_number,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Аудитория не найдена")
        
        # Основная статистика
        cursor.execute("""
            SELECT 
                a.number as audience_number,
                COUNT(DISTINCT shlc.subject_load_id) as load_count,
                COUNT(DISTINCT l.id) as lessons_count,
                MAX(l.date) as last_lesson_date
            FROM audiences a
            LEFT JOIN subject_hours_load_count shlc ON shlc.audiences LIKE '%' || a.number || '%'
            LEFT JOIN lessons l ON l.audience = a.number
            WHERE a.number = ?
            GROUP BY a.number
        """, (audience_number,))
        
        stats = cursor.fetchone()
        if not stats:
            stats = {"audience_number": audience_number, "load_count": 0, "lessons_count": 0, "last_lesson_date": None}
        
        # Нагрузки, связанные с этой аудиторией
        cursor.execute("""
            SELECT DISTINCT
                shlc.subject_load_id,
                shlc.lesson_type_id,
                shlc.hours_count,
                shlc.audiences,
                s.name as subject_name,
                d.name as department_name,
                st.type,
                st.course,
                sl.semester,
                lt.name as lesson_type_name
            FROM subject_hours_load_count shlc
            JOIN subject_loads sl ON shlc.subject_load_id = sl.id
            JOIN subjects s ON sl.subject_id = s.id
            JOIN departments d ON sl.department_id = d.id
            JOIN squad_types st ON sl.squad_type_id = st.id
            JOIN lesson_types lt ON shlc.lesson_type_id = lt.id
            WHERE shlc.audiences LIKE '%' || ? || '%'
            ORDER BY s.name, lt.name
        """, (str(audience_number),))
        
        hour_loads = []
        for row in cursor.fetchall():
            audiences = []
            if row["audiences"]:
                audiences = [a.strip() for a in row["audiences"].split("/") if a.strip()]
            
            hour_loads.append({
                "subject_load_id": row["subject_load_id"],
                "lesson_type_id": row["lesson_type_id"],
                "hours_count": row["hours_count"],
                "audiences": audiences,
                "subject_name": row["subject_name"],
                "department_name": row["department_name"],
                "type": row["type"],
                "course": row["course"],
                "semester": row["semester"],
                "lesson_type_name": row["lesson_type_name"]
            })
        
        conn.close()
        
        result = {
            **dict(stats),
            "hour_loads": hour_loads
        }
        
        print(f"✅ Данные аудитории загружены")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей аудитории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей аудитории: {str(e)}")

@app.post("/audience/audiences")
def add_audience(data: dict):
    """
    Добавить новую аудиторию
    """
    try:
        print(f"➕ Добавление новой аудитории: {data}")
        
        audience_number = data.get("number")
        
        if not audience_number:
            raise HTTPException(status_code=400, detail="Не указан номер аудитории")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования аудитории
        cursor.execute("SELECT number FROM audiences WHERE number = ?", (audience_number,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Аудитория с таким номером уже существует")
        
        # Добавление аудитории
        cursor.execute("INSERT INTO audiences (number) VALUES (?)", (audience_number,))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Аудитория №{audience_number} добавлена")
        return {"success": True, "message": f"Аудитория №{audience_number} добавлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления аудитории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления аудитории: {str(e)}")

@app.delete("/audience/audiences/{audience_number}")
def delete_audience(audience_number: int):
    """
    Удалить аудиторию
    """
    try:
        print(f"🗑️ Удаление аудитории №{audience_number}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования аудитории
        cursor.execute("SELECT number FROM audiences WHERE number = ?", (audience_number,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Аудитория не найдена")
        
        # Мягкое удаление:
        # 1. Обновляем уроки - очищаем поле audience
        cursor.execute("""
            UPDATE lessons 
            SET audience = NULL 
            WHERE audience = ?
        """, (audience_number,))
        
        print(f"✅ Очищено поле audience в {cursor.rowcount} уроках")
        
        # 2. Удаляем аудиторию из subject_hours_load_count
        cursor.execute("""
            SELECT subject_load_id, lesson_type_id, audiences 
            FROM subject_hours_load_count 
            WHERE audiences LIKE '%' || ? || '%'
        """, (str(audience_number),))
        
        print("111")
        hour_loads = cursor.fetchall()
        for row in hour_loads:
            audiences = row["audiences"]
            if audiences:
                # Удаляем аудиторию из строки
                audience_list = [a.strip() for a in audiences.split("/") if a.strip()]
                audience_list = [a for a in audience_list if a != str(audience_number)]
                new_audiences = "/".join(audience_list)
                
                cursor.execute("""
                    UPDATE subject_hours_load_count 
                    SET audiences = ? 
                    WHERE subject_load_id = ? AND lesson_type_id = ?
                """, (new_audiences, row["subject_load_id"], row["lesson_type_id"]))
        
        print(f"✅ Аудитория удалена из {len(hour_loads)} наборов часов нагрузки")
        
        # 3. Удаляем саму аудиторию
        cursor.execute("DELETE FROM audiences WHERE number = ?", (audience_number,))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": f"Аудитория №{audience_number} удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления аудитории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления аудитории: {str(e)}")

@app.get("/audience/audiences/{audience_number}/available-hour-loads")
def get_available_hour_loads(audience_number: int):
    """
    Получить доступные для добавления аудитории нагрузки часов
    """
    try:
        print(f"📊 Получение доступных нагрузок для аудитории №{audience_number}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Нагрузки, где аудитории еще нет
        cursor.execute("""
            SELECT 
                shlc.subject_load_id,
                shlc.lesson_type_id,
                shlc.hours_count,
                shlc.audiences,
                s.name as subject_name,
                lt.name as lesson_type_name
            FROM subject_hours_load_count shlc
            JOIN subject_loads sl ON shlc.subject_load_id = sl.id
            JOIN subjects s ON sl.subject_id = s.id
            JOIN lesson_types lt ON shlc.lesson_type_id = lt.id
            WHERE shlc.audiences NOT LIKE '%' || ? || '%'
            ORDER BY s.name, lt.name
        """, (str(audience_number),))
        
        hour_loads = []
        for row in cursor.fetchall():
            audiences = []
            if row["audiences"]:
                audiences = [a.strip() for a in row["audiences"].split("/") if a.strip()]
            
            hour_loads.append({
                "subject_load_id": row["subject_load_id"],
                "lesson_type_id": row["lesson_type_id"],
                "hours_count": row["hours_count"],
                "audiences": audiences,
                "subject_name": row["subject_name"],
                "lesson_type_name": row["lesson_type_name"]
            })
        
        conn.close()
        
        print(f"✅ Найдено доступных нагрузок: {len(hour_loads)}")
        return hour_loads
        
    except Exception as e:
        print(f"❌ Ошибка получения доступных нагрузок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных нагрузок: {str(e)}")

@app.put("/audience/subject-loads/{subject_load_id}/lesson-types/{lesson_type_id}/audiences")
def update_hour_load_audiences(subject_load_id: int, lesson_type_id: int, data: dict):
    """
    Обновить список аудиторий для нагрузки часов
    """
    try:
        audiences = data.get("audiences", [])
        
        # Валидация: не более 3 аудиторий
        if len(audiences) > 3:
            raise HTTPException(status_code=400, detail="Максимум 3 аудитории на нагрузку")
        
        # Валидация: все аудитории должны существовать
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for audience in audiences:
            cursor.execute("SELECT number FROM audiences WHERE number = ?", (audience,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail=f"Аудитория №{audience} не найдена")
        
        # Формируем строку аудиторий
        audiences_str = "/".join(str(audience) for audience in audiences)
        
        # Проверка существования нагрузки часов
        cursor.execute("SELECT subject_load_id FROM subject_hours_load_count WHERE subject_load_id = ? AND lesson_type_id = ?", (subject_load_id, lesson_type_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Нагрузка часов не найдена")
        
        # Обновляем аудитории
        cursor.execute("""
            UPDATE subject_hours_load_count 
            SET audiences = ? 
            WHERE subject_load_id = ? AND lesson_type_id = ?
        """, (audiences_str, subject_load_id, lesson_type_id))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Аудитории обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления аудиторий: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления аудиторий: {str(e)}")


# ------- TEACHERS -------
# ============================================================================
# ПРЕПОДАВАТЕЛИ (обновленная версия)
# ============================================================================

@app.get("/teachers")
def get_teachers():
    """
    Получить всех преподавателей (для списка)
    """
    try:
        print("🔄 Получение списка преподавателей")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                first_name,
                second_name,
                surname,
                first_name || ' ' || second_name || ' ' || surname as full_name
            FROM officers
            ORDER BY surname, first_name
        """)
        
        teachers = cursor.fetchall()
        conn.close()
        
        result = [dict(row) for row in teachers]
        print(f"✅ Найдено преподавателей: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения преподавателей: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения преподавателей: {str(e)}")

@app.get("/teachers/{teacher_id}")
def get_teacher_details(teacher_id: int):
    """
    Получить детальную информацию о преподавателе со связками
    """
    try:
        print(f"🔄 Получение деталей преподавателя ID={teacher_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Основная информация о преподавателе
        cursor.execute("""
            SELECT 
                id,
                first_name,
                second_name,
                surname,
                first_name || ' ' || second_name || ' ' || surname as full_name
            FROM officers
            WHERE id = ?
        """, (teacher_id,))
        
        teacher = cursor.fetchone()
        if not teacher:
            raise HTTPException(status_code=404, detail="Преподаватель не найден")
        
        # Связки с нагрузками и взводами
        cursor.execute("""
            SELECT 
                ssl.subject_load_id,
                ssl.squad,
                ssl.officers,
                s.name as subject_name,
                d.name as department_name,
                st.type,
                st.course,
                sl.semester
            FROM squad_subject_loads ssl
            JOIN subject_loads sl ON ssl.subject_load_id = sl.id
            JOIN subjects s ON sl.subject_id = s.id
            JOIN departments d ON sl.department_id = d.id
            JOIN squad_types st ON sl.squad_type_id = st.id
            WHERE ssl.officers LIKE '%' || ? || '%'
            ORDER BY s.name, ssl.squad
        """, (str(teacher_id),))
        
        connections = []
        for row in cursor.fetchall():
            officer_ids = []
            if row["officers"]:
                officer_ids = [id.strip() for id in row["officers"].split("/") if id.strip()]
            
            # Получаем имена всех преподавателей в этой связке
            officer_names = []
            if officer_ids:
                placeholders = ','.join('?' * len(officer_ids))
                cursor.execute(f"""
                    SELECT first_name, second_name, surname
                    FROM officers
                    WHERE id IN ({placeholders})
                    ORDER BY surname, first_name
                """, officer_ids)
                
                for officer in cursor.fetchall():
                    officer_names.append(f"{officer['surname']} {officer['first_name']} {officer['second_name']}")
            
            connections.append({
                "subject_load_id": row["subject_load_id"],
                "squad": row["squad"],
                "officer_ids": officer_ids,
                "officer_names": officer_names,
                "subject_name": row["subject_name"],
                "department_name": row["department_name"],
                "type": row["type"],
                "course": row["course"],
                "semester": row["semester"]
            })
        
        conn.close()
        
        result = {
            **dict(teacher),
            "connections": connections
        }
        
        print(f"✅ Данные преподавателя загружены, связок: {len(connections)}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей преподавателя: {str(e)}")

@app.post("/teachers")
def add_teacher(data: dict):
    """
    Добавить нового преподавателя
    """
    try:
        print(f"➕ Добавление нового преподавателя: {data}")
        
        first_name = data.get("first_name", "").strip()
        second_name = data.get("second_name", "").strip()
        surname = data.get("surname", "").strip()
        
        # Валидация
        if not all([first_name, second_name, surname]):
            raise HTTPException(status_code=400, detail="Все поля (имя, отчество, фамилия) обязательны")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка уникальности
        cursor.execute("""
            SELECT id FROM officers 
            WHERE first_name = ? AND second_name = ? AND surname = ?
        """, (first_name, second_name, surname))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Преподаватель с таким ФИО уже существует")
        
        # Добавление преподавателя
        cursor.execute("""
            INSERT INTO officers (first_name, second_name, surname)
            VALUES (?, ?, ?)
        """, (first_name, second_name, surname))
        
        teacher_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ Преподаватель добавлен, ID={teacher_id}")
        return {"success": True, "message": "Преподаватель добавлен", "id": teacher_id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления преподавателя: {str(e)}")

@app.put("/teachers/{teacher_id}")
def update_teacher(teacher_id: int, data: dict):
    """
    Обновить данные преподавателя
    """
    try:
        print(f"🔄 Обновление преподавателя ID={teacher_id}: {data}")
        
        first_name = data.get("first_name", "").strip()
        second_name = data.get("second_name", "").strip()
        surname = data.get("surname", "").strip()
        
        # Валидация
        if not all([first_name, second_name, surname]):
            raise HTTPException(status_code=400, detail="Все поля (имя, отчество, фамилия) обязательны")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования преподавателя
        cursor.execute("SELECT id FROM officers WHERE id = ?", (teacher_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Преподаватель не найден")
        
        # Проверка уникальности (кроме текущего преподавателя)
        cursor.execute("""
            SELECT id FROM officers 
            WHERE first_name = ? AND second_name = ? AND surname = ?
            AND id != ?
        """, (first_name, second_name, surname, teacher_id))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Преподаватель с таким ФИО уже существует")
        
        # Обновление данных
        cursor.execute("""
            UPDATE officers 
            SET first_name = ?, second_name = ?, surname = ?
            WHERE id = ?
        """, (first_name, second_name, surname, teacher_id))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Данные преподавателя обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления преподавателя: {str(e)}")

@app.delete("/teachers/{teacher_id}")
def delete_teacher(teacher_id: int):
    """
    Удалить преподавателя (мягкое удаление)
    """
    try:
        print(f"🗑️ Мягкое удаление преподавателя ID={teacher_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Проверка существования преподавателя
        cursor.execute("SELECT first_name, second_name, surname FROM officers WHERE id = ?", (teacher_id,))
        teacher = cursor.fetchone()
        if not teacher:
            raise HTTPException(status_code=404, detail="Преподаватель не найден")
        
        print("111")
        # Мягкое удаление:
        # 1. Обновляем уроки - очищаем поле officer_id
        cursor.execute("""
            UPDATE lessons 
            SET officer_id = NULL 
            WHERE officer_id = ?
        """, (teacher_id, ))
        print(f"✅ Очищено поле officer_id в {cursor.rowcount} уроках")
        
        # 2. Удаляем преподавателя из squad_subject_loads
        cursor.execute("""
            SELECT subject_load_id, squad, officers 
            FROM squad_subject_loads 
            WHERE officers LIKE '%' || ? || '%'
        """, (str(teacher_id),))
        
        loads = cursor.fetchall()
        for row in loads:
            officers = row["officers"]
            if officers:
                # Удаляем преподавателя из строки
                officer_list = [o.strip() for o in officers.split("/") if o.strip()]
                officer_list = [o for o in officer_list if o != str(teacher_id)]
                new_officers = "/".join(officer_list)
                
                cursor.execute("""
                    UPDATE squad_subject_loads 
                    SET officers = ? 
                    WHERE subject_load_id = ? AND squad = ?
                """, (new_officers, row["subject_load_id"], row["squad"]))
        
        print(f"✅ Преподаватель удален из {len(loads)} связок")
        
        # 3. Удаляем самого преподавателя
        cursor.execute("DELETE FROM officers WHERE id = ?", (teacher_id,))
        
        conn.commit()
        conn.close()
        
        teacher_name = f"{teacher['surname']} {teacher['first_name']} {teacher['second_name']}"
        return {"success": True, "message": f"Преподаватель {teacher_name} удален"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления преподавателя: {str(e)}")

@app.get("/teachers/{teacher_id}/available-connections")
def get_available_connections(teacher_id: int):
    """
    Получить доступные связки для добавления преподавателя
    """
    try:
        print(f"📊 Получение доступных связок для преподавателя ID={teacher_id}")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Связки, где преподавателя еще нет
        cursor.execute("""
            SELECT 
                ssl.subject_load_id,
                ssl.squad,
                ssl.officers,
                s.name as subject_name,
                d.name as department_name,
                st.type,
                st.course,
                sl.semester
            FROM squad_subject_loads ssl
            JOIN subject_loads sl ON ssl.subject_load_id = sl.id
            JOIN subjects s ON sl.subject_id = s.id
            JOIN departments d ON sl.department_id = d.id
            JOIN squad_types st ON sl.squad_type_id = st.id
            WHERE ssl.officers NOT LIKE '%' || ? || '%'
            ORDER BY s.name, ssl.squad
        """, (str(teacher_id),))
        
        connections = []
        for row in cursor.fetchall():
            officer_ids = []
            officer_names = []
            
            if row["officers"]:
                officer_ids = [id.strip() for id in row["officers"].split("/") if id.strip()]
                
                # Получаем имена текущих преподавателей
                if officer_ids:
                    placeholders = ','.join('?' * len(officer_ids))
                    cursor.execute(f"""
                        SELECT first_name, second_name, surname
                        FROM officers
                        WHERE id IN ({placeholders})
                        ORDER BY surname, first_name
                    """, officer_ids)
                    
                    for officer in cursor.fetchall():
                        officer_names.append(f"{officer['surname']} {officer['first_name']} {officer['second_name']}")
            
            connections.append({
                "subject_load_id": row["subject_load_id"],
                "squad": row["squad"],
                "officers": officer_ids,
                "officer_names": officer_names,
                "subject_name": row["subject_name"],
                "department_name": row["department_name"],
                "type": row["type"],
                "course": row["course"],
                "semester": row["semester"]
            })
        
        conn.close()
        
        print(f"✅ Найдено доступных связок: {len(connections)}")
        return connections
        
    except Exception as e:
        print(f"❌ Ошибка получения доступных связок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных связок: {str(e)}")

@app.put("/teachers/subject-loads/{subject_load_id}/squads/{squad_number}/officers")
def update_connection_officers(subject_load_id: int, squad_number: str, data: dict):
    """
    Обновить список преподавателей в связке нагрузка-взвод
    """
    try:
        print(f"🔄 Обновление преподавателей в связке {subject_load_id}-{squad_number}")
        
        officers = data.get("officers", [])
        
        # Валидация: все преподаватели должны существовать
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for officer_id in officers:
            cursor.execute("SELECT id FROM officers WHERE id = ?", (officer_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail=f"Преподаватель с ID={officer_id} не найден")
        
        # Формируем строку преподавателей
        officers_str = "/".join(str(officer_id) for officer_id in officers)
        
        # Проверка существования связки
        cursor.execute("""
            SELECT subject_load_id FROM squad_subject_loads 
            WHERE subject_load_id = ? AND squad = ?
        """, (subject_load_id, squad_number))
        
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Связка не найдена")
        
        # Обновляем преподавателей
        cursor.execute("""
            UPDATE squad_subject_loads 
            SET officers = ? 
            WHERE subject_load_id = ? AND squad = ?
        """, (officers_str, subject_load_id, squad_number))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Преподаватели обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления преподавателей: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления преподавателей: {str(e)}")


# Запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)