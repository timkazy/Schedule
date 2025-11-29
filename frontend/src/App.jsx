import "./App.css";
import { Routes, Route } from "react-router-dom";

import { EditProvider } from "./context/EditContext";
import { ActionPanelProvider } from "./context/ActionPanelContext";
import ActionPanel from "./components/panels/ActionPanel";

import MainMenu from "./components/menu/MainMenu";
import AddMenu from "./components/menu/AddMenu";
import EditMenu from "./components/menu/EditMenu";

import Schedule from "./pages/Schedule";
import Platoons from "./pages/Platoons";
import Disciplines from "./pages/Disciplines";
import Teachers from "./pages/Teachers";
import Audience from "./pages/Audience";
import Settings from "./pages/Settings";


function App() {
  return (
    <EditProvider>
      <ActionPanelProvider>
        {/* Главное меню и режим редактирования переключаем через контекст */}
        <MainMenu />
        <AddMenu />
        <EditMenu />
        <ActionPanel />

        <div className="ml-20 mr-20">
          <Routes>
            <Route path="/" element={<Schedule />} />
            <Route path="/platoons" element={<Platoons />} />
            <Route path="/disciplines" element={<Disciplines />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/audience" element={<Audience />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </ActionPanelProvider>
    </EditProvider>
  );
}

export default App;
