"""
Данный модуль описывает запросы к БД schedule на языке SQL
"""

import sqlite3
import os
import typing
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('config.env')

# Работа с относительными путями
from pathlib import Path
BASE_DIR = Path(__file__).parent.parent
db_path = BASE_DIR / "databases" / "database.db"
conn: typing.Optional[sqlite3.Connection] = sqlite3.connect(db_path)

def is_audience_available(audience: int, date: str, less_number: int) -> bool:
    """
        Проверяет, свободна ли аудитория в указанное время.
        
        Args:
            audience: Номер аудитории
            date: Дата в формате 'YYYY-MM-DD'
            less_number: Номер пары (1, 2, 3...)
        
        Returns:
            bool: True если аудитория свободна, False если занята
    """
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT COUNT(*) FROM lessons 
            WHERE audience = ? 
            AND date = ? 
            AND sequence_number = ?
        """, (audience, date, less_number))
        
        count = cursor.fetchone()[0]
        return count == 0  # Если нет занятий в это время - аудитория свободна
        
    except sqlite3.Error as e:
        print(f"Database error in is_audience_available: {e}")
        return False
    finally:
        cursor.close()

def is_officer_available(officer_id: int, date: str, less_number: int) -> bool:
    """
        Проверяет, свободен ли преподаватель в указанное время.
        
        Args:
            officer_id: ID преподавателя
            date: Дата в формате 'YYYY-MM-DD'
            less_number: Номер пары (1, 2, 3...)
        
        Returns:
            bool: True если преподаватель свободен, False если занят
    """
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT COUNT(*) FROM lessons 
            WHERE officer_id = ? 
            AND date = ? 
            AND sequence_number = ?
        """, (officer_id, date, less_number))
        
        count = cursor.fetchone()[0]
        return count == 0  # Если нет занятий в это время - преподаватель свободен
        
    except sqlite3.Error as e:
        print(f"Database error in is_officer_available: {e}")
        return False
    finally:
        cursor.close()

def get_input_data(day_number: int = None):
    """
    Args:
        day_number: Номер дня недели (1-7). Если None, возвращаются все дни.
    
    Returns:
        dict: {
            день_недели: {
                номер_взвода: {
                    название_предмета: {
                        'Аудитории': {номер_аудитории: тип_занятия, ...},
                        'Офицеры': [id_офицера, ...],
                        'Подтемы': {
                            'тема.подтема': количество_часов,
                            ...
                        }
                    },
                    ...
                },
                ...
            },
            ...
        }
    """
    cursor = conn.cursor()
    try:
        # Базовый запрос с DISTINCT и группировкой
        query = """
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
        
        # Добавляем фильтр по дню, если указан
        params = []
        if day_number is not None:
            query += " AND sq.day = ?"
            params.append(day_number)
        
        query += """
            GROUP BY sq.day, sq.number, subj.name, t.topic, t.subtopic
            HAVING theme_key IS NOT NULL
            ORDER BY sq.day, sq.number, subj.name, t.topic, t.subtopic
        """
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        result = {}
        for row in rows:
            day = row[0]  # День недели (1-7)
            squad = row[1]
            subject = row[2]
            officers_str = row[3] or ""
            audiences_str = row[4] or ""
            lesson_types_str = row[5] or ""
            theme_key = row[6] or ""
            theme_hours = row[7] or 1  # Количество часов для подтемы
            
            # Инициализируем структуру для дня
            if day not in result:
                result[day] = {}
            
            # Инициализируем структуру для взвода в этом дне
            if squad not in result[day]:
                result[day][squad] = {}
            
            # Инициализируем структуру для предмета
            if subject not in result[day][squad]:
                result[day][squad][subject] = {
                    'Аудитории': {},
                    'Офицеры': set(),
                    'Подтемы': {}  # Словарь для хранения подтем с часами
                }
            
            # Обрабатываем офицеров
            if officers_str:
                # Может быть несколько строк офицеров через запятую
                all_officers = []
                for officer_str in officers_str.split(','):
                    if officer_str:
                        officers = [int(o.strip()) for o in officer_str.split('/') if o.strip()]
                        all_officers.extend(officers)
                
                for officer_id in all_officers:
                    result[day][squad][subject]['Офицеры'].add(officer_id)
            
            # Обрабатываем аудитории
            if audiences_str and lesson_types_str:
                # Разбиваем уроки и аудитории
                audience_lists = audiences_str.split(',')
                lesson_type_lists = lesson_types_str.split(',')
                
                for aud_list, lesson_type in zip(audience_lists, lesson_type_lists):
                    if aud_list and lesson_type:
                        audiences = [a.strip() for a in aud_list.split('/') if a.strip()]
                        for audience in audiences:
                            if audience.isdigit():
                                aud_num = int(audience)
                                if aud_num in result[day][squad][subject]['Аудитории']:
                                    current_types = result[day][squad][subject]['Аудитории'][aud_num]
                                    if isinstance(current_types, list):
                                        if lesson_type not in current_types:
                                            current_types.append(lesson_type)
                                    elif current_types != lesson_type:
                                        result[day][squad][subject]['Аудитории'][aud_num] = [current_types, lesson_type]
                                else:
                                    result[day][squad][subject]['Аудитории'][aud_num] = lesson_type
            
            # Обрабатываем подтемы с часами
            if theme_key:
                # Убедимся, что тема еще не добавлена (для безопасности)
                if theme_key not in result[day][squad][subject]['Подтемы']:
                    result[day][squad][subject]['Подтемы'][theme_key] = theme_hours
        
        # Преобразуем множества в списки и сортируем подтемы
        for day in result:
            for squad in result[day]:
                for subject in result[day][squad]:
                    # Офицеров преобразуем в отсортированный список
                    result[day][squad][subject]['Офицеры'] = sorted(list(result[day][squad][subject]['Офицеры']))
                    
                    # Сортируем подтемы сначала по теме, потом по подтеме
                    sorted_themes = {}
                    for theme_key in sorted(
                        result[day][squad][subject]['Подтемы'].keys(),
                        key=lambda x: tuple(map(int, x.split('.')))
                    ):
                        sorted_themes[theme_key] = result[day][squad][subject]['Подтемы'][theme_key]
                    
                    result[day][squad][subject]['Подтемы'] = sorted_themes
        
        # Если запрашивался конкретный день, но данных нет, возвращаем пустой словарь с этим днем
        if day_number is not None and day_number not in result:
            result[day_number] = {}
        
        return result
        
    except sqlite3.Error as e:
        print(f"Database error in get_input_data: {e}")
        return {day_number: {}} if day_number is not None else {}
    finally:
        cursor.close()
