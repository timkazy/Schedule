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

def get_input_data():
    """
    Returns:
        dict: {
            день_недели: {
                номер_взвода: {
                    название_предмета: {
                        'Аудитории': {номер_аудитории: тип_занятия, ...},
                        'Офицеры': [id_офицера, ...],
                        'Подтемы': ['тема.подтема', ...]
                    },
                    название_предмета2: {
                        'Аудитории': {номер_аудитории: тип_занятия, ...},
                        'Офицеры': [id_офицера, ...],
                        'Подтемы': ['тема.подтема', ...]
                    }
                },
                номер_взвода2: {
                    название_предмета: {
                        'Аудитории': {номер_аудитории: тип_занятия, ...},
                        'Офицеры': [id_офицера, ...],
                        'Подтемы': ['тема.подтема', ...]
                    }
                }
            },
            день_недели2: {
                ...
            }
        }
    """
    cursor = conn.cursor()
    try:
        cursor.execute("""
            WITH officer_data AS (
                SELECT 
                    ssl.squad,
                    ssl.subject_load_id,
                    ssl.officers
                FROM squad_subject_loads ssl
            ),
            audience_data AS (
                SELECT 
                    shlc.subject_load_id,
                    shlc.audiences,
                    lt.name as lesson_type
                FROM subject_hours_load_count shlc
                JOIN lesson_types lt ON shlc.lesson_type_id = lt.id
            ),
            theme_data AS (
                SELECT 
                    t.subject_load_id,
                    t.topic || '.' || t.subtopic as theme
                FROM themes t
            )
            SELECT 
                sq.day as squad_day,  -- Добавляем день недели взвода
                sq.number as squad_number,
                subj.name as subject_name,
                od.officers as officers_list,
                aud.audiences as audience_list,
                aud.lesson_type as lesson_type_name,
                th.theme as theme_name
            FROM squads sq
            JOIN squad_subject_loads ssl ON sq.number = ssl.squad
            JOIN subject_loads sl ON ssl.subject_load_id = sl.id
            JOIN subjects subj ON sl.subject_id = subj.id
            LEFT JOIN officer_data od ON od.squad = sq.number AND od.subject_load_id = sl.id
            LEFT JOIN audience_data aud ON aud.subject_load_id = sl.id
            LEFT JOIN theme_data th ON th.subject_load_id = sl.id
            WHERE sq.day IS NOT NULL  -- Только взводы с указанным днем недели
            ORDER BY sq.day, sq.number, subj.name
        """)
        
        rows = cursor.fetchall()
        
        result = {}
        for row in rows:
            day = row[0]  # День недели (1-7)
            squad = row[1]
            subject = row[2]
            officers_str = row[3] or ""
            audiences_str = row[4] or ""
            lesson_type = row[5] or ""
            theme = row[6] or ""
            
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
                    'Подтемы': set()
                }
            
            # Обрабатываем офицеров
            if officers_str:
                officers = [int(o.strip()) for o in officers_str.split('/') if o.strip()]
                for officer_id in officers:
                    result[day][squad][subject]['Офицеры'].add(officer_id)
            
            # Обрабатываем аудитории
            if audiences_str and lesson_type:
                audiences = [a.strip() for a in audiences_str.split('/') if a.strip()]
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
            
            # Обрабатываем подтемы
            if theme:
                result[day][squad][subject]['Подтемы'].add(theme)
        
        # Преобразуем множества в списки для каждого дня
        for day in result:
            for squad in result[day]:
                for subject in result[day][squad]:
                    result[day][squad][subject]['Офицеры'] = sorted(list(result[day][squad][subject]['Офицеры']))
                    result[day][squad][subject]['Подтемы'] = sorted(list(result[day][squad][subject]['Подтемы']))
        
        return result
        
    except sqlite3.Error as e:
        print(f"Database error in get_input_data: {e}")
        return {}
    finally:
        cursor.close()