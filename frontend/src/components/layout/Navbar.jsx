import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, UserCircle, LogOut, Settings as SettingsIcon, User, SlidersHorizontal, Check, Eye, EyeOff, LayoutDashboard, Briefcase, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

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

  return (
    <header className="
      fixed bottom-6 left-1/2 -translate-x-1/2
      w-[calc(100%-2rem)] rounded-2xl
      border border-border/40 bg-card/65 backdrop-blur-md shadow-2xl
      lg:top-0 lg:bottom-auto lg:left-0 lg:translate-x-0
      lg:w-full lg:rounded-none
      lg:border-b lg:border-t-0 lg:border-x-0
      lg:bg-background/95 lg:shadow-sm
      z-50 transition-all duration-300
    ">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">

        {/* MOBILE TAB BAR — logged in */}
        {token ? (
          <div className="flex lg:hidden w-full items-center justify-around text-muted-foreground text-[10px] font-semibold py-1">
            <Link
              to="/dashboard"
              className={`flex flex-col items-center gap-1 transition-colors hover:text-foreground ${location.pathname === "/dashboard" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/projects"
              className={`flex flex-col items-center gap-1 transition-colors hover:text-foreground ${location.pathname === "/projects" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
            >
              <Briefcase className="h-5 w-5" />
              <span>Projects</span>
            </Link>

            <Link
              to="/analytics"
              className={`flex flex-col items-center gap-1 transition-colors hover:text-foreground ${location.pathname === "/analytics" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </Link>

            <Link
              to="/settings"
              className={`flex flex-col items-center gap-1 transition-colors hover:text-foreground ${location.pathname === "/settings" ? "text-primary font-bold" : "text-muted-foreground"
                }`}
            >
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        ) : (
          /* MOBILE — logged out */
          <div className="flex lg:hidden w-full items-center justify-between">
            <span className="font-bold text-base tracking-tight text-primary">SmartBiz</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-primary text-primary-foreground font-semibold">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}

        {/* DESKTOP FULL NAV */}
        <div className="hidden lg:flex items-center justify-between w-full">

          {/* Left: Brand + Nav Links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tight">SmartBiz</span>
            </Link>

            {token && (
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link
                  to="/dashboard"
                  className={`transition-colors hover:text-foreground ${location.pathname === "/dashboard" ? "text-foreground font-bold" : "text-muted-foreground"
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`transition-colors hover:text-foreground ${location.pathname === "/projects" ? "text-foreground font-bold" : "text-muted-foreground"
                    }`}
                >
                  Projects
                </Link>
                <Link
                  to="/analytics"
                  className={`transition-colors hover:text-foreground ${location.pathname === "/analytics" ? "text-foreground font-bold" : "text-muted-foreground"
                    }`}
                >
                  Analytics
                </Link>
                <Link
                  to="/settings"
                  className={`transition-colors hover:text-foreground ${location.pathname === "/settings" ? "text-foreground font-bold" : "text-muted-foreground"
                    }`}
                >
                  Settings
                </Link>
              </nav>
            )}
          </div>

          {/* Right: Preferences + Auth/Profile */}
          <div className="flex items-center space-x-3">

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
                <SlidersHorizontal className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>

              {isPreferencesOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-3 w-64 rounded-xl border border-border bg-card p-4 text-foreground shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-2 duration-100 flex flex-col gap-4"
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
                        { key: "dark", name: "Dark", previewBg: "bg-[#0b0f19] text-white border-white/10" },
                        { key: "oled", name: "OLED", previewBg: "bg-black text-gray-200 border-white/5" },
                        { key: "sepia", name: "Sepia", previewBg: "bg-[#fdfbf7] text-[#2d251e] border-[#dfd5c3]" },
                      ].map((t) => (
                        <button
                          key={t.key}
                          onClick={() => setTheme(t.key)}
                          className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden ${t.previewBg} ${theme === t.key ? "ring-2 ring-blue-500 scale-[1.02] font-black" : "opacity-75"
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
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Colorblind Mode</span>
                        <span className="text-[10px] text-muted-foreground">Gain: Blue / Loss: Orange</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={colorblind}
                        onChange={(e) => setColorblind(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                    </label>

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
                </div>
              )}
            </div>

            {!token ? (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex items-center justify-center h-9 w-9 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all overflow-hidden"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isDropdownOpen && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-border bg-card p-2 text-foreground shadow-2xl z-50 animate-in fade-in-0 slide-in-from-top-2 duration-100"
                  >
                    <div className="px-2 py-2">
                      <p className="text-sm font-semibold leading-none">{user?.name || "Member"}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                        {user?.email || "member@smartbiz.in"}
                      </p>
                    </div>

                    <div className="-mx-2 my-1.5 h-px bg-border" />

                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>

                    <div className="-mx-2 my-1.5 h-px bg-border" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}