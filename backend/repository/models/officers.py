"""
    Данный модуль содержит, описанные через SqlAlchemy:
        1. Модель "Офицеры"
        2. CRUD-запросы для данной модели
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from sqlalchemy import create_engine, Column, Integer, String
from dotenv import load_dotenv
import os

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../config.env"))
load_dotenv(env_path)

db_path = os.path.join(os.getenv('DATABASES_PATH'), os.getenv('DATABASE_NAME'))
engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
sess_maker = sessionmaker(bind=engine, autoflush=True, autocommit=False)
session = sess_maker()

from repository.models.base import Base

class Officer(Base):
    __tablename__ = 'officers'

    id = Column(Integer, primary_key=True, autoincrement=True)
    fio = Column(String(50), nullable=False)
    rank = Column(String(50), nullable=False)
    
    def __repr__(self):
        return f"officer: {self.rank}, {self.fio}"

    def create_officer(self, fio: str, rank: str):
        try:
            new_officer = Officer(
                fio=fio,
                rank=rank
            )
            session.add(new_officer)
            session.commit()
            return new_officer
        
        except IntegrityError:
            session.rollback()
            existing = session.query(Officer).filter_by(fio=fio, rank=rank).first()
            return existing

    def read_all_officers(self):
        return session.query(Officer).order_by(Officer.lastname.desc()).all()

    def update_officer(self, officer_id: int, fio: str = None, rank: str = None):
        try:
            officer = session.query(Officer).filter(Officer.id == officer_id).first()
            if not officer:
                return None
            
            if fio:
                setattr(officer, 'fio', fio)
            if rank:
                setattr(officer, 'rank', rank)

            return officer

        except Exception as e:
            print(f"Error: cannot update an officer - {e}")
            return None

    def delete_officer(self, officer_id: int) -> bool:
        try:
            officer = session.query(Officer).filter(Officer.id == officer_id).first()
            session.delete(officer)
            session.commit()

            return True if officer else False
            
        except Exception as e:
            print(f"Error: cannot delete an officer - {e}")
            return False
