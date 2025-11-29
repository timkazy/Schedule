"""
    Данный модуль содержит, описанные через SqlAlchemy:
        1. Модель "Взвода"
        2. CRUD-запросы для данной модели
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.exc import IntegrityError
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey
from dotenv import load_dotenv
from os import getenv

load_dotenv('config.env')

engine = create_engine('sqlite:///' + getenv('DATABASES_PATH') + '/' + getenv('DATABASE_NAME'))
sess_maker = sessionmaker(bind=engine, autoflush=True, autocommit=False)
session = sess_maker()

Base = declarative_base()

class SquadType(Base):
    __tablename__ = 'squad_types'

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)

class Squad(Base):
    __tablename__ = 'squads'

    number = Column(String(20), primary_key=True)
    day = Column(String(50), nullable=False)
    persons_count = Column(Integer)
    responsible_officer_id = Column(Integer)

    type_id = Column(Integer, ForeignKey('squad_types.id'), nullable=False)
    squad_type = relationship('SquadType', lazy="joined", backref="squad")

    def __repr__(self):
        return f"squad: {self.number}"

    def create_squad(self, number: str, day: str, type_id: int = None,
                     persons_count: int = None, responsible_officer_id: int = None):
        try:
            new_squad = Squad(
                number=number, day=day,
                persons_count=persons_count,
                type_id=type_id,
                responsible_officer_id=responsible_officer_id
            )
            session.add(new_squad)
            session.commit()
            return new_squad
        
        except IntegrityError:
            session.rollback()
            existing = session.query(Squad).filter_by(number=number).first()
            return existing

    def read_all_squads(self):
        return session.query(Squad).order_by(Squad.number.desc()).all()

    def update_squad(self, squad_number: str, day: str = None, 
                     persons_count: str = None, responsible_officer_id: str = None):
        try:
            squad = session.query(Squad).filter(Squad.number == squad_number).first()
            if not squad:
                return None
            
            if day:
                setattr(squad, 'day', day)
            if persons_count:
                setattr(squad, 'middlename', persons_count)
            if responsible_officer_id:
                setattr(squad, 'responsible_officer_id', responsible_officer_id)

            return squad

        except Exception as e:
            print(f"Error: cannot update a squad - {e}")
            return None

    def delete_squad(self, squad_number: str) -> bool:
        try:
            squad = session.query(Squad).filter(Squad.number == squad_number).first()
            session.delete(squad)
            session.commit()

            return True if squad else False
            
        except Exception as e:
            print(f"Error: cannot delete a squad - {e}")
            return False
