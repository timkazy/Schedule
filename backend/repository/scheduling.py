# scheduler_optimized.py
import sys
import os
from pathlib import Path

# Добавляем путь к модулям backend
sys.path.append(str(Path(__file__).parent))

from ortools.sat.python import cp_model
import pandas as pd
from datetime import datetime
from queries import get_input_data

class WeekScheduler:
    def __init__(self, day):
        """
        Инициализация планировщика для конкретного дня недели
        
        Args:
            day: День недели (1-7, где 1 - понедельник)
        """
        self.day = day
        self.model = cp_model.CpModel()
        
        print(f"\n{'='*80}")
        print(f"ИНИЦИАЛИЗАЦИЯ ПЛАНИРОВЩИКА ДЛЯ ДНЯ {day}")
        print(f"{'='*80}")
        
        # Загружаем данные для этого дня
        print(f"\nЗАГРУЗКА ДАННЫХ ИЗ БАЗЫ ДАННЫХ...")
        self.input_data = get_input_data()
        
        # ДЕТАЛЬНЫЙ ОТЛАДОЧНЫЙ ВЫВОД ВСЕХ ДАННЫХ
        print(f"\n{'='*80}")
        print(f"ПОЛНЫЙ ОТЛАДОЧНЫЙ ВЫВОД ВСЕХ ДАННЫХ ИЗ БАЗЫ:")
        print(f"{'='*80}")
        
        if not self.input_data:
            print("ПРЕДУПРЕЖДЕНИЕ: get_input_data() вернул пустой словарь!")
            print("Возможные причины:")
            print("1. База данных пуста")
            print("2. Взводы не имеют назначенных дней недели")
            print("3. Нет привязок взводов к предметам")
        else:
            print(f"Всего дней с данными: {len(self.input_data)}")
            
            for d in sorted(self.input_data.keys()):
                print(f"\n{'~'*60}")
                print(f"ДЕНЬ {d}:")
                print(f"{'~'*60}")
                
                if d not in self.input_data or not self.input_data[d]:
                    print("  Нет взводов")
                    continue
                
                day_squads = self.input_data[d]
                print(f"  Всего взводов: {len(day_squads)}")
                
                for squad in sorted(day_squads.keys()):
                    print(f"\n  Взвод {squad}:")
                    
                    if not day_squads[squad]:
                        print("    Нет предметов")
                        continue
                    
                    print(f"    Всего предметов: {len(day_squads[squad])}")
                    
                    for subject, data in day_squads[squad].items():
                        print(f"\n    Предмет: {subject}")
                        
                        # Аудитории
                        if data['Аудитории']:
                            aud_info = []
                            for aud, typ in data['Аудитории'].items():
                                if isinstance(typ, list):
                                    aud_info.append(f"{aud} ({', '.join(typ)})")
                                else:
                                    aud_info.append(f"{aud} ({typ})")
                            print(f"      Аудитории: {', '.join(aud_info)}")
                        else:
                            print(f"      Аудитории: нет")
                        
                        # Преподаватели
                        if data['Офицеры']:
                            print(f"      Преподаватели (ID): {data['Офицеры']}")
                            print(f"      Количество преподавателей: {len(data['Офицеры'])}")
                        else:
                            print(f"      Преподаватели: нет")
                        
                        # Подтемы
                        if data['Подтемы']:
                            print(f"      Подтемы ({len(data['Подтемы'])} тем): {data['Подтемы']}")
                            print(f"      Общее количество часов нагрузки: {len(data['Подтемы'])}")
                        else:
                            print(f"      Подтемы: нет")
                        
                        # Типы занятий из аудиторий
                        if data['Аудитории']:
                            lesson_types = set()
                            for typ in data['Аудитории'].values():
                                if isinstance(typ, list):
                                    lesson_types.update(typ)
                                else:
                                    lesson_types.add(typ)
                            if lesson_types:
                                print(f"      Типы занятий: {', '.join(sorted(lesson_types))}")
        
        print(f"\n{'='*80}")
        print(f"АНАЛИЗ ДАННЫХ ДЛЯ ДНЯ {day}:")
        print(f"{'='*80}")
        
        if day not in self.input_data:
            print(f"ОШИБКА: Для дня {day} нет данных в структуре!")
            print(f"Доступные дни: {sorted(self.input_data.keys())}")
            self.input_data[day] = {}
            self.day_data = {}
            return
        
        # Извлекаем данные для этого дня
        self.day_data = self.input_data.get(day, {})
        
        if not self.day_data:
            print(f"ОШИБКА: Для дня {day} нет взводов!")
            return
        
        print(f"УСПЕХ: Загружено данных для {len(self.day_data)} взводов")
        
        # Выводим детальную информацию для каждого взвода текущего дня
        print(f"\nДЕТАЛЬНАЯ ИНФОРМАЦИЯ ПО ВЗВОДАМ ДНЯ {day}:")
        print("-" * 60)
        
        for squad, subjects in self.day_data.items():
            print(f"\nВзвод {squad}:")
            print(f"  Всего предметов: {len(subjects)}")
            
            total_hours = 0
            for subject, data in subjects.items():
                hours = len(data['Подтемы'])
                total_hours += hours
                print(f"  * {subject}: {hours} часов ({len(data['Подтемы'])} тем)")
                print(f"      Преподаватели: {data['Офицеры']}")
                print(f"      Аудитории: {list(data['Аудитории'].keys())}")
                print(f"      Первые 3 темы: {data['Подтемы'][:3]}{'...' if len(data['Подтемы']) > 3 else ''}")
            
            print(f"  ИТОГО часов нагрузки: {total_hours}")
            print(f"  Максимум пар в семестр (17 недель * 4 пары): {17 * 4}")
        
        # Определяем учебные недели
        self.weeks = [f'Н{i}' for i in range(23, 40)]  # Недели 23-39
        print(f"\nУЧЕБНЫЕ НЕДЕЛИ: {len(self.weeks)} недель ({', '.join(self.weeks[:3])}...{', '.join(self.weeks[-3:])})")
        print(f"Всего учебных дней за семестр: {len(self.weeks)} дней")
        print(f"Максимум пар за семестр на взвод: {len(self.weeks) * 4}")
        
        # Собираем уникальные предметы, преподавателей и аудитории
        self._collect_unique_items()
        
        # Инициализируем переменные модели
        self._init_model_variables()
        
        # Добавляем ограничения
        self._add_constraints()
        
        # Добавляем целевую функцию
        self._add_objective()
    
    def _collect_unique_items(self):
        """Собираем уникальные предметы, преподавателей и аудитории для дня"""
        print(f"\nСБОР УНИКАЛЬНЫХ ЭЛЕМЕНТОВ ДЛЯ ДНЯ {self.day}:")
        print("-" * 40)
        
        self.subjects = set()
        self.officers = set()
        self.audiences = set()
        self.squads = list(self.day_data.keys())
        
        # Собираем все возможные комбинации
        for squad, subjects_dict in self.day_data.items():
            for subject, data in subjects_dict.items():
                self.subjects.add(subject)
                self.officers.update(data['Офицеры'])
                self.audiences.update(data['Аудитории'].keys())
        
        self.subjects = sorted(list(self.subjects))
        self.officers = sorted(list(self.officers))
        self.audiences = sorted(list(self.audiences))
        
        # Создаем словари для индексов
        self.subject_id = {subj: idx for idx, subj in enumerate(self.subjects)}
        self.officer_id = {off: idx for idx, off in enumerate(self.officers)}
        self.audience_id = {aud: idx for idx, aud in enumerate(self.audiences)}
        
        print(f"Взводов: {len(self.squads)} -> {self.squads}")
        print(f"Предметов: {len(self.subjects)} -> {self.subjects}")
        print(f"Преподавателей (ID): {len(self.officers)} -> {self.officers}")
        print(f"Аудиторий: {len(self.audiences)} -> {self.audiences}")
        
        # Подробная статистика по взводам
        print(f"\nСТАТИСТИКА ПО ВЗВОДАМ:")
        for squad in self.squads:
            subjects_count = len(self.day_data[squad])
            total_hours = sum(len(data['Подтемы']) for data in self.day_data[squad].values())
            max_hours_possible = len(self.weeks) * 4  # 4 пары в день
            
            print(f"\nВзвод {squad}:")
            print(f"  Предметов: {subjects_count}")
            print(f"  Часов нагрузки: {total_hours}")
            print(f"  Доступно слотов за семестр: {max_hours_possible}")
            
            if total_hours > max_hours_possible:
                print(f"  ПРЕДУПРЕЖДЕНИЕ: Нагрузка ({total_hours}ч) превышает доступные слоты ({max_hours_possible})!")
                print(f"  Решение: Будет запланировано только {max_hours_possible} часов")
    
    def _init_model_variables(self):
        """Инициализация переменных модели OR-Tools"""
        print(f"\nИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ МОДЕЛИ:")
        print("-" * 40)
        
        # Слоты (пары) в день - 4 пары как в старом проекте
        self.slots = ['S1_0830', 'S2_1015', 'S3_1230', 'S4_1415']
        
        print(f"Слоты (пары): {self.slots}")
        print(f"Недели: {len(self.weeks)} недель")
        
        total_variables = len(self.squads) * len(self.weeks) * len(self.slots)
        print(f"Всего переменных для создания: {total_variables}")
        print(f"  ({len(self.squads)} взводов × {len(self.weeks)} недель × {len(self.slots)} пар)")
        
        # Переменные для назначений
        self.subject_vars = {}  # (squad, week, slot) -> subject_id
        self.officer_vars = {}   # (squad, week, slot) -> officer_id
        self.audience_vars = {}  # (squad, week, slot) -> audience_id
        self.is_scheduled_vars = {}  # (squad, week, slot) -> bool (занят ли слот)
        
        # Для каждого взвода, недели и слота создаем переменные
        print(f"\nСоздание переменных...")
        var_count = 0
        
        for squad in self.squads:
            for week in self.weeks:
                for slot in self.slots:
                    key = (squad, week, slot)
                    var_count += 1
                    
                    # Переменная: занят ли этот слот
                    self.is_scheduled_vars[key] = self.model.NewBoolVar(f'sched_{squad}_{week}_{slot}')
                    
                    # Переменные для предмета, преподавателя, аудитории
                    self.subject_vars[key] = self.model.NewIntVar(
                        0, len(self.subjects)-1, f'subj_{squad}_{week}_{slot}'
                    )
                    self.officer_vars[key] = self.model.NewIntVar(
                        0, len(self.officers)-1, f'off_{squad}_{week}_{slot}'
                    )
                    self.audience_vars[key] = self.model.NewIntVar(
                        0, len(self.audiences)-1, f'aud_{squad}_{week}_{slot}'
                    )
                    
                    # Ограничение: если слот не занят, то назначаем специальные значения
                    not_scheduled = self.is_scheduled_vars[key].Not()
                    self.model.Add(self.subject_vars[key] == 0).OnlyEnforceIf(not_scheduled)
                    self.model.Add(self.officer_vars[key] == 0).OnlyEnforceIf(not_scheduled)
                    self.model.Add(self.audience_vars[key] == 0).OnlyEnforceIf(not_scheduled)
        
        print(f"Успешно создано {var_count} наборов переменных")
        
        # Проверяем, что переменные созданы
        if not self.subject_vars:
            print("ОШИБКА: Не создано ни одной переменной!")
            print("Возможные причины:")
            print("1. Нет взводов в day_data")
            print("2. Нет недель в self.weeks")
            print("3. Нет слотов в self.slots")
    
    def _add_constraints(self):
        """Добавление ограничений в модель"""
        print(f"\nДОБАВЛЕНИЕ ОГРАНИЧЕНИЙ В МОДЕЛЬ:")
        print("-" * 40)
        
        # 1. Ограничения по доступности для каждого взвода
        print(f"1. Ограничения по доступности для взводов...")
        constraint_count = 0
        
        for squad in self.squads:
            squad_subjects = self.day_data[squad]
            
            if not squad_subjects:
                print(f"  Взвод {squad}: нет предметов - пропускаем")
                continue
            
            print(f"  Взвод {squad}: {len(squad_subjects)} предметов")
            
            # Для каждого слота в каждой неделе ограничиваем возможные комбинации
            for week in self.weeks:
                for slot in self.slots:
                    key = (squad, week, slot)
                    
                    # Получаем все разрешенные комбинации для этого взвода
                    allowed_combinations = []
                    
                    for subject, data in squad_subjects.items():
                        subject_idx = self.subject_id[subject]
                        
                        # Для каждого преподавателя
                        for officer in data['Офицеры']:
                            officer_idx = self.officer_id[officer]
                            
                            # Для каждой аудитории
                            for audience in data['Аудитории'].keys():
                                audience_idx = self.audience_id[audience]
                                
                                allowed_combinations.append(
                                    [subject_idx, officer_idx, audience_idx]
                                )
                    
                    # Добавляем ограничение "разрешено только из этих комбинаций"
                    if allowed_combinations:
                        self.model.AddAllowedAssignments(
                            [self.subject_vars[key], self.officer_vars[key], self.audience_vars[key]],
                            allowed_combinations
                        ).OnlyEnforceIf(self.is_scheduled_vars[key])
                        constraint_count += 1
            
            print(f"    Добавлено ограничений для взвода {squad}: {constraint_count}")
        
        print(f"  ИТОГО ограничений доступности: {constraint_count}")
        
        # 2. Ограничение уникальности преподавателей в один слот одной недели
        print(f"\n2. Ограничение уникальности преподавателей...")
        unique_constraints = 0
        
        for week in self.weeks:
            for slot in self.slots:
                # Находим все взводы, которые могут иметь занятия в этот слот этой недели
                active_squads = [s for s in self.squads if (s, week, slot) in self.officer_vars]
                
                if len(active_squads) <= 1:
                    continue  # Нет конфликтов с одним взводом
                
                for i in range(len(active_squads)):
                    for j in range(i + 1, len(active_squads)):
                        squad1 = active_squads[i]
                        squad2 = active_squads[j]
                        
                        key1 = (squad1, week, slot)
                        key2 = (squad2, week, slot)
                        
                        # Преподаватель не может вести два занятия одновременно
                        self.model.Add(
                            self.officer_vars[key1] != self.officer_vars[key2]
                        ).OnlyEnforceIf([
                            self.is_scheduled_vars[key1],
                            self.is_scheduled_vars[key2]
                        ])
                        unique_constraints += 1
        
        print(f"  Добавлено ограничений уникальности: {unique_constraints}")
        
        # 3. Ограничение "без окон" внутри дня для каждого взвода в каждой неделе
        print(f"\n3. Ограничение 'без окон'...")
        window_constraints = 0
        
        for squad in self.squads:
            for week in self.weeks:
                for i in range(1, len(self.slots)):
                    curr_slot = self.slots[i]
                    prev_slot = self.slots[i-1]
                    
                    curr_key = (squad, week, curr_slot)
                    prev_key = (squad, week, prev_slot)
                    
                    # Если есть пара в текущем слоте, то должна быть и в предыдущем
                    self.model.AddImplication(
                        self.is_scheduled_vars[curr_key],
                        self.is_scheduled_vars[prev_key]
                    )
                    window_constraints += 1
        
        print(f"  Добавлено ограничений 'без окон': {window_constraints}")
        
        # 4. Ограничение по темам - распределение часов нагрузки на весь семестр
        print(f"\n4. Распределение часов нагрузки по предметам...")
        hour_constraints = 0
        
        for squad in self.squads:
            squad_subjects = self.day_data[squad]
            
            if not squad_subjects:
                continue
            
            print(f"  Взвод {squad}:")
            
            for subject, data in squad_subjects.items():
                subject_idx = self.subject_id[subject]
                
                # Считаем количество подтем как общее количество часов на семестр
                required_hours = len(data['Подтемы'])
                
                if required_hours == 0:
                    print(f"    {subject}: нет тем - пропускаем")
                    continue
                
                # Собираем все слоты этого взвода за все недели
                subject_slots = []
                for week in self.weeks:
                    for slot in self.slots:
                        key = (squad, week, slot)
                        is_this_subject = self.model.NewBoolVar(f'is_{squad}_{subject}_{week}_{slot}')
                        
                        # Проверяем, назначен ли этот предмет в этот слот
                        self.model.Add(self.subject_vars[key] == subject_idx).OnlyEnforceIf(is_this_subject)
                        self.model.Add(self.subject_vars[key] != subject_idx).OnlyEnforceIf(is_this_subject.Not())
                        
                        subject_slots.append(is_this_subject)
                
                # Ограничение: должно быть назначено требуемое количество часов за семестр
                max_possible_hours = len(self.weeks) * len(self.slots)
                actual_hours = min(required_hours, max_possible_hours)
                
                # Проверяем, есть ли достаточно слотов
                if required_hours > max_possible_hours:
                    print(f"    ПРЕДУПРЕЖДЕНИЕ: {subject} требует {required_hours}ч, но доступно только {max_possible_hours} слотов")
                    print(f"    Будет запланировано только {actual_hours} часов")
                
                self.model.Add(sum(subject_slots) == actual_hours)
                hour_constraints += 1
                
                print(f"    {subject}: требуется {required_hours}ч, назначено {actual_hours}ч")
        
        print(f"  ИТОГО ограничений по часам: {hour_constraints}")
        
        total_constraints = constraint_count + unique_constraints + window_constraints + hour_constraints
        print(f"\nВСЕГО ОГРАНИЧЕНИЙ: {total_constraints}")
    
    def _add_objective(self):
        """Добавление целевой функции"""
        print(f"\nНАСТРОЙКА ЦЕЛЕВОЙ ФУНКЦИИ:")
        print("-" * 40)
        
        # Цели:
        # 1. Минимизировать "окна" (пустые слоты между занятиями)
        # 2. Равномерно распределить нагрузку по неделям
        
        objective_terms = []
        
        # Штраф за незанятые первые слоты в каждой неделе
        for squad in self.squads:
            for week in self.weeks:
                for i, slot in enumerate(self.slots):
                    key = (squad, week, slot)
                    # Сильнее штрафуем пустые первые пары
                    weight = 4 - i  # S1=4, S2=3, S3=2, S4=1
                    objective_terms.append(self.is_scheduled_vars[key].Not() * weight)
        
        print(f"Создано {len(objective_terms)} целевых терминов")
        print(f"Веса штрафов: S1=4, S2=3, S3=2, S4=1 (чем раньше пара, тем важнее её заполнить)")
        
        # Минимизируем сумму штрафов
        self.model.Minimize(sum(objective_terms))
        print(f"Целевая функция настроена")
    
    def solve(self):
        """Решение задачи оптимизации"""
        print(f"\n{'='*80}")
        print(f"РЕШЕНИЕ ЗАДАЧИ ОПТИМИЗАЦИИ ДЛЯ ДНЯ {self.day}")
        print(f"{'='*80}")
        
        if not self.subject_vars:
            print("ОШИБКА: Нет переменных для решения!")
            print("Причина: Не созданы переменные модели")
            return cp_model.UNKNOWN
        
        print(f"Параметры задачи:")
        print(f"  Взводов: {len(self.squads)}")
        print(f"  Недель: {len(self.weeks)}")
        print(f"  Слотов в день: {len(self.slots)}")
        print(f"  Всего переменных: {len(self.subject_vars)}")
        
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 60.0  # 1 минута на решение
        solver.parameters.log_search_progress = True
        solver.parameters.num_search_workers = 4
        
        print(f"\nЗапуск решения (максимум 60 секунд)...")
        start_time = datetime.now()
        status = solver.Solve(self.model)
        end_time = datetime.now()
        elapsed = (end_time - start_time).total_seconds()
        
        print(f"\nРЕЗУЛЬТАТЫ РЕШЕНИЯ:")
        print(f"Время решения: {elapsed:.2f} секунд")
        
        if status == cp_model.OPTIMAL:
            print(f"СТАТУС: Найдено оптимальное решение!")
            print(f"Значение целевой функции: {solver.ObjectiveValue()}")
            self._display_schedule(solver)
        elif status == cp_model.FEASIBLE:
            print(f"СТАТУС: Найдено допустимое решение (не оптимальное)")
            print(f"Значение целевой функции: {solver.ObjectiveValue()}")
            self._display_schedule(solver)
        else:
            print(f"СТАТУС: Решение не найдено")
            stats = solver.ResponseStats()
            print(f"Статистика решателя:")
            for line in stats.split('\n'):
                if line.strip():
                    print(f"  {line}")
            
            # Дополнительная диагностика
            print(f"\nДИАГНОСТИКА ПРОБЛЕМ:")
            print(f"1. Проверьте, что в базе данных есть данные")
            print(f"2. Проверьте, что взводы имеют предметы с темами")
            print(f"3. Проверьте, что есть преподаватели и аудитории")
            print(f"4. Уменьшите количество недель или увеличьте время решения")
        
        return status
    
    def _display_schedule(self, solver):
        """Отображение расписания в консоли по неделям"""
        print(f"\n{'='*80}")
        print(f"РАСПИСАНИЕ НА ДЕНЬ {self.day} (ПО НЕДЕЛЯМ)")
        print(f"{'='*80}")
        
        # Для каждого взвода собираем расписание по неделям
        for squad in self.squads:
            print(f"\n{'~'*60}")
            print(f"ВЗВОД {squad}")
            print(f"{'~'*60}")
            
            # Создаем таблицу для этого взвода
            schedule_table = []
            
            # Собираем все занятия этого взвода
            theme_counter = {}
            for subject in self.day_data[squad]:
                theme_counter[(squad, subject)] = 0
            
            for week in self.weeks:
                week_schedule = []
                
                for slot in self.slots:
                    key = (squad, week, slot)
                    
                    if solver.Value(self.is_scheduled_vars[key]):
                        subject_idx = solver.Value(self.subject_vars[key])
                        officer_idx = solver.Value(self.officer_vars[key])
                        audience_idx = solver.Value(self.audience_vars[key])
                        
                        subject = self.subjects[subject_idx]
                        officer = self.officers[officer_idx]
                        audience = self.audiences[audience_idx]
                        
                        # Получаем тему для этого предмета
                        themes = self.day_data[squad][subject]['Подтемы']
                        theme_key = (squad, subject)
                        
                        if theme_key not in theme_counter:
                            theme = "Тема не указана"
                        else:
                            theme_index = theme_counter[theme_key]
                            if theme_index < len(themes):
                                theme = themes[theme_index]
                                theme_counter[theme_key] += 1
                            else:
                                theme = f"Тема {theme_index+1}"
                        
                        week_schedule.append(f"{subject} ({theme[:10]}) пр.{officer}")
                    else:
                        week_schedule.append("ОКНО")
                
                schedule_table.append([week] + week_schedule)
            
            # Выводим таблицу для взвода
            print(f"{'Неделя':<8} {'S1_0830':<25} {'S2_1015':<25} {'S3_1230':<25} {'S4_1415':<25}")
            print("-" * 110)
            
            for row in schedule_table:
                print(f"{row[0]:<8} {row[1]:<25} {row[2]:<25} {row[3]:<25} {row[4]:<25}")
            
            # Статистика для этого взвода
            print(f"\nСТАТИСТИКА ДЛЯ ВЗВОДА {squad}:")
            total_slots = len(self.weeks) * len(self.slots)
            occupied_slots = 0
            subject_stats = {}
            
            for week in self.weeks:
                for slot in self.slots:
                    key = (squad, week, slot)
                    if solver.Value(self.is_scheduled_vars[key]):
                        occupied_slots += 1
                        subject_idx = solver.Value(self.subject_vars[key])
                        subject = self.subjects[subject_idx]
                        subject_stats[subject] = subject_stats.get(subject, 0) + 1
            
            print(f"  Всего слотов за семестр: {total_slots}")
            print(f"  Занято слотов: {occupied_slots}")
            print(f"  Окон (СРС): {total_slots - occupied_slots}")
            print(f"  Эффективность: {occupied_slots/total_slots*100:.1f}%")
            
            if subject_stats:
                print(f"  Распределение по предметам:")
                for subject, count in sorted(subject_stats.items()):
                    required = len(self.day_data[squad][subject]['Подтемы'])
                    percentage = (count/required*100) if required > 0 else 0
                    print(f"    {subject}: {count}/{required} пар ({percentage:.1f}%)")

