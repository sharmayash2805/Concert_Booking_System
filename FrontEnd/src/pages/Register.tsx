import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Glyph from "@/components/Glyph";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  email: z.string().trim().email("Enter a valid email address").max(255, "Email is too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password must be 72 characters or fewer"),
  acceptedTerms: z.boolean().refine((accepted) => accepted, "You must accept the demo terms and privacy notice"),
});

type RegisterValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const submit = async (values: RegisterValues) => {
    try {
      await createAccount(values.name, values.email, values.password);
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch {
      toast.error("Could not create account. Check the details or try signing in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="grid h-12 w-12 place-items-center border-2 border-ink bg-vermilion font-display text-2xl text-paper print-shadow-sm">
              S
            </div>
          </Link>
          <h1 className="font-display text-5xl">Create Account</h1>
          <p className="text-muted-foreground mt-2">Create an account to reserve tickets.</p>
        </div>

        <div className="border-2 border-ink bg-paper p-8 print-shadow space-y-6">
          <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <Glyph name="user" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="name" placeholder="John Doe" autoComplete="name" aria-invalid={Boolean(errors.name)} {...register("name")} className="pl-10 bg-secondary border-border/50" />
              </div>
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Glyph name="mail" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} className="pl-10 bg-secondary border-border/50" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Glyph name="lock" className="absolute left-3 top-1/2 -translate-y-1/2" />
                <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register("password")} className="pl-10 bg-secondary border-border/50" />
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  id="acceptedTerms"
                  type="checkbox"
                  aria-invalid={Boolean(errors.acceptedTerms)}
                  aria-describedby={errors.acceptedTerms ? "terms-error" : undefined}
                  className="mt-1 h-4 w-4 accent-vermilion"
                  {...register("acceptedTerms")}
                />
                <div className="text-sm">
                  <label htmlFor="acceptedTerms">I accept the demo terms and privacy notice.</label>
                  <p className="mt-1">
                    Review the <Link to="/terms" className="text-primary underline">Terms</Link> and <Link to="/privacy" className="text-primary underline">Privacy Notice</Link>.
                  </p>
                </div>
              </div>
              {errors.acceptedTerms && <p id="terms-error" className="text-sm text-destructive">{errors.acceptedTerms.message}</p>}
            </div>
            <Button variant="default" className="w-full" type="submit" disabled={isSubmitting}>Create Account</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
