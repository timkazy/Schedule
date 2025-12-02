"""
    Данный модуль содержит, описанные через SqlAlchemy:
        1. Модель "Занятия" - описывает конкретное занятие из итогового расписания
        2. CRUD-запросы для данной модели
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import IntegrityError
from sqlalchemy import create_engine, Column, Integer, String, TIMESTAMP, ForeignKey
from dotenv import load_dotenv
import os

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../config.env"))
load_dotenv(env_path)

# --- Проверим, что переменные реально загрузились ---
print("📁 Загружаем env из:", env_path)
print("DATABASES_PATH =", os.getenv("DATABASES_PATH"))
print("DATABASE_NAME =", os.getenv("DATABASE_NAME"))

# --- Подключаемся к БД ---
db_path = os.path.join(os.getenv('DATABASES_PATH'), os.getenv('DATABASE_NAME'))
engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
sess_maker = sessionmaker(bind=engine, autoflush=True, autocommit=False)
session = sess_maker()

from repository.models.base import Base

class Audience(Base):
    __tablename__ = 'audiences'

    number = Column(Integer, primary_key=True)

    def create_audience(self, number: int):
        try:
            new_aud = Audience(
                number=number
            )
            session.add(new_aud)
            session.commit()
            return new_aud
        
        except IntegrityError:
            session.rollback()
            existing = session.query(Audience).filter_by(number=number).first()
            return existing

    def delete_audience(self, number: int) -> bool:
        try:
            audience = session.query(Audience).filter(Audience.number == number).first()
            session.delete(audience)
            session.commit()

            return True if audience else False
            
        except Exception as e:
            print(f"Error: cannot delete an audience - {e}")
            return False

class LessonTime(Base):
    __tablename__ = 'lesson_time'

    id = Column(Integer, primary_key=True)
    time = Column(String(50), nullable=False)

class Lesson(Base):
    __tablename__ = 'lessons'

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(TIMESTAMP, nullable=False)

    subject_id = Column(Integer, ForeignKey('subjects.id'), nullable=False)
    audience_number = Column(Integer, ForeignKey('audiences.number'), nullable=False)
    time_id = Column(Integer, ForeignKey('lesson_time.id'), nullable=False)
    
    def create_lesson(self, date: TIMESTAMP, subject_id: int, time_id: int):
        try:
            new_lesson = Lesson(
                date=date,
                subject_id=subject_id,
                time_id=time_id
            )
            session.add(new_lesson)
            session.commit()
            return new_lesson
        
        except IntegrityError:
            session.rollback()
            existing = session.query(Lesson).filter_by(date=date, subject_id=subject_id, time_id=time_id).first()
            return existing

    def read_all_lessons(self):
        return session.query(Lesson).order_by(Lesson.date.desc()).all()

    def update_lesson(self, lesson_id: int, date: TIMESTAMP = None, 
                      subject_id: int = None, time_id: int = None):
        try:
            lesson = session.query(Lesson).filter(Lesson.id == lesson_id).first()
            if not lesson:
                return None
            
            if date:
                setattr(lesson, 'date', date)
            if subject_id:
                setattr(lesson, 'subject_id', subject_id)
            if time_id:
                setattr(lesson, 'time_id', time_id)

            return lesson

        except Exception as e:
            print(f"Error: cannot update a lesson - {e}")
            return None

    def delete_lesson(self, lesson_id: int) -> bool:
        try:
            lesson = session.query(Lesson).filter(Lesson.id == lesson_id).first()
            session.delete(lesson)
            session.commit()

            return True if lesson else False
            
        except Exception as e:
            print(f"Error: cannot delete a lesson - {e}")
            return False

# ✅ добавляем связи после импорта Subject, чтобы избежать циклической ошибки
from repository.models.subjects import Subject  # импортируем только после объявления Lesson

Lesson.subject = relationship(Subject, backref="lessons")
Lesson.audience = relationship(Audience, backref="lessons")
Lesson.time = relationship(LessonTime, backref="lessons")