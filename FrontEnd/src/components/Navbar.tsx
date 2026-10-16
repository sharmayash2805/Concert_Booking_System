import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Glyph from "@/components/Glyph";

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = [
    { label: "Home", path: "/" },
    ...(user ? [{ label: "My Bookings", path: "/dashboard" }] : []),
    ...(user?.role === "ADMIN" ? [{ label: "Admin", path: "/admin" }] : []),
  ];
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-9 w-9 place-items-center border-2 border-ink bg-vermilion font-display text-xl text-paper">S</div>
          <span className="font-display text-2xl uppercase">Stubline</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "neon" : "ghost"}
                size="sm"
                className="text-sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
              <Button variant="outline" size="sm" className="gap-2" onClick={logout}>
              <Glyph name="logout" /> Sign Out
            </Button>
          ) : <Link to="/login">
            <Button variant="outline" size="sm" className="gap-2">
              <Glyph name="user" />
              Login
            </Button>
          </Link>}
        </div>

        <button
          className="md:hidden border-2 border-ink px-3 py-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          <Glyph name={mobileOpen ? "close" : "menu"} className="text-xl" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t-2 border-ink bg-paper">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                <Button
                  variant={location.pathname === item.path ? "neon" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {user ? (
              <Button variant="outline" className="w-full gap-2" onClick={() => { setMobileOpen(false); logout(); }}>
                <Glyph name="logout" /> Sign Out
              </Button>
            ) : <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full gap-2"><Glyph name="user" /> Login</Button>
            </Link>}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
