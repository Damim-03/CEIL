import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { useAdminStudent, type AdminStudent } from "../../../../hooks/admin/useAdmin";
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
} from "lucide-react";
import { useState } from "react";
import EditStudentModal from "../../components/EditStudentModal";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";
import { getCompletionColor, getCompletionLabel, type CompletionStep, getProfileCompletion } from "../../../../lib/utils/profileCompletion";

// ─── Circular Progress ────────────────────────────────────────
function CircularProgress({
  percentage,
  size = 88,
  color,
}: {
  percentage: number;
  size?: number;
  color: string;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        className="text-[#D8CDC0]/40 dark:text-[#2A2A2A]"
      />
      {/* fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

// ─── Step Row ─────────────────────────────────────────────────
function StepRow({ step }: { step: CompletionStep }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {step.done ? (
        <CheckCircle2 className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80] shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-[#BEB29E] dark:text-[#555] shrink-0" />
      )}
      <span
        className={`text-sm flex-1 ${
          step.done
            ? "text-[#1B1B1B] dark:text-[#E5E5E5]"
            : "text-[#9B8E82] dark:text-[#666] line-through decoration-[#BEB29E]/60"
        }`}
      >
        {step.labelAr}
      </span>
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          step.done
            ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
            : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] text-[#9B8E82]"
        }`}
      >
        {step.weight}%
      </span>
    </div>
  );
}

// ─── Profile Completion Card ───────────────────────────────────
function ProfileCompletionCard({ student }: { student: AdminStudent }) {
  const { percentage, isComplete, steps, infoScore, docsScore, isActive } =
    getProfileCompletion(student);
  const color = getCompletionColor(percentage);
  const { ar: label } = getCompletionLabel(percentage);
  const missing = steps.filter((s) => !s.done);

  // تقسيم الخطوات
  const infoSteps = steps.filter(
    (s) => !["docs_uploaded", "docs_approved", "active"].includes(s.key),
  );
  const docSteps = steps.filter((s) =>
    ["docs_uploaded", "docs_approved"].includes(s.key),
  );
  const activeStep = steps.find((s) => s.key === "active")!;

  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg dark:shadow-black/20 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
      {/* شريط علوي ملوّن */}
      <div className="h-1 w-full" style={{ background: color }} />
      <div
        className="absolute left-0 top-1 bottom-0 w-1.5"
        style={{ background: `${color}60` }}
      />

      <div className="p-5">
        {/* عنوان */}
        <div className="flex items-center gap-2.5 mb-5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${color}18` }}
          >
            <CircleUser className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              اكتمال الحساب
            </h3>
            <p className="text-[11px] text-[#9B8E82] dark:text-[#666]">
              {missing.length === 0
                ? "الحساب مكتمل"
                : `${missing.length} خطوة ناقصة`}
            </p>
          </div>
        </div>

        {/* دائرة النسبة */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative inline-flex items-center justify-center">
            <CircularProgress
              percentage={percentage}
              size={100}
              color={color}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-2xl font-black tabular-nums leading-none"
                style={{ color }}
              >
                {percentage}
              </span>
              <span className="text-[10px] text-[#9B8E82] dark:text-[#666] font-semibold">
                %
              </span>
            </div>
          </div>

          {/* أعمدة جانبية */}
          <div className="mr-4 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[11px] text-[#6B5D4F] dark:text-[#888]">
                  المعلومات
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: getCompletionColor(infoScore) }}
                >
                  {infoScore}%
                </span>
              </div>
              <div className="w-28 h-1.5 rounded-full bg-[#D8CDC0]/40 dark:bg-[#2A2A2A] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${infoScore}%`,
                    background: getCompletionColor(infoScore),
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[11px] text-[#6B5D4F] dark:text-[#888]">
                  الوثائق
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: getCompletionColor(docsScore) }}
                >
                  {docsScore}%
                </span>
              </div>
              <div className="w-28 h-1.5 rounded-full bg-[#D8CDC0]/40 dark:bg-[#2A2A2A] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${docsScore}%`,
                    background: getCompletionColor(docsScore),
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="text-[11px] text-[#6B5D4F] dark:text-[#888]">
                  التفعيل
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: isActive ? "#2B6F5E" : "#ef4444" }}
                >
                  {isActive ? "مفعّل" : "غير مفعّل"}
                </span>
              </div>
              <div className="w-28 h-1.5 rounded-full bg-[#D8CDC0]/40 dark:bg-[#2A2A2A] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: isActive ? "100%" : "0%",
                    background: "#2B6F5E",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* شارة الحالة */}
        <div
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl mb-4 text-sm font-bold"
          style={{ background: `${color}12`, color }}
        >
          {isComplete ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {label}
        </div>

        {/* تفاصيل الخطوات */}
        <div className="space-y-1">
          {/* قسم المعلومات */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-[#9B8E82] dark:text-[#555] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3 h-3" />
              المعلومات الشخصية
            </p>
            <div className="space-y-0.5 pl-1">
              {infoSteps.map((s) => (
                <StepRow key={s.key} step={s} />
              ))}
            </div>
          </div>

          <div className="border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] my-2" />

          {/* قسم الوثائق */}
          <div className="mb-2">
            <p className="text-[10px] font-bold text-[#9B8E82] dark:text-[#555] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              الوثائق
            </p>
            <div className="space-y-0.5 pl-1">
              {docSteps.map((s) => (
                <StepRow key={s.key} step={s} />
              ))}
            </div>
          </div>

          <div className="border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] my-2" />

          {/* التفعيل */}
          <div className="pl-1">
            <StepRow step={activeStep} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
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
          <div>
            <h2 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              {t("admin.studentDetails.studentNotFound")}
            </h2>
            <p className="text-[#6B5D4F] dark:text-[#AAAAAA] text-lg">
              {t("admin.studentDetails.studentNotFoundDesc")}
            </p>
          </div>
          <Link to="/admin/students">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 mt-4 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:text-[#E5E5E5] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222]"
            >
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
    <div className="pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to="/admin/students">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.studentDetails.backToStudents")}
          </Button>
        </Link>

        {/* Hero Card */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl dark:shadow-black/30 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-[#2B6F5E] via-[#2B6F5E]/90 to-[#2B6F5E]/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#C4A035]/15 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 top-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4A035] via-[#C4A035]/60 to-transparent"></div>

            {/* ✅ شارة الاكتمال في الـ hero */}
            <div className="absolute top-4 left-4">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-sm border"
                style={{
                  background: `${completionColor}25`,
                  borderColor: `${completionColor}50`,
                  color: "#fff",
                }}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                {completionLabel} — {percentage}%
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 relative">
              <div className="relative group">
                {student.user?.google_avatar ? (
                  <img
                    src={student.user.google_avatar}
                    alt={`${student.first_name || ""} ${student.last_name || ""}`}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-[#1A1A1A] shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white dark:border-[#1A1A1A] group-hover:shadow-2xl transition-all duration-300">
                    {student.first_name?.charAt(0) || "?"}
                    {student.last_name?.charAt(0) || ""}
                  </div>
                )}
                {/* حلقة الاكتمال حول الصورة */}
                <div
                  className="absolute inset-0 rounded-2xl border-4 pointer-events-none"
                  style={{ borderColor: `${completionColor}60` }}
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-[#1A1A1A]">
                  {student.status === "ACTIVE" ? (
                    <div className="w-4 h-4 bg-[#8DB896] rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-4 h-4 bg-[#BEB29E] rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl sm:text-4xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {student.first_name || ""}{" "}
                        {student.last_name || "Unknown"}
                      </h1>
                      <GraduationCap className="w-7 h-7 text-[#C4A035]" />
                    </div>
                    <p className="text-[#6B5D4F] dark:text-[#888888] text-sm mb-3">
                      {t("admin.studentDetails.studentId", {
                        id: student.student_id,
                      })}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          student.status === "ACTIVE"
                            ? "bg-[#8DB896]/15 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#8DB896]/30 dark:border-[#4ADE80]/20"
                            : "bg-[#D8CDC0]/30 dark:bg-[#555555]/20 text-[#6B5D4F] dark:text-[#AAAAAA] border border-[#D8CDC0]/50 dark:border-[#555555]/30"
                        }`}
                      >
                        {student.status || t("admin.studentDetails.unknown")}
                      </span>
                      {/* ✅ شريط اكتمال مدمج في الـ hero */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-[#D8CDC0]/40 dark:bg-[#2A2A2A] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${percentage}%`,
                              background: completionColor,
                            }}
                          />
                        </div>
                        <span
                          className="text-sm font-bold"
                          style={{ color: completionColor }}
                        >
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    {student.created_at && (
                      <div className="inline-flex items-center gap-3 bg-[#2B6F5E]/5 dark:bg-[#2B6F5E]/10 rounded-xl px-4 py-2.5 border border-[#2B6F5E]/15 dark:border-[#2B6F5E]/20">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shrink-0 shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] uppercase tracking-wider">
                            {t("admin.studentDetails.enrolledSince")}
                          </p>
                          <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                            {new Date(student.created_at).toLocaleDateString(
                              locale,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-[10px] text-[#2B6F5E] dark:text-[#4ADE80]/70">
                            {t("admin.studentDetails.daysAgo", {
                              count: enrolledDays ?? undefined,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsEditOpen(true)}
                      className="gap-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#1B1B1B] dark:text-[#E5E5E5] hover:bg-[#C4A035]/8 dark:hover:bg-[#C4A035]/10 hover:border-[#C4A035]/40 dark:hover:border-[#C4A035]/30 hover:text-[#C4A035] dark:hover:text-[#D4A843] transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      {t("admin.studentDetails.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("admin.students.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Student Info */}
          <div className="lg:col-span-2 relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg dark:shadow-black/20 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 sm:p-8 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("admin.studentDetails.studentInfo")}
              </h2>
            </div>
            <div className="space-y-2">
              <InfoRow
                icon={Mail}
                label={t("admin.studentDetails.emailAddress")}
                value={student.email || "—"}
                color="teal"
              />
              <InfoRow
                icon={Phone}
                label={t("admin.studentDetails.phoneNumber")}
                value={student.phone_number || "—"}
                color="mustard"
              />
              {student.date_of_birth && (
                <InfoRow
                  icon={Calendar}
                  label={t("admin.studentDetails.dateOfBirth")}
                  value={new Date(student.date_of_birth).toLocaleDateString(
                    locale,
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                  color="teal"
                />
              )}
              {student.address && (
                <InfoRow
                  icon={MapPin}
                  label={t("admin.studentDetails.address")}
                  value={student.address}
                  color="mustard"
                />
              )}
              {student.emergency_contact && (
                <InfoRow
                  icon={AlertCircle}
                  label={t("admin.studentDetails.emergencyContact")}
                  value={student.emergency_contact}
                  color="teal"
                />
              )}
            </div>

            <div className="mt-10 pt-8 border-t-2 border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 mb-4 shadow-xl shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
                  {t("admin.studentDetails.studentIdCard")}
                </h3>
                <p className="text-sm text-[#6B5D4F] dark:text-[#AAAAAA] max-w-md mx-auto">
                  {t("admin.studentDetails.studentIdCardDesc")}
                </p>
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

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* ✅ بطاقة اكتمال الحساب */}
            <ProfileCompletionCard student={student} />

            {/* Status Card */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl p-6 text-white bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E] to-[#2B6F5E]/90">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
              <div className="absolute inset-0 opacity-[0.06]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Activity className="w-5 h-5 text-[#C4A035]" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {t("admin.studentDetails.studentStatus")}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-white/60 mb-1">
                      {t("admin.studentDetails.currentStatus")}
                    </p>
                    <p className="text-2xl font-bold text-[#C4A035] capitalize">
                      {student.status || t("admin.studentDetails.unknown")}
                    </p>
                  </div>
                  <div className="text-sm text-white/70 bg-white/5 rounded-lg p-3">
                    {student.status === "ACTIVE"
                      ? t("admin.studentDetails.statusActiveDesc")
                      : t("admin.studentDetails.statusInactiveDesc")}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-lg dark:shadow-black/20 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("admin.studentDetails.quickInfo")}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                  <span className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                    {t("admin.studentDetails.type")}
                  </span>
                  <span className="text-sm font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 px-3 py-1 rounded-lg">
                    {t("admin.studentDetails.student")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                  <span className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                    {t("admin.studentDetails.status")}
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      student.status === "ACTIVE"
                        ? "text-[#2B6F5E] dark:text-[#4ADE80] bg-[#8DB896]/15 dark:bg-[#4ADE80]/10"
                        : "text-[#6B5D4F] dark:text-[#AAAAAA] bg-[#D8CDC0]/30 dark:bg-[#555555]/20"
                    }`}
                  >
                    {student.status || t("admin.studentDetails.unknown")}
                  </span>
                </div>
                {enrolledDays !== null && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                      {t("admin.studentDetails.enrollmentAge")}
                    </span>
                    <span className="text-sm font-bold text-[#C4A035] dark:text-[#D4A843] bg-[#C4A035]/8 dark:bg-[#C4A035]/10 px-3 py-1 rounded-lg">
                      {t("admin.studentDetails.days", {
                        count: enrolledDays ?? undefined,
                      })}
                    </span>
                  </div>
                )}
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

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "teal" | "mustard";
}) {
  const styles = {
    teal: {
      iconBg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      label: "text-[#2B6F5E] dark:text-[#4ADE80]",
      hover: "hover:bg-[#2B6F5E]/8 dark:hover:bg-[#2B6F5E]/10",
    },
    mustard: {
      iconBg: "bg-[#C4A035]/10 dark:bg-[#D4A843]/10",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
      label: "text-[#C4A035] dark:text-[#D4A843]",
      hover: "hover:bg-[#C4A035]/8 dark:hover:bg-[#C4A035]/10",
    },
  };
  const s = styles[color];
  return (
    <div
      className={`group ${s.hover} -mx-4 px-4 py-4 rounded-xl transition-all duration-200`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
        >
          <Icon className={`w-5 h-5 ${s.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] font-bold ${s.label} uppercase tracking-wider mb-1`}
          >
            {label}
          </p>
          <p className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] break-all">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
