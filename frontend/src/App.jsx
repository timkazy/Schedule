import "./App.css";
import { Routes, Route } from "react-router-dom";

import { EditProvider } from "./context/EditContext";
import { ActionPanelProvider } from "./context/ActionPanelContext";
import ActionPanel from "./components/panels/ActionPanel";

import Menu from "./components/menu/Menu";

import Schedule from "./pages/Schedule";
import Platoons from "./pages/Platoons";
import Disciplines from "./pages/Disciplines";
import Teachers from "./pages/Teachers";
import Audience from "./pages/Audience";
import Settings from "./pages/Settings";
import Subjects from "./pages/Subjects";
import Departments from "./pages/Departments";

import { useEdit } from "./context/useEdit";

function App() {
  return (
    <EditProvider>
      <ActionPanelProvider>
        <Menu />
        <ActionPanel />

        <div className="ml-20 mr-20">
          <Routes>
            <Route path="/" element={<Schedule />} />
            <Route path="/disciplines" element={<Disciplines />} />

            <Route path="/platoons" element={<Platoons />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/audience" element={<Audience />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </ActionPanelProvider>
    </EditProvider>
  );
}

export default App;
