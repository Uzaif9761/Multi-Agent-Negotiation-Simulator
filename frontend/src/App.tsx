import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Scenario from "./pages/Scenario";
import Agents from "./pages/Agents";
import Negotiation from "./pages/Negotiation";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scenario" element={<ProtectedRoute><Scenario /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
        <Route path="/negotiation" element={<ProtectedRoute><Negotiation /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;