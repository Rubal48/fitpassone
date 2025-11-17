// src/components/Navbar.jsx (or wherever you keep it)
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User } from "lucide-react";

/* -------------------------------------------
   THEME TOKENS (match Sunset Nomad homepage)
   ------------------------------------------- */
const THEME = {
  bg: "rgba(5, 3, 8, 0.90)",       // dark plum with transparency
  border: "rgba(248, 236, 220, 0.16)",
  accent1: "#FF4B5C",              // coral red
  accent2: "#FF9F68",              // warm peach
  textMain: "#FDFCFB",
  textMuted: "#A3A3B5",
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // read user on route change
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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Events", path: "/events" },
    { name: "Partner", path: "/partner" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      {/* Background + border + blur */}
      <div
        className="w-full backdrop-blur-xl border-b"
        style={{
          background: THEME.bg,
          borderColor: THEME.border,
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3 md:py-4">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-black/40 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.6)] overflow-hidden">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage: `conic-gradient(from 220deg, ${THEME.accent1}, ${THEME.accent2}, ${THEME.accent1})`,
                  mixBlendMode: "screen",
                }}
              />
              <span className="relative text-xs font-semibold tracking-[0.18em] text-white uppercase">
                Pf
              </span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg md:text-xl font-black tracking-tight text-white">
                Passiify
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-gray-400">
                Move every city
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm font-medium"
              >
                <span
                  className={`transition-colors ${
                    isActive(link.path)
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </span>
                {/* active underline */}
                {isActive(link.path) && (
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] rounded-full"
                    style={{
                      width: "100%",
                      backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                    }}
                  />
                )}
              </Link>
            ))}

            {/* DASHBOARD LINK (if logged in) */}
            {user && (
              <Link
                to="/my-dashboard"
                className="relative text-sm font-medium"
              >
                <span
                  className={`transition-colors ${
                    isActive("/my-dashboard")
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  Dashboard
                </span>
                {isActive("/my-dashboard") && (
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] rounded-full"
                    style={{
                      width: "100%",
                      backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                    }}
                  />
                )}
              </Link>
            )}
          </div>

          {/* DESKTOP AUTH */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/10">
                  <User className="w-4 h-4 text-orange-200" />
                  <span className="text-xs text-gray-200">
                    Hi,&nbsp;
                    <span className="font-semibold text-white">
                      {user.user?.name || user.name || "Mover"}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold px-4 py-2 rounded-full text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-white/40 text-gray-100 hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-full text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                  }}
                >
                  Join Passiify
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div
          className="md:hidden border-b backdrop-blur-xl"
          style={{
            background: "rgba(5,3,8,0.98)",
            borderColor: THEME.border,
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between py-1 ${
                  isActive(link.path)
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <span>{link.name}</span>
                {isActive(link.path) && (
                  <span
                    className="h-[2px] w-10 rounded-full"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                    }}
                  />
                )}
              </Link>
            ))}

            {/* Dashboard on mobile */}
            {user && (
              <Link
                to="/my-dashboard"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between py-1 ${
                  isActive("/my-dashboard")
                    ? "text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <span>Dashboard</span>
                {isActive("/my-dashboard") && (
                  <span
                    className="h-[2px] w-10 rounded-full"
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                    }}
                  />
                )}
              </Link>
            )}

            <div className="h-px bg-white/10 my-2" />

            {user ? (
              <>
                <div className="flex items-center gap-2 text-gray-200 text-xs">
                  <User className="w-4 h-4 text-orange-200" />
                  <span>
                    Hi,&nbsp;
                    <span className="font-semibold">
                      {user.user?.name || user.name || "Mover"}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="mt-1 w-full text-xs font-semibold px-4 py-2 rounded-full text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold px-4 py-2 rounded-full border border-white/40 text-gray-100 hover:bg-white/10 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold px-4 py-2 rounded-full text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
                  }}
                >
                  Join Passiify
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
