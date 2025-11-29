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
            CREATE TABLE IF NOT EXISTS audiences (
                number INTEGER PRIMARY KEY
            );""")
        
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS officers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fio TEXT NOT NULL UNIQUE,
                rank TEXT NOT NULL
            );""")
        

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS squad_types (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS squads (
                number TEXT PRIMARY KEY,
                day TEXT NOT NULL,
                type_id INTEGER REFERENCES squad_types(id) ON UPDATE CASCADE,
                persons_count INTEGER,
                responsible_officer_id INTEGER REFERENCES officers(id) ON UPDATE CASCADE
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS subject_types (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS subjects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                semester INTEGER NOT NULL,
                hours_count INTEGER NOT NULL,
                squad_number TEXT REFERENCES squads(number) ON UPDATE CASCADE NOT NULL,
                officer_id INTEGER REFERENCES officers(id) ON UPDATE CASCADE NOT NULL,
                type_id INTEGER REFERENCES subject_types(id) ON UPDATE CASCADE NOT NULL,
                UNIQUE(name, semester, squad_number, type_id)
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS lesson_time (
                id INTEGER PRIMARY KEY,
                time TEXT NOT NULL UNIQUE
            );""")

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject_id INTEGER REFERENCES subjects(id) ON UPDATE CASCADE NOT NULL,
                time_id INTEGER REFERENCES lesson_time(id) ON UPDATE CASCADE NOT NULL,
                audience_number INTEGER REFERENCES audiences(number) ON UPDATE CASCADE NOT NULL,
                date TIMESTAMP NOT NULL,
                UNIQUE(subject_id, time_id, date)
            );""")

    def fill_initial_data(self):
        self.conn.executemany("INSERT INTO squad_types(id, name) VALUES((?), (?)) ON CONFLICT DO NOTHING", self.squad_types)
        self.conn.executemany("INSERT INTO subject_types(id, name) VALUES((?), (?)) ON CONFLICT DO NOTHING", self.subject_types)
        self.conn.executemany("INSERT INTO lesson_time(id, time) VALUES((?), (?)) ON CONFLICT DO NOTHING", self.lesson_times)
        self.conn.commit()

    def fill_workloading(self, filename):
        filepath = './' + filename
        if not os.path.exists(filepath):
            print(f"Error: cannot get workloading file: {filename}")
            return None

        skip_disciplines = [
            'ИТОГО'
        ]

        officer_description = ''
        current_subject_name = ''
        squad_number = ''

        df = pandas.read_excel(filepath, skiprows=7, usecols='A,B,C,D,E:J,N:S')

        for index, line in df.iterrows():
            row = list(line.values)

            if pandas.isna(row[1]) == False:
                officer_description = row[1].split()
            if all(pandas.isna(x) for x in row):
                continue
            if row[2] in skip_disciplines:
                continue
            if str(officer_description).lower().endswith('вакант'):
                continue

            rank = officer_description[-3]
            fio = ' '.join(officer_description[-2:])
            officer_id = Officer().create_officer(fio, rank).id

            current_subject_name = row[2]        
            squad_number = row[3]
            Squad().create_squad(squad_number, 'Undefined')

            os_lec = row[4] != None if row[3] else 0
            os_sem = row[5] != None if row[4] else 0
            os_grp = row[6] != None if row[5] else 0
            os_prk = row[7] != None if row[6] else 0
            os_srs = row[9] != None if row[8] else 0

            sp_lec = row[10] != None if row[9] else 0
            sp_sem = row[11] != None if row[10] else 0
            sp_grp = row[12] != None if row[11] else 0
            sp_prk = row[13] != None if row[12] else 0
            sp_srs = row[15] != None if row[14] else 0

            Subject().create_subjects([
                { 'name': current_subject_name, 'semester': 0, 'hours_count': os_lec, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 1 },
                { 'name': current_subject_name, 'semester': 0, 'hours_count': os_sem, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 2 },
                { 'name': current_subject_name, 'semester': 0, 'hours_count': os_grp, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 3 },
                { 'name': current_subject_name, 'semester': 0, 'hours_count': os_prk, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 4 },
                { 'name': current_subject_name, 'semester': 0, 'hours_count': os_srs, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 5 },

                { 'name': current_subject_name, 'semester': 1, 'hours_count': sp_lec, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 1 },
                { 'name': current_subject_name, 'semester': 1, 'hours_count': sp_sem, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 2 },
                { 'name': current_subject_name, 'semester': 1, 'hours_count': sp_grp, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 3 },
                { 'name': current_subject_name, 'semester': 1, 'hours_count': sp_prk, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 4 },
                { 'name': current_subject_name, 'semester': 1, 'hours_count': sp_srs, 'squad_number': squad_number, 'officer_id': officer_id, 'type_id': 5 },
            ])

    def init_database(self):
        self.conn = sqlite3.connect(self.db_path)

        self.create_tables()
        self.fill_initial_data()
        self.fill_workloading('workloading.xlsx')

        if self.conn:
            self.conn.close()
