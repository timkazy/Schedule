from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import date, datetime
from typing import Optional, List

# Базовые схемы
class LessonTypeBase(BaseModel):
    name: str

class LessonTypeCreate(LessonTypeBase):
    pass

class LessonType(LessonTypeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DepartmentBase(BaseModel):
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AudienceBase(BaseModel):
    number: int

class AudienceCreate(AudienceBase):
    pass

class Audience(AudienceBase):
    model_config = ConfigDict(from_attributes=True)

class SquadTypeBase(BaseModel):
    type: str
    course: int

class SquadTypeCreate(SquadTypeBase):
    pass

class SquadType(SquadTypeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SquadBase(BaseModel):
    number: str
    department_id: int
    squad_type_id: int
    day: int
    start_week: int
    end_week: int

class SquadCreate(SquadBase):
    pass

class Squad(SquadBase):
    model_config = ConfigDict(from_attributes=True)

class OfficerBase(BaseModel):
    first_name: str
    second_name: str
    surname: str

class OfficerCreate(OfficerBase):
    pass

class Officer(OfficerBase):
    id: int
    full_name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class SubjectBase(BaseModel):
    name: str

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Сложные схемы
class SubjectLoadBase(BaseModel):
    subject_id: int
    department_id: int
    squad_type_id: int
    semester: bool

class SubjectLoadCreate(SubjectLoadBase):
    pass

class SubjectLoad(SubjectLoadBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class SquadSubjectLoadBase(BaseModel):
    subject_load_id: int
    squad: str
    officers: str  # Строка с разделителем "/"

class SquadSubjectLoadCreate(SquadSubjectLoadBase):
    pass

class SquadSubjectLoad(SquadSubjectLoadBase):
    model_config = ConfigDict(from_attributes=True)

class SubjectHoursLoadCountBase(BaseModel):
    subject_load_id: int
    lesson_type_id: int
    hours_count: int
    audiences: str  # Строка с разделителем "/"

class SubjectHoursLoadCountCreate(SubjectHoursLoadCountBase):
    pass

class SubjectHoursLoadCount(SubjectHoursLoadCountBase):
    model_config = ConfigDict(from_attributes=True)

class ThemeBase(BaseModel):
    subject_load_id: int
    lesson_type_id: int
    topic: int
    subtopic: int
    hours_count: int
    topic_name: Optional[str] = None
    subtopic_name: Optional[str] = None

class ThemeCreate(ThemeBase):
    pass

class Theme(ThemeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class LessonBase(BaseModel):
    squad: Optional[str] = None
    theme_id: Optional[int] = None
    officer_id: Optional[int] = None
    subject_load_id: Optional[int] = None
    date: date
    sequence_number: int
    audience: Optional[int] = None

class LessonCreate(LessonBase):
    pass

class Lesson(LessonBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Схемы для ответов API
class SubjectWithLoads(Subject):
    loads_count: int

class DepartmentWithStats(Department):
    squads_count: int
    loads_count: int

class TeacherWithConnections(Officer):
    connections: List[dict] = []

class SubjectLoadDetails(SubjectLoad):
    subject_name: Optional[str] = None
    department_name: Optional[str] = None
    type: Optional[str] = None
    course: Optional[int] = None
    squads: List[dict] = []
    hours_load: List[dict] = []
    themes: List[dict] = []

class SquadDetails(Squad):
    department_name: Optional[str] = None
    type: Optional[str] = None
    course: Optional[int] = None

class AudienceDetails(Audience):
    load_count: int = 0
    lessons_count: int = 0
    last_lesson_date: Optional[date] = None
    hour_loads: List[dict] = []



class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int

class UserLogin(BaseModel):
    username: str
    password: str

class UserInDB(UserBase):
    id: int
    role_id: int
    is_active: bool

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleInDB(RoleBase):
    id: int