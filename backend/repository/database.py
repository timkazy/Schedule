from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from pathlib import Path
import os

BASE_DIR = Path(__file__).parent.parent.parent
databases_path = BASE_DIR / "backend/databases"
db_path = databases_path / "database.db"

if not os.path.exists(databases_path):
    os.makedirs(databases_path)

DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Зависимость для получения сессии БД
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Создаем таблицы
from .models import Base

def create_tables():
    Base.metadata.create_all(bind=engine)

# Функция для конвертации строк в списки
def string_to_list(value: str) -> list:
    """Конвертирует строку с разделителем '/' в список"""
    if not value or value == "null" or value is None:
        return []
    return [item.strip() for item in value.split("/") if item.strip()]

def list_to_string(value: list) -> str:
    """Конвертирует список в строку с разделителем '/'"""
    if not value:
        return ""
    return "/".join(str(item).strip() for item in value)


# """
#     Данный модуль описывает функционал создания БД schedule
#         1. Создать объект DatabaseCreator
#         2. Осуществить вызов метода init_database
# """
# import sqlite3, os, typing, pandas
# from dotenv import load_dotenv
# # from models.subjects import *
# # from models.officers import *

# load_dotenv('config.env')

# # Работа с относительными путями
# from pathlib import Path
# BASE_DIR = Path(__file__).parent.parent
# databases_path = BASE_DIR / "databases"
# db_path = databases_path / "database.db"

# if not os.path.exists(databases_path):
#     os.makedirs(databases_path)

# conn: typing.Optional[sqlite3.Connection] = sqlite3.connect(db_path)

# class DatabaseCreator:
#     def __init__(self):
#         pass

#     def create_tables(self):
#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS lesson_types (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 name TEXT UNIQUE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS holidays (
#                 day TEXT PRIMARY KEY
#             );""")
        
