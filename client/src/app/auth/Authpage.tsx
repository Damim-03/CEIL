import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { useLogin, useRegister } from "../../hooks/auth/auth.hooks";
import { useLanguage } from "../../hooks/useLanguage";
import { LocaleLink } from "../../i18n/locales/components/LocaleLink";
import { LanguageSwitcher } from "../../i18n/locales/components/LanguageSwitcher";
import AuthStatusDialog from "./Authstatusdialog";
import logo from "../../assets/download.png";
import ceillogo from "../../assets/logo.jpg";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, dir, isRTL, currentLang } = useLanguage();

  const isRegisterRoute = location.pathname.includes("/register");
  const [mode, setMode] = useState<"login" | "register">(
    isRegisterRoute ? "register" : "login",
  );
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const target = location.pathname.includes("/register")
      ? "register"
      : "login";
    if (target !== mode) {
      setTransitioning(true);
      setTimeout(() => {
        setMode(target);
        setTransitioning(false);
      }, 200);
    }
  }, [location.pathname, mode]);

  const switchMode = (to: "login" | "register") => {
    if (to === mode) return;
    setTransitioning(true);
    // Navigate immediately so React Router updates location
    navigate(`/${currentLang}/${to}`, { replace: true });
    setTimeout(() => {
      setMode(to);
      setTransitioning(false);
    }, 200);
  };

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="flex min-h-screen" dir={dir}>
      {/* ═══ Left/Right Panel — Branding ═══ */}
      <div
        className={`hidden lg:flex lg:w-[44%] relative bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark to-[#1a3528] overflow-hidden ${isRTL ? "order-2" : "order-1"}`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 rounded-full border border-white/[0.06]" />
          <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border border-white/[0.04]" />
          <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white/[0.02]" />
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-brand-mustard/[0.15]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo + Lang */}
          <div className="flex items-center justify-between">
            <LocaleLink to="/" className="flex items-center gap-3 group">
              <img
                src={ceillogo}
                alt="CEIL"
                className="w-10 h-10 rounded-xl border border-white/15 object-contain"
              />
              <div>
                <span className="text-lg font-bold text-white">CEIL</span>
                <span className="block text-[10px] text-white/40 tracking-wide">
                  {t("footer.universityLabel")}
                </span>
              </div>
            </LocaleLink>
            <LanguageSwitcher variant="header" />
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div
              className="transition-all duration-500 ease-out"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? "translateY(12px)" : "translateY(0)",
              }}
            >
              {mode === "login" ? (
                <>
                  <h2
                    className="text-4xl font-bold text-white leading-tight"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("auth.welcomeBack")}
                    <br />
                    <span className="text-brand-mustard">
                      {t("auth.learningJourney")}
                    </span>
                  </h2>
                  <p className="text-white/50 mt-4 text-lg leading-relaxed max-w-sm">
                    {t("auth.welcomeBackDesc")}
                  </p>
                </>
              ) : (
                <>
                  <h2
                    className="text-4xl font-bold text-white leading-tight"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {t("auth.startYour")}
                    <br />
                    <span className="text-brand-mustard">
                      {t("auth.languageAdventure")}
                    </span>
                  </h2>
                  <p className="text-white/50 mt-4 text-lg leading-relaxed max-w-sm">
                    {t("auth.startYourDesc")}
                  </p>
                </>
              )}
            </div>

            <div
              className="transition-all duration-500 ease-out delay-75"
              style={{
                opacity: transitioning ? 0 : 1,
                transform: transitioning ? "translateY(8px)" : "translateY(0)",
              }}
            >
              {mode === "login" ? (
                <div className="flex gap-3 flex-wrap">
                  <PillBadge
                    icon={<BookOpen className="w-4 h-4" />}
                    label={t("auth.languagesAvailable")}
                  />
                  <PillBadge
                    icon={<Users className="w-4 h-4" />}
                    label={t("auth.studentsCount")}
                  />
                  <PillBadge
                    icon={<Award className="w-4 h-4" />}
                    label={t("auth.certified")}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <FeatureItem
                    icon={<Globe className="w-4 h-4" />}
                    text={t("auth.languagesAvailable")}
                  />
                  <FeatureItem
                    icon={<BookOpen className="w-4 h-4" />}
                    text={t("auth.cefr")}
                  />
                  <FeatureItem
                    icon={<Users className="w-4 h-4" />}
                    text={t("auth.smallGroups")}
                  />
                  <FeatureItem
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    text={t("auth.officialCerts")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom */}
          <div
            className="transition-all duration-500 ease-out delay-100"
            style={{ opacity: transitioning ? 0 : 1 }}
          >
            {mode === "login" ? (
              <div className="bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/[0.1] p-6">
                <p className="text-white/70 text-sm leading-relaxed italic">
                  "{t("auth.testimonialQuote")}"
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-brand-mustard/25 flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {t("auth.testimonialName")}
                    </p>
                    <p className="text-white/40 text-xs">
                      {t("auth.testimonialRole")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="University"
                  className="w-8 h-8 object-contain opacity-50"
                />
                <p className="text-white/30 text-xs">
                  © {new Date().getFullYear()} CEIL –{" "}
                  {t("footer.universityLabel")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Form Panel ═══ */}
      <div
        className={`flex-1 flex items-center justify-center bg-brand-gray px-4 py-10 relative ${isRTL ? "order-1" : "order-2"}`}
      >
        <div
          className="absolute inset-0 opacity-[0.012] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <LocaleLink to="/" className="flex items-center gap-3">
              <img
                src={ceillogo}
                alt="CEIL"
                className="w-10 h-10 rounded-xl object-contain"
              />
              <span className="text-xl font-bold text-brand-black">CEIL</span>
            </LocaleLink>
            <LanguageSwitcher variant="header" />
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
              {t("auth.signIn")}
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                mode === "register"
                  ? "bg-brand-teal-dark text-white shadow-md shadow-brand-teal-dark/20"
                  : "text-brand-brown hover:text-brand-black"
              }`}
            >
              {t("auth.createAccount")}
            </button>
          </div>

          {/* Form */}
          <div
            className="transition-all duration-300 ease-out"
            style={{
              opacity: transitioning ? 0 : 1,
              transform: transitioning
                ? mode === "register"
                  ? `translateX(${isRTL ? "20px" : "-20px"})`
                  : `translateX(${isRTL ? "-20px" : "20px"})`
                : "translateX(0)",
            }}
          >
            {mode === "login" ? (
              <LoginForm />
            ) : (
              <RegisterForm switchToLogin={() => switchMode("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Login Form ═══ */
function LoginForm() {
  const { t, isRTL } = useLanguage();
  const loginMutation = useLogin();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const registeredSuccess = (location.state as any)?.registered;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogStatus, setDialogStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [dialogError, setDialogError] = useState("");
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = t("auth.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = t("auth.emailInvalid");
    if (!formData.password) e.password = t("auth.passwordRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setDialogStatus("loading");
    loginMutation.mutate(formData, {
      onSuccess: () => setDialogStatus("success"),
      onError: (err: any) => {
        setDialogError(err.response?.data?.message || err.message || "");
        setDialogStatus("error");
      },
    });
  };

  return (
    <>
      <AuthStatusDialog
        status={dialogStatus}
        action="login"
        errorMessage={dialogError}
        onClose={() => setDialogStatus("idle")}
      />
      <div className="bg-white rounded-2xl border border-brand-beige p-8 shadow-sm">
        <div className="mb-7">
          <h1
            className="text-2xl font-bold text-brand-black"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("auth.signIn")}
          </h1>
          <p className="mt-2 text-sm text-brand-brown">
            {t("auth.signInSubtitle")}
          </p>
        </div>

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
          {t("auth.continueWithGoogle")}
        </Button>

        <Divider text={t("auth.orSignInWith")} />

        {registeredSuccess && (
          <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            {t("auth.accountCreatedSuccess")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label={t("auth.email")} error={errors.email}>
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
            label={t("auth.password")}
            error={errors.password}
            trailing={
              <button
                type="button"
                className="text-xs text-brand-teal-dark hover:underline font-medium"
              >
                {t("auth.forgot")}
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
            className="w-full h-12 rounded-xl bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white font-semibold text-base shadow-lg shadow-brand-teal-dark/20 gap-2 hover:-translate-y-0.5 transition-all duration-300"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              t("auth.signingIn")
            ) : (
              <>
                {t("auth.signIn")}
                <Arrow className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

/* ═══ Register Form ═══ */
function RegisterForm({ switchToLogin }: { switchToLogin: () => void }) {
  const { t, isRTL } = useLanguage();
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
  });
  const [error, setError] = useState<string | null>(null);
  const [dialogStatus, setDialogStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [dialogError, setDialogError] = useState("");
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const update = (field: string, value: string) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }
    setDialogStatus("loading");
    registerMutation.mutate(
      { ...formData, confirmPassword: undefined } as any,
      {
        onSuccess: () => {
          setDialogStatus("success");
          setTimeout(() => {
            navigate("/login", { replace: true, state: { registered: true } });
          }, 1800);
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            (err.response?.status === 409
              ? t("auth.emailAlreadyRegistered")
              : err.message || "");
          setDialogError(msg);
          setDialogStatus("error");
        },
      },
    );
  };

  return (
    <>
      <AuthStatusDialog
        status={dialogStatus}
        action="register"
        errorMessage={dialogError}
        onClose={() => setDialogStatus("idle")}
      />
      <div className="bg-white rounded-2xl border border-brand-beige p-8 shadow-sm">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-brand-black"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("auth.createAccount")}
          </h1>
          <p className="mt-2 text-sm text-brand-brown">
            {t("auth.createAccountSubtitle")}
          </p>
        </div>

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
          {t("auth.signUpWithGoogle")}
        </Button>

        <Divider text={t("auth.orRegisterWith")} />
        {error && <ErrorBanner message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.firstName")}>
              <Input
                placeholder={t("auth.firstName")}
                value={formData.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
              />
            </Field>
            <Field label={t("auth.lastName")}>
              <Input
                placeholder={t("auth.lastName")}
                value={formData.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
              />
            </Field>
          </div>

          <Field label={t("auth.email")}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.password")}>
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
            <Field label={t("auth.confirmPassword")}>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("auth.gender")}>
              <Select
                value={formData.gender}
                onValueChange={(v) => update("gender", v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-brand-beige">
                  <SelectValue placeholder={t("auth.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">{t("auth.male")}</SelectItem>
                  <SelectItem value="Female">{t("auth.female")}</SelectItem>
                  <SelectItem value="Other">{t("auth.other")}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t("auth.phone")}>
              <Input
                type="tel"
                placeholder="+213..."
                value={formData.phone_number}
                onChange={(e) => update("phone_number", e.target.value)}
                className="h-11 rounded-xl border-brand-beige focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/10"
                dir="ltr"
              />
            </Field>
          </div>

          <Button
            className="w-full h-12 rounded-xl bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white font-semibold text-base shadow-lg shadow-brand-teal-dark/20 gap-2 mt-2 hover:-translate-y-0.5 transition-all duration-300"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              t("auth.creatingAccount")
            ) : (
              <>
                {t("auth.createAccount")}
                <Arrow className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </>
  );
}

/* ═══ Shared Components ═══ */
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

function PillBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.07] backdrop-blur-sm border border-white/[0.1] text-white text-xs font-medium">
      {icon}
      {label}
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white/60 text-sm">
      <div className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center shrink-0">
        {icon}
      </div>
      {text}
    </div>
  );
}
