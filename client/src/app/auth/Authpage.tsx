import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../components/ui/select";
import { GoogleIcon } from "../../components/google-icon";
import {
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { useLogin, useRegister } from "../../hooks/auth/auth.hooks";

// ═══════════════════════════════════════════════════
// AuthPage — Login & Register with smooth transitions
// ═══════════════════════════════════════════════════

export default function AuthPage() {
  const location = useLocation();
  const isRegisterRoute = location.pathname === "/register";
  const [mode, setMode] = useState<"login" | "register">(
    isRegisterRoute ? "register" : "login",
  );
  const [transitioning, setTransitioning] = useState(false);

  // Sync with route
  useEffect(() => {
    const target = location.pathname === "/register" ? "register" : "login";
    if (target !== mode) {
      setTransitioning(true);
      setTimeout(() => {
        setMode(target);
        setTransitioning(false);
      }, 200);
    }
  }, [location.pathname]);

  const switchMode = (to: "login" | "register") => {
    if (to === mode) return;
    setTransitioning(true);
    setTimeout(() => {
      setMode(to);
      setTransitioning(false);
      window.history.replaceState(null, "", to === "login" ? "/login" : "/register");
    }, 200);
  };

  return (
    <div className="flex min-h-screen">
      {/* ═══ Left Panel — shared, static ═══ */}
      <div className="hidden lg:flex lg:w-[44%] relative bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-brand-mustard/20" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LTC Platform</span>
          </Link>

          {/* Center — dynamic text */}
          <div className="space-y-8">
            <div
              className="transition-all duration-500 ease-out"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning
                  ? "translateY(12px)"
                  : "translateY(0)",
              }}
            >
              {mode === "login" ? (
                <>
                  <h2
                    className="text-4xl font-bold text-white leading-tight"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Welcome Back to
                    <br />
                    Your Learning
                    <br />
                    <span className="text-brand-mustard">Journey</span>
                  </h2>
                  <p className="text-white/60 mt-4 text-lg leading-relaxed max-w-sm">
                    Access your courses, track your progress, and continue
                    growing your language skills.
                  </p>
                </>
              ) : (
                <>
                  <h2
                    className="text-4xl font-bold text-white leading-tight"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Start Your
                    <br />
                    Language
                    <br />
                    <span className="text-brand-mustard">Adventure</span>
                  </h2>
                  <p className="text-white/60 mt-4 text-lg leading-relaxed max-w-sm">
                    Create your account and join hundreds of students learning
                    new languages every day.
                  </p>
                </>
              )}
            </div>

            {/* Features / Stats */}
            <div
              className="transition-all duration-500 ease-out delay-75"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning
                  ? "translateY(8px)"
                  : "translateY(0)",
              }}
            >
              {mode === "login" ? (
                <div className="flex gap-4 flex-wrap">
                  <PillBadge
                    icon={<BookOpen className="w-4 h-4" />}
                    label="6+ Languages"
                  />
                  <PillBadge
                    icon={<Users className="w-4 h-4" />}
                    label="500+ Students"
                  />
                  <PillBadge
                    icon={<Award className="w-4 h-4" />}
                    label="Certified"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <FeatureItem
                    icon={<Globe className="w-4 h-4" />}
                    text="6+ languages available"
                  />
                  <FeatureItem
                    icon={<BookOpen className="w-4 h-4" />}
                    text="CEFR-aligned curriculum (A1 – C2)"
                  />
                  <FeatureItem
                    icon={<Users className="w-4 h-4" />}
                    text="Small groups, certified instructors"
                  />
                  <FeatureItem
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    text="Official certificates upon completion"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div
            className="transition-all duration-500 ease-out delay-100"
            style={{
              opacity: transitioning ? 0 : 1,
            }}
          >
            {mode === "login" ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 p-6">
                <p className="text-white/80 text-sm leading-relaxed italic">
                  "The platform made it so easy to track my progress and stay
                  motivated throughout my French course."
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-brand-mustard/30 flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      Sarah M.
                    </p>
                    <p className="text-white/50 text-xs">
                      French B1 Student
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white/40 text-xs">
                © {new Date().getFullYear()} Language Training Center. All
                rights reserved.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Right Panel — Form ═══ */}
      <div className="flex-1 flex items-center justify-center bg-brand-gray px-4 py-10 relative">
        {/* Background */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
          <div
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
            className="w-full h-full"
          />
        </div>

        <div className="relative w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-teal-dark flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-brand-black">
                LTC Platform
              </span>
            </Link>
          </div>

          {/* Mode Tabs */}
          <div className="flex bg-white rounded-2xl border border-brand-beige p-1.5 mb-6 shadow-sm">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                mode === "login"
                  ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20"
                  : "text-brand-brown hover:text-brand-black"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                mode === "register"
                  ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20"
                  : "text-brand-brown hover:text-brand-black"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Card with transition */}
          <div
            className="transition-all duration-300 ease-out"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning
                ? mode === "register"
                  ? "translateX(-20px)"
                  : "translateX(20px)"
                : "translateX(0)",
            }}
          >
            {mode === "login" ? <LoginForm /> : <RegisterForm switchToLogin={() => switchMode("login")} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════
// Login Form
// ═══════════════════════════════════

function LoginForm() {
  const loginMutation = useLogin();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const registeredSuccess = (location.state as any)?.registered;

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Please enter a valid email";
    if (!formData.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    loginMutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-beige p-8 shadow-sm">
      <div className="mb-7">
        <h1
          className="text-2xl font-bold text-brand-black"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Sign In
        </h1>
        <p className="mt-2 text-sm text-brand-brown">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2.5 h-12 rounded-xl border-brand-beige text-brand-black hover:bg-brand-gray font-medium"
        onClick={() => {
          window.location.href =
            import.meta.env.VITE_API_URL + "/auth/google";
        }}
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <Divider text="or sign in with email" />

      {/* Success */}
      {registeredSuccess && (
        <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          Account created successfully! Please sign in.
        </div>
      )}

      {/* Error */}
      {loginMutation.isError && (
        <ErrorBanner
          message={loginMutation.error?.message || "Invalid credentials"}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) =>
              setFormData((p) => ({ ...p, email: e.target.value }))
            }
            className="h-12 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
          />
        </Field>

        <Field
          label="Password"
          error={errors.password}
          trailing={
            <button
              type="button"
              className="text-xs text-brand-teal-dark hover:underline font-medium"
            >
              Forgot?
            </button>
          }
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData((p) => ({ ...p, password: e.target.value }))
              }
              className="h-12 rounded-xl border-brand-beige pr-12 focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
            />
            <PasswordToggle
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
          </div>
        </Field>

        <Button
          className="w-full h-12 rounded-xl bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white font-semibold text-base shadow-lg shadow-brand-teal-dark/20 gap-2"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            "Signing in..."
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════
// Register Form
// ═══════════════════════════════════

function RegisterForm({ switchToLogin }: { switchToLogin: () => void }) {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    phone_number: "",
    nationality: "",
    education_level: "",
  });

  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    registerMutation.mutate(
      { ...formData, confirmPassword: undefined } as any,
      {
        onSuccess: () =>
          navigate("/login", {
            replace: true,
            state: { registered: true },
          }),
        onError: (err: any) =>
          setError(err.message || "Registration failed"),
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-brand-beige p-8 shadow-sm">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold text-brand-black"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Create Account
        </h1>
        <p className="mt-2 text-sm text-brand-brown">
          Fill in your details to get started
        </p>
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2.5 h-12 rounded-xl border-brand-beige text-brand-black hover:bg-brand-gray font-medium"
        onClick={() => {
          window.location.href =
            import.meta.env.VITE_API_URL + "/auth/google";
        }}
      >
        <GoogleIcon />
        Sign up with Google
      </Button>

      <Divider text="or register with email" />

      {error && <ErrorBanner message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name">
            <Input
              placeholder="John"
              value={formData.first_name}
              onChange={(e) => update("first_name", e.target.value)}
              className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
            />
          </Field>
          <Field label="Last Name">
            <Input
              placeholder="Doe"
              value={formData.last_name}
              onChange={(e) => update("last_name", e.target.value)}
              className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
            />
          </Field>
        </div>

        {/* Email */}
        <Field label="Email">
          <Input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => update("email", e.target.value)}
            className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
          />
        </Field>

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => update("password", e.target.value)}
                className="h-11 rounded-xl border-brand-beige pr-10 focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
              />
              <PasswordToggle
                show={showPassword}
                onToggle={() => setShowPassword(!showPassword)}
              />
            </div>
          </Field>
          <Field label="Confirm">
            <Input
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
            />
          </Field>
        </div>

        {/* Gender + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gender">
            <Select
              value={formData.gender}
              onValueChange={(v) => update("gender", v)}
            >
              <SelectTrigger className="h-11 rounded-xl border-brand-beige">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              placeholder="+213..."
              value={formData.phone_number}
              onChange={(e) => update("phone_number", e.target.value)}
              className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
            />
          </Field>
        </div>

        <Button
          className="w-full h-12 rounded-xl bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white font-semibold text-base shadow-lg shadow-brand-teal-dark/20 gap-2 mt-2"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            "Creating account..."
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════
// Shared UI Components
// ═══════════════════════════════════

function Field({
  label,
  error,
  trailing,
  children,
}: {
  label: string;
  error?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-brand-black">{label}</Label>
        {trailing}
      </div>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-brand-beige" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-white px-3 text-brand-brown font-medium">
          {text}
        </span>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
        <span className="text-red-500 text-xs font-bold">!</span>
      </div>
      {message}
    </div>
  );
}

function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-brown/50 hover:text-brand-brown transition-colors"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

function PillBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs font-medium">
      {icon}
      {label}
    </div>
  );
}

function FeatureItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-white/70 text-sm">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      {text}
    </div>
  );
}