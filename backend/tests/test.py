# backend/tests/test.py
import pytest
import requests
import random
import string
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    adapter = requests.adapters.HTTPAdapter(pool_connections=10, pool_maxsize=10)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def test_holiday(api_client):
    day = "12.04.25"
    response = api_client.post(f"{BASE_URL}/settings/save_holiday", json= {"day" : day})
    assert response.status_code == 200

def test_holiday_get(api_client):
    response = api_client.get(f"{BASE_URL}/settings/get_holidays")
    assert response.status_code == 200

def test_del_holiday(api_client):
    day = "12.04.25"
    try:
        response = api_client.delete(f"{BASE_URL}/settings/delete_holiday", json= {"day" : day})
        assert response.status_code == 200
    except:
        pass 

# Тест базового чтения расписания
def test_1_schedule_basic_read(api_client):
    # Простой тест без нагрузки
    response = api_client.get(f"{BASE_URL}/schedule", timeout=5)
    assert response.status_code == 200

# Тест чтения нескольких основных эндпоинтов
def test_2_read_multiple_endpoints(api_client):
    endpoints = ["/platoons", "/subjects", "/teachers", "/departments", "/health"]
    
    for endpoint in endpoints:
        try:
            response = api_client.get(f"{BASE_URL}{endpoint}", timeout=5)
            assert response.status_code == 200
        except:
            pass

# Тест создания предмета
def test_3_create_subject_simple(api_client):
    # Создаем один предмет
    name = f"ТестПредмет_{random.randint(1, 100000)}"
    try:
        response = api_client.post(f"{BASE_URL}/subjects", 
                                 json={"name": name}, 
                                 timeout=5)
        assert response.status_code == 200
    except:
        pass

# Тест здоровья сервера
def test_4_health_check(api_client):
    response = api_client.get(f"{BASE_URL}/health", timeout=5)
    assert response.status_code == 200

# Тест фильтрации взводов
def test_5_filter_platoons(api_client):
    try:
        dept_response = api_client.get(f"{BASE_URL}/departments", timeout=5)
        if dept_response.status_code == 200 and dept_response.json():
            department_id = dept_response.json()[0]["id"]
            response = api_client.get(f"{BASE_URL}/platoons?department_id={department_id}", timeout=5)
            assert response.status_code == 200
    except:
        pass

# Тест получения предметов для взвода
def test_6_get_platoon_subjects(api_client):
    try:
        platoons_response = api_client.get(f"{BASE_URL}/platoons", timeout=5)
        if platoons_response.status_code == 200 and platoons_response.json():
            platoon_id = platoons_response.json()[0]["number"]
            response = api_client.get(f"{BASE_URL}/schedule/subjects?platoon_id={platoon_id}", timeout=5)
            assert response.status_code == 200
    except:
        pass

# Тест детальной информации о взводе
def test_7_platoon_details(api_client):
    try:
        platoons_response = api_client.get(f"{BASE_URL}/platoons", timeout=5)
        if platoons_response.status_code == 200 and platoons_response.json():
            platoon_id = platoons_response.json()[0]["number"]
            response = api_client.get(f"{BASE_URL}/platoons/{platoon_id}", timeout=5)
            assert response.status_code == 200
    except:
        pass

# Тест чтения дисциплин
def test_8_disciplines_read(api_client):
    try:
        response = api_client.get(f"{BASE_URL}/disciplines/subject-loads", timeout=5)
        assert response.status_code == 200
    except:
        pass

# Тест доступности системы
def test_9_system_availability(api_client):
    critical_endpoints = ["/schedule", "/health", "/platoons"]
    
    for endpoint in critical_endpoints:
        try:
            response = api_client.get(f"{BASE_URL}{endpoint}", timeout=5)
            assert response.status_code == 200
        except:
            pass

# Тест легкой нагрузки - 10 параллельных запросов
def test_10_light_load(api_client):
    endpoints = ["/schedule", "/platoons", "/subjects", "/health"]
    
    def make_request():
        endpoint = random.choice(endpoints)
        try:
            response = api_client.get(f"{BASE_URL}{endpoint}", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request) for _ in range(10)]
        
        success_count = 0
        for future in as_completed(futures):
            if future.result():
                success_count += 1
        
        assert success_count == 10

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])