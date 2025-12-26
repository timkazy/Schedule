# scheduling.py
from ortools.sat.python import cp_model
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
import traceback

# Импортируем функции из нового модуля с SQLAlchemy
try:
    from .queries_alchemy import get_input_data, is_audience_available, is_officer_available
except ImportError:
    # Для обратной совместимости
    from .queries import get_input_data, is_audience_available, is_officer_available

# === СТАТИЧНЫЕ ДАННЫЕ ===
class WeekScheduler:
    """Класс для генерации расписания с использованием SQLAlchemy"""
    
    # Константы класса
    HOLIDAY_WEEKS = ['Н31']
    WEEKS_WITH_HOLIDAY = [f'Н{i}' for i in range(23, 40)]
    SLOTS = ['S1_0830', 'S2_1015', 'S3_1230', 'S4_1415']
    
    SLOT_TO_SEQUENCE = {
        'S1_0830': 1,
        'S2_1015': 2,
        'S3_1230': 3,
        'S4_1415': 4
    }
    
    DAY_TO_WEEKDAY = {
        1: 0,  # Понедельник
        2: 1,  # Вторник
        3: 2,  # Среда
        4: 3,  # Четверг
        5: 4,  # Пятница
        6: 5,  # Суббота
        7: 6   # Воскресенье
    }
    
    def __init__(self, db_session: Session, day_number: Optional[int] = None, clear_existing: bool = True):
        """Инициализация планировщика с SQLAlchemy сессией
        
        Args:
            db_session: SQLAlchemy сессия
            day_number: Номер дня недели (1-7), если None - все дни
            clear_existing: Если True, удаляет существующие записи для этих групп
        """
        self.db_session = db_session
        self.day_number = day_number
        self.clear_existing = clear_existing
        
        print(f"🔧 Инициализация планировщика для дня {day_number}...")
        
        # Получаем данные через SQLAlchemy
        self.db_data = get_input_data(db_session, day_number) if day_number else get_input_data(db_session)
        
        # Инициализируем структуры ДО вызова prepare_data_from_db()
        self.groups_to_clear = set()
        self.schedule_results = []
        self.theme_mapping = {}
        self.officer_mapping = {}
        self.week_dates = {}
        
        print(f"📊 Данные из БД для дня {day_number}: {len(self.db_data)} дней")
        self.prepare_data_from_db()
        
        # Инициализируем даты
        self.initialize_dates()
    
    def initialize_dates(self):
        """Инициализирует даты для всех недель"""
        # Начало семестра (примерная дата)
        current_date = datetime(2024, 9, 2)  # Начало учебного года
        
        for week in self.WEEKS_WITH_HOLIDAY:
            if week not in self.HOLIDAY_WEEKS:
                self.week_dates[week] = current_date
                current_date += timedelta(days=7)
        
        print(f"📅 Даты инициализированы: {len(self.week_dates)} недель")
    
    def prepare_data_from_db(self):
        """Подготовка данных из БД для использования в алгоритме"""
        if not self.db_data:
            self.day_data = False
            print("❌ Нет данных из БД")
            return
        
        # Формируем GROUPS_DAY из данных БД
        GROUPS_DAY = {}
        for day, day_groups in self.db_data.items():
            day_int = int(day)
            GROUPS_DAY[day_int] = [str(group) for group in day_groups.keys()]
        
        print(f"📋 GROUPS_DAY из БД: {len(GROUPS_DAY)} дней с группами")
        
        # Если указан конкретный день, используем только его
        if self.day_number is not None:
            if self.day_number in GROUPS_DAY:
                self.GROUPS_DAY = {self.day_number: GROUPS_DAY[self.day_number]}
            else:
                self.GROUPS_DAY = {}
                self.day_data = False
                print(f"⚠️ Для дня {self.day_number} нет групп")
                return
        else:
            self.GROUPS_DAY = GROUPS_DAY
        
        # Собираем все группы для очистки
        for day_groups in self.GROUPS_DAY.values():
            self.groups_to_clear.update(day_groups)
        
        # Группируем все группы для определения стартовых недель
        all_groups_set = set()
        for day_groups in self.GROUPS_DAY.values():
            all_groups_set.update(day_groups)
        
        print(f"👥 Все группы: {len(all_groups_set)} групп")
        
        # Стартовые недели - пока статично
        self.GROUP_START_WEEK = {group: 'Н23' for group in all_groups_set}
        print(f"📅 Стартовые недели: установлены для {len(self.GROUP_START_WEEK)} групп")
        
        # Формируем SEMESTER_LOAD из данных БД (только для групп выбранных дней)
        self.SEMESTER_LOAD = {}
        self.subjects_data_full = {}
        self.THEMES = {}
        
        # Обрабатываем данные из db_data
        for day in self.GROUPS_DAY.keys():
            if day in self.db_data:
                for group, group_data in self.db_data[day].items():
                    group_str = str(group)
                    
                    if group_str not in self.subjects_data_full:
                        self.subjects_data_full[group_str] = {}
                    
                    for subject, subject_data in group_data.items():
                        # Суммируем часы из подтем
                        subtopics = subject_data.get('Подтемы', {})
                        total_hours = sum(subtopics.values())
                        
                        if total_hours > 0:
                            self.SEMESTER_LOAD[(group_str, subject)] = total_hours
                        
                        # Преобразуем ID офицеров в имена (пока используем ID как строку)
                        officer_ids = subject_data.get('Офицеры', [])
                        teachers = [f"Оф_{officer_id}" for officer_id in officer_ids]
                        
                        # Получаем аудитории
                        audience_dict = subject_data.get('Аудитории', {})
                        rooms = [str(room_num) for room_num in audience_dict.keys()]
                        
                        self.subjects_data_full[group_str][subject] = {
                            'teachers': teachers,
                            'rooms': rooms
                        }
                        
                        # Формируем THEMES
                        if subtopics:
                            themes_list = []
                            for theme_key, hours in subtopics.items():
                                if '.' in theme_key:
                                    topic, subtopic = map(int, theme_key.split('.'))
                                    themes_list.append({
                                        'topic': topic,
                                        'subtopic': subtopic,
                                        'hours': int(hours),
                                        'subject': subject
                                    })
                            self.THEMES[(group_str, subject)] = themes_list
        
        print(f"📚 SEMESTER_LOAD: {len(self.SEMESTER_LOAD)} нагрузок")
        print(f"📝 subjects_data_full: {len(self.subjects_data_full)} групп с предметами")
        print(f"📖 THEMES: {sum(len(v) for v in self.THEMES.values())} тем")
        
        # Вспомогательные занятия - статично
        self.subjects_data_misc = {
            'СРС': {'teachers': ['Дежурный_Преподаватель'], 'rooms': ['505']}
        }
        
        # Фиксированные события - пустые
        self.FIXED_EVENTS = []
        self.FIXED_SLOTS = set()
        
        self.day_data = True  # Флаг, что данные подготовлены
        print("✅ Данные подготовлены")
    
    def clear_existing_lessons(self):
        """Удаляет существующие записи lessons для групп, которые будут перегенерированы"""
        if not self.groups_to_clear or not self.clear_existing:
            print("⚠️ Очистка не требуется")
            return
        
        try:
            groups_list = list(self.groups_to_clear)
            print(f"🧹 Очистка уроков для групп: {groups_list}")
            
            # Получаем диапазон дат для удаления
            if self.week_dates:
                date_list = []
                for week_date in self.week_dates.values():
                    for day_offset in range(7):
                        date = week_date + timedelta(days=day_offset)
                        date_list.append(date.strftime('%Y-%m-%d'))
                
                if date_list:
                    # Создаем запрос с параметрами
                    placeholders = ', '.join([f':date{i}' for i in range(len(date_list))])
                    group_placeholders = ', '.join([f':group{i}' for i in range(len(groups_list))])
                    
                    query = text(f"""
                        DELETE FROM lessons 
                        WHERE squad IN ({group_placeholders})
                        AND date IN ({placeholders})
                    """)
                    
                    # Создаем словарь параметров
                    params = {}
                    for i, group in enumerate(groups_list):
                        params[f'group{i}'] = group
                    for i, date in enumerate(date_list):
                        params[f'date{i}'] = date
                    
                    result = self.db_session.execute(query, params)
                    deleted_count = result.rowcount
                    
                    self.db_session.commit()
                    
                    print(f"✅ Удалено {deleted_count} существующих уроков")
                else:
                    # Удаляем все уроки для этих групп
                    placeholders = ', '.join([f':group{i}' for i in range(len(groups_list))])
                    query = text(f"DELETE FROM lessons WHERE squad IN ({placeholders})")
                    
                    params = {f'group{i}': group for i, group in enumerate(groups_list)}
                    result = self.db_session.execute(query, params)
                    deleted_count = result.rowcount
                    
                    self.db_session.commit()
                    print(f"✅ Удалено {deleted_count} существующих уроков")
            
        except Exception as e:
            print(f"❌ Ошибка при удалении существующих уроков: {e}")
            self.db_session.rollback()
    
    def load_theme_mapping(self):
        """Загружает маппинг тем из БД через SQLAlchemy"""
        try:
            query = text("""
                SELECT 
                    t.id as theme_id,
                    s.name as subject_name,
                    t.topic,
                    t.subtopic,
                    t.subject_load_id
                FROM themes t
                JOIN subject_loads sl ON t.subject_load_id = sl.id
                JOIN subjects s ON sl.subject_id = s.id
                ORDER BY s.name, t.topic, t.subtopic
            """)
            
            result = self.db_session.execute(query)
            themes = result.fetchall()
            
            self.theme_mapping.clear()
            for theme_id, subject_name, topic, subtopic, subject_load_id in themes:
                key = (subject_name, topic, subtopic)
                if key not in self.theme_mapping:
                    self.theme_mapping[key] = []
                self.theme_mapping[key].append({
                    'theme_id': theme_id,
                    'subject_load_id': subject_load_id
                })
            
            print(f"📖 Загружено {len(themes)} тем из БД")
            
        except Exception as e:
            print(f"❌ Ошибка при загрузке тем: {e}")
    
    def load_officer_mapping(self):
        """Загружает маппинг офицеров из БД через SQLAlchemy"""
        try:
            query = text("""
                SELECT id, first_name, second_name, surname 
                FROM officers
            """)
            
            result = self.db_session.execute(query)
            officers = result.fetchall()
            
            self.officer_mapping.clear()
            for officer_id, first_name, second_name, surname in officers:
                # Создаем разные форматы для поиска
                full_name = f"{first_name}_{second_name}_{surname}"
                short_name = f"Оф_{officer_id}"
                
                self.officer_mapping[full_name] = officer_id
                self.officer_mapping[short_name] = officer_id
                self.officer_mapping[f"{first_name}_{surname}"] = officer_id
            
            print(f"👨‍🏫 Загружено {len(officers)} офицеров из БД")
            
        except Exception as e:
            print(f"❌ Ошибка при загрузке офицеров: {e}")
    
    def find_theme_id_and_subject_load(self, subject_name, topic, subtopic, group):
        """Находит theme_id и subject_load_id для темы"""
        key = (subject_name, topic, subtopic)
        
        if key not in self.theme_mapping:
            print(f"⚠️ Тема не найдена в маппинге: {key}")
            return None, None
        
        themes = self.theme_mapping[key]
        
        if len(themes) == 1:
            return themes[0]['theme_id'], themes[0]['subject_load_id']
        
        # Если несколько тем с одинаковым названием, находим по group
        try:
            query = text("""
                SELECT sl.id 
                FROM subject_loads sl
                JOIN subjects s ON sl.subject_id = s.id
                JOIN squad_subject_loads ssl ON sl.id = ssl.subject_load_id
                WHERE s.name = :subject_name AND ssl.squad = :squad
            """)
            
            result = self.db_session.execute(query, {
                'subject_name': subject_name,
                'squad': group
            })
            
            subject_load_ids = [row[0] for row in result.fetchall()]
            
            for theme_info in themes:
                if theme_info['subject_load_id'] in subject_load_ids:
                    return theme_info['theme_id'], theme_info['subject_load_id']
            
            # Если не нашли точного совпадения, возвращаем первый
            return themes[0]['theme_id'], themes[0]['subject_load_id']
            
        except Exception as e:
            print(f"❌ Ошибка при поиске subject_load_id: {e}")
            return themes[0]['theme_id'], themes[0]['subject_load_id']
    
    def find_officer_id(self, teacher_name):
        """Находит officer_id по имени преподавателя"""
        # Прямой поиск в маппинге
        if teacher_name in self.officer_mapping:
            return self.officer_mapping[teacher_name]
        
        # Если формат "Оф_123"
        if teacher_name.startswith('Оф_'):
            try:
                return int(teacher_name.split('_')[1])
            except (ValueError, IndexError):
                pass
        
        # Поиск в БД
        try:
            if '_' in teacher_name:
                parts = teacher_name.split('_')
                
                # Формат: Имя_Отчество_Фамилия
                if len(parts) >= 3:
                    query = text("""
                        SELECT id FROM officers 
                        WHERE first_name = :first_name AND second_name = :second_name AND surname = :surname
                    """)
                    result = self.db_session.execute(query, {
                        'first_name': parts[0],
                        'second_name': parts[1],
                        'surname': '_'.join(parts[2:])
                    })
                    row = result.fetchone()
                    if row:
                        return row[0]
                
                # Формат: Имя_Фамилия
                if len(parts) == 2:
                    query = text("""
                        SELECT id FROM officers 
                        WHERE first_name = :first_name AND surname = :surname
                    """)
                    result = self.db_session.execute(query, {
                        'first_name': parts[0],
                        'surname': parts[1]
                    })
                    row = result.fetchone()
                    if row:
                        return row[0]
            
            # Прямой поиск по всем полям
            query = text("""
                SELECT id FROM officers 
                WHERE first_name LIKE :search OR second_name LIKE :search OR surname LIKE :search
            """)
            result = self.db_session.execute(query, {'search': f"%{teacher_name}%"})
            
            row = result.fetchone()
            if row:
                return row[0]
            
        except Exception as e:
            print(f"❌ Ошибка при поиске офицера: {e}")
        
        print(f"⚠️ Офицер не найден: {teacher_name}")
        return None
    
    def save_schedule_to_db(self, schedule_results):
        """Сохраняет сгенерированное расписание в таблицу lessons"""
        if not schedule_results:
            print("⚠️ Нет результатов для сохранения")
            return
        
        lessons_to_insert = []
        
        try:
            # Загружаем маппинги
            self.load_theme_mapping()
            self.load_officer_mapping()
            
            for result in schedule_results:
                group, week, slot, display = result
                
                # Пропускаем СРС и пустые ячейки
                if 'СРС' in str(display) or display == '-' or 'ВЫХОДНОЙ' in str(display):
                    continue
                
                # Парсим display для получения деталей урока
                if '→' in str(display):
                    parts = display.split('→', 1)
                    subject_name = parts[0].strip()
                    
                    rest = parts[1].strip()
                    
                    # Извлекаем тему
                    theme_part = rest.split('(')[0].strip()
                    
                    # Убираем "(прод.)" если есть
                    if '(прод.)' in theme_part:
                        theme_part = theme_part.replace('(прод.)', '').strip()
                    
                    # Парсим тему и подтему
                    if '.' in theme_part:
                        try:
                            topic_str, subtopic_str = theme_part.split('.')
                            topic = int(topic_str)
                            subtopic = int(subtopic_str.split()[0] if ' ' in subtopic_str else subtopic_str)
                        except ValueError:
                            print(f"❌ Ошибка парсинга темы: {theme_part}")
                            continue
                    
                    # Извлекаем преподавателя и аудиторию
                    if '(' in rest and ')' in rest:
                        teacher_room = rest[rest.find('(')+1:rest.find(')')]
                        if ',' in teacher_room:
                            teacher_name, room = teacher_room.split(',', 1)
                            teacher_name = teacher_name.strip()
                            room = room.strip()
                            
                            # Находим IDs
                            officer_id = self.find_officer_id(teacher_name)
                            theme_id, subject_load_id = self.find_theme_id_and_subject_load(
                                subject_name, topic, subtopic, group
                            )
                            
                            if officer_id and theme_id and subject_load_id:
                                # Получаем дату
                                if week in self.week_dates:
                                    week_date = self.week_dates[week]
                                    
                                    # Добавляем день недели
                                    if self.day_number in self.DAY_TO_WEEKDAY:
                                        target_day = self.DAY_TO_WEEKDAY[self.day_number]
                                        date = week_date + timedelta(days=target_day)
                                        
                                        sequence_number = self.SLOT_TO_SEQUENCE.get(slot, 1)
                                        
                                        # Проверяем доступность
                                        date_str = date.strftime('%Y-%m-%d')
                                        
                                        # Проверяем, не занята ли аудитория
                                        if not is_audience_available(self.db_session, int(room), date_str, sequence_number):
                                            print(f"⚠️ Аудитория {room} занята {date_str} на паре {sequence_number}")
                                            continue
                                        
                                        # Проверяем, не занят ли преподаватель
                                        if not is_officer_available(self.db_session, officer_id, date_str, sequence_number):
                                            print(f"⚠️ Преподаватель {officer_id} занят {date_str} на паре {sequence_number}")
                                            continue
                                        
                                        # Добавляем урок
                                        lessons_to_insert.append((
                                            group,
                                            theme_id,
                                            officer_id,
                                            subject_load_id,
                                            date_str,
                                            sequence_number,
                                            int(room)
                                        ))
                                        print(f"✅ Добавлен урок: {group}, {date_str}, {slot}, {subject_name}")
            
            # Вставляем уроки в БД
            if lessons_to_insert:
                query = text("""
                    INSERT INTO lessons (squad, theme_id, officer_id, subject_load_id, date, sequence_number, audience)
                    VALUES (:squad, :theme_id, :officer_id, :subject_load_id, :date, :sequence_number, :audience)
                """)
                
                # Подготавливаем параметры для каждой записи
                for lesson in lessons_to_insert:
                    params = {
                        'squad': lesson[0],
                        'theme_id': lesson[1],
                        'officer_id': lesson[2],
                        'subject_load_id': lesson[3],
                        'date': lesson[4],
                        'sequence_number': lesson[5],
                        'audience': lesson[6]
                    }
                    self.db_session.execute(query, params)
                
                self.db_session.commit()
                print(f"🎉 Успешно сохранено {len(lessons_to_insert)} уроков в БД")
                
                # Выводим статистику
                for i, lesson in enumerate(lessons_to_insert[:5], 1):
                    print(f"  {i}. Группа: {lesson[0]}, Дата: {lesson[4]}, Пара: {lesson[5]}, Ауд: {lesson[6]}")
                if len(lessons_to_insert) > 5:
                    print(f"  ... и еще {len(lessons_to_insert) - 5} уроков")
            else:
                print("⚠️ Нет уроков для сохранения")
                
        except Exception as e:
            print(f"❌ Ошибка при сохранении в БД: {e}")
            traceback.print_exc()
            self.db_session.rollback()
    
    def solve(self):
        """Основной метод решения задачи составления расписания"""
        if not hasattr(self, 'day_data') or not self.day_data:
            print(f"❌ Нет данных для обработки")
            return
        
        # Удаляем существующие уроки для этих групп (если нужно)
        if self.clear_existing:
            self.clear_existing_lessons()
        
        # Создаем словарь доступных недель для ВСЕХ групп один раз
        all_groups = []
        for day_groups in self.GROUPS_DAY.values():
            all_groups.extend(day_groups)
        
        print(f"👥 Группы для планирования: {len(all_groups)} групп")
        
        if not all_groups:
            print(f"❌ Нет групп для планирования")
            return
        
        group_available_weeks_all = {}
        for group in all_groups:
            start_idx = self.WEEKS_WITH_HOLIDAY.index(self.GROUP_START_WEEK[group])
            group_available_weeks_all[group] = self.WEEKS_WITH_HOLIDAY[start_idx:]
        
        print(f"📅 Доступные недели для групп: загружено для {len(group_available_weeks_all)} групп")
        
        # Обрабатываем каждый день отдельно
        for day_number in sorted(self.GROUPS_DAY.keys()):
            print(f"\n{'=' * 100}")
            print(f"🚀 ГЕНЕРАЦИЯ РАСПИСАНИЯ ДЛЯ ДНЯ {day_number}")
            print(f"{'=' * 100}")
            
            GROUPS = self.GROUPS_DAY[day_number]
            if not GROUPS:
                print(f"⚠️ В день {day_number} нет групп для планирования")
                continue
            
            print(f"👥 Группы в день {day_number}: {GROUPS}")
            
            # Используем глобальный словарь доступных недель
            group_available_weeks = {g: group_available_weeks_all[g] for g in GROUPS}
            
            # Учебные недели — глобально все, кроме праздничных
            WEEKS = [w for w in self.WEEKS_WITH_HOLIDAY if w not in self.HOLIDAY_WEEKS]
            
            # === Собираем все возможные преподаватели, аудитории, дисциплины ===
            all_teachers = sorted(set(t for d in self.subjects_data_full.values() 
                                      for s in d.values() 
                                      for t in s['teachers']) |
                                  set(self.subjects_data_misc['СРС']['teachers']) |
                                  set(f[4] for f in self.FIXED_EVENTS if f[4] != 'НЕВ'))
            
            all_rooms = sorted(set(r for d in self.subjects_data_full.values() 
                                   for s in d.values() 
                                   for r in s['rooms']) |
                               set(self.subjects_data_misc['СРС']['rooms']) |
                               set(f[5] for f in self.FIXED_EVENTS))
            
            all_subjects = sorted(set(sub for g in self.subjects_data_full for sub in self.subjects_data_full[g]) | {'СРС'})
            subject_id = {sub: idx for idx, sub in enumerate(all_subjects)}
            teacher_id = {t: idx for idx, t in enumerate(all_teachers)}
            room_id = {r: idx for idx, r in enumerate(all_rooms)}
            
            print(f"👨‍🏫 Все преподаватели: {len(all_teachers)}")
            print(f"🏫 Все аудитории: {len(all_rooms)}")
            print(f"📚 Все предметы: {len(all_subjects)}")
            
            # === 2. МОДЕЛЬ ===
            model = cp_model.CpModel()
            
            subject_assign = {}
            teacher_assign = {}
            room_assign = {}
            is_scheduled = {}
            load_finished = {}
            
            # Разрешённые комбинации (дисциплина, преподаватель, аудитория) для каждой группы
            permitted_by_group = {g: [] for g in GROUPS}
            
            for group in GROUPS:
                # Основные дисциплины группы
                for sub, data in self.subjects_data_full.get(group, {}).items():
                    sub_id_val = subject_id[sub]
                    for t in data['teachers']:
                        t_id = teacher_id[t]
                        for r in data['rooms']:
                            r_id = room_id[r]
                            permitted_by_group[group].append((sub_id_val, t_id, r_id))
                
                # Добавляем СРС
                srs_sub_id = subject_id['СРС']
                for t in self.subjects_data_misc['СРС']['teachers']:
                    t_id = teacher_id[t]
                    for r in self.subjects_data_misc['СРС']['rooms']:
                        r_id = room_id[r]
                        permitted_by_group[group].append((srs_sub_id, t_id, r_id))
                
                print(f"  Группа {group}: {len(permitted_by_group[group])} разрешенных комбинаций")
            
            # === Основной цикл по группам, неделям и слотам ===
            for group in GROUPS:
                total_load = sum(count for (g, sub), count in self.SEMESTER_LOAD.items() if g == group)
                executed_pairs = 0
                
                available_weeks = group_available_weeks[group]
                print(f"\n📊 Группа {group}: общая нагрузка {total_load} пар, доступные недели {len(available_weeks)}")
                
                for week in self.WEEKS_WITH_HOLIDAY:
                    if week in self.HOLIDAY_WEEKS:
                        continue  # Пропускаем праздничные недели полностью
                    
                    is_week_available = week in available_weeks
                    load_finished[(group, week)] = model.NewBoolVar(f'LoadFinished_{group}_{week}')
                    
                    week_load_sum = []
                    
                    for slot in self.SLOTS:
                        key = (group, week, slot)
                        
                        # Если неделя недоступна для группы — слот не может быть занят
                        if not is_week_available:
                            is_scheduled[key] = model.NewBoolVar(f'IsSched_{key}')
                            model.Add(is_scheduled[key] == 0)
                            continue
                        
                        is_scheduled[key] = model.NewBoolVar(f'IsSched_{group}_{week}_{slot}')
                        
                        if key in self.FIXED_SLOTS:
                            model.Add(is_scheduled[key] == 1)
                        else:
                            subject_assign[key] = model.NewIntVar(0, len(all_subjects) - 1, f'Sub_{group}_{week}_{slot}')
                            teacher_assign[key] = model.NewIntVar(0, len(all_teachers) - 1, f'Tea_{group}_{week}_{slot}')
                            room_assign[key] = model.NewIntVar(0, len(all_rooms) - 1, f'Room_{group}_{week}_{slot}')
                            
                            model.AddAllowedAssignments(
                                [subject_assign[key], teacher_assign[key], room_assign[key]],
                                permitted_by_group[group]
                            )
                            
                            # Считаем только реальные дисциплины (не СРС)
                            is_discipline = model.NewBoolVar(f'IsDisc_{group}_{week}_{slot}')
                            model.Add(subject_assign[key] != subject_id['СРС']).OnlyEnforceIf(is_discipline)
                            model.Add(subject_assign[key] == subject_id['СРС']).OnlyEnforceIf(is_discipline.Not())
                            week_load_sum.append(is_discipline)
                            
                            model.Add(is_scheduled[key] == 1)
                    
                    if is_week_available:
                        week_load = model.NewIntVar(0, len(self.SLOTS), f'WeekLoad_{group}_{week}')
                        model.Add(week_load == sum(week_load_sum))
                        executed_pairs += week_load
                        
                        model.Add(executed_pairs >= total_load).OnlyEnforceIf(load_finished[(group, week)])
                        model.Add(executed_pairs < total_load).OnlyEnforceIf(load_finished[(group, week)].Not())
            
            print(f"\n📊 Создано переменных: subject_assign={len(subject_assign)}, teacher_assign={len(teacher_assign)}, room_assign={len(room_assign)}")
            
            # === ОГРАНИЧЕНИЯ ===
            
            # 1. Точная нагрузка по дисциплинам
            print("\n1️⃣ Ограничение: Точная нагрузка по дисциплинам")
            for (group, sub), count in self.SEMESTER_LOAD.items():
                if group not in GROUPS:
                    continue
                
                sub_id_val = subject_id[sub]
                keys = [(group, w, s) for w in group_available_weeks_all[group] for s in self.SLOTS
                        if (group, w, s) in subject_assign]
                
                counters = []
                for key in keys:
                    b = model.NewBoolVar(f'Count_{group}_{sub}_{key[1]}_{key[2]}')
                    model.Add(subject_assign[key] == sub_id_val).OnlyEnforceIf(b)
                    model.Add(subject_assign[key] != sub_id_val).OnlyEnforceIf(b.Not())
                    counters.append(b)
                model.Add(sum(counters) == count)
            
            # 2. Преподаватель и аудитория — уникальны в один slot
            for week in self.WEEKS_WITH_HOLIDAY:
                if week in self.HOLIDAY_WEEKS:
                    continue
                for slot in self.SLOTS:
                    active_keys = [(g, week, slot) for g in GROUPS if (g, week, slot) in teacher_assign]
                    for i in range(len(active_keys)):
                        for j in range(i + 1, len(active_keys)):
                            key1 = active_keys[i]
                            key2 = active_keys[j]
                            g1, g2 = key1[0], key2[0]
                            
                            is_real1 = model.NewBoolVar(f'Real1_{g1}_{week}_{slot}')
                            is_real2 = model.NewBoolVar(f'Real2_{g2}_{week}_{slot}')
                            
                            model.Add(subject_assign[key1] != subject_id['СРС']).OnlyEnforceIf(is_real1)
                            model.Add(subject_assign[key1] == subject_id['СРС']).OnlyEnforceIf(is_real1.Not())
                            model.Add(subject_assign[key2] != subject_id['СРС']).OnlyEnforceIf(is_real2)
                            model.Add(subject_assign[key2] == subject_id['СРС']).OnlyEnforceIf(is_real2.Not())
                            
                            model.Add(teacher_assign[key1] != teacher_assign[key2]).OnlyEnforceIf([is_real1, is_real2])
            
            # 3. Нет окон внутри дня
            for group in GROUPS:
                available_weeks = group_available_weeks[group]
                for week in available_weeks:
                    if week in self.HOLIDAY_WEEKS:
                        continue
                    for i in range(1, len(self.SLOTS)):
                        curr = (group, week, self.SLOTS[i])
                        prev = (group, week, self.SLOTS[i - 1])
                        if curr in is_scheduled and prev in is_scheduled:
                            model.AddImplication(is_scheduled[curr], is_scheduled[prev])
            
            # 4. СРС в S1–S3 только после завершения нагрузки
            for group in GROUPS:
                for week in group_available_weeks[group]:
                    if week in self.HOLIDAY_WEEKS:
                        continue
                    for slot in self.SLOTS[:3]:
                        key = (group, week, slot)
                        if key in subject_assign:
                            is_srs = model.NewBoolVar(f'SRS_Early_{group}_{week}_{slot}')
                            model.Add(subject_assign[key] == subject_id['СРС']).OnlyEnforceIf(is_srs)
                            model.Add(subject_assign[key] != subject_id['СРС']).OnlyEnforceIf(is_srs.Not())
                            model.AddImplication(is_srs, load_finished[(group, week)])
            
            # 5. Темы должны идти подряд (блоками)
            for group in GROUPS:
                for (g, subj), theme_list in self.THEMES.items():
                    if g != group:
                        continue
                    sub_id_val = subject_id[subj]
                    
                    available_weeks = [w for w in group_available_weeks[group] if w not in self.HOLIDAY_WEEKS]
                    
                    for theme_idx, theme_info in enumerate(theme_list):
                        hours = theme_info['hours']
                        if hours <= 1:
                            continue
                        
                        possible_starts = []
                        for week in available_weeks:
                            for start_idx in range(len(self.SLOTS) - hours + 1):
                                block_keys = [(group, week, self.SLOTS[start_idx + i]) for i in range(hours)]
                                if all(k in subject_assign for k in block_keys):
                                    possible_starts.append(block_keys)
                        
                        if not possible_starts:
                            continue
                        
                        block_vars = [model.NewBoolVar(f"Block_{group}_{subj}_{theme_idx}_{j}") for j in
                                      range(len(possible_starts))]
                        model.AddExactlyOne(block_vars)
                        
                        for var, block_keys in zip(block_vars, possible_starts):
                            for key in block_keys:
                                model.Add(subject_assign[key] == sub_id_val).OnlyEnforceIf(var)
            
            # 6. Ограничение на количество пар одного предмета в неделю
            MAX_SUBJECT_PER_WEEK = 2
            excess_penalty = []
            for group in GROUPS:
                for week in group_available_weeks[group]:
                    if week in self.HOLIDAY_WEEKS:
                        continue
                    
                    for (g, sub), count in self.SEMESTER_LOAD.items():
                        if g != group:
                            continue
                            
                        sub_id_val = subject_id[sub]
                        week_keys = [(group, week, slot) for slot in self.SLOTS 
                                    if (group, week, slot) in subject_assign]
                        
                        if week_keys:
                            week_counters = []
                            for key in week_keys:
                                b = model.NewBoolVar(f'WeekCount_{group}_{sub}_{week}_{key[2]}')
                                model.Add(subject_assign[key] == sub_id_val).OnlyEnforceIf(b)
                                model.Add(subject_assign[key] != sub_id_val).OnlyEnforceIf(b.Not())
                                week_counters.append(b)
                            
                            excess = model.NewIntVar(0, len(self.SLOTS), f'Excess_{group}_{sub}_{week}')
                            model.Add(excess >= sum(week_counters) - MAX_SUBJECT_PER_WEEK)
                            excess_penalty.append(excess)

            # === ЦЕЛЕВАЯ ФУНКЦИЯ ===
            s4_discipline = []  # Штраф за СРС в S4
            s123_srs = []  # Штраф за СРС в первых трёх парах
            
            for group in GROUPS:
                for week in group_available_weeks[group]:
                    if week in self.HOLIDAY_WEEKS:
                        continue
                    for slot in self.SLOTS:
                        key = (group, week, slot)
                        if key in subject_assign:
                            is_srs = model.NewBoolVar(f'OptSRS_{group}_{week}_{slot}')
                            model.Add(subject_assign[key] == subject_id['СРС']).OnlyEnforceIf(is_srs)
                            model.Add(subject_assign[key] != subject_id['СРС']).OnlyEnforceIf(is_srs.Not())
                            
                            if slot == 'S4_1415':
                                s4_discipline.append(is_srs)
                            else:
                                s123_srs.append(is_srs)
            
            print(f"\n🎯 Целевая функция: штраф за СРС в S4: {len(s4_discipline)}, в S1-S3: {len(s123_srs)}")
            print(f"   Штраф за превышение лимита предметов в неделю: {len(excess_penalty)}")
            
            # Минимизируем: СРС в S4 (вес 1), СРС в S1-S3 (вес 2), превышение лимита (вес 3)
            model.Minimize(sum(s4_discipline) + 2 * sum(s123_srs) + 3 * sum(excess_penalty))
            
            # === РЕШЕНИЕ ===
            solver = cp_model.CpSolver()
            solver.parameters.max_time_in_seconds = 300.0
            solver.parameters.log_search_progress = True
            solver.parameters.num_search_workers = 8
            solver.parameters.random_seed = 42
            
            print("\n⚙️ Запуск решателя...")
            status = solver.Solve(model)
            
            print(f"\n📊 Статус решения: {status} (OPTIMAL={cp_model.OPTIMAL}, FEASIBLE={cp_model.FEASIBLE})")
            
            # Сохраняем day_number для использования в сохранении
            self.day_number = day_number
            
            # === ВЫВОД И СОХРАНЕНИЕ РЕЗУЛЬТАТОВ ===
            schedule_results = self.print_and_collect_schedule(
                status, solver, subject_assign, teacher_assign, room_assign,
                subject_id, teacher_id, room_id, all_subjects, all_teachers, 
                all_rooms, group_available_weeks, GROUPS
            )
            
            # Сохраняем результаты в БД
            if schedule_results:
                print(f"\n💾 Сохранение расписания для дня {day_number} в БД...")
                self.save_schedule_to_db(schedule_results)
    
    def print_and_collect_schedule(self, status, solver, subject_assign, teacher_assign, room_assign,
                                  subject_id, teacher_id, room_id, all_subjects, all_teachers, 
                                  all_rooms, group_available_weeks, GROUPS):
        """Вывод расписания в консоль и сбор результатов для сохранения"""
        schedule_results = []
        
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print("✅ РАСПИСАНИЕ СФОРМИРОВАНО!")
            print(f"📈 Целевая функция: {solver.ObjectiveValue()}\n")
            
            results = []
            
            # 1. Собираем все реальные занятия
            real_lessons = []
            for key in subject_assign:
                group, week, slot = key
                if week not in group_available_weeks[group]:
                    continue
                sub_idx = solver.Value(subject_assign[key])
                sub = all_subjects[sub_idx]
                if sub == 'СРС':
                    continue
                tea = all_teachers[solver.Value(teacher_assign[key])]
                room = all_rooms[solver.Value(room_assign[key])]
                real_lessons.append((group, week, slot, sub, tea, room))
            
            print(f"📚 Найдено реальных занятий: {len(real_lessons)}")
            
            # 2. Сортируем по времени
            week_order = {w: i for i, w in enumerate(self.WEEKS_WITH_HOLIDAY)}
            slot_order = {s: i for i, s in enumerate(self.SLOTS)}
            real_lessons.sort(key=lambda x: (week_order[x[1]], slot_order[x[2]]))
            
            # 3. Распределяем темы по порядку с учётом часов
            current_theme_index = {}
            theme_slot_counter = {}
            
            for (g, s), themes in self.THEMES.items():
                if g in GROUPS:
                    current_theme_index[(g, s)] = 0
                    theme_slot_counter[(g, s)] = 0
            
            for group, week, slot, sub, tea, room in real_lessons:
                key = (group, sub)
                if key not in current_theme_index:
                    continue
                
                idx = current_theme_index[key]
                theme_info = self.THEMES[key][idx]
                theme_name = f"{theme_info['topic']}.{theme_info['subtopic']}"
                hours = theme_info['hours']
                
                # Если это первый слот темы — пишем название
                if theme_slot_counter[key] == 0:
                    display = f"{sub} → {theme_name} ({tea}, {room})"
                else:
                    display = f"{sub} → {theme_name} (прод.) ({tea}, {room})"
                
                results.append([group, week, slot, display])
                schedule_results.append([group, week, slot, display])
                
                theme_slot_counter[key] += 1
                
                # Если тема закончилась — переходим к следующей
                if theme_slot_counter[key] >= hours:
                    current_theme_index[key] += 1
                    theme_slot_counter[key] = 0
            
            # 4. Добавляем СРС (только пока не выполнена нагрузка)
            total_loads = {g: sum(c for (gg, s), c in self.SEMESTER_LOAD.items() if gg == g) for g in GROUPS}
            executed_count = {g: 0 for g in GROUPS}
            
            for group, week, slot, sub, tea, room in real_lessons:
                if sub != 'СРС':
                    executed_count[group] += 1
            
            for key in subject_assign:
                group, week, slot = key
                if week not in group_available_weeks[group]:
                    continue
                if solver.Value(subject_assign[key]) == subject_id['СРС']:
                    if executed_count[group] < total_loads[group]:
                        results.append([group, week, slot, "СРС (Окно)"])
                        schedule_results.append([group, week, slot, "СРС (Окно)"])
            
            # 5. Фиксированные события
            for ev in self.FIXED_EVENTS:
                results.append([ev[0], ev[1], ev[2], f"{ev[3]} ({ev[4]}, {ev[5]})"])
                schedule_results.append([ev[0], ev[1], ev[2], f"{ev[3]} ({ev[4]}, {ev[5]})"])
            
            print(f"📊 Всего записей в расписании: {len(results)}")
            
            # 6. Вывод
            df = pd.DataFrame(results, columns=['Группа', 'Неделя', 'Слот', 'Занятие'])
            df = df.drop_duplicates(subset=['Группа', 'Неделя', 'Слот'])
            
            for group in GROUPS:
                print(f"\n{'=' * 95}")
                print(f"   РАСПИСАНИЕ ГРУППЫ {group} (старт: {self.GROUP_START_WEEK[group]})")
                print(f"{'=' * 95}")
                
                gdf = df[df['Группа'] == group].copy()
                if gdf.empty:
                    print("Нет занятий для этой группы")
                    continue
                
                pivot = gdf.pivot_table(index='Слот', columns='Неделя', values='Занятие',
                                        aggfunc='first', fill_value='-')
                pivot = pivot.reindex(index=self.SLOTS, columns=self.WEEKS_WITH_HOLIDAY, fill_value='-')
                
                # Чистим хвост и ставим СРС правильно
                executed_up_to = {w: 0 for w in self.WEEKS_WITH_HOLIDAY}
                current = 0
                for week in self.WEEKS_WITH_HOLIDAY:
                    if week in group_available_weeks[group] and week not in self.HOLIDAY_WEEKS:
                        executed_up_to[week] = current
                        current += sum(1 for _, w, s, disp in results
                                       if _ == group and w == week and '→' in str(disp))
                    else:
                        executed_up_to[week] = current
                
                for week in self.WEEKS_WITH_HOLIDAY:
                    if week in self.HOLIDAY_WEEKS:
                        pivot[week] = 'ВЫХОДНОЙ'
                    elif week not in group_available_weeks[group]:
                        pivot[week] = '-'
                    else:
                        if executed_up_to[week] >= total_loads[group]:
                            pivot[week] = '-'
                        else:
                            has_lesson = any('→' in str(v) for v in pivot[week])
                            if has_lesson:
                                pivot_week_series = pivot[week]
                                for i in range(len(pivot_week_series)):
                                    if pivot_week_series.iloc[i] == '-':
                                        pivot_week_series.iloc[i] = 'СРС (Окно)'
                            else:
                                pivot[week] = 'СРС (Окно)'
                
                print(pivot.to_string())
                print()
        
        else:
            print("❌ Решение не найдено")
            print(solver.ResponseStats())
        
        return schedule_results


