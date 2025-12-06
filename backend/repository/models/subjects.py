"""
    Данный модуль содержит, описанные через SqlAlchemy:
        1. Модель "Предметы" из файла учебной нагрузки
        2. CRUD-запросы для данной модели
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import IntegrityError
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, insert
from dotenv import load_dotenv
import os
from .squads import *
from .officers import *

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../config.env"))
load_dotenv(env_path)

db_path = os.path.join(os.getenv('DATABASES_PATH'), os.getenv('DATABASE_NAME'))
engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
sess_maker = sessionmaker(bind=engine, autoflush=True, autocommit=False)
session = sess_maker()

from repository.models.base import Base

class SubjectType(Base):
    __tablename__ = 'subject_types'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)

    subjects = relationship('Subject', back_populates="subject_type")

class Subject(Base):
    __tablename__ = 'subjects'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    semester = Column(Integer, nullable=False)
    hours_count = Column(Integer, nullable=False)

    squad_number = Column(Integer, ForeignKey('squads.number'), nullable=False)
    # squad = relationship('Squad')

    officer_id = Column(Integer, ForeignKey('officers.id'), nullable=False)
    # officer = relationship('Officer')

    type_id = Column(Integer, ForeignKey('subject_types.id'), nullable=False)
    subject_type = relationship('SubjectType', lazy="joined", back_populates="subjects")

    def __repr__(self):
        return f"subject: {self.name} for {self.squad_number}"

    def create_subject(self, name: str, semester: int, hours_count: int, squad_number: int, 
                       officer_id: int, type_id: int):
        try:
            new_subject = Subject(
                name=name, 
                semester=semester,
                hours_count=hours_count,
                squad_number=squad_number,
                officer_id=officer_id,
                type_id=type_id
            )
            session.add(new_subject)
            session.commit()
            return new_subject

        except IntegrityError:
            session.rollback()
            existing = session.query(Subject).filter_by(name=name, semester=semester, squad_number=squad_number, type_id=type_id).first()
            return existing

    def create_subjects(self, subjects_data: list):
        try:
            subjects_dicts = []
            for data in subjects_data:
                subjects_dicts.append({
                    'name': data['name'],
                    'semester': data['semester'],
                    'hours_count': data['hours_count'],
                    'squad_number': data['squad_number'],
                    'officer_id': data['officer_id'],
                    'type_id': data['type_id']
                })

            stmt = insert(Subject).values(subjects_dicts)
            stmt = stmt.prefix_with("OR IGNORE")
            session.execute(stmt)
            session.commit()

        except Exception as e:
            session.rollback()
            print(f"Error: cannot create a subject - {e}")
            return None

    def read_all_subjects(self):
        return session.query(Subject).order_by(Subject.semester.desc()).order_by(Subject.name.desc()).all()

    def update_subject(self, subject_id: int, name: str = None, semester: int = None, hours_count: int = None, 
                       squad_number: int = None, officer_id: int = None, type_id: int = None):
        try:
            subject = session.query(Subject).filter(Subject.id == subject_id).first()
            if not subject:
                return None
            
            if name:
                setattr(subject, 'name', name)
            if semester:
                setattr(subject, 'semester', semester)
            if hours_count:
                setattr(subject, 'hours_count', hours_count)
            if squad_number:
                setattr(subject, 'squad_number', squad_number)
            if officer_id:
                setattr(subject, 'officer_id', officer_id)
            if type_id:
                setattr(subject, 'type_id', type_id)

            return subject

        except Exception as e:
            print(f"Error: cannot update a subject - {e}")
            return None

    def delete_subject(self, subject_id: int) -> bool:
        try:
            subject = session.query(Subject).filter(Subject.id == subject_id).first()
            session.delete(subject)
            session.commit()

            return True if subject else False
            
        except Exception as e:
            print(f"Error: cannot delete a subject - {e}")
            return False
