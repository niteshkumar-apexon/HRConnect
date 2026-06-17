import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Leaves from "./pages/Leaves/Leaves";
import Admin from "./pages/Admin/Admin";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;