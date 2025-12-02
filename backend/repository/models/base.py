# каждый файл создаёт свою изолированную базу моделей, и 
# SQLAlchemy считает, что таблицы из других файлов «чужие» и их не существует.

# Нужно сделать так, чтобы все модели использовали один и тот же Base

from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()