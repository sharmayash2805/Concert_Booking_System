import { Link, useLocation, useNavigate } from "react-router-dom";
import { Music, Menu, X, User as UserIcon, Shield, Sparkles, LogOut, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAdmin, switchRole, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow-primary transition-all duration-300 group-hover:scale-110 shadow-md">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold gradient-text tracking-tight">ConcertHub</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                Live
              </span>
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button
              variant={location.pathname === "/" ? "neon" : "ghost"}
              size="sm"
              className="text-sm font-medium"
            >
              Browse Events
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              variant={location.pathname === "/dashboard" ? "neon" : "ghost"}
              size="sm"
              className="text-sm font-medium gap-1.5"
            >
              <Ticket className="w-4 h-4" />
              My Bookings
            </Button>
          </Link>
          <Link to="/admin">
            <Button
              variant={location.pathname === "/admin" ? "neon" : "ghost"}
              size="sm"
              className="text-sm font-medium gap-1.5"
            >
              <Shield className="w-4 h-4 text-accent" />
              Admin Panel
              {isAdmin && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-accent/20 text-accent font-bold">
                  Active
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* Right Section: Mode Switcher & User Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Dual Mode Switcher Pill */}
          <div className="flex items-center p-0.5 rounded-full bg-secondary/80 border border-border/70 text-xs">
            <button
              onClick={() => {
                if (isAdmin) switchRole("USER");
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-all ${
                !isAdmin
                  ? "gradient-bg text-white shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              User Mode
            </button>
            <button
              onClick={() => {
                if (!isAdmin) {
                  switchRole("ADMIN");
                  if (location.pathname !== "/admin") {
                    navigate("/admin");
                  }
                }
              }}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium transition-all ${
                isAdmin
                  ? "bg-accent text-accent-foreground shadow-sm font-bold glow-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Mode
            </button>
          </div>

          {/* User Account info */}
          <div className="flex items-center gap-2 pl-2 border-l border-border/60">
            <div className="text-right leading-tight">
              <p className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                {user.name.split(" ")[0]}
              </p>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isAdmin ? "text-accent" : "text-primary"}`}>
                {role}
              </span>
            </div>
            <Link to="/login" title="Switch or Sign In">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
                <Sparkles className="w-4 h-4 text-muted-foreground hover:text-primary" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Sign Out"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 text-foreground rounded-lg hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50 animate-fade-in p-4 space-y-4">
          {/* Dual Mode Switcher in Mobile */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Mode</p>
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-xl">
              <button
                onClick={() => {
                  switchRole("USER");
                  setMobileOpen(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${
                  !isAdmin ? "gradient-bg text-white font-bold" : "text-muted-foreground"
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" /> User Mode
              </button>
              <button
                onClick={() => {
                  switchRole("ADMIN");
                  setMobileOpen(false);
                  navigate("/admin");
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 ${
                  isAdmin ? "bg-accent text-accent-foreground font-bold" : "text-muted-foreground"
                }`}
              >
                <Shield className="w-3.5 h-3.5" /> Admin Mode
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === "/" ? "neon" : "ghost"}
                className="w-full justify-start text-sm"
              >
                Browse Events
              </Button>
            </Link>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === "/dashboard" ? "neon" : "ghost"}
                className="w-full justify-start text-sm gap-2"
              >
                <Ticket className="w-4 h-4" /> My Bookings
              </Button>
            </Link>
            <Link to="/admin" onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === "/admin" ? "neon" : "ghost"}
                className="w-full justify-start text-sm gap-2"
              >
                <Shield className="w-4 h-4 text-accent" /> Admin Panel
              </Button>
            </Link>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="neon-outline" size="sm">
                Switch User
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
