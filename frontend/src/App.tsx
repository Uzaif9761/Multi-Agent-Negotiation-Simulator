import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scenario from "./pages/Scenario";
import Agents from "./pages/Agents";
import Negotiation from "./pages/Negotiation";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scenario" element={<Scenario />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/negotiation" element={<Negotiation />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/negotiation" element={<Negotiation />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}

export default App;