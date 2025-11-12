import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  // ✅ Updated Navigation Links (Added About + Dashboard)
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Events", path: "/events" },
    { name: "Partner", path: "/partner" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* 🧿 Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-tight flex items-center"
        >
          <span className="text-blue-400">Pass</span>
          <span className="text-orange-400">iify</span>
        </Link>

        {/* 🌍 Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              className="relative font-medium text-white/90 hover:text-white transition duration-300 group"
            >
              {link.name}
              <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}

          {/* ✅ Dashboard Link (only if logged in) */}
          {user && (
            <Link
              to="/my-dashboard"
              className="relative font-medium text-white/90 hover:text-white transition duration-300 group"
            >
              Dashboard
              <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-orange-300 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          )}
        </div>

        {/* 👤 Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-300" />
                <span className="text-white/90">
                  Hi,{" "}
                  <span className="font-semibold text-orange-300">
                    {user.user?.name || user.name || "User"}
                  </span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="border border-white/70 px-4 py-2 rounded-full hover:bg-white/10 transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* 📱 Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* 📱 Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-blue-800/90 backdrop-blur-lg text-white border-t border-white/10">
          <div className="flex flex-col py-4 px-6 space-y-4 font-medium">
            {navLinks.map((link, i) => (
              <Link
                key={i}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-300 transition"
              >
                {link.name}
              </Link>
            ))}

            {/* ✅ Dashboard in Mobile View */}
            {user && (
              <Link
                to="/my-dashboard"
                onClick={() => setMenuOpen(false)}
                className="hover:text-orange-300 transition"
              >
                Dashboard
              </Link>
            )}

            {user ? (
              <>
                <span className="text-white/80">
                  Hi, {user.user?.name || user.name || "User"}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-semibold transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="border border-white/40 px-4 py-2 rounded-full text-center hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-center font-semibold transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
