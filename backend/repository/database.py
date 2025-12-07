"""
    Данный модуль описывает функционал создания БД schedule
        1. Создать объект DatabaseCreator
        2. Осуществить вызов метода init_database
"""

import sqlite3, os, typing, pandas
from dotenv import load_dotenv
from .models.subjects import *
from .models.officers import *

class DatabaseCreator:
    def __init__(self):
        load_dotenv('config.env')

        # Get db connection
        self.databases_path = os.getenv('DATABASES_PATH')
        self.db_path = os.getenv('DATABASES_PATH') + '/' + os.getenv('DATABASE_NAME')
        if not os.path.exists(self.databases_path):
            os.makedirs(self.databases_path)

        self.conn: typing.Optional[sqlite3.Connection] = None
        
        # Set class attributes
        self.squad_types = [
            (1, 'Солдаты запаса'),
            (2, 'Офицеры запаса'),
            (3, 'Офицеры кадра')
        ]

        self.subject_types = [
            (1, 'Лекционное занятие'),
            (2, 'Практическое занятие'),
            (3, 'Групповое занятие'),
            (4, 'Семинарское занятие'),
            (5, 'Самостоятельная работа студентов')
        ]

        self.lesson_times = [
            (1, '8.30-10.05'),
            (2, '10.15-11.50'),
            (3, '12.30-14.05'),
            (4, '14.15-15.30')
        ]

    def create_tables(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS lesson_types (
                name TEXT PRIMARY KEY
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS holidays (
                day DATE PRIMARY KEY
            );""")


        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS departments (
                name TEXT PRIMARY KEY
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS audiences (
                number INTEGER PRIMARY KEY
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS course_and_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                course INTEGER NOT NULL,
                UNIQUE(type, course)
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS squads (
                id TEXT PRIMARY KEY,
                department TEXT REFERENCES departments(name) ON UPDATE CASCADE,
                course_and_type_id INTEGER REFERENCES course_and_types(id) ON UPDATE CASCADE,
                day INTEGER NOT NULL
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS officers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                second_name TEXT NOT NULL,
                surname TEXT NOT NULL,
                UNIQUE(first_name, second_name, surname)
            );""")


        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS subject_loads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER REFERENCES subjects(id) ON UPDATE CASCADE NOT NULL,
                course_and_type_id INTEGER REFERENCES course_and_types(id) ON UPDATE CASCADE NOT NULL,
                department TEXT REFERENCES departments(name) ON UPDATE CASCADE NOT NULL,
                semester BOOLEAN NOT NULL,
                UNIQUE(subject_id, course_and_type_id, department, semester)
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS squad_subject_loads (
                subject_load_id INTEGER REFERENCES subject_loads(id) ON UPDATE CASCADE NOT NULL,
                squad TEXT REFERENCES squads(id) ON UPDATE CASCADE NOT NULL,
                PRIMARY KEY(subject_load_id, squad)
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS subject_load_audiences (
                subject_load_id INTEGER REFERENCES subject_loads(id) ON UPDATE CASCADE NOT NULL,
                audience_id INTEGER REFERENCES auidences(id) ON UPDATE CASCADE NOT NULL,
                priority INTEGER,
                PRIMARY KEY (subject_load_id, audience_id)
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS subject_hours_load_count (
                subject_load_id INTEGER REFERENCES subject_loads(id) ON UPDATE CASCADE NOT NULL,
                lesson_type TEXT REFERENCES lesson_types(name) ON UPDATE CASCADE NOT NULL,
                hours_count INTEGER NOT NULL,
                PRIMARY KEY (subject_load_id, lesson_type)
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS themes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_load_id INTEGER REFERENCES subject_loads(id) ON UPDATE CASCADE NOT NULL,
                topic INTEGER NOT NULL,
                subtopic INTEGER NOT NULL,
                UNIQUE(subject_load_id, topic, subtopic),
                lesson_type TEXT REFERENCES lesson_types(name) ON UPDATE CASCADE,
                hours_count INTEGER NOT NULL,
                topic_name TEXT,
                subtopic_name TEXT
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS lessons (
                squad TEXT REFERENCES squads(id) ON UPDATE CASCADE NOT NULL,
                date DATE NOT NULL,
                sequence_number INTEGER NOT NULL,
                PRIMARY(squad, date, sequence_number),

                theme_id INTEGER REFERENCES themes(id) ON UPDATE CASCADE,
                officer_id INTEGER REFERENCES officers(id) ON UPDATE CASCADE,
                subject_load_id INTEGER REFERENCES subject_loads(id) ON UPDATE CASCADE NOT NULL
            );""")

        ###########################################

    def init_database(self):
        self.conn = sqlite3.connect(self.db_path)

        self.create_tables()

        if self.conn:
            self.conn.close()
