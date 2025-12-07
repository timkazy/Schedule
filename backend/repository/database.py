"""
    Данный модуль описывает функционал создания БД schedule
        1. Создать объект DatabaseCreator
        2. Осуществить вызов метода init_database
"""

import sqlite3, os, typing, pandas
from dotenv import load_dotenv
from .models.subjects import *
from .models.officers import *

load_dotenv('config.env')

databases_path = os.getenv('DATABASES_PATH')
db_path = os.getenv('DATABASES_PATH') + '/' + os.getenv('DATABASE_NAME')
if not os.path.exists(databases_path):
    os.makedirs(databases_path)

conn: typing.Optional[sqlite3.Connection] = sqlite3.connect(db_path)

class DatabaseCreator:
    def __init__(self):
        pass

    def create_tables(self):
        conn.execute("""
            CREATE TABLE IF NOT EXISTS lesson_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS holidays (
                day TEXT PRIMARY KEY
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS audiences (
                number INTEGER PRIMARY KEY
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS squad_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                course INTEGER NOT NULL,
                UNIQUE (type, course)
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS squads (
                number TEXT PRIMARY KEY,
                department_id INTEGER NOT NULL,
                squad_type_id INTEGER NOT NULL,
                day INTEGER NOT NULL,

                FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE,
                FOREIGN KEY (squad_type_id) REFERENCES squad_types(id) ON UPDATE CASCADE
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS officers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                second_name TEXT NOT NULL,
                surname TEXT NOT NULL,
                UNIQUE(first_name, second_name, surname)
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS subject_loads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER NOT NULL,
                department_id INTEGER NOT NULL,
                squad_type_id INTEGER NOT NULL,
                semester BOOLEAN NOT NULL,

                UNIQUE(subject_id, squad_type_id, department_id, semester),
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON UPDATE CASCADE,
                FOREIGN KEY (squad_type_id) REFERENCES squad_types(id) ON UPDATE CASCADE,
                FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE
            );""")

        # officers - массив аудиторий, представленный в виде строки с разделяющим элементом /
        conn.execute("""
            CREATE TABLE IF NOT EXISTS squad_subject_loads (
                subject_load_id INTEGER NOT NULL,
                squad TEXT NOT NULL,
                officers TEXT NOT NULL,

                PRIMARY KEY(subject_load_id, squad)
                FOREIGN KEY (squad) REFERENCES squads(number) ON UPDATE CASCADE,
                FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE
            );""")

        # audiences - массив аудиторий, представленный в виде строки с разделяющим элементом /
        conn.execute("""
            CREATE TABLE IF NOT EXISTS subject_hours_load_count (
                subject_load_id INTEGER NOT NULL,
                lesson_type_id INTEGER NOT NULL,
                hours_count INTEGER NOT NULL,
                audiences TEXT NOT NULL,

                PRIMARY KEY (subject_load_id, lesson_type_id),
                FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE,
                FOREIGN KEY (lesson_type_id) REFERENCES lesson_types(id) ON UPDATE CASCADE
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS themes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_load_id INTEGER NOT NULL,
                lesson_type_id INTEGER NOT NULL,
                topic INTEGER NOT NULL,
                subtopic INTEGER NOT NULL,
                hours_count INTEGER NOT NULL,
                topic_name TEXT,
                subtopic_name TEXT,
                          
                UNIQUE(subject_load_id, topic, subtopic),
                FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE,
                FOREIGN KEY (lesson_type_id) REFERENCES lesson_types(id) ON UPDATE CASCADE
            );""")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY,
                squad TEXT NOT NULL,
                theme_id INTEGER NOT NULL,
                officer_id INTEGER NOT NULL,
                subject_load_id INTEGER NOT NULL,
                date DATE NOT NULL,
                sequence_number INTEGER NOT NULL,

                UNIQUE(squad, date, sequence_number),         
                FOREIGN KEY (squad) REFERENCES squads(number) ON UPDATE CASCADE,
                FOREIGN KEY (theme_id) REFERENCES themes(id) ON UPDATE CASCADE,
                FOREIGN KEY (officer_id) REFERENCES officers(id) ON UPDATE CASCADE,
                FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE
            );""")

    def init_database(self):
        self.create_tables()

class DatabaseInitializer:
    def __init__(self):
        self.lesson_types = [
            (1, 'Лекционное занятие'),
            (2, 'Практическое занятие'),
            (3, 'Групповое занятие'),
            (4, 'Семинарское занятие'),
            (5, 'Самостоятельная работа студентов')
        ]

        self.departments = [
            (1, 'Кафедра СД'),
            (2, 'Кафедра АО и РЭО'),
            (3, 'Кафедра ОВП')
        ]

        self.squad_types = [
            (1, 'Офицеры запаса', 2),
            (2, 'Офицеры запаса', 3),
            (3, 'Офицеры запаса', 4),
            (4, 'Офицеры кадра', 1),
            (5, 'Офицеры кадра', 2),
            (6, 'Офицеры кадра', 3),
            (7, 'Офицеры кадра', 4),
            (8, 'Солдаты запаса', 2),
            (9, 'Солдаты запаса', 3),
        ]

        self.officers = [
            (1, 'Дмитрий', 'Орлов', 'Валерьевич'),
            (2, 'Алексей', 'Овчинников', 'Владимирович'),
            (3, 'Ситдиков', 'Венер', 'Мунирович'),
            (4, 'Саяхов', 'Альберт', 'Рауфович'),
            (5, 'Оглобличев', 'Максим', 'Алексеевич'),
            (6, 'Ахмедянов', 'Сергей', 'Александрович'),
            (7, 'Корнилов', 'Игорь', 'Владимирович'),
            (8, 'Трофимов', 'Виталий', 'Анатольевич'),
            (9, 'Яхин', 'Азат', 'Варисович'),
            (10, 'Храмченко', 'Руслан', 'Иванович'),

            (11, 'Сергеев', 'Алексей', 'Петрович'),
            (12, 'Шартдинов', 'Айдар', 'Шайхлисламович'),
            (13, 'Алказ', 'Вадим', 'Александрович'),
            (14, 'Ступин', 'Евгений', 'Олегович'),
            (15, 'Загиров', 'Наиль', 'Абдрахманович'),
            (16, 'Кабиров', 'Ильнур', 'Равилевич'),
            (17, 'Ворошилов', 'Сергей', 'Иванович'),
            (18, 'Шиверских', 'Антон', 'Сергеевич'),
            (19, 'Чернявский', 'Михаил', 'Анатольевич '),

            (20, 'Веледов', 'Магир', 'Идриснаби'),
            (21, 'Рзаев', 'Дмитрий', 'Олегович'),
            (22, 'Садыков', 'Азамат', 'Камилевич'),
            (23, 'Селуянов', 'Андрей', 'Александрович'),
            (24, 'Мустафин', 'Марсель', 'Рафитович'),
            (25, 'Воробьев', 'Николай', 'Александрович'),
            (26, 'Файзуллин', 'Рамиль', 'Равильевич')
        ]

        self.audiences = [
            (208, ), (210, ), (227, ), (305, ), (110, )
        ]

    def fill_data(self):
        conn.executemany("INSERT INTO lesson_types(id, name) VALUES((?), (?)) ON CONFLICT DO NOTHING", self.lesson_types)
        conn.executemany("INSERT INTO squad_types(id, type, course) VALUES((?), (?), (?)) ON CONFLICT DO NOTHING", self.squad_types)
        conn.executemany("INSERT INTO officers(id, first_name, second_name, surname) VALUES((?), (?), (?), (?)) ON CONFLICT DO NOTHING", self.officers)
        conn.executemany("INSERT INTO audiences(number) VALUES((?)) ON CONFLICT DO NOTHING", self.audiences)
        conn.commit()