#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS start_end_dates  (
#                 start_0 TEXT KEY,
#                 end_0 TEXT UNIQUE,
#                 start_1 TEXT UNIQUE,
#                 end_1 TEXT UNIQUE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS departments (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 name TEXT UNIQUE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS audiences (
#                 number INTEGER PRIMARY KEY
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS squad_types (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 type TEXT NOT NULL,
#                 course INTEGER NOT NULL,
#                 UNIQUE (type, course)
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS squads (
#                 number TEXT PRIMARY KEY,
#                 department_id INTEGER NOT NULL,
#                 squad_type_id INTEGER NOT NULL,
#                 day INTEGER NOT NULL,
#                 start_week INTEGER NOT NULL,
#                 end_week INTEGER NOT NULL,

#                 FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (squad_type_id) REFERENCES squad_types(id) ON UPDATE CASCADE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS officers (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 first_name TEXT NOT NULL,
#                 second_name TEXT NOT NULL,
#                 surname TEXT NOT NULL,
#                 UNIQUE(first_name, second_name, surname)
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS subjects (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 name TEXT NOT NULL UNIQUE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS subject_loads (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 subject_id INTEGER NOT NULL,
#                 department_id INTEGER NOT NULL,
#                 squad_type_id INTEGER NOT NULL,
#                 semester BOOLEAN NOT NULL,

#                 UNIQUE(subject_id, squad_type_id, department_id, semester),
#                 FOREIGN KEY (subject_id) REFERENCES subjects(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (squad_type_id) REFERENCES squad_types(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (department_id) REFERENCES departments(id) ON UPDATE CASCADE
#             );""")

#         # officers - массив аудиторий, представленный в виде строки с разделяющим элементом /
#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS squad_subject_loads (
#                 subject_load_id INTEGER NOT NULL,
#                 squad TEXT NOT NULL,
#                 officers TEXT NOT NULL,

#                 PRIMARY KEY(subject_load_id, squad)
#                 FOREIGN KEY (squad) REFERENCES squads(number) ON UPDATE CASCADE,
#                 FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE
#             );""")

#         # audiences - массив аудиторий, представленный в виде строки с разделяющим элементом /
#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS subject_hours_load_count (
#                 subject_load_id INTEGER NOT NULL,
#                 lesson_type_id INTEGER NOT NULL,
#                 hours_count INTEGER NOT NULL,
#                 audiences TEXT NOT NULL,

#                 PRIMARY KEY (subject_load_id, lesson_type_id),
#                 FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (lesson_type_id) REFERENCES lesson_types(id) ON UPDATE CASCADE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS themes (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 subject_load_id INTEGER NOT NULL,
#                 lesson_type_id INTEGER NOT NULL,
#                 topic INTEGER NOT NULL,
#                 subtopic INTEGER NOT NULL,
#                 hours_count INTEGER NOT NULL,
#                 topic_name TEXT,
#                 subtopic_name TEXT,
                          
#                 UNIQUE(subject_load_id, topic, subtopic),
#                 FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (lesson_type_id) REFERENCES lesson_types(id) ON UPDATE CASCADE
#             );""")

#         conn.execute("""
#             CREATE TABLE IF NOT EXISTS lessons (
#                 id INTEGER PRIMARY KEY,
#                 squad TEXT,
#                 theme_id INTEGER,
#                 officer_id INTEGER,
#                 subject_load_id INTEGER,
#                 date DATE NOT NULL,
#                 sequence_number INTEGER NOT NULL,
#                 audience INTEGER,

#                 UNIQUE(squad, date, sequence_number),         
#                 FOREIGN KEY (squad) REFERENCES squads(number) ON UPDATE CASCADE,
#                 FOREIGN KEY (theme_id) REFERENCES themes(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (officer_id) REFERENCES officers(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (subject_load_id) REFERENCES subject_loads(id) ON UPDATE CASCADE,
#                 FOREIGN KEY (audience) REFERENCES audiences(number) ON UPDATE CASCADE
#             );""")

#     def init_database(self):
#         self.create_tables()

# class DatabaseInitializer:
#     def __init__(self):

#         self.start_end_dates = [
#             ('2025-09-01', '2025-12-30', '2026-02-01', '2026-06-25') 
#         ]
        
#         self.lesson_types = [
#             (1, 'лекция'),
#             (2, 'практика'),
#             (3, 'гр. занятие'),
#             (4, 'семинар'),
#             (5, 'срс')
#         ]

#         self.departments = [
#             (1, 'СВиАД'),
#             (2, 'БЭ'),
#             (3, 'АО'),
#             (4, 'РЭО'),
#             (5, 'СНОП'),
#             (6, 'БПЛА')
#         ]

#         self.squad_types = [
#             (1, 'Офицеры запаса', 2),
#             (2, 'Офицеры запаса', 3),
#             (3, 'Офицеры запаса', 4),
#             (4, 'Офицеры кадра', 1),
#             (5, 'Офицеры кадра', 2),
#             (6, 'Офицеры кадра', 3),
#             (7, 'Офицеры кадра', 4),
#             (8, 'Солдаты запаса', 2),
#             (9, 'Солдаты запаса', 3),
#         ]

#         self.audiences = [
#             (208, ), (210, ), (227, ), (305, ), (110, ), (104, ), (209, ), (313, ), (212, ), (123, ), (226, )
#         ]

#         self.subjects = [
#             (1, 'СРС'),
#             (2, 'ОВП'),
#             (3, 'ОТ'),
#             (4, 'ОАТ'),
#             (5, 'КВС'),
#             (6, 'РЛО'),
#             (7, 'ТЭиРЭО')
#         ]

#         # self.subject_loads = [
#         #     (1, 2, 1, 1, 0),
#         #     (2, 3, 1, 1, 0),
#         #     (3, 4, 1, 1, 1),
#         #     (4, 7, 1, 1, 1)
#         # ]

#         # self.squads = [
#         #     ("4342", 1, 1, 1, 2, 16),
#         #     ("4343", 1, 1, 2, 3, 17)
#         # ]

#         # self.subject_hours_load_count = [
#         #     (1, 1, 20, "208/210/227"),
#         #     (1, 2, 5, "208/210/227"),
#         #     (2, 1, 6, "208/210/227"),
#         #     (3, 3, 100, "104/313/123"),
#         #     (4, 4, 40, "209/212/226"),
#         # ]

#         self.officers = [
#             (1, 'Дмитрий', 'Орлов', 'Валерьевич'),
#             (2, 'Алексей', 'Овчинников', 'Владимирович'),
#             (3, 'Ситдиков', 'Венер', 'Мунирович'),
#             (4, 'Саяхов', 'Альберт', 'Рауфович'),
#             (5, 'Оглобличев', 'Максим', 'Алексеевич'),
#             (6, 'Ахмедянов', 'Сергей', 'Александрович'),
#             (7, 'Корнилов', 'Игорь', 'Владимирович'),
#             (8, 'Трофимов', 'Виталий', 'Анатольевич'),
#             (9, 'Яхин', 'Азат', 'Варисович'),
#             (10, 'Храмченко', 'Руслан', 'Иванович'),

#             (11, 'Сергеев', 'Алексей', 'Петрович'),
#             (12, 'Шартдинов', 'Айдар', 'Шайхлисламович'),
#             (13, 'Алказ', 'Вадим', 'Александрович'),
#             (14, 'Ступин', 'Евгений', 'Олегович'),
#             (15, 'Загиров', 'Наиль', 'Абдрахманович'),
#             (16, 'Кабиров', 'Ильнур', 'Равилевич'),
#             (17, 'Ворошилов', 'Сергей', 'Иванович'),
#             (18, 'Шиверских', 'Антон', 'Сергеевич'),
#             (19, 'Чернявский', 'Михаил', 'Анатольевич '),

#             (20, 'Веледов', 'Магир', 'Идриснаби'),
#             (21, 'Рзаев', 'Дмитрий', 'Олегович'),
#             (22, 'Садыков', 'Азамат', 'Камилевич'),
#             (23, 'Селуянов', 'Андрей', 'Александрович'),
#             (24, 'Мустафин', 'Марсель', 'Рафитович'),
#             (25, 'Воробьев', 'Николай', 'Александрович'),
#             (26, 'Файзуллин', 'Рамиль', 'Равильевич')
#         ]

#         # self.squad_subject_loads = [
#         #     (1, "4342", "5/6/7"),
#         #     (1, "4343", "1/2/3"),
#         #     (2, "4342", "8/9/10"),
#         #     (2, "4343", "11/12/13"),
#         #     (3, "4343", "14/15/18"),
#         #     (4, "4343", "18/19/20"),
#         # ]

#         # self.themes = [
#         #     (1, 1, 1, 1, 1, 1),
#         #     (2, 1, 1, 1, 2, 1),
#         #     (3, 2, 1, 2, 1, 1),
#         #     (4, 2, 1, 2, 2, 1),
#         #     (5, 3, 3, 9, 1, 1),
#         #     (6, 3, 3, 9, 2, 1),
#         #     (7, 3, 3, 9, 3, 1),
#         #     (8, 4, 4, 4, 1, 1),
#         #     (9, 4, 4, 5, 1, 1),
#         #     (10, 4, 4, 5, 2, 1),
#         # ]

#     def fill_data(self):
#         conn.executemany("INSERT INTO start_end_dates(start_0, end_0, start_1, end_1) VALUES((?), (?), (?), (?)) ON CONFLICT DO NOTHING", self.start_end_dates)
#         conn.executemany("INSERT INTO lesson_types(id, name) VALUES((?), (?)) ON CONFLICT DO NOTHING", self.lesson_types)
#         conn.executemany("INSERT INTO squad_types(id, type, course) VALUES((?), (?), (?)) ON CONFLICT DO NOTHING", self.squad_types)
#         conn.executemany("INSERT INTO audiences(number) VALUES((?)) ON CONFLICT DO NOTHING", self.audiences)
#         conn.executemany("INSERT INTO officers(id, first_name, second_name, surname) VALUES((?), (?), (?), (?)) ON CONFLICT DO NOTHING", self.officers)

#         conn.executemany("INSERT INTO subjects(id, name) VALUES(?, ?) ON CONFLICT DO NOTHING", self.subjects)
#         conn.executemany("INSERT INTO departments(id, name) VALUES(?, ?) ON CONFLICT DO NOTHING", self.departments)
#         # conn.executemany("INSERT INTO squads(number, department_id, squad_type_id, day, start_week, end_week) VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING", self.squads)
#         # conn.executemany("INSERT INTO subject_loads(id, subject_id, department_id, squad_type_id, semester) VALUES(?, ?, ?, ?, ?) ON CONFLICT DO NOTHING", self.subject_loads)
#         # conn.executemany("INSERT INTO subject_hours_load_count(subject_load_id, lesson_type_id, hours_count, audiences) VALUES(?, ?, ?, ?) ON CONFLICT DO NOTHING", self.subject_hours_load_count)
#         # conn.executemany("INSERT INTO squad_subject_loads(subject_load_id, squad, officers) VALUES(?, ?, ?) ON CONFLICT DO NOTHING", self.squad_subject_loads)
#         # conn.executemany("INSERT INTO themes(id, subject_load_id, lesson_type_id, topic, subtopic, hours_count) VALUES(?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING", self.themes)

#         conn.commit()

# db_creator = DatabaseCreator()
# db_initializer = DatabaseInitializer()