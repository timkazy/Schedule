from sqlalchemy.orm import Session
from .database import engine, SessionLocal
from .models import Base, LessonType, Department, SquadType, Audience, Subject, Officer, StartEndDate, Holiday

def init_database():
    """Инициализация базы данных - создание таблиц и заполнение начальными данными"""
    # Создаем таблицы
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Заполняем начальные данные, если таблицы пустые
        fill_initial_data(db)
        db.commit()
        print("✅ База данных инициализирована")
    except Exception as e:
        db.rollback()
        print(f"❌ Ошибка при инициализации БД: {e}")
        raise
    finally:
        db.close()

def fill_initial_data(db: Session):
    """Заполнение начальных данных"""
    
    # 1. Типы занятий
    lesson_types = [
        {"id": 1, "name": "лекция"},
        {"id": 2, "name": "практика"},
        {"id": 3, "name": "гр. занятие"},
        {"id": 4, "name": "семинар"},
        {"id": 5, "name": "срс"}
    ]
    for lt_data in lesson_types:
        if not db.query(LessonType).filter(LessonType.id == lt_data["id"]).first():
            lesson_type = LessonType(**lt_data)
            db.add(lesson_type)
    
    # 2. Кафедры
    departments = [
        {"id": 1, "name": "СВиАД"},
        {"id": 2, "name": "БЭ"},
        {"id": 3, "name": "АО"},
        {"id": 4, "name": "РЭО"},
        {"id": 5, "name": "СНОП"},
        {"id": 6, "name": "БПЛА"}
    ]
    for dept_data in departments:
        if not db.query(Department).filter(Department.id == dept_data["id"]).first():
            department = Department(**dept_data)
            db.add(department)
    
    # 3. Типы взводов
    squad_types = [
        {"id": 1, "type": "Офицеры запаса", "course": 2},
        {"id": 2, "type": "Офицеры запаса", "course": 3},
        {"id": 3, "type": "Офицеры запаса", "course": 4},
        {"id": 4, "type": "Офицеры кадра", "course": 1},
        {"id": 5, "type": "Офицеры кадра", "course": 2},
        {"id": 6, "type": "Офицеры кадра", "course": 3},
        {"id": 7, "type": "Офицеры кадра", "course": 4},
        {"id": 8, "type": "Солдаты запаса", "course": 2},
        {"id": 9, "type": "Солдаты запаса", "course": 3},
    ]
    for st_data in squad_types:
        if not db.query(SquadType).filter(SquadType.id == st_data["id"]).first():
            squad_type = SquadType(**st_data)
            db.add(squad_type)
    
    # 4. Аудитории
    audiences_data = [208, 210, 227, 305, 110, 104, 209, 313, 212, 123, 226]
    for aud_num in audiences_data:
        if not db.query(Audience).filter(Audience.number == aud_num).first():
            audience = Audience(number=aud_num)
            db.add(audience)
    
    # 5. Предметы
    subjects = [
        {"id": 1, "name": "СРС"},
        {"id": 2, "name": "ОВП"},
        {"id": 3, "name": "ОТ"},
        {"id": 4, "name": "ОАТ"},
        {"id": 5, "name": "КВС"},
        {"id": 6, "name": "РЛО"},
        {"id": 7, "name": "ТЭиРЭО"}
    ]
    for subj_data in subjects:
        if not db.query(Subject).filter(Subject.id == subj_data["id"]).first():
            subject = Subject(**subj_data)
            db.add(subject)
    
    # 6. Преподаватели
    officers = [
        {"id": 1, "first_name": "Дмитрий", "second_name": "Орлов", "surname": "Валерьевич"},
        {"id": 2, "first_name": "Алексей", "second_name": "Овчинников", "surname": "Владимирович"},
        {"id": 3, "first_name": "Ситдиков", "second_name": "Венер", "surname": "Мунирович"},
        {"id": 4, "first_name": "Саяхов", "second_name": "Альберт", "surname": "Рауфович"},
        {"id": 5, "first_name": "Оглобличев", "second_name": "Максим", "surname": "Алексеевич"},
        {"id": 6, "first_name": "Ахмедянов", "second_name": "Сергей", "surname": "Александрович"},
        {"id": 7, "first_name": "Корнилов", "second_name": "Игорь", "surname": "Владимирович"},
        {"id": 8, "first_name": "Трофимов", "second_name": "Виталий", "surname": "Анатольевич"},
        {"id": 9, "first_name": "Яхин", "second_name": "Азат", "surname": "Варисович"},
        {"id": 10, "first_name": "Храмченко", "second_name": "Руслан", "surname": "Иванович"},
        {"id": 11, "first_name": "Сергеев", "second_name": "Алексей", "surname": "Петрович"},
        {"id": 12, "first_name": "Шартдинов", "second_name": "Айдар", "surname": "Шайхлисламович"},
        {"id": 13, "first_name": "Алказ", "second_name": "Вадим", "surname": "Александрович"},
        {"id": 14, "first_name": "Ступин", "second_name": "Евгений", "surname": "Олегович"},
        {"id": 15, "first_name": "Загиров", "second_name": "Наиль", "surname": "Абдрахманович"},
        {"id": 16, "first_name": "Кабиров", "second_name": "Ильнур", "surname": "Равилевич"},
        {"id": 17, "first_name": "Ворошилов", "second_name": "Сергей", "surname": "Иванович"},
        {"id": 18, "first_name": "Шиверских", "second_name": "Антон", "surname": "Сергеевич"},
        {"id": 19, "first_name": "Чернявский", "second_name": "Михаил", "surname": "Анатольевич "},
        {"id": 20, "first_name": "Веледов", "second_name": "Магир", "surname": "Идриснаби"},
        {"id": 21, "first_name": "Рзаев", "second_name": "Дмитрий", "surname": "Олегович"},
        {"id": 22, "first_name": "Садыков", "second_name": "Азамат", "surname": "Камилевич"},
        {"id": 23, "first_name": "Селуянов", "second_name": "Андрей", "surname": "Александрович"},
        {"id": 24, "first_name": "Мустафин", "second_name": "Марсель", "surname": "Рафитович"},
        {"id": 25, "first_name": "Воробьев", "second_name": "Николай", "surname": "Александрович"},
        {"id": 26, "first_name": "Файзуллин", "second_name": "Рамиль", "surname": "Равильевич"}
    ]
    for officer_data in officers:
        if not db.query(Officer).filter(Officer.id == officer_data["id"]).first():
            officer = Officer(**officer_data)
            db.add(officer)
    
    # 7. Даты начала/окончания семестров
    start_end_dates = [
        {"start_0": "2025-09-01", "end_0": "2025-12-30", "start_1": "2026-02-01", "end_1": "2026-06-25"}
    ]
    for date_data in start_end_dates:
        if not db.query(StartEndDate).filter(StartEndDate.start_0 == date_data["start_0"]).first():
            date_record = StartEndDate(**date_data)
            db.add(date_record)
    
    print("✅ Начальные данные заполнены")