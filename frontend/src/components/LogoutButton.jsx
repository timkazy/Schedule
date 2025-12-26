// frontend/components/LogoutButton.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function LogoutButton() {
  const { logout, user } = useContext(AuthContext);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-white rounded-lg px-3 py-1 shadow-md">
          <div className="text-sm font-medium text-gray-700">
            {user?.first_name} {user?.last_name}
          </div>
          <div className="text-xs text-gray-500">
            {user?.role === "teacher" ? "👨‍🏫 Преподаватель" : "👨‍🎓 Студент"}
          </div>
        </div>
        
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
          title="Выйти из системы"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
            />
          </svg>
          Выйти
        </button>
      </div>
    </div>
  );
}

export default LogoutButton;