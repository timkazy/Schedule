# Расписание (Schedule)

#### **Описание проекта**
```bash
# Запуск всего проекта
./start.bat
```

#### **Запуск отдельно backend-а**

Для Windows:

```bash
# Создание виртуального окружения
python -m venv backend/venv
# Активация виртуального окружения
backend\venv\Scripts\activate
# Накат необходимых зависимостей
pip install -r requirements.txt
# Запуск главного файла
python backend/main.py
```

Для Linux:

```bash
# Создание виртуального окружения
# python -m venv backend/venv
# Активация виртуального окружения
source venv/bin/activate
# Накат необходимых зависимостей
pip install -r requirements.txt
# Запуск главного файла
cd ./backend
uvicorn main:app --reload
```

#### **Запуск отдельно frontend-а**
Для этого необходимо скачать node.js
https://nodejs.org/en/download
Версия 22.21.1 (LTS)
После установки в директории проекта
```bash
cd .\frontend\
# Установка зависимостей
npm install
# Запуск проекта
npm run dev
```

#### **Working with Git**
В случае необходимости слития наработок из своей ветки:
  1. Создать Pull-requests
  2. Описать ревьюеров, получить их Accept
  3. Слить в новую ветку, удалив исходную
  4. Удалить смерженную ветку локально
  5. Переключиться на main-ветку локально и создать новую ветку для будущих задач

#### **Алгоритм слияния:**
  1. `git checkout main` - убедиться что локальная main ветка актуальна.
  2. `git pull origin main` - актуализировать main, чтобы избежать конфликтов.
  3. `git checkout <ветка>` - переключиться на свою ветку.
  4. `git merge main` - слияние с main. Если возникнут конфликты - разрешить вручную. 
  5. `git push origin <ветка>` - отправить в github.
  6. Создать Pull-request
  7. `git checkout main` - переключиться на ветку main если еще не здесь.
  8. `git branch -d <ветка>` - удалить ветку локально.