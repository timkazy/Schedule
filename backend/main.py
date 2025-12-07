'''
from dotenv import load_dotenv
import os

from repository import database, queries

BACKEND_PORT = int(os.getenv('BACKEND_PORT'))

dbCreator = database.DatabaseCreator()
dbCreator.init_database()

dbInitializer = database.DatabaseInitializer()
dbInitializer.fill_data()

print(queries.get_input_data())
'''

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, joinedload

from dotenv import load_dotenv
from os import getenv

# --- Импорты моделей и схем ---
from repository.models.subjects import Subject
from repository.models.officers import Officer
from repository.models.squads import Squad
from repository.models.lessons import Lesson, Audience, LessonTime
from schemas import Subject as SubjectSchema, Officer as OfficerSchema, Squad as SquadSchema

# --- Настройки окружения ---
load_dotenv('config.env')

# --- Настройки БД ---
DATABASE_URL = f"sqlite:///{getenv('DATABASES_PATH')}/{getenv('DATABASE_NAME')}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# --- Инициализация приложения ---
app = FastAPI(title="Schedule API", version="1.0")

# --- CORS (для React) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Зависимость для получения сессии ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------------------------
# 🔹 Тестовый маршрут
# ---------------------------------------------------------------------------
@app.get("/api/hello")
def hello():
    return {"message": "FastAPI подключён к реальной базе данных ✅"}


# ---------------------------------------------------------------------------
# 🔹 Предметы (subjects)
# ---------------------------------------------------------------------------
@app.get("/api/subjects", response_model=list[SubjectSchema])
def get_subjects(db: Session = Depends(get_db)):
    """Получить все предметы"""
    subjects = db.query(Subject).all()
    return subjects


# ---------------------------------------------------------------------------
# 🔹 Офицеры (officers)
# ---------------------------------------------------------------------------
@app.get("/api/officers", response_model=list[OfficerSchema])
def get_officers(db: Session = Depends(get_db)):
    """Получить всех офицеров"""
    officers = db.query(Officer).all()
    return officers


# ---------------------------------------------------------------------------
# 🔹 Взвода (squads)
# ---------------------------------------------------------------------------
@app.get("/api/squads", response_model=list[SquadSchema])
def get_squads(db: Session = Depends(get_db)):
    """Получить все взвода"""
    squads = db.query(Squad).all()
    return squads


# ---------------------------------------------------------------------------
# 🔹 Один предмет по ID
# ---------------------------------------------------------------------------
@app.get("/api/subjects/{subject_id}", response_model=SubjectSchema)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Предмет не найден")
    return subject

@app.get("/api/schedule")
def get_schedule(db: Session = Depends(get_db)):
    lessons = (
        db.query(Lesson)
        .options(
            joinedload(Lesson.subject)
            .joinedload(Subject.subject_type),
            joinedload(Lesson.audience),
        )
        .all()
    )

    schedule_dict = {}

    for lesson in lessons:
        subject = lesson.subject
        squad_number = subject.squad_number
        squad = db.query(Squad).filter(Squad.number == squad_number).first()
        if not squad:
            continue

        day_name = squad.day
        date_str = lesson.date.strftime("%d.%m")

        # --- Создаём уровни структуры ---
        schedule_dict.setdefault(day_name, {}).setdefault(squad_number, {}).setdefault(date_str, [])

        # --- Добавляем ячейку ---
        schedule_dict[day_name][squad_number][date_str].append({
            "lessonId": lesson.id,
            "subjectId": subject.id,
            "subject": subject.name,
            "topicNumber": f"{subject.semester}.{subject.hours_count}",
            "type": subject.subject_type.name if subject.subject_type else None,
            "audience": str(lesson.audience.number) if lesson.audience else None,
            "audienceNumber": lesson.audience_number,
        })

    # --- Преобразуем в JSON-структуру ---
    result = []
    for day_name, platoons in schedule_dict.items():
        platoons_list = []
        for squad_number, columns in platoons.items():
            cols = []
            for date, cells in columns.items():
                cols.append({
                    "title": date,
                    "cells": cells
                })
            platoons_list.append({
                "id": squad_number,
                "platoonName": str(squad_number),
                "columns": cols
            })
        result.append({
            "dayName": day_name,
            "platoons": platoons_list
        })

    return result


# POST
@app.post("/api/schedule/savecell")
def save_cell(data: dict = Body(...), db: Session = Depends(get_db)):
    from repository.models.subjects import Subject, SubjectType
    from repository.models.lessons import Audience

    lesson_id = data.get("lessonId")
    subject_name = data.get("subject")
    lesson_type = data.get("type")
    audience = data.get("audience")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    subject = lesson.subject
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    # 1️⃣ Определяем тип предмета
    if lesson_type:
        subject_type = db.query(SubjectType).filter(SubjectType.name == lesson_type).first()
        if not subject_type:
            subject_type = SubjectType(name=lesson_type)
            db.add(subject_type)
            db.commit()
        new_type_id = subject_type.id
    else:
        new_type_id = subject.type_id

    # 2️⃣ Проверяем, существует ли уже другой предмет с такими параметрами
    duplicate = (
        db.query(Subject)
        .filter(
            Subject.name == (subject_name or subject.name),
            Subject.semester == subject.semester,
            Subject.squad_number == subject.squad_number,
            Subject.type_id == new_type_id,
            Subject.id != subject.id
        )
        .first()
    )

    if duplicate:
        # Уже есть такой предмет — просто используем его ID
        lesson.subject_id = duplicate.id
        print(f"🔄 Найден дубликат Subject ID={duplicate.id}, переназначаем lesson.")
    else:
        # Безопасно обновляем текущий предмет
        if subject_name:
            subject.name = subject_name
        subject.type_id = new_type_id
        db.add(subject)

    # 3️⃣ Аудитория
    if audience:
        aud = db.query(Audience).filter(Audience.number == audience).first()
        if not aud:
            aud = Audience(number=audience)
            db.add(aud)
            db.commit()
        lesson.audience_number = aud.number

    db.commit()
    return {"success": True, "lessonId": lesson.id}