def generate_and_save_schedule(
    db_session: Session,
    day: Optional[int] = None,
    strategy: str = "upsert",
    academic_year_start: Optional[datetime] = None
):
    """
    Функция-обертка для использования в FastAPI с SQLAlchemy
    
    Args:
        db_session: SQLAlchemy session
        day: Номер дня недели (1-7), если None - все дни
        strategy: Стратегия генерации ("upsert", "replace", "update")
        academic_year_start: Дата начала учебного года
    
    Returns:
        dict: Результат генерации
    """
    try:
        print(f"🚀 Запуск генерации расписания...")
        print(f"   День: {'все' if day is None else day}")
        print(f"   Стратегия: {strategy}")
        print(f"   Дата начала года: {academic_year_start}")
        
        # Определяем, нужно ли удалять существующие записи
        clear_existing = strategy.lower() in ["replace", "upsert"]
        
        # Создаем планировщик с SQLAlchemy сессией
        scheduler = WeekScheduler(
            db_session=db_session,
            day_number=day,
            clear_existing=clear_existing
        )
        
        # Обновляем даты начала недели, если указана дата начала учебного года
        if academic_year_start:
            scheduler.week_dates = {}
            current_date = academic_year_start
            
            for week in WeekScheduler.WEEKS_WITH_HOLIDAY:
                if week not in WeekScheduler.HOLIDAY_WEEKS:
                    scheduler.week_dates[week] = current_date
                    current_date += timedelta(days=7)
            
            print(f"📅 Даты инициализированы начиная с {academic_year_start.strftime('%Y-%m-%d')}")
        
        # Запускаем решение
        if hasattr(scheduler, 'day_data') and scheduler.day_data:
            scheduler.solve()
            
            return {
                "success": True,
                "message": f"Расписание успешно сгенерировано для {'всех дней' if day is None else f'дня {day}'}",
                "strategy": strategy,
                "clear_existing": clear_existing
            }
        else:
            return {
                "success": False,
                "error": f"Нет данных для генерации {'всех дней' if day is None else f'дня {day}'}"
            }
            
    except Exception as e:
        print(f"❌ Ошибка при генерации расписания: {e}")
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Ошибка при генерации расписания: {str(e)}"
        }


