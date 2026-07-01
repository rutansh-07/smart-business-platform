import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserCircle, LogOut, Settings as SettingsIcon, User, SlidersHorizontal, Check, Eye, EyeOff, LayoutDashboard, Briefcase, BarChart3, ChevronDown, Crown, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationsPanel } from "../NotificationsPanel";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: Briefcase },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => localStorage.getItem("smartbiz_theme") || "dark");
  const [colorblind, setColorblind] = useState(() => localStorage.getItem("smartbiz_colorblind") === "true");
  const [privacyMask, setPrivacyMask] = useState(() => localStorage.getItem("smartbiz_privacy") === "true");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light" || theme === "sepia") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    localStorage.setItem("smartbiz_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-colorblind", colorblind ? "true" : "false");
    localStorage.setItem("smartbiz_colorblind", colorblind ? "true" : "false");
  }, [colorblind]);

  useEffect(() => {
    document.documentElement.setAttribute("data-privacy-mask", privacyMask ? "true" : "false");
    localStorage.setItem("smartbiz_privacy", privacyMask ? "true" : "false");
  }, [privacyMask]);

  useEffect(() => {
    const savedToken = localStorage.getItem("smartbiz_token");
    const savedUser = localStorage.getItem("smartbiz_user");
    setToken(savedToken);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("smartbiz_token");
    localStorage.removeItem("smartbiz_user");
    toast.success("Successfully logged out!");
    setIsDropdownOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const closeAll = () => {
      setIsDropdownOpen(false);
      setIsPreferencesOpen(false);
    };
    if (isDropdownOpen || isPreferencesOpen) {
      document.addEventListener("click", closeAll);
    }
    return () => document.removeEventListener("click", closeAll);
  }, [isDropdownOpen, isPreferencesOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="
      fixed bottom-5 left-1/2 -translate-x-1/2
      w-[calc(100%-2rem)] max-w-xl rounded-2xl
      border border-border/40 bg-card/70 backdrop-blur-xl shadow-2xl
      lg:top-0 lg:bottom-auto lg:left-0 lg:translate-x-0
      lg:w-full lg:max-w-none lg:rounded-none
      lg:border-b lg:border-t-0 lg:border-x-0
      lg:bg-background/90 lg:backdrop-blur-md lg:shadow-sm
      z-50 transition-all duration-300
    ">
      <div className="w-full max-w-screen-xl mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">

        {/* ─── MOBILE TAB BAR — logged in ─── */}
        {token ? (
          <div className="flex lg:hidden w-full items-center justify-around">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative flex flex-col items-center gap-1 px-3 py-1"
                >
                  {/* Animated active pill background */}
                  {active && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 relative z-10 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-semibold relative z-10 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          /* MOBILE — logged out */
          <div className="flex lg:hidden w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-5 w-5 text-primary" />
              <span className="font-bold text-base tracking-tight text-primary">SmartBiz</span>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign In
              </Link>
              <Link to="/register" className={buttonVariants({ size: "sm", className: "bg-primary text-primary-foreground font-semibold" })}>
                Get Started
              </Link>
            </div>
          </div>
        )}

        {/* ─── DESKTOP FULL NAV ─── */}
        <div className="hidden lg:flex items-center justify-between w-full">

          {/* Left: Brand + Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Logo className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">SmartBiz</span>
            </Link>

            {token && (
              <nav className="flex items-center gap-1">
                {NAV_LINKS.map(({ to, label }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? "text-foreground bg-muted/60"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="desktop-nav-pill"
                          className="absolute inset-0 rounded-lg bg-muted/60"
                          transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right: Preferences + Auth/Profile */}
          <div className="flex items-center gap-3">

            {token && <NotificationsPanel token={token} />}

            {/* Preferences Panel */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreferencesOpen(!isPreferencesOpen);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card/60 backdrop-blur-sm hover:bg-muted/80 text-foreground transition-all cursor-pointer"
                title="Aesthetics & Accessibility Preferences"
              >
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
              </button>

              <AnimatePresence>
                {isPreferencesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-border bg-card p-4 text-foreground shadow-2xl z-50 flex flex-col gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-sm leading-none">System Preferences</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">Configure layout, colors, and accessibility</p>
                    </div>

                    <div className="h-px bg-border -mx-4" />

                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold text-muted-foreground">Financial Theme</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: "light", name: "Light", previewBg: "bg-white text-slate-800 border-slate-200" },
                          { key: "dark", name: "Dark", previewBg: "bg-[#080d16] text-white border-white/10" },
                          { key: "oled", name: "OLED", previewBg: "bg-black text-gray-200 border-white/5" },
                          { key: "sepia", name: "Sepia", previewBg: "bg-[#fdfbf7] text-[#2d251e] border-[#dfd5c3]" },
                        ].map((t) => (
                          <button
                            key={t.key}
                            onClick={() => setTheme(t.key)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${t.previewBg} ${
                              theme === t.key ? "ring-2 ring-blue-500 scale-[1.02] font-black" : "opacity-75"
                            }`}
                          >
                            <span>{t.name}</span>
                            {theme === t.key && (
                              <div className="absolute top-1 right-1 rounded-full bg-blue-500 p-0.5 text-white">
                                <Check className="h-2 w-2" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-border -mx-4" />

                    <div className="flex flex-col gap-3">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Privacy Mask</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {privacyMask ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            Blur balances unless hovered
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacyMask}
                          onChange={(e) => setPrivacyMask(e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!token ? (
              <>
                <Link to="/login" className={buttonVariants({ variant: "ghost" })}>
                  Sign In
                </Link>
                <Link to="/register" className={buttonVariants({ className: "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" })}>
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center gap-2.5 h-9 px-2 rounded-lg border border-border/60 hover:border-border hover:bg-muted/40 transition-all"
                >
                  <Avatar className="h-7 w-7">
                    {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground max-w-[100px] truncate">
                      {user?.name?.split(" ")[0] || "Account"}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground">|</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      user?.role === "admin"
                        ? "bg-amber-500/15 text-amber-500"
                        : "bg-sky-500/15 text-sky-500"
                    }`}>
                      {user?.role === "admin" ? "Owner" : "Employee"}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-border bg-card p-2 text-foreground shadow-2xl z-50"
                    >
                      {/* User info header */}
                      <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
                        <Avatar className="h-9 w-9 shrink-0">
                          {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold leading-none truncate">{user?.name || "Member"}</p>
                            <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              user?.role === "admin"
                                ? "bg-amber-500/15 text-amber-500"
                                : "bg-sky-500/15 text-sky-500"
                            }`}>
                              {user?.role === "admin" ? <><Crown className="h-2.5 w-2.5" /> Owner</> : <><Users className="h-2.5 w-2.5" /> Employee</>}
                            </span>
                          </div>
                          <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                            {user?.email || "member@smartbiz.in"}
                          </p>
                        </div>
                      </div>

                      <div className="-mx-2 my-1 h-px bg-border" />

                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      >
                        <SettingsIcon className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>

                      <div className="-mx-2 my-1 h-px bg-border" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}