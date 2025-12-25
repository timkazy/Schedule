from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import calendar

def generate_lesson_dates_for_squad(squad_info: Dict[str, Any], db: Session) -> List[str]:
    """
    Генерирует список дат занятий для взвода
    """
    day = squad_info.get('day', 1)
    start_week = squad_info.get('start_week')
    end_week = squad_info.get('end_week')
    
    if not start_week or not end_week:
        return []
    
    # Получаем текущий год
    current_year = datetime.now().year
    
    # Получаем дату начала учебного года (1 сентября)
    start_date = datetime(current_year, 9, 1)
    
    # Находим первый день недели start_week
    days_to_add = (start_week - 1) * 7
    first_date = start_date + timedelta(days=days_to_add)
    
    # Находим день недели начала (понедельник = 1, воскресенье = 7)
    # SQLite: 1 = воскресенье, 2 = понедельник, ... 7 = суббота
    # Наш день: 1 = понедельник, 7 = воскресенье
    # Конвертируем
    start_weekday = first_date.weekday() + 1  # Python: 0 = понедельник
    
    # Находим нужный день недели
    if start_weekday > day:
        days_to_day = day - start_weekday + 7
    else:
        days_to_day = day - start_weekday
    
    first_lesson_date = first_date + timedelta(days=days_to_day)
    
    # Генерируем все даты
    dates = []
    current_date = first_lesson_date
    week_count = 0
    
    while week_count < (end_week - start_week + 1):
        dates.append(current_date.strftime('%Y-%m-%d'))
        current_date += timedelta(days=7)
        week_count += 1
    
    return dates

def generate_lessons_for_squad(db: Session, squad_number: str, squad_info: Dict[str, Any]) -> int:
    """
    Создает занятия для взвода
    """
    dates = generate_lesson_dates_for_squad(squad_info, db)
    
    lessons_created = 0
    for date in dates:
        for sequence_number in range(1, 5):  # 4 пары в день
            try:
                db.execute(text("""
                    INSERT INTO lessons (squad, date, sequence_number)
                    VALUES (:squad, :date, :sequence)
                """), {
                    "squad": squad_number,
                    "date": date,
                    "sequence": sequence_number
                })
                lessons_created += 1
            except Exception as e:
                print(f"Ошибка создания занятия: {e}")
    
    db.commit()
    return lessons_created

def clear_squad_lessons(db: Session, squad_number: str):
    """Удалить все занятия взвода"""
    db.execute(text("DELETE FROM lessons WHERE squad = :squad"), {"squad": squad_number})
    db.commit()

def shift_squad_lessons(db: Session, squad_number: str, week_shift: int):
    """Сдвинуть занятия взвода на указанное количество недель"""
    if week_shift == 0:
        return
    
    # Получаем все даты занятий взвода
    result = db.execute(text("""
        SELECT DISTINCT date FROM lessons 
        WHERE squad = :squad 
        ORDER BY date
    """), {"squad": squad_number})
    
    dates = [row.date for row in result.fetchall()]
    
    for old_date in dates:
        try:
            new_date = (datetime.strptime(old_date, '%Y-%m-%d') + 
                       timedelta(weeks=week_shift)).strftime('%Y-%m-%d')
            
            # Обновляем дату
            db.execute(text("""
                UPDATE lessons 
                SET date = :new_date 
                WHERE squad = :squad AND date = :old_date
            """), {
                "squad": squad_number,
                "old_date": old_date,
                "new_date": new_date
            })
        except Exception as e:
            print(f"Ошибка сдвига занятия: {e}")
    
    db.commit()