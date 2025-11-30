// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, Dumbbell } from "lucide-react";

/* -------------------------------------------
   PASSIIFY THEME TOKENS (Blue + Orange)
------------------------------------------- */
const THEME = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9", // sky-500
  accentTo: "#F97316", // orange-500
  light: {
    bg: "#FFFFFF",
    border: "rgba(148,163,184,0.55)",
    textMain: "#020617",
    textMuted: "#6B7280",
    chipBg: "#F9FAFB",
  },
  dark: {
    bg: "#020617",
    border: "rgba(30,64,175,0.75)",
    textMain: "#E5E7EB",
    textMuted: "#9CA3AF",
    chipBg: "#020617",
  },
};

const HERO_ROUTES = ["/", "/explore", "/events"];

/* -------------------------------------------
   THEME HELPER — auto-follow device
------------------------------------------- */
const getSystemMode = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mode, setMode] = useState(getSystemMode); // 🟦 auto from device

  const navigate = useNavigate();
  const location = useLocation();

  const isHeroRoute = HERO_ROUTES.includes(location.pathname);
  const gradient = `linear-gradient(120deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo})`;
  const palette = mode === "light" ? THEME.light : THEME.dark;

  /* -------------------------------------------
     THEME — follow device only (no localStorage)
  ------------------------------------------- */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      setMode(e.matches ? "dark" : "light");
    };

    // initial sync + listener
    handleChange(mq);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  /* -------------------------------------------
     Read user on route change
  ------------------------------------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]);

  /* -------------------------------------------
     Scroll effect → stronger shadow after 16px
     (only really visible when at top)
  ------------------------------------------- */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    { name: "About", path: "/about" },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // Solid, premium container — no glass/backdrop blur
  const containerStyle = {
    backgroundColor: palette.bg,
    borderBottom: `1px solid ${palette.border}`,
    boxShadow: scrolled
      ? "0 18px 60px rgba(15,23,42,0.55)"
      : isHeroRoute
      ? "0 10px 35px rgba(15,23,42,0.38)"
      : "0 14px 45px rgba(15,23,42,0.45)",
    transition: "box-shadow 200ms ease, background-color 200ms ease",
  };

  const logoBoxStyle = {
    backgroundColor: "#020617",
    border: "1px solid rgba(148,163,184,0.6)",
    boxShadow: "0 18px 60px rgba(15,23,42,0.85)",
  };

  return (
    // 🔹 No more `fixed top-0` → navbar scrolls with page
    <nav className="w-full z-40">
      {/* Main nav bar */}
      <div style={containerStyle}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 md:py-3.5">
          {/* LOGO + BRAND */}
          <Link to="/" className="flex items-center gap-2 group">
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-2xl overflow-hidden"
              style={logoBoxStyle}
            >
              {/* subtle gradient motion strip */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage: `conic-gradient(from 220deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo}, ${THEME.accentFrom})`,
                  mixBlendMode: "screen",
                }}
              />
              <span className="relative text-[10px] font-semibold tracking-[0.20em] text-white uppercase">
                Pf
              </span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center">
                <Dumbbell className="w-2.5 h-2.5 text-sky-400" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="text-[18px] md:text-[19px] font-black tracking-tight"
                style={{ color: palette.textMain }}
              >
                Passiify
              </span>
              <span
                className="text-[9px] uppercase tracking-[0.26em]"
                style={{ color: palette.textMuted }}
              >
                Move every city
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative text-sm font-medium"
              >
                <span
                  className="transition-colors"
                  style={{
                    color: isActive(link.path)
                      ? palette.textMain
                      : palette.textMuted,
                  }}
                >
                  {link.name}
                </span>
                {isActive(link.path) && (
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] rounded-full"
                    style={{ width: "100%", backgroundImage: gradient }}
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
                  className="transition-colors"
                  style={{
                    color: isActive("/my-dashboard")
                      ? palette.textMain
                      : palette.textMuted,
                  }}
                >
                  Dashboard
                </span>
                {isActive("/my-dashboard") && (
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] rounded-full"
                    style={{ width: "100%", backgroundImage: gradient }}
                  />
                )}
              </Link>
            )}
          </div>

          {/* DESKTOP AUTH AREA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                  style={{
                    backgroundColor: palette.chipBg,
                    border: `1px solid ${palette.border}`,
                    color: palette.textMain,
                  }}
                >
                  <User
                    className="w-4 h-4"
                    style={{ color: THEME.accentMid }}
                  />
                  <span>
                    Hi,&nbsp;
                    <span className="font-semibold">
                      {user.user?.name || user.name || "Mover"}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold px-4 py-2 rounded-full shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.03] transition-transform"
                  style={{ backgroundImage: gradient, color: "#020617" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                  style={{
                    border: `1px solid ${palette.border}`,
                    color: palette.textMain,
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-full shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.03] transition-transform"
                  style={{ backgroundImage: gradient, color: "#020617" }}
                >
                  Join Passiify
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON — subtle motion like modern apps */}
          <button
            className="md:hidden rounded-full p-1.5 transition-transform duration-150"
            style={{
              color: palette.textMain,
              transform: menuOpen ? "scale(1.05)" : "scale(1)",
            }}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Subtle gradient accent line under navbar */}
      <div
        className="h-[2px] w-full"
        style={{
          backgroundImage: gradient,
          opacity: isHeroRoute && !scrolled ? 0.9 : 1,
        }}
      />

      {/* MOBILE DROPDOWN — now collapses height when closed */}
      <div
        className="md:hidden overflow-hidden transition-all duration-200"
        style={{
          maxHeight: menuOpen ? 500 : 0,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          backgroundColor: palette.bg,
          borderBottom: menuOpen ? `1px solid ${palette.border}` : "transparent",
          boxShadow: menuOpen ? "0 18px 60px rgba(15,23,42,0.8)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between py-1"
              style={{
                color: isActive(link.path)
                  ? palette.textMain
                  : palette.textMuted,
              }}
            >
              <span>{link.name}</span>
              {isActive(link.path) && (
                <span
                  className="h-[2px] w-10 rounded-full"
                  style={{ backgroundImage: gradient }}
                />
              )}
            </Link>
          ))}

          {/* Dashboard on mobile */}
          {user && (
            <Link
              to="/my-dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between py-1"
              style={{
                color: isActive("/my-dashboard")
                  ? palette.textMain
                  : palette.textMuted,
              }}
            >
              <span>Dashboard</span>
              {isActive("/my-dashboard") && (
                <span
                  className="h-[2px] w-10 rounded-full"
                  style={{ backgroundImage: gradient }}
                />
              )}
            </Link>
          )}

          <div
            className="h-px my-2"
            style={{ backgroundColor: palette.border }}
          />

          {user ? (
            <>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: palette.textMain }}
              >
                <User
                  className="w-4 h-4"
                  style={{ color: THEME.accentMid }}
                />
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
                className="mt-1 w-full text-xs font-semibold px-4 py-2 rounded-full shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.02] transition-transform"
                style={{ backgroundImage: gradient, color: "#020617" }}
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                style={{
                  border: `1px solid ${palette.border}`,
                  color: palette.textMain,
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="w-full text-center text-xs font-semibold px-4 py-2 rounded-full shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.02] transition-transform"
                style={{ backgroundImage: gradient, color: "#020617" }}
              >
                Join Passiify
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
