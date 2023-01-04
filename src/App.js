import './styles/App.scss';
import { Routes, Route, Navigate } from "react-router-dom";
import StartPage from './pages/startPage';
import BrewPage from "./pages/brewPage";
import ProfilingPage from './pages/profilingPage';
import HistoryPage from './pages/historyPage';
import SettingsPage from './pages/settingsPage';
import NotFoundPage from './pages/notFoundPage';

window.TEST_WITHOUT_ESP = false

function App() {
  return (
    <Routes>
        <Route path="/"           element={<StartPage /> } />
        <Route path="/brew/:graphState" element={<BrewPage /> } />
        <Route path="/brew/*" element={<Navigate to="/brew/Past" />} />
        <Route path="/profiling/*"  element={<ProfilingPage /> } />
        <Route path="/history/*"   element={<HistoryPage /> } />
        <Route path="/settings/*"   element={<SettingsPage /> } />
        <Route path="*"           element={<NotFoundPage /> } />
    </Routes>
  );
}

export default App;