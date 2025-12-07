# Pydantic — это библиотека для Python, которая упрощает работу с данными,
# используя аннотации типов для их валидации и сериализации.
# Она позволяет создавать модели данных,
# которые автоматически проверяют, преобразуют и сериализуют данные,
# делая код более надежным, читаемым и простым в поддержке.

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Officer Schemas ---
class OfficerBase(BaseModel):
    fio: Optional[str] = None
    rank: Optional[str] = None

class OfficerCreate(OfficerBase):
    pass

class Officer(OfficerBase):
    id: int

    class Config:
        from_attributes = True


# --- SquadType Schemas ---
class SquadTypeBase(BaseModel):
    name: str

class SquadTypeCreate(SquadTypeBase):
    pass

class SquadType(SquadTypeBase):
    id: int

    class Config:
        from_attributes = True


# --- Squad Schemas ---
class SquadBase(BaseModel):
    day: Optional[str] = None
    type_id: Optional[int] = None
    persons_count: Optional[int] = None
    responsible_officer_id: Optional[int] = None

class SquadCreate(SquadBase):
    number: str

class Squad(SquadBase):
    number: str
    type: Optional[SquadType] = None
    responsible_officer: Optional[Officer] = None

    class Config:
        from_attributes = True


# --- SubjectType Schemas ---
class SubjectTypeBase(BaseModel):
    name: str

class SubjectTypeCreate(SubjectTypeBase):
    pass

class SubjectType(SubjectTypeBase):
    id: int

    class Config:
        from_attributes = True


# --- Subject Schemas ---
class SubjectBase(BaseModel):
    name: str
    semester: int
    hours_count: int
    squad_number: Optional[str] = None
    officer_id: int
    type_id: int

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    id: int
    squad: Optional[Squad] = None
    officer: Optional[Officer] = None
    type: Optional[SubjectType] = None

    class Config:
        from_attributes = True


# --- Audience Schemas ---
class AudienceBase(BaseModel):
    pass

class AudienceCreate(AudienceBase):
    number: int

class Audience(AudienceBase):
    number: int

    class Config:
        from_attributes = True


# --- LessonTime Schemas ---
class LessonTimeBase(BaseModel):
    time: str

class LessonTimeCreate(LessonTimeBase):
    pass

class LessonTime(LessonTimeBase):
    id: int

    class Config:
        from_attributes = True


# --- Lesson Schemas ---
class LessonBase(BaseModel):
    subject_id: int
    time_id: int
    audience_number: int
    date: datetime

class LessonCreate(LessonBase):
    pass

class Lesson(LessonBase):
    id: int
    subject: Optional[Subject] = None
    time: Optional[LessonTime] = None
    audience: Optional[Audience] = None

    class Config:
        from_attributes = True


# --- Расширенные схемы для связей ---
class SubjectWithLessons(Subject):
    lessons: List[Lesson] = []

class SquadWithSubjects(Squad):
    subjects: List[Subject] = []

class OfficerWithDetails(Officer):
    taught_subjects: List[Subject] = []
    responsible_squads: List[Squad] = []

class LessonWithDetails(Lesson):
    subject: Optional[Subject] = None
    time: Optional[LessonTime] = None
    audience: Optional[Audience] = None

# class ItemBase(BaseModel):
#     name: str
#     description: str | None = None

# class ItemCreate(ItemBase):
#     pass

# class Item(ItemBase):
#     id: int

#     class Config:
#         from_attributes = True
