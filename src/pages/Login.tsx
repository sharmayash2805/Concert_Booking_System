import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Music, Shield, User as UserIcon, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Welcome back to ConcertHub!");
        if (email.toLowerCase().includes("admin")) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error(result.message || "Failed to log in");
      }
    } catch {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: "USER" | "ADMIN") => {
    loginAsDemo(role);
    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-pink/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-scale-in space-y-6">
        {/* Brand header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center glow-primary shadow-lg">
              <Music className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold gradient-text">Welcome to ConcertHub</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in or pick a demo mode below to test features
          </p>
        </div>

        {/* 1-Click Demo Selectors */}
        <div className="glass rounded-2xl p-5 border border-primary/30 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="w-4 h-4" />
            Instant One-Click Demo Access
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("USER")}
              className="p-3.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 hover:border-primary/50 text-left transition-all group hover-lift"
            >
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <UserIcon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                User Mode
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Browse concerts, pick zones & book seats
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              className="p-3.5 rounded-xl bg-secondary/80 hover:bg-secondary border border-border/60 hover:border-accent/50 text-left transition-all group hover-lift"
            >
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Shield className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                Admin Mode
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Manage events, view sales & attendees
              </p>
            </button>
          </div>
        </div>

        {/* Manual Credentials Card */}
        <div className="glass rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@concerthub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border/50 focus:border-primary"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Demo emails: <code className="text-primary">user@concerthub.com</code> or <code className="text-accent">admin@concerthub.com</code>
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-[11px] text-muted-foreground">Demo pw: <code className="text-foreground font-mono">user123</code> / <code className="text-foreground font-mono">admin123</code></span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <Button variant="neon" className="w-full gap-2 mt-2" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
                </>
              ) : (
                <>
                  Sign In to ConcertHub <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-2 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
