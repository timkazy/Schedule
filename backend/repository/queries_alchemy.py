# queries_alchemy.py
"""
Модуль для работы с БД через SQLAlchemy (безопасно для многопоточности)
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, Dict, Any
from datetime import datetime
from .database import string_to_list  # если нужно

def is_audience_available(db_session: Session, audience: int, date: str, less_number: int) -> bool:
    """
    Проверяет, свободна ли аудитория в указанное время.
    
    Args:
        db_session: SQLAlchemy сессия
        audience: Номер аудитории
        date: Дата в формате 'YYYY-MM-DD'
        less_number: Номер пары (1, 2, 3...)
    
    Returns:
        bool: True если аудитория свободна, False если занята
    """
    try:
        query = text("""
            SELECT COUNT(*) FROM lessons 
            WHERE audience = :audience 
            AND date = :date 
            AND sequence_number = :sequence_number
        """)
        
        result = db_session.execute(query, {
            'audience': audience,
            'date': date,
            'sequence_number': less_number
        })
        
        count = result.scalar()
        return count == 0  # Если нет занятий в это время - аудитория свободна
        
    except Exception as e:
        print(f"Database error in is_audience_available: {e}")
        return False

def is_officer_available(db_session: Session, officer_id: int, date: str, less_number: int) -> bool:
    """
    Проверяет, свободен ли преподаватель в указанное время.
    
    Args:
        db_session: SQLAlchemy сессия
        officer_id: ID преподавателя
        date: Дата в формате 'YYYY-MM-DD'
        less_number: Номер пары (1, 2, 3...)
    
    Returns:
        bool: True если преподаватель свободен, False если занят
    """
    try:
        query = text("""
            SELECT COUNT(*) FROM lessons 
            WHERE officer_id = :officer_id 
            AND date = :date 
            AND sequence_number = :sequence_number
        """)
        
        result = db_session.execute(query, {
            'officer_id': officer_id,
            'date': date,
            'sequence_number': less_number
        })
        
        count = result.scalar()
        return count == 0
        
    except Exception as e:
        print(f"Database error in is_officer_available: {e}")
        return False

def get_input_data(db_session: Session, day_number: Optional[int] = None) -> Dict:
    """
    Получает данные для генерации расписания через SQLAlchemy.
    
    Args:
        db_session: SQLAlchemy сессия
        day_number: Номер дня недели (1-7). Если None, возвращаются все дни.
    
    Returns:
        dict: Структурированные данные для планировщика
    """
    try:
        # Базовый запрос с DISTINCT и группировкой
        query_sql = """
            SELECT 
                sq.day as squad_day,
                sq.number as squad_number,
                subj.name as subject_name,
                GROUP_CONCAT(DISTINCT 
                    CASE 
                        WHEN ssl.officers IS NOT NULL AND ssl.officers != '' 
                        THEN ssl.officers 
                        ELSE NULL 
                    END
                ) as officers_list,
                GROUP_CONCAT(DISTINCT 
                    CASE 
                        WHEN shlc.audiences IS NOT NULL AND shlc.audiences != '' 
                        THEN shlc.audiences 
                        ELSE NULL 
                    END
                ) as audience_list,
                GROUP_CONCAT(DISTINCT lt.name) as lesson_type_list,
                t.topic || '.' || t.subtopic as theme_key,
                SUM(DISTINCT t.hours_count) as theme_hours
            FROM squads sq
            JOIN squad_subject_loads ssl ON sq.number = ssl.squad
            JOIN subject_loads sl ON ssl.subject_load_id = sl.id
            JOIN subjects subj ON sl.subject_id = subj.id
            LEFT JOIN subject_hours_load_count shlc ON sl.id = shlc.subject_load_id
            LEFT JOIN lesson_types lt ON shlc.lesson_type_id = lt.id
            LEFT JOIN themes t ON sl.id = t.subject_load_id
            WHERE sq.day IS NOT NULL
        """
        
        params = {}
        if day_number is not None:
            query_sql += " AND sq.day = :day"
            params['day'] = day_number
        
        query_sql += """
            GROUP BY sq.day, sq.number, subj.name, t.topic, t.subtopic
            HAVING theme_key IS NOT NULL
            ORDER BY sq.day, sq.number, subj.name, t.topic, t.subtopic
        """
        
        query = text(query_sql)
        result = db_session.execute(query, params)
        rows = result.fetchall()
        
        # Обработка результатов (та же логика, что и раньше)
        result_dict = {}
        for row in rows:
            day = row[0]  # День недели (1-7)
            squad = row[1]
            subject = row[2]
            officers_str = row[3] or ""
            audiences_str = row[4] or ""
            lesson_types_str = row[5] or ""
            theme_key = row[6] or ""
            theme_hours = row[7] or 1
            
            # Инициализируем структуру для дня
            if day not in result_dict:
                result_dict[day] = {}
            
            # Инициализируем структуру для взвода в этом дне
            if squad not in result_dict[day]:
                result_dict[day][squad] = {}
            
            # Инициализируем структуру для предмета
            if subject not in result_dict[day][squad]:
                result_dict[day][squad][subject] = {
                    'Аудитории': {},
                    'Офицеры': set(),
                    'Подтемы': {}
                }
            
            # Обрабатываем офицеров
            if officers_str:
                all_officers = []
                for officer_str in officers_str.split(','):
                    if officer_str:
                        officers = [int(o.strip()) for o in officer_str.split('/') if o.strip()]
                        all_officers.extend(officers)
                
                for officer_id in all_officers:
                    result_dict[day][squad][subject]['Офицеры'].add(officer_id)
            
            # Обрабатываем аудитории
            if audiences_str and lesson_types_str:
                audience_lists = audiences_str.split(',')
                lesson_type_lists = lesson_types_str.split(',')
                
                for aud_list, lesson_type in zip(audience_lists, lesson_type_lists):
                    if aud_list and lesson_type:
                        audiences = [a.strip() for a in aud_list.split('/') if a.strip()]
                        for audience in audiences:
                            if audience.isdigit():
                                aud_num = int(audience)
                                if aud_num in result_dict[day][squad][subject]['Аудитории']:
                                    current_types = result_dict[day][squad][subject]['Аудитории'][aud_num]
                                    if isinstance(current_types, list):
                                        if lesson_type not in current_types:
                                            current_types.append(lesson_type)
                                    elif current_types != lesson_type:
                                        result_dict[day][squad][subject]['Аудитории'][aud_num] = [current_types, lesson_type]
                                else:
                                    result_dict[day][squad][subject]['Аудитории'][aud_num] = lesson_type
            
            # Обрабатываем подтемы с часами
            if theme_key:
                if theme_key not in result_dict[day][squad][subject]['Подтемы']:
                    result_dict[day][squad][subject]['Подтемы'][theme_key] = theme_hours
        
        # Преобразуем множества в списки и сортируем подтемы
        for day in result_dict:
            for squad in result_dict[day]:
                for subject in result_dict[day][squad]:
                    result_dict[day][squad][subject]['Офицеры'] = sorted(list(result_dict[day][squad][subject]['Офицеры']))
                    
                    sorted_themes = {}
                    for theme_key in sorted(
                        result_dict[day][squad][subject]['Подтемы'].keys(),
                        key=lambda x: tuple(map(int, x.split('.')))
                    ):
                        sorted_themes[theme_key] = result_dict[day][squad][subject]['Подтемы'][theme_key]
                    
                    result_dict[day][squad][subject]['Подтемы'] = sorted_themes
        
        # Если запрашивался конкретный день, но данных нет, возвращаем пустой словарь с этим днем
        if day_number is not None and day_number not in result_dict:
            result_dict[day_number] = {}
        
        return result_dict
        
    except Exception as e:
        print(f"Database error in get_input_data: {e}")
        return {day_number: {}} if day_number is not None else {}