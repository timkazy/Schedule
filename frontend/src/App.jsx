import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { EditProvider } from "./context/EditContext";
import { ActionPanelProvider } from "./context/ActionPanelContext";
import ActionPanel from "./components/panels/ActionPanel";

import Login from "./pages/Login";
import Menu from "./components/menu/Menu";

import Schedule from "./pages/Schedule";
import Platoons from "./pages/Platoons";
import Disciplines from "./pages/Disciplines";
import Teachers from "./pages/Teachers";
import Audience from "./pages/Audience";
import Settings from "./pages/Settings";
import Subjects from "./pages/Subjects";
import Departments from "./pages/Departments";

import LogoutButton from "./components/LogoutButton"; // Новый компонент
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, role, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  const { isAuthenticated, isTeacher } = useContext(AuthContext);

  return (
    <>
      {isAuthenticated && (
        <>
          <Menu />
          <ActionPanel />
          <LogoutButton /> {/* Кнопка выхода */}
        </>
      )}
      
      <div className={isAuthenticated ? "ml-20 mr-20" : ""}>
        <Routes>
          {/* Публичный маршрут */}
          <Route path="/login" element={<Login />} />
          
          {/* Защищенные маршруты */}
          <Route path="/" element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          
          <Route path="/disciplines" element={
            <ProtectedRoute requiredRole="teacher">
              <Disciplines />
            </ProtectedRoute>
          } />
          
          <Route path="/platoons" element={
            <ProtectedRoute requiredRole="teacher">
              <Platoons />
            </ProtectedRoute>
          } />
          
          <Route path="/departments" element={
            <ProtectedRoute requiredRole="teacher">
              <Departments />
            </ProtectedRoute>
          } />
          
          <Route path="/subjects" element={
            <ProtectedRoute requiredRole="teacher">
              <Subjects />
            </ProtectedRoute>
          } />
          
          <Route path="/audience" element={
            <ProtectedRoute requiredRole="teacher">
              <Audience />
            </ProtectedRoute>
          } />
          
          <Route path="/teachers" element={
            <ProtectedRoute requiredRole="teacher">
              <Teachers />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute requiredRole="teacher">
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Перенаправление на главную если маршрут не найден */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <EditProvider>
        <ActionPanelProvider>
          <AppContent />
        </ActionPanelProvider>
      </EditProvider>
    </AuthProvider>
  );
}

export default App;