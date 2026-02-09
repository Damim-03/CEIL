import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Calendar,
  Users,
  BookOpen,
  Globe,
  Award,
  MapPin,
  Clock,
  UserPlus,
  Loader2,
  ArrowLeft,
  Tag,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Info,
  Sparkles,
  BadgeCheck,
  TrendingUp,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { usePublicCourse } from "../../hooks/announce/Usepublic";
import { useAuthRedirect } from "../../lib/utils/auth-redirect";

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price: number | null, currency: string = "DA") => {
  if (price === null || price === undefined) return "—";
  return `${Number(price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}`;
};

export default function CourseInfoMorePage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, isError } = usePublicCourse(id!);
  const { isLoggedIn, role, getRegisterHref } = useAuthRedirect();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-brand-beige" />
          <Loader2 className="w-16 h-16 animate-spin text-brand-teal-dark absolute inset-0" />
        </div>
        <p className="text-brand-brown text-sm font-medium animate-pulse">
          Loading course details...
        </p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-24 h-24 rounded-2xl bg-red-50 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-300" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-black">
            Course Not Found
          </h2>
          <p className="text-brand-brown mt-2">
            This course may have been removed or the link is incorrect.
          </p>
        </div>
        <Button
          asChild
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white mt-2 rounded-xl px-6"
        >
          <Link to="/courses">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  const isOpen =
    course.registration_open &&
    (course.capacity === 0 || course.enrolled < course.capacity);

  const fillPercent =
    course.capacity > 0
      ? Math.min((course.enrolled / course.capacity) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-brand-gray">
      {/* ═══════════ HERO HEADER ═══════════ */}
      <div className="relative overflow-hidden">
        {course.image_url ? (
          <>
            <img
              src={course.image_url}
              alt={course.course_name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark/85 via-brand-teal-dark/75 to-brand-teal/70" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-teal-dark via-brand-teal-dark to-brand-teal" />
        )}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[10%] w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 left-[5%] w-80 h-80 rounded-full border border-white/5" />
          <div className="absolute top-1/2 right-[30%] w-32 h-32 rounded-full bg-white/5" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <nav className="flex items-center gap-2 text-sm text-white/50 mb-8">
            <Link to="/" className="hover:text-white/80 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              to="/courses"
              className="hover:text-white/80 transition-colors"
            >
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/70 font-medium truncate max-w-[200px]">
              {course.course_name}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {course.flag_emoji && (
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-5xl shrink-0 shadow-xl">
                {course.flag_emoji}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                {course.language && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-semibold border border-white/20">
                    <Globe className="w-3 h-3" />
                    {course.language}
                  </span>
                )}
                {course.level && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-mustard/90 text-white text-xs font-semibold">
                    <GraduationCap className="w-3 h-3" />
                    {course.level}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isOpen
                      ? "bg-emerald-400/90 text-white"
                      : "bg-red-400/90 text-white"
                  }`}
                >
                  {isOpen ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>

              <h1
                className="text-3xl lg:text-4xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {course.course_name}
                {course.title_ar && (
                  <span className="text-white/60 text-xl lg:text-2xl font-normal">
                    {" "}
                    — {course.title_ar}
                  </span>
                )}
              </h1>

              {course.title_ar && (
                <p className="text-white/50 mt-2 text-base" dir="rtl">
                  {course.title_ar}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 50"
            fill="none"
            className="w-full h-auto block"
          >
            <path
              d="M0 50L60 44C120 38 240 26 360 22C480 18 600 22 720 26C840 30 960 34 1080 32C1200 30 1320 22 1380 18L1440 14V50H0Z"
              className="fill-brand-gray"
            />
          </svg>
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ──── Left Column ──── */}
          <div className="flex-1 space-y-6">
            {(course.description_ar || course.description) && (
              <div className="bg-white rounded-2xl border border-brand-beige p-6 shadow-sm animate-fade-up">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-teal-dark/8 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-brand-teal-dark" />
                  </div>
                  <h2
                    className="text-lg font-bold text-brand-black"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    About This Course
                  </h2>
                </div>
                <div className="space-y-3">
                  {course.description_ar && (
                    <p className="text-brand-black/60 leading-relaxed" dir="rtl">
                      {course.description_ar}
                    </p>
                  )}
                  {course.description && (
                    <p className="text-brand-black/60 leading-relaxed">
                      {course.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <InfoChip icon={<BadgeCheck className="w-4 h-4" />} label="Type" value="Certified" color="teal" />
              <InfoChip icon={<Globe className="w-4 h-4" />} label="Language" value={course.language || "—"} color="mustard" />
              <InfoChip icon={<MapPin className="w-4 h-4" />} label="Format" value="In-Person" color="brown" />
              <InfoChip icon={<BookOpen className="w-4 h-4" />} label="Code" value={course.course_code || "—"} color="teal" />
            </div>

            {course.level && (
              <div className="bg-white rounded-2xl border border-brand-beige p-6 shadow-sm animate-fade-up" style={{ animationDelay: "150ms" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-mustard/20 to-brand-mustard/5 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-brand-mustard-dark" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-brown font-medium uppercase tracking-wider">Level</p>
                    <p className="text-xl font-bold text-brand-black">{course.level}</p>
                  </div>
                </div>
              </div>
            )}

            {course.pricing && course.pricing.length > 0 && (
              <div className="bg-white rounded-2xl border border-brand-beige overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="bg-gradient-to-r from-brand-teal-dark to-brand-teal px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                    <Tag className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-sans)" }}>Pricing by Status</h2>
                    <p className="text-white/60 text-xs">Fees vary based on applicant category</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-gray/50">
                        <th className="text-left px-6 py-3 font-semibold text-brand-brown text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3 font-semibold text-brand-brown text-xs uppercase tracking-wider">Details</th>
                        <th className="text-right px-6 py-3 font-semibold text-brand-brown text-xs uppercase tracking-wider">Price</th>
                        <th className="text-center px-5 py-3 font-semibold text-brand-brown text-xs uppercase tracking-wider">Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.pricing.map((p: any, i: number) => (
                        <tr key={p.id || i} className={`border-t border-brand-beige/60 transition-colors hover:bg-brand-teal-dark/[0.02] ${i % 2 !== 0 ? "bg-brand-gray/30" : ""}`}>
                          <td className="px-6 py-4"><span className="font-semibold text-brand-black">{p.status_fr}</span></td>
                          <td className="px-5 py-4">
                            <div className="space-y-0.5">
                              {p.status_ar && <p className="text-brand-black/55 text-sm" dir="rtl">{p.status_ar}</p>}
                              {p.status_en && <p className="text-brand-brown text-xs">{p.status_en}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right"><span className="font-bold text-brand-black tabular-nums text-base">{formatPrice(p.price, p.currency)}</span></td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${!p.discount || p.discount === "Aucune" || p.discount === "None" ? "bg-brand-beige/80 text-brand-brown" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"}`}>
                              {p.discount || "None"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {course.groups && course.groups.length > 0 && (
              <div className="space-y-4 animate-fade-up" style={{ animationDelay: "250ms" }}>
                <div className="flex items-center gap-3 px-1">
                  <div className="w-9 h-9 rounded-lg bg-brand-teal-dark/8 flex items-center justify-center">
                    <Users className="w-4.5 h-4.5 text-brand-teal-dark" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-brand-black" style={{ fontFamily: "var(--font-sans)" }}>Available Groups</h2>
                    <p className="text-brand-brown text-xs">{course.groups.length} group{course.groups.length > 1 ? "s" : ""} available</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {course.groups.map((g: any) => {
                    const gFill = g.max_students > 0 ? Math.min((g.enrolled / g.max_students) * 100, 100) : 0;
                    return (
                      <div key={g.id} className="bg-white rounded-xl border border-brand-beige p-5 hover:shadow-md hover:border-brand-teal/20 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-brand-black text-base">{g.name}</h3>
                            {g.teacher && <p className="text-brand-brown text-xs mt-0.5">{g.teacher}</p>}
                          </div>
                          <span className="inline-flex px-2.5 py-1 rounded-lg bg-brand-teal-dark/8 text-brand-teal-dark text-xs font-bold">{g.level}</span>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-brand-brown">Enrolled</span>
                            <span className="font-semibold text-brand-black">{g.enrolled} / {g.max_students}</span>
                          </div>
                          <div className="h-2 bg-brand-beige/80 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${gFill >= 90 ? "bg-red-400" : gFill >= 60 ? "bg-brand-mustard" : "bg-brand-teal-dark"}`} style={{ width: `${gFill}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {course.session_name && (
              <div className="bg-white rounded-2xl border border-brand-beige overflow-hidden shadow-sm animate-fade-up" style={{ animationDelay: "300ms" }}>
                <div className="bg-gradient-to-r from-brand-teal-dark to-brand-teal px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                    <Clock className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-sans)" }}>Session History</h2>
                    <p className="text-white/60 text-xs">Past and current sessions</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-gray/50 border border-brand-beige/60">
                    <div className="w-12 h-12 rounded-xl bg-brand-teal-dark/8 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-brand-teal-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-black">{course.session_name}</p>
                      <p className="text-brand-brown text-sm mt-0.5">{formatDate(course.start_date)} — {formatDate(course.end_date)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-brand-black text-lg">{course.enrolled}<span className="text-brand-brown font-normal text-sm">/{course.capacity || "∞"}</span></p>
                      <p className="text-brand-brown text-xs">participants</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ──── Right Sidebar ──── */}
          <div className="lg:w-[300px] shrink-0 space-y-5">
            <div className="bg-white rounded-2xl border border-brand-beige overflow-hidden shadow-sm sticky top-24">
              <div className={`px-5 py-4 flex items-center gap-2.5 ${isOpen ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-red-400 to-red-500"}`}>
                {isOpen ? <CheckCircle2 className="w-5 h-5 text-white" /> : <XCircle className="w-5 h-5 text-white" />}
                <h3 className="text-base font-bold text-white">{isOpen ? "Registration Open" : "Registration Closed"}</h3>
              </div>

              <div className="p-5 space-y-4">
                {course.session_name ? (
                  <div className="space-y-3.5">
                    <SidebarRow icon={<Sparkles className="w-4 h-4" />} label="Session" value={course.session_name} />
                    {course.start_date && (
                      <SidebarRow icon={<Calendar className="w-4 h-4" />} label="Period" value={`${formatDate(course.start_date)} — ${formatDate(course.end_date)}`} />
                    )}
                    <SidebarRow icon={<Users className="w-4 h-4" />} label="Enrolled" value={`${course.enrolled} / ${course.capacity || "∞"}`} />
                    {course.capacity > 0 && (
                      <div>
                        <div className="h-2 bg-brand-beige rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${fillPercent >= 90 ? "bg-red-400" : fillPercent >= 60 ? "bg-brand-mustard" : "bg-brand-teal-dark"}`} style={{ width: `${fillPercent}%` }} />
                        </div>
                        <p className="text-[11px] text-brand-brown mt-1">{Math.round(fillPercent)}% filled</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-brand-beige mx-auto mb-2" />
                    <p className="text-brand-brown text-sm">No session scheduled yet</p>
                  </div>
                )}

                {course.price !== null && Number(course.price) > 0 && (
                  <div className="pt-3.5 border-t border-brand-beige/60">
                    <p className="text-[11px] text-brand-brown uppercase tracking-wider font-medium">Starting from</p>
                    <p className="text-2xl font-bold text-brand-teal-dark mt-0.5">{formatPrice(course.price, course.currency)}</p>
                  </div>
                )}

                {/* ✅ CTA — Auth-aware via useAuthRedirect */}
                <div className="space-y-2.5 pt-1">
                  {isOpen && (
                    <>
                      {/* Not logged in → Login first */}
                      {!isLoggedIn && (
                        <Button asChild className="w-full bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white gap-2 h-12 text-sm font-semibold rounded-xl shadow-lg shadow-brand-teal-dark/20">
                          <Link to={`/login?redirect=${encodeURIComponent(`/courses/${course.id}`)}`}>
                            <LogIn className="w-4 h-4" />
                            Login to Register
                          </Link>
                        </Button>
                      )}

                      {/* Student → Can register */}
                      {isLoggedIn && role === "STUDENT" && (
                        <Button asChild className="w-full bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white gap-2 h-12 text-sm font-semibold rounded-xl shadow-lg shadow-brand-teal-dark/20">
                          <Link to={getRegisterHref(course.id)}>
                            <UserPlus className="w-4 h-4" />
                            Register Now
                          </Link>
                        </Button>
                      )}

                      {/* Admin or Teacher → Cannot register */}
                      {isLoggedIn && (role === "ADMIN" || role === "TEACHER") && (
                        <>
                          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                            <Info className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-700 font-medium">
                              {role === "ADMIN" ? "Admins cannot register for courses" : "Teachers cannot register for courses"}
                            </p>
                          </div>
                          <Button asChild variant="outline" className="w-full border-brand-beige text-brand-teal-dark hover:bg-brand-teal-dark hover:text-white gap-2 rounded-xl h-11">
                            <Link to={getRegisterHref(course.id)}>
                              <LayoutDashboard className="w-4 h-4" />
                              Go to Dashboard
                            </Link>
                          </Button>
                        </>
                      )}
                    </>
                  )}

                  <Button variant="outline" asChild className="w-full border-brand-beige text-brand-brown hover:bg-brand-gray gap-2 rounded-xl">
                    <Link to="/courses">
                      <ArrowLeft className="w-4 h-4" />
                      All Courses
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-beige p-5 shadow-sm">
              <h4 className="font-bold text-brand-black text-sm mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
                <Info className="w-4 h-4 text-brand-teal-dark" />
                Quick Facts
              </h4>
              <div className="space-y-3">
                <QuickRow icon={<Globe className="w-3.5 h-3.5" />} label="Language" value={course.language || "—"} />
                <QuickRow icon={<Award className="w-3.5 h-3.5" />} label="Level" value={course.level || "All Levels"} />
                <QuickRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Code" value={course.course_code || "—"} />
                <QuickRow icon={<MapPin className="w-3.5 h-3.5" />} label="Format" value="In-Person" />
                <QuickRow icon={<Users className="w-3.5 h-3.5" />} label="Groups" value={`${course.groups?.length || 0} available`} />
                {course.fee_amount && Number(course.fee_amount) > 0 && (
                  <QuickRow icon={<TrendingUp className="w-3.5 h-3.5" />} label="Admin Fee" value={`${Number(course.fee_amount).toLocaleString()} DA`} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: "teal" | "mustard" | "brown" }) {
  const styles = { teal: "bg-brand-teal-dark/5 border-brand-teal/15", mustard: "bg-brand-mustard/5 border-brand-mustard/15", brown: "bg-brand-brown/5 border-brand-brown/15" };
  const iconStyles = { teal: "text-brand-teal-dark", mustard: "text-brand-mustard-dark", brown: "text-brand-brown" };
  return (
    <div className={`rounded-xl border p-4 text-center ${styles[color]}`}>
      <div className={`mx-auto mb-2 ${iconStyles[color]}`}>{icon}</div>
      <p className="text-[10px] text-brand-brown uppercase tracking-wider font-medium">{label}</p>
      <p className="text-sm font-bold text-brand-black mt-0.5 truncate">{value}</p>
    </div>
  );
}

function SidebarRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-brand-brown/60 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-brand-brown">{label}</p>
        <p className="text-sm font-semibold text-brand-black truncate">{value}</p>
      </div>
    </div>
  );
}

function QuickRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-brand-brown/50 shrink-0">{icon}</span>
      <span className="text-brand-brown">{label}</span>
      <span className="ml-auto font-semibold text-brand-black truncate">{value}</span>
    </div>
  );
}