import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Music, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password should be at least 6 characters");
      return;
    }
    setLoading(true);

    try {
      const result = await register(name.trim(), email.trim(), password, role);
      if (result.success) {
        toast.success(`Welcome to ConcertHub, ${name.trim()}! Logged in as ${role === "ADMIN" ? "Admin" : "User"}.`);
        if (role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error(result.message || "Failed to create account");
      }
    } catch {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-accent-bg opacity-10" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-scale-in space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl gradient-accent-bg flex items-center justify-center glow-accent shadow-lg">
              <Music className="w-6 h-6 text-accent-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold gradient-text">Create Your Account</h1>
          <p className="text-muted-foreground mt-1 text-sm">Join ConcertHub to book tickets and manage events</p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-secondary border-border/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border/50"
                  required
                />
              </div>
            </div>

            {/* Account Role / Mode Choice */}
            <div className="space-y-1.5">
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("USER")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === "USER"
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-secondary/60 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Music Fan (User)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    role === "ADMIN"
                      ? "bg-accent/20 border-accent text-accent"
                      : "bg-secondary/60 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" /> Organizer (Admin)
                </button>
              </div>
            </div>

            <Button variant="neon" className="w-full gap-2 mt-4" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Get Started <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground pt-2 border-t border-border/50">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
