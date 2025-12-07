"""
Данный модуль описывает запросы к БД schedule на языке SQL
"""

import sqlite3
import os
import typing
from datetime import datetime
from dotenv import load_dotenv

load_dotenv('config.env')

databases_path = os.getenv('DATABASES_PATH')
db_path = os.path.join(databases_path, 'schedule.db') if databases_path else 'schedule.db'
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
            номер_взвода: {
                название_предмета: {
                    'Аудитории': {номер_аудитории: тип_занятия, ...},
                    'Офицеры': [id_офицера, ...],
                    'Подтемы': ['тема.подтема', ...]
                }
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
            ORDER BY sq.number, subj.name
        """)
        
        rows = cursor.fetchall()
        
        result = {}
        for row in rows:
            squad = row[0]
            subject = row[1]
            officers_str = row[2] or ""
            audiences_str = row[3] or ""
            lesson_type = row[4] or ""
            theme = row[5] or ""
            
            if squad not in result:
                result[squad] = {}
            if subject not in result[squad]:
                result[squad][subject] = {
                    'Аудитории': {},
                    'Офицеры': set(),
                    'Подтемы': set()
                }
            
            if officers_str:
                officers = [int(o.strip()) for o in officers_str.split('/') if o.strip()]
                for officer_id in officers:
                    result[squad][subject]['Офицеры'].add(officer_id)
            
            if audiences_str and lesson_type:
                audiences = [a.strip() for a in audiences_str.split('/') if a.strip()]
                for audience in audiences:
                    if audience.isdigit():
                        aud_num = int(audience)
                        if aud_num in result[squad][subject]['Аудитории']:
                            current_types = result[squad][subject]['Аудитории'][aud_num]
                            if isinstance(current_types, list):
                                if lesson_type not in current_types:
                                    current_types.append(lesson_type)
                            elif current_types != lesson_type:
                                result[squad][subject]['Аудитории'][aud_num] = [current_types, lesson_type]
                        else:
                            result[squad][subject]['Аудитории'][aud_num] = lesson_type
            
            if theme:
                result[squad][subject]['Подтемы'].add(theme)
        
        for squad in result:
            for subject in result[squad]:
                result[squad][subject]['Офицеры'] = sorted(list(result[squad][subject]['Офицеры']))
                result[squad][subject]['Подтемы'] = sorted(list(result[squad][subject]['Подтемы']))
        
        return result
        
    except sqlite3.Error as e:
        print(f"Database error in get_input_data: {e}")
        return {}
    finally:
        cursor.close()
