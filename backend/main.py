# backend/main.py

from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text 
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import traceback

from repository import crud, schemas, models, database
from repository.database import get_db, create_tables
from repository.initializer import init_database
from repository.scheduling import generate_and_save_schedule, WeekScheduler

from repository import auth, crud, schemas
from repository.database import get_db
from repository.auth import get_current_user, get_current_teacher, get_current_student

# Включите логирование SQL запросов
import logging
logging.basicConfig()
# logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

import calendar
from repository.schedule_generator import (
    generate_lessons_for_squad, clear_squad_lessons, 
    shift_squad_lessons, generate_lesson_dates_for_squad
)

# Создаем таблицы при запуске
create_tables()

app = FastAPI(title="Schedule API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Инициализируем базу данных при запуске
print("🔧 Инициализация базы данных...")
try:
    init_database()
    print("✅ База данных готова")
except Exception as e:
    print(f"⚠️ Предупреждение при инициализации БД: {e}")

# Вспомогательные функции
def convert_date_format(date_str: str) -> str:
    """Конвертирует дату из формата 'дд.мм' в 'YYYY-MM-DD'"""
    try:
        day, month = date_str.split('.')
        year = datetime.now().year
        return f"{year}-{int(month):02d}-{int(day):02d}"
    except:
        return date_str

# Эндпоинты аутентификации
@app.post("/auth/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Вход в систему"""
    print("1")

    user = crud.authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не активен"
        )
    
    # Создаем токен
    access_token_expires = timedelta(minutes=crud.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crud.create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role.name,
        "user_id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name
    }

@app.post("/auth/logout")
def logout():
    """Выход из системы (на клиенте просто удаляем токен)"""
    return {"message": "Успешный выход из системы"}

@app.get("/auth/me", response_model=schemas.UserInDB)
def get_current_user_info(current_user = Depends(get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user

# ---------------------------------------------------------------------------
# 🔹 GET /subjects
# ---------------------------------------------------------------------------
@app.get("/schedule/subjects")
def get_subjects(
    platoon_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Получить предметы для взвода"""
    try:
        if platoon_id:
            subjects = crud.get_subjects_for_platoon(db, platoon_id)
            result = [
                {
                    "subject_load_id": row.subjectId,
                    "name": row.subjectName
                }
                for row in subjects
            ]
            return result
        else:
            return []
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения предметов: {str(e)}")

@app.get("/schedule/topics")
def get_topics(
    subject_load_id: Optional[int] = Query(None),
    lesson_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        topics = crud.get_topics_for_subject(db, subject_load_id, lesson_type)
        return [
            {
                "topic": row.topic,
                "subtopic": row.subtopic,
                "typeOfActivity": row.typeOfActivity
            }
            for row in topics
        ]
    except Exception as e:
        print(f"❌ Ошибка в get_topics: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения тем: {e}")

@app.get("/schedule/lesson-types")
def get_lesson_types(
    subject_load_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        lesson_types = crud.get_lesson_types_for_subject(db, subject_load_id)
        return lesson_types
    except Exception as e:
        print(f"❌ Ошибка в get_lesson_types: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов занятий: {e}")

@app.get("/schedule/audiences")
def get_audiences(
    subject_load_id: Optional[int] = Query(None),
    lesson_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        audiences = crud.get_audiences_for_subject(db, subject_load_id, lesson_type)
        return audiences
    except Exception as e:
        print(f"❌ Ошибка в get_audiences: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения аудиторий: {e}")

@app.get("/schedule/teachers")
def get_teachers(
    platoon_id: Optional[str] = Query(None),
    subject_load_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        if platoon_id and subject_load_id:
            teachers = crud.get_teachers_for_platoon_and_subject(db, platoon_id, subject_load_id)
            return teachers
        else:
            return []
    except Exception as e:
        print(f"❌ Ошибка в get_teachers: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения преподавателей: {e}")

@app.get("/schedule")
def get_schedule(db: Session = Depends(get_db)):
    try:
        print("📊 Формирование расписания...")
        schedule = crud.get_schedule(db)
        print(f"✅ Сформировано расписание: {len(schedule)} дней")
        return schedule
    except Exception as e:
        print(f"❌ Ошибка в get_schedule: {e}")
        print(traceback.format_exc())
        return []

@app.post("/schedule/savecell")
def save_cell(data: dict, db: Session = Depends(get_db)):
    """Обновить данные ячейки по lesson_id"""
    try:
        print(f"📦 Получены данные: {data}")
        result = crud.save_cell_data(db, data)
        return result
    except Exception as e:
        print("❌ Ошибка в save_cell:", e)
        print(traceback.format_exc())
        return {"success": False, "error": str(e)}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Используйте text() для SQL выражений
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

# ------------------------ PLATOONS ------------------------
@app.get("/platoons/departments")
def get_departments(db: Session = Depends(get_db)):
    try:
        departments = db.query(models.Department).order_by(models.Department.name).all()
        return [{"id": dept.id, "name": dept.name} for dept in departments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения кафедр: {str(e)}")

@app.get("/platoons/squad-types")
def get_squad_types(db: Session = Depends(get_db)):
    try:
        squad_types = db.query(models.SquadType).order_by(models.SquadType.type, models.SquadType.course).all()
        return [{"id": st.id, "type": st.type, "course": st.course} for st in squad_types]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов взводов: {str(e)}")

@app.get("/platoons")
def get_platoons(
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(
            models.Squad.number,
            models.Department.name.label("department_name")
        ).join(
            models.Department,
            models.Squad.department_id == models.Department.id
        )
        
        if department_id:
            query = query.filter(models.Squad.department_id == department_id)
        
        platoons = query.order_by(models.Squad.number).all()
        return [{"number": row.number, "department_name": row.department_name} for row in platoons]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения взводов: {str(e)}")

@app.get("/platoons/{platoon_number}")
def get_platoon_details(platoon_number: str, db: Session = Depends(get_db)):
    try:
        print(f"🔍 Получение данных взвода: {platoon_number}")
        platoon = crud.get_platoon_details(db, platoon_number)
        if not platoon:
            raise HTTPException(status_code=404, detail="Взвод не найден")
        return dict(platoon)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения данных взвода: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения данных взвода: {str(e)}")

@app.put("/platoons/{platoon_number}")
def update_platoon(platoon_number: str, data: dict, db: Session = Depends(get_db)):
    """
    Обновить данные взвода и пересчитать расписание
    """
    try:
        print(f"🔄 Обновление взвода {platoon_number}: {data}")
        

        
        # Получаем текущие данные взвода
        current_squad = db.query(models.Squad).filter(
            models.Squad.number == platoon_number
        ).first()
        
        if not current_squad:
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        old_start_week = current_squad.start_week
        old_end_week = current_squad.end_week
        old_day = current_squad.day
        
        # Обновление полей
        if "squad_type_id" in data:
            squad_type = db.query(models.SquadType).filter(
                models.SquadType.id == data["squad_type_id"]
            ).first()
            if not squad_type:
                raise HTTPException(status_code=400, detail="Тип взвода не найден")
            current_squad.squad_type_id = data["squad_type_id"]
        
        new_day = old_day
        if "day" in data:
            if 1 <= data["day"] <= 7:
                current_squad.day = data["day"]
                new_day = data["day"]
            else:
                raise HTTPException(status_code=400, detail="День недели должен быть от 1 до 7")
        
        new_start_week = old_start_week
        if "start_week" in data:
            if data["start_week"] is None:
                current_squad.start_week = None
                new_start_week = None
            elif 1 <= data["start_week"] <= 52:
                current_squad.start_week = data["start_week"]
                new_start_week = data["start_week"]
            else:
                raise HTTPException(status_code=400, detail="Неделя начала должна быть от 1 до 52")
        
        new_end_week = old_end_week
        if "end_week" in data:
            if data["end_week"] is None:
                current_squad.end_week = None
                new_end_week = None
            elif 1 <= data["end_week"] <= 52:
                current_squad.end_week = data["end_week"]
                new_end_week = data["end_week"]
            else:
                raise HTTPException(status_code=400, detail="Неделя окончания должна быть от 1 до 52")
        
        # Валидация
        if (new_start_week is not None and new_end_week is not None and
            new_start_week >= new_end_week):
            raise HTTPException(status_code=400, detail="Неделя начала должна быть меньше недели окончания")
        
        # Проверяем изменения
        has_changes = any([
            "squad_type_id" in data,
            ("day" in data and data["day"] != old_day),
            ("start_week" in data and data.get("start_week") != old_start_week),
            ("end_week" in data and data.get("end_week") != old_end_week)
        ])
        
        if not has_changes:
            print("🔄 Нет изменений для обновления")
            return {"success": True, "message": "Нет изменений для обновления"}
        
        db.commit()
        db.refresh(current_squad)
        print(f"✅ Взвод {platoon_number} обновлен")
        
        # Определяем, нужно ли обновлять расписание
        schedule_needs_update = False
        schedule_reason = ""
        
        day_changed = "day" in data and data["day"] != old_day
        start_week_changed = ("start_week" in data and 
                             data.get("start_week") != old_start_week)
        end_week_changed = ("end_week" in data and 
                           data.get("end_week") != old_end_week)
        
        if day_changed:
            schedule_needs_update = True
            schedule_reason = "изменен день недели"
        
        if start_week_changed:
            schedule_needs_update = True
            if schedule_reason:
                schedule_reason += " и "
            schedule_reason += "изменена неделя начала"
        
        if end_week_changed:
            schedule_needs_update = True
            if schedule_reason:
                schedule_reason += " и "
            schedule_reason += "изменена неделя окончания"
        
        # Особые случаи: добавление или удаление недель
        if ("start_week" in data and data["start_week"] is None and old_start_week is not None):
            schedule_needs_update = True
            schedule_reason = "удалена неделя начала"
        
        if ("start_week" in data and data["start_week"] is not None and old_start_week is None):
            schedule_needs_update = True
            schedule_reason = "добавлена неделя начала"
        
        if ("end_week" in data and data["end_week"] is None and old_end_week is not None):
            schedule_needs_update = True
            schedule_reason = "удалена неделя окончания"
        
        if ("end_week" in data and data["end_week"] is not None and old_end_week is None):
            schedule_needs_update = True
            schedule_reason = "добавлена неделя окончания"
        
        print(f"📅 Нужно обновить расписание: {schedule_needs_update}, причина: {schedule_reason}")
        
        if not schedule_needs_update:
            print("📅 Параметры расписания не изменились - пропускаем обновление")
            return {"success": True, "message": "Данные обновлены"}
        
        # Проверяем, есть ли уже занятия у взвода
        lesson_count = db.execute(text("""
            SELECT COUNT(*) as count FROM lessons WHERE squad = :squad
        """), {"squad": platoon_number}).scalar()
        
        if lesson_count == 0:
            # Если занятий нет - создаем новые
            if current_squad.start_week and current_squad.end_week:
                print(f"📝 Создаем новое расписание...")
                squad_info = {
                    'day': current_squad.day,
                    'start_week': current_squad.start_week,
                    'end_week': current_squad.end_week
                }
                lessons_created = generate_lessons_for_squad(db, platoon_number, squad_info)
                print(f"✅ Создано {lessons_created} занятий")
            else:
                print("⚠️ Не указаны недели - расписание не создано")
        else:
            # Если занятия есть, анализируем изменения
            old_duration = old_end_week - old_start_week if old_end_week and old_start_week else 0
            new_duration = new_end_week - new_start_week if new_end_week and new_start_week else 0
            
            can_shift = (
                not day_changed and  # День недели не изменился
                new_start_week is not None and  # Новый start_week указан
                new_end_week is not None and    # Новый end_week указан
                old_start_week is not None and  # Старый start_week был указан
                old_end_week is not None and    # Старый end_week был указан
                new_duration >= old_duration    # Новый период не короче старого
            )
            
            if can_shift:
                # Можем просто сдвинуть занятия
                week_shift = new_start_week - old_start_week
                print(f"Сдвигаем занятия на {week_shift} недель")
                shift_squad_lessons(db, platoon_number, week_shift)
                
                # Если end_week изменился, добавляем или удаляем занятия
                if end_week_changed:
                    print("Корректируем занятия из-за изменения end_week")
                    
                    # Получаем текущие даты после сдвига
                    result = db.execute(text("""
                        SELECT DISTINCT date FROM lessons 
                        WHERE squad = :squad 
                        ORDER BY date
                    """), {"squad": platoon_number})
                    current_dates = [row.date for row in result.fetchall()]
                    
                    # Генерируем новые даты которые должны быть
                    squad_info = {
                        'day': current_squad.day,
                        'start_week': current_squad.start_week,
                        'end_week': current_squad.end_week
                    }
                    target_dates = generate_lesson_dates_for_squad(squad_info, db)
                    
                    # Находим даты которые нужно добавить
                    dates_to_add = [d for d in target_dates if d not in current_dates]
                    
                    # Находим даты которые нужно удалить
                    dates_to_remove = [d for d in current_dates if d not in target_dates]
                    
                    # Добавляем недостающие даты
                    for date in dates_to_add:
                        for seq_num in range(1, 5):
                            try:
                                db.execute(text("""
                                    INSERT OR IGNORE INTO lessons (squad, date, sequence_number)
                                    VALUES (:squad, :date, :seq)
                                """), {
                                    "squad": platoon_number,
                                    "date": date,
                                    "seq": seq_num
                                })
                            except Exception as e:
                                print(f"Ошибка добавления занятия: {e}")
                    
                    # Удаляем лишние даты
                    if dates_to_remove:
                        placeholders = ','.join(['?' for _ in dates_to_remove])
                        db.execute(text(f"""
                            DELETE FROM lessons 
                            WHERE squad = :squad AND date IN ({placeholders})
                        """), {"squad": platoon_number, **{f"p{i}": date for i, date in enumerate(dates_to_remove)}})
                        print(f"🗑️ Удалено занятий в {len(dates_to_remove)} дней")
                    
                    print(f"Добавлено занятий в {len(dates_to_add)} дней")
                    
            else:
                # Нельзя сдвинуть - пересоздаем полностью
                print("🔄 Пересоздаем расписание полностью...")
                clear_squad_lessons(db, platoon_number)
                
                if current_squad.start_week and current_squad.end_week:
                    squad_info = {
                        'day': current_squad.day,
                        'start_week': current_squad.start_week,
                        'end_week': current_squad.end_week
                    }
                    lessons_created = generate_lessons_for_squad(db, platoon_number, squad_info)
                    print(f"✅ Создано {lessons_created} занятий")
        
        return {"success": True, "message": "Данные и расписание обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления взвода: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления взвода: {str(e)}")
    
@app.post("/platoons/{platoon_number}/rename")
def rename_platoon(platoon_number: str, data: dict, db: Session = Depends(get_db)):
    try:
        new_number = data.get("newNumber")
        if not new_number:
            raise HTTPException(status_code=400, detail="Не указан новый номер")
        
        result = crud.rename_platoon(db, platoon_number, new_number)
        if not result:
            raise HTTPException(status_code=400, detail="Невозможно переименовать взвод")
        
        return {"success": True, "message": f"Взвод переименован в {new_number}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка переименования: {str(e)}")

@app.delete("/platoons/{platoon_number}")
def delete_platoon(platoon_number: str, db: Session = Depends(get_db)):
    try:
        # Проверяем существование взвода
        platoon = db.query(models.Squad).filter(models.Squad.number == platoon_number).first()
        if not platoon:
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        # Удаляем связанные данные
        db.query(models.Lesson).filter(models.Lesson.squad == platoon_number).delete()
        db.query(models.SquadSubjectLoad).filter(models.SquadSubjectLoad.squad == platoon_number).delete()
        db.delete(platoon)
        db.commit()
        
        return {"success": True, "message": "Взвод удален"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка удаления: {str(e)}")

@app.post("/platoons")
def add_platoon(data: dict, db: Session = Depends(get_db)):
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
        
        # Проверяем существование
        existing = db.query(models.Squad).filter(models.Squad.number == number).first()
        if existing:
            raise HTTPException(status_code=400, detail="Взвод с таким номером уже существует")
        
        dept = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not dept:
            raise HTTPException(status_code=400, detail="Кафедра не найдена")
        
        squad_type = db.query(models.SquadType).filter(models.SquadType.id == squad_type_id).first()
        if not squad_type:
            raise HTTPException(status_code=400, detail="Тип взвода не найден")
        
        # Создаем взвод
        squad = models.Squad(
            number=number,
            department_id=department_id,
            squad_type_id=squad_type_id,
            day=day,
            start_week=start_week,
            end_week=end_week
        )
        db.add(squad)
        db.commit()
        db.refresh(squad)
        
        # Создаем расписание для взвода, если указаны недели
        if start_week and end_week:
            print(f"📅 Создаем расписание для взвода {number}...")
            squad_info = {
                'day': day,
                'start_week': start_week,
                'end_week': end_week
            }
            
            from repository.schedule_generator import generate_lessons_for_squad
            lessons_created = generate_lessons_for_squad(db, number, squad_info)
            print(f"✅ Создано {lessons_created} занятий для взвода {number}")
        
        return {"success": True, "message": "Взвод и расписание созданы", "number": number}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления взвода: {str(e)}")

# ------------------------ DISCIPLINES ------------------------
@app.get("/disciplines/subject-loads")
def get_subject_loads(db: Session = Depends(get_db)):
    """
    Получить все нагрузки
    """
    try:
        print("🔄 Получение всех нагрузок")
        
        # Используем SQLAlchemy ORM с правильным join
        loads = db.query(
            models.SubjectLoad.id,
            models.Subject.name.label("subject_name"),
            models.Department.name.label("department_name"),
            models.SquadType.type,
            models.SquadType.course,
            models.SubjectLoad.semester
        ).join(
            models.Subject, models.SubjectLoad.subject_id == models.Subject.id
        ).join(
            models.Department, models.SubjectLoad.department_id == models.Department.id
        ).join(
            models.SquadType, models.SubjectLoad.squad_type_id == models.SquadType.id
        ).order_by(
            models.Subject.name,
            models.SquadType.course,
            models.SubjectLoad.semester
        ).all()
        
        # Преобразуем в список словарей
        result = []
        for load in loads:
            result.append({
                "id": load.id,
                "subject_name": load.subject_name,
                "department_name": load.department_name,
                "type": load.type,
                "course": load.course,
                "semester": load.semester
            })
        
        print(f"✅ Найдено нагрузок: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения нагрузок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения нагрузок: {str(e)}")
    
@app.get("/disciplines/platoon-loads/{platoon_number}")
def get_platoon_loads(platoon_number: str, db: Session = Depends(get_db)):
    """Получить все нагрузки, привязанные к взводу"""
    try:
        # Получаем все нагрузки, привязанные к взводу
        loads = db.query(
            models.SubjectLoad.id,
            models.Subject.name.label("subject_name"),
            models.Department.name.label("department_name"),
            models.SquadType.type,
            models.SquadType.course,
            models.SubjectLoad.semester,
            models.SquadSubjectLoad.officers
        ).join(
            models.SquadSubjectLoad, models.SquadSubjectLoad.subject_load_id == models.SubjectLoad.id
        ).join(
            models.Subject, models.Subject.id == models.SubjectLoad.subject_id
        ).join(
            models.Department, models.SubjectLoad.department_id == models.Department.id
        ).join(
            models.SquadType, models.SubjectLoad.squad_type_id == models.SquadType.id
        ).filter(
            models.SquadSubjectLoad.squad == platoon_number
        ).group_by(
            models.SubjectLoad.id
        ).order_by(
            models.Subject.name
        ).all()
        
        result = []
        for row in loads:
            # Парсим преподавателей
            officers = []
            if row.officers:
                officers = [int(id.strip()) for id in row.officers.split("/") if id.strip()]
            
            # Получаем часы нагрузки
            hours_load = db.query(
                models.SubjectHoursLoadCount.lesson_type_id,
                models.LessonType.name.label("lesson_type_name"),
                models.SubjectHoursLoadCount.hours_count,
                models.SubjectHoursLoadCount.audiences
            ).join(
                models.LessonType, models.SubjectHoursLoadCount.lesson_type_id == models.LessonType.id
            ).filter(
                models.SubjectHoursLoadCount.subject_load_id == row.id
            ).all()
            
            total_hours = sum([h.hours_count for h in hours_load]) if hours_load else 0
            
            result.append({
                "id": row.id,
                "subject_name": row.subject_name,
                "department_name": row.department_name,
                "type": row.type,
                "course": row.course,
                "semester": row.semester,
                "officers": officers,
                "total_hours": total_hours,
                "hours_load": [
                    {
                        "lesson_type_id": h.lesson_type_id,
                        "lesson_type_name": h.lesson_type_name,
                        "hours_count": h.hours_count,
                        "audiences": h.audiences
                    }
                    for h in hours_load
                ]
            })
        
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения нагрузок взвода: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения нагрузок взвода: {str(e)}")
    
@app.get("/disciplines/available-loads-for-platoon")
def get_available_loads_for_platoon(
    platoon_number: str = Query(...),
    db: Session = Depends(get_db)
):
    """Получить нагрузки, доступные для привязки к взводу"""
    try:
        # Получаем тип взвода
        platoon = db.query(models.Squad).filter(models.Squad.number == platoon_number).first()
        if not platoon:
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        squad_type_id = platoon.squad_type_id
        department_id = platoon.department_id
        
        # Получаем нагрузки, которые еще не привязаны к этому взводу
        loads = db.query(
            models.SubjectLoad.id,
            models.Subject.name.label("subject_name"),
            models.Department.name.label("department_name"),
            models.SquadType.type,
            models.SquadType.course,
            models.SubjectLoad.semester
        ).join(
            models.Subject, models.SubjectLoad.subject_id == models.Subject.id
        ).join(
            models.Department, models.SubjectLoad.department_id == models.Department.id
        ).join(
            models.SquadType, models.SubjectLoad.squad_type_id == models.SquadType.id
        ).filter(
            models.SubjectLoad.squad_type_id == squad_type_id,
            models.SubjectLoad.department_id == department_id
        ).filter(
            ~models.SubjectLoad.id.in_(
                db.query(models.SquadSubjectLoad.subject_load_id)
                .filter(models.SquadSubjectLoad.squad == platoon_number)
            )
        ).order_by(
            models.Subject.name,
            models.SquadType.course,
            models.SubjectLoad.semester
        ).all()
        
        result = []
        for load in loads:
            result.append({
                "id": load.id,
                "subject_name": load.subject_name,
                "department_name": load.department_name,
                "type": load.type,
                "course": load.course,
                "semester": load.semester
            })
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения доступных нагрузок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных нагрузок: {str(e)}")
    
@app.get("/disciplines/subject-loads/{subject_load_id}")
def get_subject_load_details_api(subject_load_id: int, db: Session = Depends(get_db)):
    try:
        print(f"🔄 Получение деталей нагрузки ID={subject_load_id}")
        details = crud.get_subject_load_details(db, subject_load_id)
        if not details:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        return details
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей нагрузки: {str(e)}")

@app.post("/disciplines/subject-loads")
def add_subject_load(data: dict, db: Session = Depends(get_db)):
    """Добавить новую нагрузку"""
    try:
        print(f"📦 Добавление новой нагрузки: {data}")
        
        subject_id = data.get("subject_id")
        department_id = data.get("department_id")
        squad_type_id = data.get("squad_type_id")
        semester = data.get("semester", 0)
        
        if not all([subject_id, department_id, squad_type_id]):
            raise HTTPException(status_code=400, detail="Не указаны обязательные поля")
        
        # Проверка уникальности
        existing = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.subject_id == subject_id,
            models.SubjectLoad.department_id == department_id,
            models.SubjectLoad.squad_type_id == squad_type_id,
            models.SubjectLoad.semester == semester
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Такая нагрузка уже существует")
        
        # Проверка существования предмета
        subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=400, detail="Предмет не найден")
        
        # Проверка существования кафедры
        department = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=400, detail="Кафедра не найден")
        
        # Проверка существования типа взвода
        squad_type = db.query(models.SquadType).filter(models.SquadType.id == squad_type_id).first()
        if not squad_type:
            raise HTTPException(status_code=400, detail="Тип взвода не найден")
        
        # Добавление нагрузки
        subject_load = models.SubjectLoad(
            subject_id=subject_id,
            department_id=department_id,
            squad_type_id=squad_type_id,
            semester=semester
        )
        db.add(subject_load)
        db.commit()
        db.refresh(subject_load)
        
        print(f"✅ Нагрузка добавлена, ID={subject_load.id}")
        return {"success": True, "message": "Нагрузка добавлена", "id": subject_load.id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления нагрузки: {str(e)}")

@app.put("/disciplines/subject-loads/{subject_load_id}")
def update_subject_load(subject_load_id: int, data: dict, db: Session = Depends(get_db)):
    """Обновить нагрузку"""
    try:
        print(f"🔄 Обновление нагрузки ID={subject_load_id}: {data}")
        
        # Проверка существования нагрузки
        subject_load = db.query(models.SubjectLoad).filter(models.SubjectLoad.id == subject_load_id).first()
        if not subject_load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Обновление полей
        if "subject_id" in data:
            subject = db.query(models.Subject).filter(models.Subject.id == data["subject_id"]).first()
            if not subject:
                raise HTTPException(status_code=400, detail="Предмет не найден")
            subject_load.subject_id = data["subject_id"]
        
        if "department_id" in data:
            department = db.query(models.Department).filter(models.Department.id == data["department_id"]).first()
            if not department:
                raise HTTPException(status_code=400, detail="Кафедра не найдена")
            subject_load.department_id = data["department_id"]
        
        if "squad_type_id" in data:
            squad_type = db.query(models.SquadType).filter(models.SquadType.id == data["squad_type_id"]).first()
            if not squad_type:
                raise HTTPException(status_code=400, detail="Тип взвода не найден")
            subject_load.squad_type_id = data["squad_type_id"]
        
        if "semester" in data:
            subject_load.semester = data["semester"]
        
        # Проверка уникальности после обновления
        existing = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.subject_id == subject_load.subject_id,
            models.SubjectLoad.department_id == subject_load.department_id,
            models.SubjectLoad.squad_type_id == subject_load.squad_type_id,
            models.SubjectLoad.semester == subject_load.semester,
            models.SubjectLoad.id != subject_load_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Такая нагрузка уже существует")
        
        db.commit()
        db.refresh(subject_load)
        
        return {"success": True, "message": "Нагрузка обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления нагрузки: {str(e)}")

@app.delete("/disciplines/subject-loads/{subject_load_id}")
def delete_subject_load(subject_load_id: int, db: Session = Depends(get_db)):
    """Удалить нагрузку"""
    try:
        print(f"🗑️ Удаление нагрузки ID={subject_load_id}")
        
        # Проверка существования нагрузки
        subject_load = db.query(models.SubjectLoad).filter(models.SubjectLoad.id == subject_load_id).first()
        if not subject_load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Удаление связанных данных в правильном порядке
        # 1. Удаляем темы
        db.query(models.Theme).filter(models.Theme.subject_load_id == subject_load_id).delete()
        
        # 2. Удаляем часы нагрузки
        db.query(models.SubjectHoursLoadCount).filter(
            models.SubjectHoursLoadCount.subject_load_id == subject_load_id
        ).delete()
        
        # 3. Удаляем привязки к взводам
        db.query(models.SquadSubjectLoad).filter(
            models.SquadSubjectLoad.subject_load_id == subject_load_id
        ).delete()
        
        # 4. Обновляем уроки (очищаем связанные поля)
        db.query(models.Lesson).filter(
            models.Lesson.subject_load_id == subject_load_id
        ).update({
            "theme_id": None,
            "subject_load_id": None,
            "audience": None
        })
        
        # 5. Удаляем саму нагрузку
        db.delete(subject_load)
        db.commit()
        
        return {"success": True, "message": "Нагрузка удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления нагрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления нагрузки: {str(e)}")

# Списки для форм
@app.get("/disciplines/subjects")
def get_subjects_list(db: Session = Depends(get_db)):
    """Получить все предметы"""
    try:
        subjects = db.query(models.Subject).order_by(models.Subject.name).all()
        return [{"id": subj.id, "name": subj.name} for subj in subjects]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения предметов: {str(e)}")

@app.get("/disciplines/departments")
def get_departments_list(db: Session = Depends(get_db)):
    """Получить все кафедры"""
    try:
        departments = db.query(models.Department).order_by(models.Department.name).all()
        return [{"id": dept.id, "name": dept.name} for dept in departments]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения кафедр: {str(e)}")

@app.get("/disciplines/squad-types")
def get_squad_types_list(db: Session = Depends(get_db)):
    """Получить все типы взводов"""
    try:
        squad_types = db.query(models.SquadType).order_by(models.SquadType.type, models.SquadType.course).all()
        return [{"id": st.id, "type": st.type, "course": st.course} for st in squad_types]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов взводов: {str(e)}")

@app.get("/disciplines/lesson-types")
def get_lesson_types_list(db: Session = Depends(get_db)):
    """Получить все типы занятий"""
    try:
        lesson_types = db.query(models.LessonType).order_by(models.LessonType.name).all()
        return [{"id": lt.id, "name": lt.name} for lt in lesson_types]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения типов занятий: {str(e)}")

@app.get("/disciplines/officers")
def get_officers_list(db: Session = Depends(get_db)):
    """Получить всех преподавателей"""
    try:
        officers = db.query(models.Officer).order_by(models.Officer.surname, models.Officer.first_name).all()
        return [
            {
                "id": officer.id,
                "first_name": officer.first_name,
                "second_name": officer.second_name,
                "surname": officer.surname
            }
            for officer in officers
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения преподавателей: {str(e)}")

@app.get("/disciplines/audiences")
def get_audiences_list(db: Session = Depends(get_db)):
    """Получить все аудитории"""
    try:
        audiences = db.query(models.Audience).order_by(models.Audience.number).all()
        return [{"id": aud.number, "number": aud.number} for aud in audiences]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения аудиторий: {str(e)}")

# Работа с привязанными взводами
@app.get("/disciplines/available-squads")
def get_available_squads(
    subject_load_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Получить доступные для привязки взводы"""
    try:
        # Получаем тип взвода из нагрузки
        subject_load = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.id == subject_load_id
        ).first()
        
        if not subject_load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Получаем взводы с таким же типом, которые еще не привязаны к этой нагрузке
        squads = db.query(
            models.Squad.number,
            models.Department.name.label("department_name")
        ).join(
            models.Department,
            models.Squad.department_id == models.Department.id
        ).filter(
            models.Squad.squad_type_id == subject_load.squad_type_id
        ).filter(
            ~models.Squad.number.in_(
                db.query(models.SquadSubjectLoad.squad)
                .filter(models.SquadSubjectLoad.subject_load_id == subject_load_id)
                .subquery()
            )
        ).order_by(
            models.Squad.number
        ).all()
        
        return [{"number": row.number, "department_name": row.department_name} for row in squads]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных взводов: {str(e)}")

@app.post("/disciplines/subject-loads/{subject_load_id}/squads")
def add_squad_to_subject_load(subject_load_id: int, data: dict, db: Session = Depends(get_db)):
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
        subject_load = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.id == subject_load_id
        ).first()
        if not subject_load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Проверка существования взвода
        squad_obj = db.query(models.Squad).filter(models.Squad.number == squad).first()
        if not squad_obj:
            raise HTTPException(status_code=404, detail="Взвод не найден")
        
        # Проверка, не привязан ли уже этот взвод
        existing = db.query(models.SquadSubjectLoad).filter(
            models.SquadSubjectLoad.subject_load_id == subject_load_id,
            models.SquadSubjectLoad.squad == squad
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Взвод уже привязан к этой нагрузке")
        
        # Проверка преподавателей
        for officer_id in officers:
            officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
            if not officer:
                raise HTTPException(status_code=400, detail=f"Преподаватель с ID={officer_id} не найден")
        
        # Формируем строку преподавателей
        officers_str = "/".join(str(officer_id) for officer_id in officers)
        
        # Добавляем привязку
        squad_subject_load = models.SquadSubjectLoad(
            subject_load_id=subject_load_id,
            squad=squad,
            officers=officers_str
        )
        db.add(squad_subject_load)
        db.commit()
        
        return {"success": True, "message": "Взвод привязан к нагрузке"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка привязки взвода: {str(e)}")

@app.put("/disciplines/subject-loads/{subject_load_id}/squads/{squad_number}")
def update_squad_subject_load(
    subject_load_id: int,
    squad_number: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Обновить привязку взвода к нагрузке"""
    try:
        print(f"🔄 Обновление привязки взвода {squad_number} к нагрузке {subject_load_id}")
        
        officers = data.get("officers", [])
        
        if not officers:
            raise HTTPException(status_code=400, detail="Не указаны преподаватели")
        
        # Проверка существования привязки
        squad_load = db.query(models.SquadSubjectLoad).filter(
            models.SquadSubjectLoad.subject_load_id == subject_load_id,
            models.SquadSubjectLoad.squad == squad_number
        ).first()
        
        if not squad_load:
            raise HTTPException(status_code=404, detail="Привязка не найдена")
        
        # Проверка преподавателей
        for officer_id in officers:
            officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
            if not officer:
                raise HTTPException(status_code=400, detail=f"Преподаватель с ID={officer_id} не найден")
        
        # Формируем строку преподавателей
        officers_str = "/".join(str(officer_id) for officer_id in officers)
        
        # Обновляем привязку
        squad_load.officers = officers_str
        db.commit()
        
        return {"success": True, "message": "Привязка обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления привязки: {str(e)}")

@app.delete("/disciplines/subject-loads/{subject_load_id}/squads/{squad_number}")
def delete_squad_subject_load(
    subject_load_id: int,
    squad_number: str,
    db: Session = Depends(get_db)
):
    """Отвязать взвод от нагрузки"""
    try:
        print(f"🔓 Отвязка взвода {squad_number} от нагрузки {subject_load_id}")
        
        # Проверка существования привязки
        squad_load = db.query(models.SquadSubjectLoad).filter(
            models.SquadSubjectLoad.subject_load_id == subject_load_id,
            models.SquadSubjectLoad.squad == squad_number
        ).first()
        
        if not squad_load:
            raise HTTPException(status_code=404, detail="Привязка не найдена")
        
        # Удаляем привязку
        db.delete(squad_load)
        
        # Удаляем уроки, связанные с этой привязкой
        db.query(models.Lesson).filter(
            models.Lesson.subject_load_id == subject_load_id,
            models.Lesson.squad == squad_number
        ).delete()
        
        db.commit()
        
        return {"success": True, "message": "Взвод отвязан от нагрузки"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка отвязки взвода: {str(e)}")

# Работа с часами нагрузки
@app.post("/disciplines/subject-loads/{subject_load_id}/hours")
def add_hours_load(subject_load_id: int, data: dict, db: Session = Depends(get_db)):
    """Добавить часы нагрузки для типа занятия"""
    try:
        print(f"➕ Добавление часов для нагрузки {subject_load_id}: {data}")
        
        lesson_type_id = data.get("lesson_type_id")
        hours_count = data.get("hours_count")
        audiences = data.get("audiences", "")
        
        if not lesson_type_id or not hours_count:
            raise HTTPException(status_code=400, detail="Не указаны обязательные поля")
        
        # Проверка существования нагрузки
        subject_load = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.id == subject_load_id
        ).first()
        if not subject_load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Проверка существования типа занятия
        lesson_type = db.query(models.LessonType).filter(
            models.LessonType.id == lesson_type_id
        ).first()
        if not lesson_type:
            raise HTTPException(status_code=400, detail="Тип занятия не найден")
        
        # Проверка, не добавлены ли уже часы для этого типа
        existing = db.query(models.SubjectHoursLoadCount).filter(
            models.SubjectHoursLoadCount.subject_load_id == subject_load_id,
            models.SubjectHoursLoadCount.lesson_type_id == lesson_type_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Часы для этого типа занятия уже добавлены")
        
        # Добавляем часы
        hour_load = models.SubjectHoursLoadCount(
            subject_load_id=subject_load_id,
            lesson_type_id=lesson_type_id,
            hours_count=hours_count,
            audiences=audiences
        )
        db.add(hour_load)
        db.commit()
        
        return {"success": True, "message": "Часы добавлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления часов: {str(e)}")

@app.put("/disciplines/subject-loads/{subject_load_id}/hours/{lesson_type_id}")
def update_hours_load(
    subject_load_id: int,
    lesson_type_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Обновить часы нагрузки для типа занятия"""
    try:
        print(f"🔄 Обновление часов для нагрузки {subject_load_id}, тип {lesson_type_id}: {data}")
        
        hours_count = data.get("hours_count")
        audiences = data.get("audiences", "")
        
        if not hours_count:
            raise HTTPException(status_code=400, detail="Не указано количество часов")
        
        # Проверка существования записи
        hour_load = db.query(models.SubjectHoursLoadCount).filter(
            models.SubjectHoursLoadCount.subject_load_id == subject_load_id,
            models.SubjectHoursLoadCount.lesson_type_id == lesson_type_id
        ).first()
        
        if not hour_load:
            raise HTTPException(status_code=404, detail="Запись о часах не найдена")
        
        # Обновляем запись
        hour_load.hours_count = hours_count
        hour_load.audiences = audiences
        db.commit()
        
        return {"success": True, "message": "Часы обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления часов: {str(e)}")

@app.delete("/disciplines/subject-loads/{subject_load_id}/hours/{lesson_type_id}")
def delete_hours_load(
    subject_load_id: int,
    lesson_type_id: int,
    db: Session = Depends(get_db)
):
    """Удалить часы нагрузки для типа занятия"""
    try:
        print(f"🗑️ Удаление часов для нагрузки {subject_load_id}, тип {lesson_type_id}")
        
        # Проверка существования записи
        hour_load = db.query(models.SubjectHoursLoadCount).filter(
            models.SubjectHoursLoadCount.subject_load_id == subject_load_id,
            models.SubjectHoursLoadCount.lesson_type_id == lesson_type_id
        ).first()
        
        if not hour_load:
            raise HTTPException(status_code=404, detail="Запись о часах не найдена")
        
        # Удаляем запись
        db.delete(hour_load)
        db.commit()
        
        return {"success": True, "message": "Часы удалены"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка удаления часов: {str(e)}")

# Работа с темами
@app.post("/disciplines/subject-loads/{subject_load_id}/themes")
def add_theme(subject_load_id: int, data: dict, db: Session = Depends(get_db)):
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
        
        # Проверка существования нагрузки
        subject_load = db.query(models.SubjectLoad).filter(
            models.SubjectLoad.id == subject_load_id
        ).first()
        if not subject_load:
            raise HTTPException(status_code=404, detail="Нагрузка не найдена")
        
        # Проверка существования типа занятия
        lesson_type = db.query(models.LessonType).filter(
            models.LessonType.id == lesson_type_id
        ).first()
        if not lesson_type:
            raise HTTPException(status_code=400, detail="Тип занятия не найден")
        
        # Проверка уникальности темы
        existing = db.query(models.Theme).filter(
            models.Theme.subject_load_id == subject_load_id,
            models.Theme.topic == topic,
            models.Theme.subtopic == subtopic
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Тема с таким номером уже существует")
        
        # Добавляем тему
        theme = models.Theme(
            subject_load_id=subject_load_id,
            lesson_type_id=lesson_type_id,
            topic=topic,
            subtopic=subtopic,
            hours_count=hours_count,
            topic_name=topic_name,
            subtopic_name=subtopic_name
        )
        db.add(theme)
        db.commit()
        db.refresh(theme)
        
        return {"success": True, "message": "Тема добавлена", "id": theme.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка добавления темы: {str(e)}")

@app.put("/disciplines/themes/{theme_id}")
def update_theme(theme_id: int, data: dict, db: Session = Depends(get_db)):
    """Обновить тему"""
    try:
        print(f"🔄 Обновление темы ID={theme_id}: {data}")
        
        # Проверка существования темы
        theme = db.query(models.Theme).filter(models.Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Тема не найдена")
        
        # Обновление полей
        if "lesson_type_id" in data:
            lesson_type = db.query(models.LessonType).filter(
                models.LessonType.id == data["lesson_type_id"]
            ).first()
            if not lesson_type:
                raise HTTPException(status_code=400, detail="Тип занятия не найден")
            theme.lesson_type_id = data["lesson_type_id"]
        
        if "topic" in data:
            theme.topic = data["topic"]
        
        if "subtopic" in data:
            theme.subtopic = data["subtopic"]
        
        if "hours_count" in data:
            theme.hours_count = data["hours_count"]
        
        if "topic_name" in data:
            theme.topic_name = data["topic_name"]
        
        if "subtopic_name" in data:
            theme.subtopic_name = data["subtopic_name"]
        
        # Проверка уникальности при изменении номера темы
        if "topic" in data or "subtopic" in data:
            existing = db.query(models.Theme).filter(
                models.Theme.subject_load_id == theme.subject_load_id,
                models.Theme.topic == theme.topic,
                models.Theme.subtopic == theme.subtopic,
                models.Theme.id != theme_id
            ).first()
            
            if existing:
                raise HTTPException(status_code=400, detail="Тема с таким номером уже существует")
        
        db.commit()
        db.refresh(theme)
        
        return {"success": True, "message": "Тема обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления темы: {str(e)}")

@app.delete("/disciplines/themes/{theme_id}")
def delete_theme(theme_id: int, db: Session = Depends(get_db)):
    """Удалить тему"""
    try:
        print(f"🗑️ Удаление темы ID={theme_id}")
        
        # Проверка существования темы
        theme = db.query(models.Theme).filter(models.Theme.id == theme_id).first()
        if not theme:
            raise HTTPException(status_code=404, detail="Тема не найдена")
        
        # Удаляем тему
        db.delete(theme)
        
        # Удаляем уроки, связанные с этой темой
        db.query(models.Lesson).filter(models.Lesson.theme_id == theme_id).delete()
        
        db.commit()
        
        return {"success": True, "message": "Тема удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка удаления темы: {str(e)}")

# ------------------------ AUDIENCE ------------------------
@app.get("/audience/audiences")
def get_audiences_api(db: Session = Depends(get_db)):
    """Получить все аудитории"""
    try:
        print("🔄 Получение всех аудиторий")
        
        # Получаем все аудитории
        audiences = db.query(models.Audience).order_by(models.Audience.number).all()
        
        result = []
        for audience in audiences:
            # Для каждой аудитории считаем статистику
            load_count = db.query(func.count(func.distinct(models.SubjectHoursLoadCount.subject_load_id))).filter(
                models.SubjectHoursLoadCount.audiences.like(f'%{audience.number}%')
            ).scalar()
            
            lessons_count = db.query(func.count(models.Lesson.id)).filter(
                models.Lesson.audience == audience.number
            ).scalar()
            
            last_lesson = db.query(models.Lesson).filter(
                models.Lesson.audience == audience.number
            ).order_by(models.Lesson.date.desc()).first()
            
            result.append({
                "number": audience.number,
                "load_count": load_count or 0,
                "lessons_count": lessons_count or 0,
                "last_lesson_date": last_lesson.date if last_lesson else None
            })
        
        print(f"✅ Найдено аудиторий: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения аудиторий: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения аудиторий: {str(e)}")
    
@app.get("/audience/audiences/{audience_number}")
def get_audience_details_api(audience_number: int, db: Session = Depends(get_db)):
    """Получить детальную информацию об аудитории"""
    try:
        print(f"🔄 Получение деталей аудитории №{audience_number}")
        details = crud.get_audience_details(db, audience_number)
        if not details:
            raise HTTPException(status_code=404, detail="Аудитория не найдена")
        return details
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей аудитории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей аудитории: {str(e)}")

@app.post("/audience/audiences")
def add_audience_api(data: dict, db: Session = Depends(get_db)):
    """Добавить новую аудиторию"""
    try:
        print(f"➕ Добавление новой аудитории: {data}")
        
        audience_number = data.get("number")
        
        if not audience_number:
            raise HTTPException(status_code=400, detail="Не указан номер аудитории")
        
        # Проверка существования аудитории
        existing = db.query(models.Audience).filter(
            models.Audience.number == audience_number
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Аудитория с таким номером уже существует")
        
        # Добавление аудитории
        audience = models.Audience(number=audience_number)
        db.add(audience)
        db.commit()
        
        print(f"✅ Аудитория №{audience_number} добавлена")
        return {"success": True, "message": f"Аудитория №{audience_number} добавлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления аудитории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления аудитории: {str(e)}")

@app.delete("/audience/audiences/{audience_number}")
def delete_audience_api(audience_number: int, db: Session = Depends(get_db)):
    """Удалить аудиторию"""
    try:
        print(f"🗑️ Удаление аудитории №{audience_number}")
        
        # Проверка существования аудитории
        audience = db.query(models.Audience).filter(
            models.Audience.number == audience_number
        ).first()
        if not audience:
            raise HTTPException(status_code=404, detail="Аудитория не найдена")
        
        # Мягкое удаление:
        # 1. Обновляем уроки - очищаем поле audience
        db.query(models.Lesson).filter(
            models.Lesson.audience == audience_number
        ).update({"audience": None})
        
        # 2. Удаляем аудиторию из subject_hours_load_count
        hour_loads = db.query(models.SubjectHoursLoadCount).filter(
            models.SubjectHoursLoadCount.audiences.like(f'%{audience_number}%')
        ).all()
        
        for hour_load in hour_loads:
            if hour_load.audiences:
                # Удаляем аудиторию из строки
                audience_list = [a.strip() for a in hour_load.audiences.split("/") if a.strip()]
                audience_list = [a for a in audience_list if a != str(audience_number)]
                new_audiences = "/".join(audience_list)
                hour_load.audiences = new_audiences
        
        # 3. Удаляем саму аудиторию
        db.delete(audience)
        db.commit()
        
        return {"success": True, "message": f"Аудитория №{audience_number} удалена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления аудитории: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления аудитории: {str(e)}")

@app.get("/audience/audiences/{audience_number}/available-hour-loads")
def get_available_hour_loads_api(audience_number: int, db: Session = Depends(get_db)):
    """Получить доступные для добавления аудитории нагрузки часов"""
    try:
        print(f"📊 Получение доступных нагрузок для аудитории №{audience_number}")
        
        # Нагрузки, где аудитории еще нет
        hour_loads = db.query(
            models.SubjectHoursLoadCount.subject_load_id,
            models.SubjectHoursLoadCount.lesson_type_id,
            models.SubjectHoursLoadCount.hours_count,
            models.SubjectHoursLoadCount.audiences,
            models.Subject.name.label("subject_name"),
            models.LessonType.name.label("lesson_type_name")
        ).join(
            models.SubjectLoad,
            models.SubjectHoursLoadCount.subject_load_id == models.SubjectLoad.id
        ).join(
            models.Subject,
            models.SubjectLoad.subject_id == models.Subject.id
        ).join(
            models.LessonType,
            models.SubjectHoursLoadCount.lesson_type_id == models.LessonType.id
        ).filter(
            ~models.SubjectHoursLoadCount.audiences.like(f'%{audience_number}%')
        ).order_by(
            models.Subject.name,
            models.LessonType.name
        ).all()
        
        result = []
        for row in hour_loads:
            audiences = []
            if row.audiences:
                audiences = [a.strip() for a in row.audiences.split("/") if a.strip()]
            
            result.append({
                "subject_load_id": row.subject_load_id,
                "lesson_type_id": row.lesson_type_id,
                "hours_count": row.hours_count,
                "audiences": audiences,
                "subject_name": row.subject_name,
                "lesson_type_name": row.lesson_type_name
            })
        
        print(f"✅ Найдено доступных нагрузок: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения доступных нагрузок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных нагрузок: {str(e)}")

@app.put("/audience/subject-loads/{subject_load_id}/lesson-types/{lesson_type_id}/audiences")
def update_hour_load_audiences_api(
    subject_load_id: int,
    lesson_type_id: int,
    data: dict,
    db: Session = Depends(get_db)
):
    """Обновить список аудиторий для нагрузки часов"""
    try:
        audiences = data.get("audiences", [])
        
        # Валидация: не более 3 аудиторий
        if len(audiences) > 3:
            raise HTTPException(status_code=400, detail="Максимум 3 аудитории на нагрузку")
        
        # Валидация: все аудитории должны существовать
        for audience in audiences:
            aud_obj = db.query(models.Audience).filter(
                models.Audience.number == audience
            ).first()
            if not aud_obj:
                raise HTTPException(status_code=400, detail=f"Аудитория №{audience} не найдена")
        
        # Формируем строку аудиторий
        audiences_str = "/".join(str(audience) for audience in audiences)
        
        # Проверка существования нагрузки часов
        hour_load = db.query(models.SubjectHoursLoadCount).filter(
            models.SubjectHoursLoadCount.subject_load_id == subject_load_id,
            models.SubjectHoursLoadCount.lesson_type_id == lesson_type_id
        ).first()
        if not hour_load:
            raise HTTPException(status_code=404, detail="Нагрузка часов не найдена")
        
        # Обновляем аудитории
        hour_load.audiences = audiences_str
        db.commit()
        
        return {"success": True, "message": "Аудитории обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления аудиторий: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления аудиторий: {str(e)}")

# Holidays
@app.get("/settings/get_holidays")
def get_all_holidays(db: Session = Depends(get_db)):
    return crud.get_all_holidays(db)

@app.post("/settings/save_holiday")
def save_holiday(day: dict, db: Session = Depends(get_db)):
    return crud.save_holiday(db, day)

@app.delete("/settings/delete_holiday")
def delete_holiday(day: dict, db: Session = Depends(get_db)):
    return crud.delete_holiday(db, day)

# ------------------------ TEACHERS ------------------------
@app.get("/teachers", response_model=List[schemas.Officer])
def get_teachers_api(db: Session = Depends(get_db)):
    """Получить всех преподавателей (для списка)"""
    try:
        print("🔄 Получение списка преподавателей")
        
        teachers = db.query(models.Officer).order_by(
            models.Officer.surname,
            models.Officer.first_name
        ).all()
        
        result = []
        for teacher in teachers:
            result.append({
                "id": teacher.id,
                "first_name": teacher.first_name,
                "second_name": teacher.second_name,
                "surname": teacher.surname,
                "full_name": f"{teacher.surname} {teacher.first_name} {teacher.second_name}"
            })
        
        print(f"✅ Найдено преподавателей: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения преподавателей: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения преподавателей: {str(e)}")

@app.get("/teachers/{teacher_id}")
def get_teacher_details_api(teacher_id: int, db: Session = Depends(get_db)):
    """Получить детальную информацию о преподавателе со связками"""
    try:
        print(f"🔄 Получение деталей преподавателя ID={teacher_id}")
        details = crud.get_teacher_details(db, teacher_id)
        if not details:
            raise HTTPException(status_code=404, detail="Преподаватель не найден")
        return details
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей преподавателя: {str(e)}")

@app.post("/teachers")
def add_teacher_api(data: dict, db: Session = Depends(get_db)):
    """Добавить нового преподавателя"""
    try:
        print(f"➕ Добавление нового преподавателя: {data}")
        
        first_name = data.get("first_name", "").strip()
        second_name = data.get("second_name", "").strip()
        surname = data.get("surname", "").strip()
        
        # Валидация
        if not all([first_name, second_name, surname]):
            raise HTTPException(status_code=400, detail="Все поля (имя, отчество, фамилия) обязательны")
        
        # Проверка уникальности
        existing = db.query(models.Officer).filter(
            models.Officer.first_name == first_name,
            models.Officer.second_name == second_name,
            models.Officer.surname == surname
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Преподаватель с таким ФИО уже существует")
        
        # Добавление преподавателя
        officer = models.Officer(
            first_name=first_name,
            second_name=second_name,
            surname=surname
        )
        db.add(officer)
        db.commit()
        db.refresh(officer)
        
        print(f"✅ Преподаватель добавлен, ID={officer.id}")
        return {"success": True, "message": "Преподаватель добавлен", "id": officer.id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления преподавателя: {str(e)}")

@app.put("/teachers/{teacher_id}")
def update_teacher_api(teacher_id: int, data: dict, db: Session = Depends(get_db)):
    """Обновить данные преподавателя"""
    try:
        print(f"🔄 Обновление преподавателя ID={teacher_id}: {data}")
        
        first_name = data.get("first_name", "").strip()
        second_name = data.get("second_name", "").strip()
        surname = data.get("surname", "").strip()
        
        # Валидация
        if not all([first_name, second_name, surname]):
            raise HTTPException(status_code=400, detail="Все поля (имя, отчество, фамилия) обязательны")
        
        # Проверка существования преподавателя
        officer = db.query(models.Officer).filter(models.Officer.id == teacher_id).first()
        if not officer:
            raise HTTPException(status_code=404, detail="Преподаватель не найден")
        
        # Проверка уникальности (кроме текущего преподавателя)
        existing = db.query(models.Officer).filter(
            models.Officer.first_name == first_name,
            models.Officer.second_name == second_name,
            models.Officer.surname == surname,
            models.Officer.id != teacher_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Преподаватель с таким ФИО уже существует")
        
        # Обновление данных
        officer.first_name = first_name
        officer.second_name = second_name
        officer.surname = surname
        db.commit()
        db.refresh(officer)
        
        return {"success": True, "message": "Данные преподавателя обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления преподавателя: {str(e)}")

@app.delete("/teachers/{teacher_id}")
def delete_teacher_api(teacher_id: int, db: Session = Depends(get_db)):
    """Удалить преподавателя (мягкое удаление)"""
    try:
        print(f"🗑️ Мягкое удаление преподавателя ID={teacher_id}")
        
        # Проверка существования преподавателя
        officer = db.query(models.Officer).filter(models.Officer.id == teacher_id).first()
        if not officer:
            raise HTTPException(status_code=404, detail="Преподаватель не найден")
        
        # Мягкое удаление:
        # 1. Обновляем уроки - очищаем поле officer_id
        db.query(models.Lesson).filter(
            models.Lesson.officer_id == teacher_id
        ).update({"officer_id": None})
        
        # 2. Удаляем преподавателя из squad_subject_loads
        squad_loads = db.query(models.SquadSubjectLoad).filter(
            models.SquadSubjectLoad.officers.like(f'%{teacher_id}%')
        ).all()
        
        for squad_load in squad_loads:
            if squad_load.officers:
                # Удаляем преподавателя из строки
                officer_list = [o.strip() for o in squad_load.officers.split("/") if o.strip()]
                officer_list = [o for o in officer_list if o != str(teacher_id)]
                new_officers = "/".join(officer_list)
                squad_load.officers = new_officers
        
        # 3. Удаляем самого преподавателя
        db.delete(officer)
        db.commit()
        
        teacher_name = f"{officer.surname} {officer.first_name} {officer.second_name}"
        return {"success": True, "message": f"Преподаватель {teacher_name} удален"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления преподавателя: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления преподавателя: {str(e)}")

@app.get("/teachers/{teacher_id}/available-connections")
def get_available_connections_api(teacher_id: int, db: Session = Depends(get_db)):
    """Получить доступные связки для добавления преподавателя"""
    try:
        print(f"📊 Получение доступных связок для преподавателя ID={teacher_id}")
        
        # Связки, где преподавателя еще нет
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
            ~models.SquadSubjectLoad.officers.like(f'%{teacher_id}%')
        ).order_by(
            models.Subject.name,
            models.SquadSubjectLoad.squad
        ).all()
        
        connections = []
        for row in connections_query:
            officer_ids = []
            officer_names = []
            
            if row.officers:
                officer_ids = [id_str.strip() for id_str in row.officers.split("/") if id_str.strip()]
                
                # Получаем имена текущих преподавателей
                if officer_ids:
                    officers = db.query(models.Officer).filter(
                        models.Officer.id.in_([int(id_str) for id_str in officer_ids if id_str.isdigit()])
                    ).order_by(models.Officer.surname, models.Officer.first_name).all()
                    
                    officer_names = [f"{o.surname} {o.first_name} {o.second_name}" for o in officers]
            
            connections.append({
                "subject_load_id": row.subject_load_id,
                "squad": row.squad,
                "officers": officer_ids,
                "officer_names": officer_names,
                "subject_name": row.subject_name,
                "department_name": row.department_name,
                "type": row.type,
                "course": row.course,
                "semester": row.semester
            })
        
        print(f"✅ Найдено доступных связок: {len(connections)}")
        return connections
        
    except Exception as e:
        print(f"❌ Ошибка получения доступных связок: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения доступных связок: {str(e)}")

@app.put("/teachers/subject-loads/{subject_load_id}/squads/{squad_number}/officers")
def update_connection_officers_api(
    subject_load_id: int,
    squad_number: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Обновить список преподавателей в связке нагрузка-взвод"""
    try:
        print(f"🔄 Обновление преподавателей в связке {subject_load_id}-{squad_number}")
        
        officers = data.get("officers", [])
        
        # Валидация: все преподаватели должны существовать
        for officer_id in officers:
            officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
            if not officer:
                raise HTTPException(status_code=400, detail=f"Преподаватель с ID={officer_id} не найден")
        
        # Формируем строку преподавателей
        officers_str = "/".join(str(officer_id) for officer_id in officers)
        
        # Проверка существования связки
        squad_load = db.query(models.SquadSubjectLoad).filter(
            models.SquadSubjectLoad.subject_load_id == subject_load_id,
            models.SquadSubjectLoad.squad == squad_number
        ).first()
        
        if not squad_load:
            raise HTTPException(status_code=404, detail="Связка не найдена")
        
        # Обновляем преподавателей
        squad_load.officers = officers_str
        db.commit()
        
        return {"success": True, "message": "Преподаватели обновлены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления преподавателей: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления преподавателей: {str(e)}")

# ------------------------ SUBJECTS ------------------------
@app.get("/subjects")
def get_subjects_api(db: Session = Depends(get_db)):
    """Получить все предметы"""
    try:
        print("🔄 Получение списка предметов")
        
        # Получаем все предметы
        subjects = db.query(models.Subject).order_by(models.Subject.name).all()
        
        result = []
        for subject in subjects:
            # Считаем количество нагрузок для каждого предмета
            loads_count = db.query(func.count(models.SubjectLoad.id)).filter(
                models.SubjectLoad.subject_id == subject.id
            ).scalar()
            
            result.append({
                "id": subject.id,
                "name": subject.name,
                "loads_count": loads_count
            })
        
        print(f"✅ Найдено предметов: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения предметов: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения предметов: {str(e)}")
    
@app.get("/subjects/{subject_id}")
def get_subject_details_api(subject_id: int, db: Session = Depends(get_db)):
    """Получить детальную информацию о предмете с нагрузками"""
    try:
        print(f"🔄 Получение деталей предмета ID={subject_id}")
        
        # Основная информация о предмете
        subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Предмет не найден")
        
        # Нагрузки этого предмета
        loads = db.query(
            models.SubjectLoad.id,
            models.SubjectLoad.semester,
            models.Department.name.label("department_name"),
            models.SquadType.type,
            models.SquadType.course
        ).join(
            models.Department,
            models.SubjectLoad.department_id == models.Department.id
        ).join(
            models.SquadType,
            models.SubjectLoad.squad_type_id == models.SquadType.id
        ).filter(
            models.SubjectLoad.subject_id == subject_id
        ).order_by(
            models.Department.name,
            models.SquadType.course,
            models.SubjectLoad.semester
        ).all()
        
        loads_list = []
        for row in loads:
            # Взводы для этой нагрузки
            squads = db.query(
                models.SquadSubjectLoad.squad.label("number"),
                models.Department.name.label("department_name")
            ).join(
                models.Squad,
                models.SquadSubjectLoad.squad == models.Squad.number
            ).join(
                models.Department,
                models.Squad.department_id == models.Department.id
            ).filter(
                models.SquadSubjectLoad.subject_load_id == row.id
            ).order_by(
                models.SquadSubjectLoad.squad
            ).all()
            
            # Статистика по нагрузке
            themes_count = db.query(models.Theme).filter(
                models.Theme.subject_load_id == row.id
            ).count()
            
            lesson_types_count = db.query(models.SubjectHoursLoadCount).filter(
                models.SubjectHoursLoadCount.subject_load_id == row.id
            ).distinct(models.SubjectHoursLoadCount.lesson_type_id).count()
            
            total_hours = db.query(func.sum(models.SubjectHoursLoadCount.hours_count)).filter(
                models.SubjectHoursLoadCount.subject_load_id == row.id
            ).scalar() or 0
            
            loads_list.append({
                "id": row.id,
                "semester": row.semester,
                "department_name": row.department_name,
                "type": row.type,
                "course": row.course,
                "squads": [{"number": s.number, "department_name": s.department_name} for s in squads],
                "themes_count": themes_count,
                "lesson_types_count": lesson_types_count,
                "total_hours": total_hours
            })
        
        result = {
            "id": subject.id,
            "name": subject.name,
            "loads_count": len(loads_list),
            "loads": loads_list
        }
        
        print(f"✅ Данные предмета загружены, нагрузок: {len(loads_list)}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей предмета: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей предмета: {str(e)}")

@app.post("/subjects")
def add_subject_api(data: dict, db: Session = Depends(get_db)):
    """Добавить новый предмет"""
    try:
        print(f"Добавление нового предмета: {data}")
        
        name = data.get("name", "").strip()
        
        if not name:
            raise HTTPException(status_code=400, detail="Название предмета обязательно")
        
        # Проверка уникальности
        existing = db.query(models.Subject).filter(models.Subject.name == name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Предмет с таким названием уже существует")
        
        # Добавление предмета
        subject = models.Subject(name=name)
        db.add(subject)
        db.commit()
        db.refresh(subject)
        
        print(f"✅ Предмет добавлен, ID={subject.id}")
        return {"success": True, "message": "Предмет добавлен", "id": subject.id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления предмета: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления предмета: {str(e)}")

@app.put("/subjects/{subject_id}")
def update_subject_api(subject_id: int, data: dict, db: Session = Depends(get_db)):
    """Обновить предмет"""
    try:
        print(f"🔄 Обновление предмета ID={subject_id}: {data}")
        
        name = data.get("name", "").strip()
        
        if not name:
            raise HTTPException(status_code=400, detail="Название предмета обязательно")
        
        # Проверка существования предмета
        subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Предмет не найден")
        
        # Проверка уникальности (кроме текущего предмета)
        existing = db.query(models.Subject).filter(
            models.Subject.name == name,
            models.Subject.id != subject_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Предмет с таким названием уже существует")
        
        # Обновление предмета
        subject.name = name
        db.commit()
        db.refresh(subject)
        
        return {"success": True, "message": "Предмет обновлен"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления предмета: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления предмета: {str(e)}")

@app.delete("/subjects/{subject_id}")
def delete_subject_api(subject_id: int, db: Session = Depends(get_db)):
    """Удалить предмет со всеми связанными данными"""
    try:
        print(f"🗑️ Удаление предмета ID={subject_id} со всеми связанными данными")
        
        # Проверка существования предмета
        subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Предмет не найден")
        
        # Получаем все нагрузки этого предмета
        load_ids = [load.id for load in db.query(models.SubjectLoad.id).filter(
            models.SubjectLoad.subject_id == subject_id
        ).all()]
        
        # Начинаем транзакцию для каскадного удаления
        try:
            if load_ids:
                # 1. Удаляем темы
                db.query(models.Theme).filter(
                    models.Theme.subject_load_id.in_(load_ids)
                ).delete(synchronize_session=False)
                
                # 2. Удаляем часы нагрузки
                db.query(models.SubjectHoursLoadCount).filter(
                    models.SubjectHoursLoadCount.subject_load_id.in_(load_ids)
                ).delete(synchronize_session=False)
                
                # 3. Удаляем привязки к взводам
                db.query(models.SquadSubjectLoad).filter(
                    models.SquadSubjectLoad.subject_load_id.in_(load_ids)
                ).delete(synchronize_session=False)
                
                # 4. Обновляем уроки (очищаем связанные поля)
                db.query(models.Lesson).filter(
                    models.Lesson.subject_load_id.in_(load_ids)
                ).update({
                    "theme_id": None,
                    "subject_load_id": None,
                    "audience": None
                }, synchronize_session=False)
                
                # 5. Удаляем сами нагрузки
                db.query(models.SubjectLoad).filter(
                    models.SubjectLoad.id.in_(load_ids)
                ).delete(synchronize_session=False)
            
            # 6. Удаляем сам предмет
            db.delete(subject)
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise
        
        subject_name = subject.name
        return {"success": True, "message": f"Предмет '{subject_name}' и все связанные данные удалены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления предмета: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления предмета: {str(e)}")

# ------------------------ DEPARTMENTS ------------------------
@app.get("/departments")
def get_departments_api(db: Session = Depends(get_db)):
    """Получить все кафедры"""
    try:
        print("🔄 Получение списка кафедр")
        
        # Получаем все кафедры
        departments = db.query(models.Department).order_by(models.Department.name).all()
        
        result = []
        for department in departments:
            # Считаем статистику для каждой кафедры отдельно
            squads_count = db.query(func.count(models.Squad.number)).filter(
                models.Squad.department_id == department.id
            ).scalar()
            
            loads_count = db.query(func.count(models.SubjectLoad.id)).filter(
                models.SubjectLoad.department_id == department.id
            ).scalar()
            
            result.append({
                "id": department.id,
                "name": department.name,
                "squads_count": squads_count,
                "loads_count": loads_count
            })
        
        print(f"✅ Найдено кафедр: {len(result)}")
        return result
        
    except Exception as e:
        print(f"❌ Ошибка получения кафедр: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения кафедр: {str(e)}")

@app.get("/departments/{department_id}")
def get_department_details_api(department_id: int, db: Session = Depends(get_db)):
    """Получить детальную информацию о кафедре со взводами и нагрузками"""
    try:
        print(f"🔄 Получение деталей кафедры ID={department_id}")
        
        # Основная информация о кафедре
        department = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Кафедра не найдена")
        
        # Взводы этой кафедры - преобразуем Row в словарь правильно
        squads = db.query(
            models.Squad.number,
            models.SquadType.type,
            models.SquadType.course,
            models.Squad.day,
            models.Squad.start_week,
            models.Squad.end_week
        ).join(
            models.SquadType,
            models.Squad.squad_type_id == models.SquadType.id
        ).filter(
            models.Squad.department_id == department_id
        ).order_by(
            models.Squad.number
        ).all()
        
        # Правильное преобразование Row в словарь
        squads_list = []
        for row in squads:
            squads_list.append({
                "number": row.number,
                "type": row.type,
                "course": row.course,
                "day": row.day,
                "start_week": row.start_week,
                "end_week": row.end_week
            })
        
        # Нагрузки этой кафедры
        loads = db.query(
            models.SubjectLoad.id,
            models.SubjectLoad.semester,
            models.Subject.name.label("subject_name"),
            models.SquadType.type,
            models.SquadType.course
        ).join(
            models.Subject,
            models.SubjectLoad.subject_id == models.Subject.id
        ).join(
            models.SquadType,
            models.SubjectLoad.squad_type_id == models.SquadType.id
        ).filter(
            models.SubjectLoad.department_id == department_id
        ).order_by(
            models.Subject.name,
            models.SquadType.course,
            models.SubjectLoad.semester
        ).all()
        
        loads_list = []
        for row in loads:
            # Взводы для этой нагрузки
            load_squads = db.query(models.SquadSubjectLoad.squad).filter(
                models.SquadSubjectLoad.subject_load_id == row.id
            ).order_by(models.SquadSubjectLoad.squad).all()
            
            # Статистика по нагрузке
            themes_count = db.query(models.Theme).filter(
                models.Theme.subject_load_id == row.id
            ).count()
            
            lesson_types_count = db.query(models.SubjectHoursLoadCount).filter(
                models.SubjectHoursLoadCount.subject_load_id == row.id
            ).distinct(models.SubjectHoursLoadCount.lesson_type_id).count()
            
            total_hours = db.query(func.sum(models.SubjectHoursLoadCount.hours_count)).filter(
                models.SubjectHoursLoadCount.subject_load_id == row.id
            ).scalar() or 0
            
            # Правильное преобразование
            loads_list.append({
                "id": row.id,
                "semester": row.semester,
                "subject_name": row.subject_name,
                "type": row.type,
                "course": row.course,
                "squads": [squad.squad for squad in load_squads],
                "themes_count": themes_count,
                "lesson_types_count": lesson_types_count,
                "total_hours": total_hours
            })
        
        result = {
            "id": department.id,
            "name": department.name,
            "squads_count": len(squads_list),
            "loads_count": len(loads_list),
            "squads": squads_list,
            "loads": loads_list
        }
        
        print(f"✅ Данные кафедры загружены, взводов: {len(squads_list)}, нагрузок: {len(loads_list)}")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка получения деталей кафедры: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка получения деталей кафедры: {str(e)}")
    
@app.post("/departments")
def add_department_api(data: dict, db: Session = Depends(get_db)):
    """Добавить новую кафедру"""
    try:
        print(f"➕ Добавление новой кафедры: {data}")
        
        name = data.get("name", "").strip()
        
        if not name:
            raise HTTPException(status_code=400, detail="Название кафедры обязательно")
        
        # Проверка уникальности
        existing = db.query(models.Department).filter(models.Department.name == name).first()
        if existing:
            raise HTTPException(status_code=400, detail="Кафедра с таким названием уже существует")
        
        # Добавление кафедры
        department = models.Department(name=name)
        db.add(department)
        db.commit()
        db.refresh(department)
        
        print(f"✅ Кафедра добавлена, ID={department.id}")
        return {"success": True, "message": "Кафедра добавлена", "id": department.id}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка добавления кафедры: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка добавления кафедры: {str(e)}")

@app.put("/departments/{department_id}")
def update_department_api(department_id: int, data: dict, db: Session = Depends(get_db)):
    """Обновить кафедру"""
    try:
        print(f"🔄 Обновление кафедры ID={department_id}: {data}")
        
        name = data.get("name", "").strip()
        
        if not name:
            raise HTTPException(status_code=400, detail="Название кафедры обязательно")
        
        # Проверка существования кафедры
        department = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Кафедра не найден")
        
        # Проверка уникальности (кроме текущей кафедры)
        existing = db.query(models.Department).filter(
            models.Department.name == name,
            models.Department.id != department_id
        ).first()
        
        if existing:
            raise HTTPException(status_code=400, detail="Кафедра с таким названием уже существует")
        
        # Обновление кафедры
        department.name = name
        db.commit()
        db.refresh(department)
        
        return {"success": True, "message": "Кафедра обновлена"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка обновления кафедры: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обновления кафедры: {str(e)}")

@app.delete("/departments/{department_id}")
def delete_department_api(department_id: int, db: Session = Depends(get_db)):
    """Удалить кафедру со всеми связанными данными"""
    try:
        print(f"🗑️ Удаление кафедры ID={department_id} со всеми связанными данными")
        
        # Проверка существования кафедры
        department = db.query(models.Department).filter(models.Department.id == department_id).first()
        if not department:
            raise HTTPException(status_code=404, detail="Кафедра не найдена")
        
        # Получаем все взводы этой кафедры
        squad_numbers = [squad.number for squad in db.query(models.Squad.number).filter(
            models.Squad.department_id == department_id
        ).all()]
        
        # Получаем все нагрузки этой кафедры
        load_ids = [load.id for load in db.query(models.SubjectLoad.id).filter(
            models.SubjectLoad.department_id == department_id
        ).all()]
        
        # Начинаем транзакцию для каскадного удаления
        try:
            if load_ids:
                # 1. Удаляем темы
                db.query(models.Theme).filter(
                    models.Theme.subject_load_id.in_(load_ids)
                ).delete(synchronize_session=False)
                
                # 2. Удаляем часы нагрузки
                db.query(models.SubjectHoursLoadCount).filter(
                    models.SubjectHoursLoadCount.subject_load_id.in_(load_ids)
                ).delete(synchronize_session=False)
                
                # 3. Удаляем привязки к взводам
                db.query(models.SquadSubjectLoad).filter(
                    models.SquadSubjectLoad.subject_load_id.in_(load_ids)
                ).delete(synchronize_session=False)
                
                # 4. Обновляем уроки (очищаем связанные поля)
                db.query(models.Lesson).filter(
                    models.Lesson.subject_load_id.in_(load_ids)
                ).update({
                    "theme_id": None,
                    "subject_load_id": None,
                    "audience": None
                }, synchronize_session=False)
                
                # 5. Удаляем сами нагрузки
                db.query(models.SubjectLoad).filter(
                    models.SubjectLoad.id.in_(load_ids)
                ).delete(synchronize_session=False)
            
            if squad_numbers:
                # 6. Обновляем уроки, связанные с взводами
                db.query(models.Lesson).filter(
                    models.Lesson.squad.in_(squad_numbers)
                ).update({"squad": None}, synchronize_session=False)
                
                # 7. Удаляем взводы
                db.query(models.Squad).filter(
                    models.Squad.number.in_(squad_numbers)
                ).delete(synchronize_session=False)
            
            # 8. Удаляем саму кафедру
            db.delete(department)
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise
        
        department_name = department.name
        return {"success": True, "message": f"Кафедра '{department_name}' и все связанные данные удалены"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Ошибка удаления кафедры: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления кафедры: {str(e)}")

@app.post("/schedule/generate")
def generate_schedule_api(
    day: Optional[int] = Query(None),
    strategy: str = Query("upsert", regex="^(upsert|replace|update)$"),
    academic_year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_teacher)
):
    """Запустить генерацию расписания"""
    try:
        print(f"👤 Пользователь {current_user.username} запускает генерацию")
        # Определяем дату начала учебного года
        academic_year_start = None
        if academic_year:
            academic_year_start = datetime(academic_year, 9, 1)
        
        # Вызываем функцию генерации
        result = generate_and_save_schedule(
            db_session=db,
            day=day,
            strategy=strategy,
            academic_year_start=academic_year_start
        )
        
        if result.get("success", False):
            return {
                "success": True,
                "message": "Расписание успешно сгенерировано и сохранено",
                "details": result
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка: {result.get('error', 'Неизвестная ошибка')}"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка: {str(e)}")

# Запуск сервера
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)