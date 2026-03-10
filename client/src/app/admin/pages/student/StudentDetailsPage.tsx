import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  useAdminStudent,
  type AdminStudent,
} from "../../../../hooks/admin/useAdmin";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Activity,
  GraduationCap,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  BookOpen,
  CircleUser,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import EditStudentModal from "../../components/EditStudentModal";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";
import {
  getCompletionColor,
  getCompletionLabel,
  type CompletionStep,
  getProfileCompletion,
} from "../../../../lib/utils/profileCompletion";

/* ═══════════════════════════════════════════════
   CIRCULAR PROGRESS
═══════════════════════════════════════════════ */
function CircularProgress({
  percentage,
  size = 96,
  color,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const cx = size / 2,
    cy = size / 2;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)",
          filter: `drop-shadow(0 0 8px ${color}70)`,
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════
   STEP ROW
═══════════════════════════════════════════════ */
function StepRow({ step }: { step: CompletionStep }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${step.done ? "bg-white/[0.04]" : "opacity-50"}`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-[#4ADE80]/15" : "bg-white/8"}`}
      >
        {step.done ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-white/25" />
        )}
      </div>
      <span
        className={`text-sm flex-1 ${step.done ? "text-white/85" : "text-white/30 line-through"}`}
      >
        {step.labelAr}
      </span>
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${step.done ? "bg-[#4ADE80]/12 text-[#4ADE80]" : "bg-white/6 text-white/25"}`}
      >
        +{step.weight}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PROFILE COMPLETION CARD
═══════════════════════════════════════════════ */
function ProfileCompletionCard({ student }: { student: AdminStudent }) {
  const { percentage, isComplete, steps, infoScore, docsScore, isActive } =
    getProfileCompletion(student);
  const color = getCompletionColor(percentage);
  const { ar: label } = getCompletionLabel(percentage);
  const missing = steps.filter((s) => !s.done);

  const infoSteps = steps.filter(
    (s) => !["docs_uploaded", "docs_approved", "active"].includes(s.key),
  );
  const docSteps = steps.filter((s) =>
    ["docs_uploaded", "docs_approved"].includes(s.key),
  );
  const activeStep = steps.find((s) => s.key === "active")!;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, #0d1f18 0%, #162d22 60%, #0a1810 100%)",
        boxShadow: `0 0 50px ${color}18, inset 0 1px 0 rgba(255,255,255,0.05)`,
        border: `1px solid ${color}20`,
      }}
    >
      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-15"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            transform: "translate(30%, -30%)",
          }}
        />
      </div>
      {/* top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `${color}18`,
                border: `1px solid ${color}30`,
              }}
            >
              <CircleUser className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                اكتمال الحساب
              </p>
              <p className="text-sm font-bold text-white/80 mt-0.5">
                {missing.length === 0
                  ? "مكتمل ✓"
                  : `${missing.length} خطوات ناقصة`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: `${color}80` }}
            >
              {label}
            </p>
            <p
              className="text-3xl font-black tabular-nums leading-none"
              style={{ color }}
            >
              {percentage}
              <span className="text-base font-bold opacity-70">%</span>
            </p>
          </div>
        </div>

        {/* Circular + sub-bars */}
        <div className="flex items-center gap-5 mb-5">
          <div className="relative shrink-0">
            <CircularProgress percentage={percentage} size={90} color={color} />
            <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? (
                <Sparkles className="w-5 h-5" style={{ color }} />
              ) : (
                <span
                  className="text-sm font-black"
                  style={{ color: `${color}80` }}
                >
                  {percentage}
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {[
              {
                label: "معلومات",
                pct: infoScore,
                c: getCompletionColor(infoScore),
              },
              {
                label: "وثائق",
                pct: docsScore,
                c: getCompletionColor(docsScore),
              },
              {
                label: "تفعيل",
                pct: isActive ? 100 : 0,
                c: isActive ? "#4ADE80" : "#ef4444",
                text: isActive ? "مفعّل" : "معطّل",
              },
            ].map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/35">{b.label}</span>
                  <span
                    className="text-[10px] font-black tabular-nums"
                    style={{ color: b.c }}
                  >
                    {b.text ?? `${b.pct}%`}
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${b.pct}%`,
                      background: b.c,
                      boxShadow: `0 0 5px ${b.c}70`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status badge */}
        <div
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl mb-4 text-sm font-bold"
          style={{
            background: `${color}10`,
            border: `1px solid ${color}22`,
            color,
          }}
        >
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {isComplete ? "الحساب مكتمل بالكامل" : label}
        </div>

        {/* Steps */}
        <div className="space-y-0.5">
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.15em] px-3 pt-1 pb-2 flex items-center gap-2">
            <User className="w-3 h-3" /> المعلومات الشخصية
          </p>
          {infoSteps.map((s) => (
            <StepRow key={s.key} step={s} />
          ))}

          <div className="border-t border-white/[0.06] my-2" />
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.15em] px-3 pt-1 pb-2 flex items-center gap-2">
            <BookOpen className="w-3 h-3" /> الوثائق
          </p>
          {docSteps.map((s) => (
            <StepRow key={s.key} step={s} />
          ))}

          <div className="border-t border-white/[0.06] my-2" />
          <StepRow step={activeStep} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INFO CARD — grid tile
