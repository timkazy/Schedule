from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, text
from typing import List, Optional, Dict, Any
from datetime import datetime
from . import models, schemas
from .database import string_to_list, list_to_string

# Универсальные CRUD операции
def get_all(model, db: Session, skip: int = 0, limit: int = 100):
    return db.query(model).offset(skip).limit(limit).all()

def get_by_id(model, db: Session, id: Any):
    return db.query(model).filter(model.id == id).first()

def create(model, db: Session, obj_in: schemas.BaseModel):
    obj_data = obj_in.model_dump()
    db_obj = model(**obj_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(model, db: Session, db_obj, obj_in: schemas.BaseModel):
    obj_data = obj_in.model_dump(exclude_unset=True)
    for field in obj_data:
        setattr(db_obj, field, obj_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(model, db: Session, id: Any):
    obj = db.query(model).filter(model.id == id).first()
    if obj:
        db.delete(obj)
        db.commit()
    return obj

# Специфические операции для расписания
def get_subjects_for_platoon(db: Session, platoon_id: str):
    query = db.query(
        models.SubjectLoad.id.label("subjectId"),
        models.Subject.name.label("subjectName")
    ).join(
        models.SquadSubjectLoad,
        models.SquadSubjectLoad.subject_load_id == models.SubjectLoad.id
    ).join(
        models.Subject,
        models.Subject.id == models.SubjectLoad.subject_id
    ).filter(
        models.SquadSubjectLoad.squad == platoon_id
    ).distinct().order_by(models.Subject.name)
    
    return query.all()

def get_topics_for_subject(db: Session, subject_load_id: int, lesson_type: Optional[str] = None):
    query = db.query(
        models.Theme.topic,
        models.Theme.subtopic,
        models.LessonType.name.label("typeOfActivity")
    ).join(
        models.LessonType,
        models.Theme.lesson_type_id == models.LessonType.id
    ).filter(
        models.Theme.subject_load_id == subject_load_id
    )
    
    if lesson_type:
        query = query.filter(models.LessonType.name == lesson_type)
    
    return query.order_by(models.Theme.topic, models.Theme.subtopic).all()

def get_lesson_types_for_subject(db: Session, subject_load_id: int):
    # Из subject_hours_load_count
    query1 = db.query(models.LessonType.name).join(
        models.SubjectHoursLoadCount,
        models.SubjectHoursLoadCount.lesson_type_id == models.LessonType.id
    ).filter(
        models.SubjectHoursLoadCount.subject_load_id == subject_load_id
    )
    
    # Из themes
    query2 = db.query(models.LessonType.name).join(
        models.Theme,
        models.Theme.lesson_type_id == models.LessonType.id
    ).filter(
        models.Theme.subject_load_id == subject_load_id
    )
    
    # Объединяем и получаем уникальные значения
    result = query1.union(query2).order_by(models.LessonType.name).all()
    return [row[0] for row in result]

def get_audiences_for_subject(db: Session, subject_load_id: int, lesson_type: Optional[str] = None):
    lesson_type_id = None
    if lesson_type:
        lesson_type_obj = db.query(models.LessonType).filter(
            models.LessonType.name == lesson_type
        ).first()
        if lesson_type_obj:
            lesson_type_id = lesson_type_obj.id
    
    query = db.query(models.SubjectHoursLoadCount.audiences).filter(
        models.SubjectHoursLoadCount.subject_load_id == subject_load_id
    )
    
    if lesson_type_id:
        query = query.filter(models.SubjectHoursLoadCount.lesson_type_id == lesson_type_id)
    
    rows = query.all()
    
    audience_set = set()
    for row in rows:
        if row.audiences:
            for a in string_to_list(row.audiences):
                if a.isdigit():
                    audience_set.add(int(a))
    
    return [{"id": a, "importance": 1} for a in sorted(audience_set)]

def get_teachers_for_platoon_and_subject(db: Session, platoon_id: str, subject_load_id: int):
    from sqlalchemy import func
    
    # Получаем строку с преподавателями
    squad_load = db.query(models.SquadSubjectLoad).filter(
        models.SquadSubjectLoad.squad == platoon_id,
        models.SquadSubjectLoad.subject_load_id == subject_load_id
    ).first()
    
    if not squad_load or not squad_load.officers:
        return []
    
    # Преобразуем строку в список ID
    officer_ids = [int(id_str) for id_str in string_to_list(squad_load.officers) if id_str.isdigit()]
    
    if not officer_ids:
        return []
    
    # Получаем преподавателей
    officers = db.query(models.Officer).filter(
        models.Officer.id.in_(officer_ids)
    ).all()
    
    # Форматируем ФИО
    return [
        f"{officer.surname} {officer.first_name} {officer.second_name}"
        for officer in officers
    ]

def get_schedule(db: Session):
    """Получить полное расписание"""
    # Получаем все взвода с днями
    squads = db.query(
        models.Squad.number.label("platoonId"),
        models.Squad.day
    ).distinct().order_by(models.Squad.day, models.Squad.number).all()
    
    result = []
    day_counter = 1
    current_day = None
    day_platoons = []
    
    for squad in squads:
        platoon_id = squad.platoonId
        day_name = squad.day
        
        if day_name != current_day:
            if current_day is not None:
                result.append({
                    "dayId": day_counter,
                    "platoons": day_platoons.copy()
                })
                day_counter += 1
                day_platoons = []
            current_day = day_name
        
        # INFO: предметы и аудитории - используем сырые запросы
        info_rows = db.execute(text("""
            SELECT DISTINCT 
                sl.id as subject_load_id,
                s.name as subject
            FROM squad_subject_loads ssl
            JOIN subject_loads sl ON ssl.subject_load_id = sl.id
            JOIN subjects s ON sl.subject_id = s.id
            WHERE ssl.squad = :platoon_id
        """), {"platoon_id": platoon_id}).fetchall()
        
        info = []
        for row in info_rows:
            # Получаем аудитории для предмета
            hour_loads = db.execute(text("""
                SELECT audiences 
                FROM subject_hours_load_count
                WHERE subject_load_id = :subject_load_id
            """), {"subject_load_id": row.subject_load_id}).fetchall()
            
            audience_set = set()
            for load in hour_loads:
                if load.audiences:
                    for a in string_to_list(load.audiences):
                        if a.isdigit():
                            audience_set.add(int(a))
            
            info.append({
                "subject_load_id": row.subject_load_id,
                "subject": row.subject,
                "audiences": sorted(audience_set)
            })
        
        # LESSONS - используем сырые запросы
        lessons = db.execute(text("""
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
            WHERE l.squad = :platoon_id
            ORDER BY l.date, l.sequence_number
        """), {"platoon_id": platoon_id}).fetchall()
        
        # Группируем по дате
        columns_map = {}
        for lesson in lessons:
            date_str = str(lesson.date).split(" ")[0]
            try:
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
                "lesson_id": lesson.lesson_id,
                "subject_load_id": lesson.subject_load_id,
                "subject": lesson.subject,
                "topic": int(lesson.topic) if lesson.topic and str(lesson.topic).isdigit() else None,
                "subtopic": int(lesson.subtopic) if lesson.subtopic and str(lesson.subtopic).isdigit() else None,
                "type": lesson.type,
                "audience": lesson.audience,
                "teacher": lesson.teacher
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
    
    return result

def get_all_holidays(db:Session):
    return db.query(models.Holiday).all()

def save_holiday(db: Session, data: dict):
    try:
        day = data.get("day")
        new_day = models.Holiday(day = day)
        db.add(new_day) # Аналог db.query().all().insert(new_day)
        db.commit()
    except Exception as e:
        db.rollback()
        return None
    return new_day

def delete_holiday(db: Session, data: dict):
    try:
        day = data.get("day")
        deleted = db.query(models.Holiday).filter(models.Holiday.day == day).delete()
        db.commit()
        return deleted
    
    except Exception as e:
        db.rollback()
        return None


def save_cell_data(db: Session, data: dict):
    """Обновить данные ячейки расписания"""
    lesson_id = data.get("lesson_id")
    
    if not lesson_id:
        return {"success": False, "error": "❌ Не указан lesson_id"}
    
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        return {"success": False, "error": f"Занятие с ID={lesson_id} не найдено"}
    
    updates = {}
    
    # 1. subject_load_id
    subject_load_id = data.get("subject_load_id")
    if subject_load_id and subject_load_id != "null":
        subject_load = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.id == int(subject_load_id)
        ).first()
        if subject_load:
            updates["subject_load_id"] = int(subject_load_id)
    elif subject_load_id in ("null", None):
        updates["subject_load_id"] = None
    
    # 2. audience
    audience = data.get("audience")
    if audience and audience != "null":
        audience_obj = db.query(models.Audience).filter(
            models.Audience.number == int(audience)
        ).first()
        if audience_obj:
            updates["audience"] = int(audience)
    elif audience in ("null", None):
        updates["audience"] = None
    
    # 3. teacher
    teacher = data.get("teacher")
    if teacher and teacher != "null" and teacher.strip():
        name_parts = teacher.strip().split()
        if len(name_parts) == 3:
            officer = db.query(models.Officer).filter(
                models.Officer.first_name == name_parts[0],
                models.Officer.second_name == name_parts[1],
                models.Officer.surname == name_parts[2]
            ).first()
            if officer:
                updates["officer_id"] = officer.id
    elif teacher in ("null", "", None):
        updates["officer_id"] = None
    
    # 4. theme
    topic = data.get("topic")
    subtopic = data.get("subtopic")
    if (subject_load_id and subject_load_id != "null" and
        topic and topic != "null" and
        subtopic and subtopic != "null"):
        
        theme = db.query(models.Theme).filter(
            models.Theme.subject_load_id == int(subject_load_id),
            models.Theme.topic == int(topic),
            models.Theme.subtopic == int(subtopic)
        ).first()
        if theme:
            updates["theme_id"] = theme.id
    elif topic in ("null", None) or subtopic in ("null", None):
        updates["theme_id"] = None
    
    # Применяем обновления
    if updates:
        for key, value in updates.items():
            setattr(lesson, key, value)
        db.commit()
        db.refresh(lesson)
    
    return {
        "success": True,
        "lessonId": lesson_id,
        "updatedData": {
            "id": lesson.id,
            "squad": lesson.squad,
            "theme_id": lesson.theme_id,
            "officer_id": lesson.officer_id,
            "subject_load_id": lesson.subject_load_id,
            "date": lesson.date,
            "sequence_number": lesson.sequence_number,
            "audience": lesson.audience
        }
    }

# Функции для работы с взводами
def get_platoon_details(db: Session, platoon_number: str):
    result = db.query(
        models.Squad.number,
        models.Squad.day,
        models.Squad.start_week,
        models.Squad.end_week,
        models.Squad.department_id,
        models.Department.name.label("department_name"),
        models.SquadType.id.label("squad_type_id"),
        models.SquadType.type,
        models.SquadType.course
    ).join(
        models.Department,
        models.Squad.department_id == models.Department.id
    ).join(
        models.SquadType,
        models.Squad.squad_type_id == models.SquadType.id
    ).filter(
        models.Squad.number == platoon_number
    ).first()
    
    if not result:
        return None
    
    # Преобразуем в словарь
    return {
        "number": result.number,
        "day": result.day,
        "start_week": result.start_week,
        "end_week": result.end_week,
        "department_id": result.department_id,
        "department_name": result.department_name,
        "squad_type_id": result.squad_type_id,
        "type": result.type,
        "course": result.course
    }

def update_platoon_data(db: Session, platoon_number: str, data: dict):
    platoon = db.query(models.Squad).filter(models.Squad.number == platoon_number).first()
    if not platoon:
        return None
    
    updates = {}
    
    if "squad_type_id" in data:
        squad_type = db.query(models.SquadType).filter(
            models.SquadType.id == data["squad_type_id"]
        ).first()
        if squad_type:
            updates["squad_type_id"] = data["squad_type_id"]
    
    if "day" in data:
        if 1 <= data["day"] <= 7:
            updates["day"] = data["day"]
    
    if "start_week" in data:
        if data["start_week"] is None:
            updates["start_week"] = None
        elif 1 <= data["start_week"] <= 52:
            updates["start_week"] = data["start_week"]
    
    if "end_week" in data:
        if data["end_week"] is None:
            updates["end_week"] = None
        elif 1 <= data["end_week"] <= 52:
            updates["end_week"] = data["end_week"]
    
    # Применяем обновления
    for key, value in updates.items():
        setattr(platoon, key, value)
    
    db.commit()
    db.refresh(platoon)
    return platoon

def rename_platoon(db: Session, old_number: str, new_number: str):
    # Проверяем существование старого взвода
    old_squad = db.query(models.Squad).filter(models.Squad.number == old_number).first()
    if not old_squad:
        return None
    
    # Проверяем, не занят ли новый номер
    existing_squad = db.query(models.Squad).filter(models.Squad.number == new_number).first()
    if existing_squad:
        return None
    
    # Обновляем номер во всех таблицах
    db.execute(text("""
        UPDATE squads SET number = :new_number WHERE number = :old_number
    """), {"new_number": new_number, "old_number": old_number})
    
    db.execute(text("""
        UPDATE squad_subject_loads SET squad = :new_number WHERE squad = :old_number
    """), {"new_number": new_number, "old_number": old_number})
    
    db.execute(text("""
        UPDATE lessons SET squad = :new_number WHERE squad = :old_number
    """), {"new_number": new_number, "old_number": old_number})
    
    db.commit()
    return new_number

def get_subject_load_details(db: Session, subject_load_id: int):
    # Основная информация
    load = db.query(
        models.SubjectLoad.id,
        models.SubjectLoad.subject_id,
        models.SubjectLoad.department_id,
        models.SubjectLoad.squad_type_id,
        models.SubjectLoad.semester,
        models.Subject.name.label("subject_name"),
        models.Department.name.label("department_name"),
        models.SquadType.type.label("squad_type_type"),  # переименуем чтобы не конфликтовало
        models.SquadType.course.label("squad_type_course")  # переименуем чтобы не конфликтовало
    ).join(
        models.Subject,
        models.SubjectLoad.subject_id == models.Subject.id
    ).join(
        models.Department,
        models.SubjectLoad.department_id == models.Department.id
    ).join(
        models.SquadType,
        models.SubjectLoad.squad_type_id == models.SquadType.id
    ).filter(
        models.SubjectLoad.id == subject_load_id
    ).first()
    
    if not load:
        return None
    
    # Привязанные взводы
    squads_rows = db.query(
        models.SquadSubjectLoad.squad.label("squad_number"),
        models.Department.name.label("department_name"),
        models.SquadSubjectLoad.officers
    ).join(
        models.Squad,
        models.SquadSubjectLoad.squad == models.Squad.number
    ).join(
        models.Department,
        models.Squad.department_id == models.Department.id
    ).filter(
        models.SquadSubjectLoad.subject_load_id == subject_load_id
    ).all()
    
    squads = []
    for row in squads_rows:
        officer_ids = []
        officers = []
        if row.officers:
            officer_ids = [int(id_str) for id_str in string_to_list(row.officers) if id_str.isdigit()]
            
            if officer_ids:
                officers_query = db.query(models.Officer).filter(
                    models.Officer.id.in_(officer_ids)
                ).all()
                officers = [
                    {
                        "id": o.id, 
                        "first_name": o.first_name, 
                        "second_name": o.second_name, 
                        "surname": o.surname
                    } 
                    for o in officers_query
                ]
        
        squads.append({
            "squad_number": row.squad_number,
            "department_name": row.department_name,
            "officer_ids": officer_ids,
            "officers": officers
        })
    
    # Часы нагрузки
    hours_rows = db.query(
        models.SubjectHoursLoadCount.lesson_type_id,
        models.LessonType.name.label("lesson_type_name"),
        models.SubjectHoursLoadCount.hours_count,
        models.SubjectHoursLoadCount.audiences
    ).join(
        models.LessonType,
        models.SubjectHoursLoadCount.lesson_type_id == models.LessonType.id
    ).filter(
        models.SubjectHoursLoadCount.subject_load_id == subject_load_id
    ).all()
    
    hours_load = []
    for row in hours_rows:
        audiences = string_to_list(row.audiences) if row.audiences else []
        hours_load.append({
            "lesson_type_id": row.lesson_type_id,
            "lesson_type_name": row.lesson_type_name,
            "hours_count": row.hours_count,
            "audiences": audiences
        })
    
    # Темы
    themes = db.query(
        models.Theme.id,
        models.Theme.lesson_type_id,
        models.LessonType.name.label("lesson_type_name"),
        models.Theme.topic,
        models.Theme.subtopic,
        models.Theme.hours_count,
        models.Theme.topic_name,
        models.Theme.subtopic_name
    ).join(
        models.LessonType,
        models.Theme.lesson_type_id == models.LessonType.id
    ).filter(
        models.Theme.subject_load_id == subject_load_id
    ).order_by(
        models.Theme.topic,
        models.Theme.subtopic
    ).all()
    
    themes_list = []
    for theme in themes:
        themes_list.append({
            "id": theme.id,
            "lesson_type_id": theme.lesson_type_id,
            "lesson_type_name": theme.lesson_type_name,
            "topic": theme.topic,
            "subtopic": theme.subtopic,
            "hours_count": theme.hours_count,
            "topic_name": theme.topic_name,
            "subtopic_name": theme.subtopic_name
        })
    
    # Собираем результат
    result = {
        "id": load.id,
        "subject_id": load.subject_id,
        "department_id": load.department_id,
        "squad_type_id": load.squad_type_id,
        "semester": load.semester,
        "subject_name": load.subject_name,
        "department_name": load.department_name,
        "type": load.squad_type_type,  # используем переименованное поле
        "course": load.squad_type_course,  # используем переименованное поле
        "squads": squads,
        "hours_load": hours_load,
        "themes": themes_list
    }
    
    return result


def get_audience_details(db: Session, audience_number: int):
    # Проверяем существование аудитории
    audience = db.query(models.Audience).filter(
        models.Audience.number == audience_number
    ).first()
    
    if not audience:
        return None
    
    # Статистика - разделим на два отдельных запроса
    
    # 1. Количество нагрузок, где аудитория упоминается
    load_count = db.query(
        func.count(func.distinct(models.SubjectHoursLoadCount.subject_load_id))
    ).filter(
        models.SubjectHoursLoadCount.audiences.like(f'%{audience_number}%')
    ).scalar() or 0
    
    # 2. Количество уроков в этой аудитории
    lessons_count = db.query(func.count(models.Lesson.id)).filter(
        models.Lesson.audience == audience_number
    ).scalar() or 0
    
    # 3. Последний урок в этой аудитории
    last_lesson_date = db.query(func.max(models.Lesson.date)).filter(
        models.Lesson.audience == audience_number
    ).scalar()
    
    stats = {
        "audience_number": audience_number,
        "load_count": load_count,
        "lessons_count": lessons_count,
        "last_lesson_date": last_lesson_date
    }
    
    # Нагрузки
    hour_loads_query = db.query(
        models.SubjectHoursLoadCount.subject_load_id,
        models.SubjectHoursLoadCount.lesson_type_id,
        models.SubjectHoursLoadCount.hours_count,
        models.SubjectHoursLoadCount.audiences,
        models.Subject.name.label("subject_name"),
        models.Department.name.label("department_name"),
        models.SquadType.type,
        models.SquadType.course,
        models.SubjectLoad.semester,
        models.LessonType.name.label("lesson_type_name")
    ).join(
        models.SubjectLoad,
        models.SubjectHoursLoadCount.subject_load_id == models.SubjectLoad.id
    ).join(
        models.Subject,
        models.SubjectLoad.subject_id == models.Subject.id
    ).join(
        models.Department,
        models.SubjectLoad.department_id == models.Department.id
    ).join(
        models.SquadType,
        models.SubjectLoad.squad_type_id == models.SquadType.id
    ).join(
        models.LessonType,
        models.SubjectHoursLoadCount.lesson_type_id == models.LessonType.id
    ).filter(
        models.SubjectHoursLoadCount.audiences.like(f'%{audience_number}%')
    ).order_by(
        models.Subject.name,
        models.LessonType.name
    ).all()
    
    hour_loads = []
    for row in hour_loads_query:
        audiences = string_to_list(row.audiences) if row.audiences else []
        hour_loads.append({
            "subject_load_id": row.subject_load_id,
            "lesson_type_id": row.lesson_type_id,
            "hours_count": row.hours_count,
            "audiences": audiences,
            "subject_name": row.subject_name,
            "department_name": row.department_name,
            "type": row.type,
            "course": row.course,
            "semester": row.semester,
            "lesson_type_name": row.lesson_type_name
        })
    
    result = {**stats, "hour_loads": hour_loads}
    return result

# Функции для работы с преподавателями
def get_teacher_details(db: Session, teacher_id: int):
    teacher = db.query(models.Officer).filter(models.Officer.id == teacher_id).first()
    if not teacher:
        return None
    
    # Связки с нагрузками
    connections_query = db.query(
        models.SquadSubjectLoad.subject_load_id,
        models.SquadSubjectLoad.squad,
        models.SquadSubjectLoad.officers,
        models.Subject.name.label("subject_name"),
        models.Department.name.label("department_name"),
        models.SquadType.type,
        models.SquadType.course,
        models.SubjectLoad.semester
    ).join(
        models.SubjectLoad,
        models.SquadSubjectLoad.subject_load_id == models.SubjectLoad.id
    ).join(
        models.Subject,
        models.SubjectLoad.subject_id == models.Subject.id
    ).join(
        models.Department,
        models.SubjectLoad.department_id == models.Department.id
    ).join(
        models.SquadType,
        models.SubjectLoad.squad_type_id == models.SquadType.id
    ).filter(
        models.SquadSubjectLoad.officers.like(f'%{teacher_id}%')
    ).order_by(
        models.Subject.name,
        models.SquadSubjectLoad.squad
    ).all()
    
    connections = []
    for row in connections_query:
        officer_ids = string_to_list(row.officers) if row.officers else []
        
        # Получаем имена всех преподавателей
        officer_names = []
        if officer_ids:
            officers = db.query(models.Officer).filter(
                models.Officer.id.in_([int(id_str) for id_str in officer_ids if id_str.isdigit()])
            ).order_by(models.Officer.surname, models.Officer.first_name).all()
            
            officer_names = [f"{o.surname} {o.first_name} {o.second_name}" for o in officers]
        
        connections.append({
            "subject_load_id": row.subject_load_id,
            "squad": row.squad,
            "officer_ids": officer_ids,
            "officer_names": officer_names,
            "subject_name": row.subject_name,
            "department_name": row.department_name,
            "type": row.type,
            "course": row.course,
            "semester": row.semester
        })
    
    result = {
        "id": teacher.id,
        "first_name": teacher.first_name,
        "second_name": teacher.second_name,
        "surname": teacher.surname,
        "full_name": f"{teacher.surname} {teacher.first_name} {teacher.second_name}",
        "connections": connections
    }
    
    return result