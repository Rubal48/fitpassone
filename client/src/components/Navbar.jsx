import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, Dumbbell } from "lucide-react";

/* -------------------------------------------
   PASSIIFY THEME TOKENS (Blue + Orange)
   ------------------------------------------- */
const THEME = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9",  // sky-500
  accentTo: "#F97316",   // orange-500
};

const HERO_ROUTES = ["/", "/explore", "/events"];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Read user on route change
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]);

  // Scroll effect for subtle shadow + opacity
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
    { name: "Partner", path: "/partner" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const gradient = `linear-gradient(120deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo})`;

  const isHeroRoute = HERO_ROUTES.includes(location.pathname);

  // Background behavior:
  // - Hero route + top of page → ultra-transparent glass
  // - After scroll OR non-hero route → solid glass card with shadow
  const containerClasses = (() => {
    if (isHeroRoute && !scrolled) {
      return [
        "border-b border-transparent",
        "bg-gradient-to-b from-slate-950/0 via-slate-950/25 to-slate-950/70",
        "dark:from-slate-950/0 dark:via-slate-950/35 dark:to-slate-950/85",
        "backdrop-blur-2xl",
        "shadow-none",
      ].join(" ");
    }
    // solid state
    return [
      "border-b border-slate-200/70 dark:border-slate-800/80",
      "bg-white/92 dark:bg-slate-950/90",
      "backdrop-blur-xl",
      "shadow-[0_18px_60px_rgba(15,23,42,0.75)]",
    ].join(" ");
  })();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40">
      {/* Glass background */}
      <div className={`w-full transition-all duration-300 ${containerClasses}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-3 md:py-3.5">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-950/95 dark:bg-slate-900/95 border border-white/10 shadow-[0_16px_40px_rgba(15,23,42,0.85)] overflow-hidden">
              {/* gradient wash */}
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  backgroundImage: `conic-gradient(from 220deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo}, ${THEME.accentFrom})`,
                  mixBlendMode: "screen",
                }}
              />
              {/* main initials */}
              <span className="relative text-[10px] font-semibold tracking-[0.20em] text-white uppercase">
                Pf
              </span>
              {/* fitness corner icon */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-950/90 border border-white/20 flex items-center justify-center">
                <Dumbbell className="w-2.5 h-2.5 text-sky-400" />
              </div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[18px] md:text-[19px] font-black tracking-tight text-slate-50 dark:text-white drop-shadow-sm">
                Passiify
              </span>
              <span className="text-[9px] uppercase tracking-[0.26em] text-slate-300/90 dark:text-slate-400">
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
                  className={`transition-colors ${
                    isActive(link.path)
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {link.name}
                </span>
                {isActive(link.path) && (
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] rounded-full"
                    style={{
                      width: "100%",
                      backgroundImage: gradient,
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
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                  <User className="w-4 h-4 text-sky-500" />
                  <span className="text-xs text-slate-700 dark:text-slate-200">
                    Hi,&nbsp;
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {user.user?.name || user.name || "Mover"}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold px-4 py-2 rounded-full text-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.85)] hover:scale-[1.03] transition-transform"
                  style={{ backgroundImage: gradient }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-300/85 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-full text-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.03] transition-transform"
                  style={{ backgroundImage: gradient }}
                >
                  Join Passiify
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-slate-900 dark:text-white"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div className="md:hidden border-b border-slate-200/85 dark:border-slate-800/85 backdrop-blur-xl bg-white/97 dark:bg-slate-950/97 shadow-[0_18px_60px_rgba(15,23,42,0.8)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between py-1 ${
                  isActive(link.path)
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
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
                className={`flex items-center justify-between py-1 ${
                  isActive("/my-dashboard")
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
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

            <div className="h-px bg-slate-200/80 dark:bg-slate-800/80 my-2" />

            {user ? (
              <>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 text-xs">
                  <User className="w-4 h-4 text-sky-500" />
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
                  className="mt-1 w-full text-xs font-semibold px-4 py-2 rounded-full text-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.02] transition-transform"
                  style={{ backgroundImage: gradient }}
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold px-4 py-2 rounded-full border border-slate-300/85 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold px-4 py-2 rounded-full text-slate-950 shadow-[0_16px_50px_rgba(15,23,42,0.9)] hover:scale-[1.02] transition-transform"
                  style={{ backgroundImage: gradient }}
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