═══════════════════════════════════════════════ */
function InfoCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-default group"
      style={{ background: `${accent}06`, border: `1px solid ${accent}14` }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = `${accent}0d`;
        el.style.borderColor = `${accent}28`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = `${accent}06`;
        el.style.borderColor = `${accent}14`;
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}12`, border: `1px solid ${accent}1e` }}
      >
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[10px] font-black uppercase tracking-wider mb-1"
          style={{ color: `${accent}80` }}
        >
          {label}
        </p>
        <p className="text-sm font-semibold text-[#1B1B1B] dark:text-white/85 break-all leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const StudentDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const { studentId } = useParams();
  const { data: student, isLoading, refetch } = useAdminStudent(studentId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";

  if (isLoading) return <PageLoader />;

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 p-8 bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-xl dark:shadow-black/30 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-[#BEB29E] dark:text-[#666666]" />
          </div>
          <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("admin.studentDetails.studentNotFound")}
          </h2>
          <Link to="/admin/students">
            <Button variant="outline" size="lg" className="gap-2 mt-4">
              <ArrowLeft className="w-4 h-4" />
              {t("admin.studentDetails.backToStudents")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const enrolledDays = student.created_at
    ? Math.floor(
        (new Date().getTime() - new Date(student.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const { percentage, isComplete } = getProfileCompletion(student);
  const completionColor = getCompletionColor(percentage);
  const { ar: completionLabel } = getCompletionLabel(percentage);

  return (
    <div className="pb-16">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back */}
        <Link to="/admin/students">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/15 dark:hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.studentDetails.backToStudents")}
          </Button>
        </Link>

        {/* ══════════ HERO ══════════ */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(140deg, #0c2018 0%, #163326 45%, #0d1e17 100%)",
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Decorative bg */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.18]"
              style={{
                background: `radial-gradient(circle, ${completionColor} 0%, transparent 65%)`,
              }}
            />
            <div
              className="absolute top-1/2 -left-10 w-48 h-48 rounded-full opacity-10"
              style={{
                background:
                  "radial-gradient(circle, #C4A035 0%, transparent 65%)",
              }}
            />
            {/* subtle grid */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.035]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="g"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.8"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#g)" />
            </svg>
          </div>

          {/* Top glow */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${completionColor}70 35%, #C4A03560 65%, transparent 100%)`,
            }}
          />

          <div className="relative px-6 sm:px-10 pt-7 pb-8">
            {/* Top row: badge + actions */}
            <div className="flex items-center justify-between mb-8">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                style={{
                  background: `${completionColor}15`,
                  border: `1px solid ${completionColor}30`,
                  color: completionColor,
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {completionLabel} — {percentage}%
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(196,160,53,0.12)",
                    border: "1px solid rgba(196,160,53,0.28)",
                    color: "#C4A035",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(196,160,53,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(196,160,53,0.12)";
                  }}
                >
                  <Edit className="w-3.5 h-3.5" />
                  {t("admin.studentDetails.edit")}
                </button>
                <button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: "rgba(239,68,68,0.10)",
                    border: "1px solid rgba(239,68,68,0.22)",
                    color: "#f87171",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(239,68,68,0.20)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(239,68,68,0.10)";
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("admin.students.delete")}
                </button>
              </div>
            </div>

            {/* Avatar + name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                {/* glow ring */}
                <div
                  className="absolute -inset-2 rounded-2xl opacity-50 blur-md"
                  style={{
                    background: `linear-gradient(135deg, ${completionColor}50, #C4A03540)`,
                  }}
                />
                <div
                  className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden"
                  style={{ border: "2px solid rgba(255,255,255,0.12)" }}
                >
                  {student.user?.google_avatar ? (
                    <img
                      src={student.user.google_avatar}
                      alt={`${student.first_name} ${student.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-5xl font-black"
                      style={{
                        background: "linear-gradient(135deg, #2B6F5E, #C4A035)",
                      }}
                    >
                      {student.first_name?.charAt(0)}
                      {student.last_name?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* status dot */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 z-10 ${
                    student.status === "ACTIVE" ? "bg-[#4ADE80]" : "bg-white/25"
                  }`}
                  style={{
                    borderColor: "#0c2018",
                    boxShadow:
                      student.status === "ACTIVE"
                        ? "0 0 10px #4ADE8090"
                        : undefined,
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-2">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-white/25 text-xs font-mono mb-5 tracking-wider">
                  {student.student_id}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  {/* status badge */}
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                      student.status === "ACTIVE"
                        ? "text-[#4ADE80]"
                        : "text-white/40"
                    }`}
                    style={{
                      background:
                        student.status === "ACTIVE"
                          ? "rgba(74,222,128,0.12)"
                          : "rgba(255,255,255,0.06)",
                      border: `1px solid ${student.status === "ACTIVE" ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.1)"}`,
                    }}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${student.status === "ACTIVE" ? "bg-[#4ADE80] animate-pulse" : "bg-white/25"}`}
                    />
                    {student.status}
                  </span>

                  {/* completion bar */}
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      className="w-20 h-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          background: completionColor,
                          boxShadow: `0 0 5px ${completionColor}`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-black tabular-nums"
                      style={{ color: completionColor }}
                    >
                      {percentage}%
                    </span>
                  </div>

                  {/* date */}
                  {student.created_at && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-white/35"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(student.created_at).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {enrolledDays !== null && (
                        <span className="text-white/20 mx-0.5">·</span>
                      )}
                      {enrolledDays !== null && <span>{enrolledDays} يوم</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom border */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(196,160,53,0.35), transparent)",
            }}
          />
        </div>

        {/* ══════════ CONTENT GRID ══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left col ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info */}
            <div
              className="relative bg-white dark:bg-[#0e0e0e] rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(43,111,94,0.15)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{
                  background: "linear-gradient(to bottom, #2B6F5E, #C4A035)",
                }}
              />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, #2B6F5E, #2B6F5E90)",
                    }}
                  >
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1B1B1B] dark:text-white">
                      {t("admin.studentDetails.studentInfo")}
                    </h2>
                    <p className="text-xs text-[#9B8E82] dark:text-white/30">
                      البيانات الشخصية والتواصل
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoCard
                    icon={Mail}
                    label={t("admin.studentDetails.emailAddress")}
                    value={student.email || "—"}
                    accent="#2B6F5E"
                  />
                  <InfoCard
                    icon={Phone}
                    label={t("admin.studentDetails.phoneNumber")}
                    value={student.phone_number || "—"}
                    accent="#C4A035"
                  />
                  {student.date_of_birth && (
                    <InfoCard
                      icon={Calendar}
                      label={t("admin.studentDetails.dateOfBirth")}
                      value={new Date(student.date_of_birth).toLocaleDateString(
                        locale,
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                      accent="#2B6F5E"
                    />
                  )}
                  {student.address && (
                    <InfoCard
                      icon={MapPin}
                      label={t("admin.studentDetails.address")}
                      value={student.address}
                      accent="#C4A035"
                    />
                  )}
                  {student.emergency_contact && (
                    <InfoCard
                      icon={AlertCircle}
                      label={t("admin.studentDetails.emergencyContact")}
                      value={student.emergency_contact}
                      accent="#f97316"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "النوع",
                  value: "طالب",
                  color: "#2B6F5E",
                  icon: GraduationCap,
                  suffix: "",
                },
                {
                  label: "الحالة",
                  value: student.status || "—",
                  color: student.status === "ACTIVE" ? "#4ADE80" : "#9B8E82",
                  icon: Activity,
                  suffix: "",
                },
                {
                  label: "أيام التسجيل",
                  value: enrolledDays !== null ? `${enrolledDays}` : "—",
                  color: "#C4A035",
                  icon: Calendar,
                  suffix: " يوم",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #0d1f18, #142d22)",
                    border: `1px solid ${item.color}18`,
                    boxShadow: `0 0 20px ${item.color}08`,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{
                      background: `linear-gradient(90deg, ${item.color}50, transparent)`,
                    }}
                  />
                  <div className="p-4">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}25`,
                      }}
                    >
                      <item.icon
                        className="w-4 h-4"
                        style={{ color: item.color }}
                      />
                    </div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">
                      {item.label}
                    </p>
                    <p
                      className="text-lg font-black"
                      style={{ color: item.color }}
                    >
                      {item.value}
                      <span className="text-sm">{item.suffix}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ID Card */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #0a1d16, #132b20)",
                border: "1px solid rgba(43,111,94,0.2)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)",
                }}
              />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(43,111,94,0.2)",
                      border: "1px solid rgba(43,111,94,0.3)",
                    }}
                  >
                    <Shield className="w-5 h-5 text-[#4ADE80]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {t("admin.studentDetails.studentIdCard")}
                    </h3>
                    <p className="text-xs text-white/30">
                      {t("admin.studentDetails.studentIdCardDesc")}
                    </p>
                  </div>
                </div>
                <div className="max-w-md mx-auto">
                  <UserIDCardFlip
                    profile={{
                      user_id: student.student_id,
                      email: student.email || "",
                      google_avatar: student.user?.google_avatar,
                      role: "STUDENT",
                      is_active: student.status === "ACTIVE",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right sidebar ─── */}
          <div className="space-y-5">
            <ProfileCompletionCard student={student} />

            {/* Status */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(140deg, #0f2a22, #1a3d2e)",
                border: "1px solid rgba(43,111,94,0.2)",
                boxShadow: "0 0 30px rgba(43,111,94,0.08)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)",
                }}
              />
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                      background: "rgba(74,222,128,0.12)",
                      border: "1px solid rgba(74,222,128,0.2)",
                    }}
                  >
                    <Activity className="w-4 h-4 text-[#4ADE80]" />
                  </div>
                  <h3 className="text-sm font-bold text-white/75">
                    {t("admin.studentDetails.studentStatus")}
                  </h3>
                </div>
                <div className="text-center py-4">
                  <div
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-base font-black ${
                      student.status === "ACTIVE"
                        ? "text-[#4ADE80]"
                        : "text-white/35"
                    }`}
                    style={{
                      background:
                        student.status === "ACTIVE"
                          ? "rgba(74,222,128,0.08)"
                          : "rgba(255,255,255,0.03)",
                      border: `1px solid ${student.status === "ACTIVE" ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${student.status === "ACTIVE" ? "bg-[#4ADE80] animate-pulse" : "bg-white/20"}`}
                    />
                    {student.status}
                  </div>
                  <p className="text-xs text-white/25 mt-3 px-2 leading-relaxed">
                    {student.status === "ACTIVE"
                      ? t("admin.studentDetails.statusActiveDesc")
                      : t("admin.studentDetails.statusInactiveDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditStudentModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        student={student}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default StudentDetailsPage;