def generate_schedule_for_all_days():
    """Генерация расписания для всех дней недели"""
    print("=" * 100)
    print("ЗАПУСК ГЕНЕРАЦИИ РАСПИСАНИЯ ДЛЯ ВСЕХ ДНЕЙ")
    print("=" * 100)
    
    # Генерируем расписание для каждого дня
    for day in range(1, 8):
        print(f"\n" + "*" * 100)
        print(f"ОБРАБОТКА ДНЯ {day}")
        print("*" * 100)
        
        scheduler = WeekScheduler(day)
        
        if not scheduler.day_data:
            print(f"\nДля дня {day} нет данных о взводах - пропускаем")
            print("-" * 60)
            continue
        
        print(f"\n" + "-" * 60)
        print(f"ЗАПУСК РЕШЕНИЯ ДЛЯ ДНЯ {day}")
        print("-" * 60)
        
        scheduler.solve()
        
        print(f"\n" + "=" * 60)
        print(f"ЗАВЕРШЕНО ОБРАБОТКА ДНЯ {day}")
        print("=" * 60)
    
    print("\n" + "=" * 100)
    print("ГЕНЕРАЦИЯ РАСПИСАНИЯ ДЛЯ ВСЕХ ДНЕЙ ЗАВЕРШЕНА")
    print("=" * 100)

if __name__ == "__main__":
    # Можно запустить для конкретного дня или для всех
    import argparse
    
    parser = argparse.ArgumentParser(description='Генерация расписания по неделям')
    parser.add_argument('--day', type=int, choices=range(1, 8), 
                       help='День недели (1-7), если не указан - все дни')
    
    args = parser.parse_args()
    
    if args.day:
        print("=" * 80)
        print(f"ГЕНЕРАЦИЯ РАСПИСАНИЯ ТОЛЬКО ДЛЯ ДНЯ {args.day}")
        print("=" * 80)
        scheduler = WeekScheduler(args.day)
        if scheduler.day_data:
            scheduler.solve()
        else:
            print(f"Для дня {args.day} нет данных")
    else:
        generate_schedule_for_all_days()