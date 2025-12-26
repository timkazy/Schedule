// frontend/context/AuthContext.jsx
import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://192.168.0.6:8000";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState(null);

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");
    
    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        setRole(parsedUser.role);
        setIsAuthenticated(true);
        
        // Устанавливаем заголовок для всех запросов
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Ошибка при загрузке данных пользователя:", error);
        logout();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        username,
        password,
      });

      const { access_token, ...userData } = response.data;
      
      // Сохраняем токен и данные пользователя
      localStorage.setItem("token", access_token);
      localStorage.setItem("userInfo", JSON.stringify(userData));
      
      // Устанавливаем заголовок для всех последующих запросов
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      console.log(`🔧 Установлен заголовок Authorization для axios`);
      
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
      
      return response.data;
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Удаляем токен и данные пользователя
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    
    // Удаляем заголовок авторизации
    delete axios.defaults.headers.common["Authorization"];
    
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    
    // Можно также отправить запрос на сервер для инвалидации токена
    axios.post(`${API_BASE}/auth/logout`).catch(console.error);
  }, []);

  const isTeacher = () => role === "teacher";
  const isStudent = () => role === "student";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        role,
        login,
        logout,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};