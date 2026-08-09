import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Scenario", path: "/scenario" },
    { name: "Agents", path: "/agents" },
    { name: "Negotiation", path: "/negotiation" },
    { name: "Reports", path: "/reports" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-cyan-300"
          >
            🤖 Multi-Agent AI
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  isActive
                    ? "text-cyan-300 font-semibold"
                    : "hover:text-cyan-300"
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Login/Logout Button */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:block bg-cyan-400 text-black px-4 py-2 rounded-lg hover:bg-cyan-300 transition-colors"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-4 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className="hover:text-cyan-300"
              >
                {item.name}
              </NavLink>
            ))}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg w-fit border border-red-500/20"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-cyan-400 text-black px-4 py-2 rounded-lg w-fit"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;