# Функция для запуска из командной строки
def main():
    """Основная функция для запуска из командной строки"""
    import argparse
    parser = argparse.ArgumentParser(description='Генерация расписания по неделям')
    parser.add_argument('--day', type=int, choices=range(1, 8), 
                       help='День недели (1-7), если не указан - все дни')
    parser.add_argument('--keep-existing', action='store_true',
                       help='Не удалять существующие записи (по умолчанию удаляются)')
    
    args = parser.parse_args()
    
    clear_existing = not args.keep_existing
    
    # Для запуска из командной строки нужно создать сессию
    from repository.database import SessionLocal
    
    db = SessionLocal()
    try:
        if args.day:
            print(f"\n{'*' * 100}")
            print(f"ГЕНЕРАЦИЯ РАСПИСАНИЯ ТОЛЬКО ДЛЯ ДНЯ {args.day}")
            print(f"{'*' * 100}")
            
            scheduler = WeekScheduler(
                db_session=db,
                day_number=args.day,
                clear_existing=clear_existing
            )
            if hasattr(scheduler, 'day_data') and scheduler.day_data:
                scheduler.solve()
            else:
                print(f"Для дня {args.day} нет данных")
        else:
            print(f"\n{'*' * 100}")
            print(f"ГЕНЕРАЦИЯ РАСПИСАНИЯ ДЛЯ ВСЕХ ДНЕЙ")
            print(f"{'*' * 100}")
            
            scheduler = WeekScheduler(
                db_session=db,
                day_number=None,
                clear_existing=clear_existing
            )
            if hasattr(scheduler, 'day_data') and scheduler.day_data:
                scheduler.solve()
            else:
                print("Нет данных для генерации расписания")
    finally:
        db.close()


if __name__ == "__main__":
    main()