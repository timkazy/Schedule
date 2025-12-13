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


# Запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)