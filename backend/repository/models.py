from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Text, PrimaryKeyConstraint
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class LessonType(Base):
    __tablename__ = "lesson_types"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Holiday(Base):
    __tablename__ = "holidays"
    
    day = Column(String, primary_key=True)

class StartEndDate(Base):
    __tablename__ = "start_end_dates"
    
    start_0 = Column(String, primary_key=True)
    end_0 = Column(String)
    start_1 = Column(String)
    end_1 = Column(String)

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationships
    squads = relationship("Squad", back_populates="department")
    subject_loads = relationship("SubjectLoad", back_populates="department")

class Audience(Base):
    __tablename__ = "audiences"
    
    number = Column(Integer, primary_key=True, index=True)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="audience_rel")

class SquadType(Base):
    __tablename__ = "squad_types"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False, index=True)
    course = Column(Integer, nullable=False, index=True)
    
    # Relationships
    squads = relationship("Squad", back_populates="squad_type")
    subject_loads = relationship("SubjectLoad", back_populates="squad_type")

class Squad(Base):
    __tablename__ = "squads"
    
    number = Column(String, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    squad_type_id = Column(Integer, ForeignKey("squad_types.id"), nullable=False)
    day = Column(Integer, nullable=False)
    start_week = Column(Integer, nullable=False)
    end_week = Column(Integer, nullable=False)
    
    # Relationships
    department = relationship("Department", back_populates="squads")
    squad_type = relationship("SquadType", back_populates="squads")
    lessons = relationship("Lesson", back_populates="squad_rel")

class Officer(Base):
    __tablename__ = "officers"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False, index=True)
    second_name = Column(String, nullable=False, index=True)
    surname = Column(String, nullable=False, index=True)
    
    # Relationships
    lessons = relationship("Lesson", back_populates="officer")

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    
    # Relationships
    subject_loads = relationship("SubjectLoad", back_populates="subject")

class SubjectLoad(Base):
    __tablename__ = "subject_loads"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    squad_type_id = Column(Integer, ForeignKey("squad_types.id"), nullable=False)
    semester = Column(Boolean, nullable=False)
    
    # Relationships
    subject = relationship("Subject", back_populates="subject_loads")
    department = relationship("Department", back_populates="subject_loads")
    squad_type = relationship("SquadType", back_populates="subject_loads")
    themes = relationship("Theme", back_populates="subject_load")
    lessons = relationship("Lesson", back_populates="subject_load")

class SquadSubjectLoad(Base):
    __tablename__ = "squad_subject_loads"
    
    subject_load_id = Column(Integer, ForeignKey("subject_loads.id"), nullable=False)
    squad = Column(String, ForeignKey("squads.number"), nullable=False)
    officers = Column(Text, nullable=False)  # Строка с разделителем "/"
    
    __table_args__ = (
        PrimaryKeyConstraint('subject_load_id', 'squad'),
    )
    
    # Relationships (без back_populates, так как это просто связующая таблица)
    subject_load = relationship("SubjectLoad")
    squad_rel = relationship("Squad")

class SubjectHoursLoadCount(Base):
    __tablename__ = "subject_hours_load_count"
    
    subject_load_id = Column(Integer, ForeignKey("subject_loads.id"), nullable=False)
    lesson_type_id = Column(Integer, ForeignKey("lesson_types.id"), nullable=False)
    hours_count = Column(Integer, nullable=False)
    audiences = Column(Text, nullable=False)  # Строка с разделителем "/"
    
    __table_args__ = (
        PrimaryKeyConstraint('subject_load_id', 'lesson_type_id'),
    )
    
    # Relationships
    subject_load = relationship("SubjectLoad")
    lesson_type = relationship("LessonType")

class Theme(Base):
    __tablename__ = "themes"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_load_id = Column(Integer, ForeignKey("subject_loads.id"), nullable=False)
    lesson_type_id = Column(Integer, ForeignKey("lesson_types.id"), nullable=False)
    topic = Column(Integer, nullable=False)
    subtopic = Column(Integer, nullable=False)
    hours_count = Column(Integer, nullable=False)
    topic_name = Column(Text)
    subtopic_name = Column(Text)
    
    # Relationships
    subject_load = relationship("SubjectLoad", back_populates="themes")
    lesson_type = relationship("LessonType")
    lessons = relationship("Lesson", back_populates="theme")

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    squad = Column(String, ForeignKey("squads.number"))
    theme_id = Column(Integer, ForeignKey("themes.id"))
    officer_id = Column(Integer, ForeignKey("officers.id"))
    subject_load_id = Column(Integer, ForeignKey("subject_loads.id"))
    date = Column(Date, nullable=False)
    sequence_number = Column(Integer, nullable=False)
    audience = Column(Integer, ForeignKey("audiences.number"))
    
    # Relationships
    squad_rel = relationship("Squad", back_populates="lessons")
    theme = relationship("Theme", back_populates="lessons")
    officer = relationship("Officer", back_populates="lessons")
    subject_load = relationship("SubjectLoad", back_populates="lessons")
    audience_rel = relationship("Audience", back_populates="lessons")