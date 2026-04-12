import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStudentDashboard } from "../../../hooks/student/Usestudent";
import { useStudentProfile } from "../../../hooks/student/Usestudent";
import PageLoader from "../../../components/PageLoader";
import { Button } from "../../../components/ui/button";
import {
  User,
  FileText,
  CheckCircle,
  AlertTriangle,
  Edit,
  Upload,
  GraduationCap,
  ArrowRight,
  Shield,
  Eye,
  BookOpen,
  TrendingUp,
  Award,
  X,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { useMe } from "../../../hooks/auth/auth.hooks";
import type {
  CircularProgressProps,
  DonutChartProps,
} from "../../../types/Types";
import { StudentIDCardFlip } from "../components/StudentIDCardFlip";
import { useState, useEffect } from "react";

/* ═══════ NEW STUDENT MODAL ═══════ */
function NewStudentModal({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(false);

  // animation on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md transition-all duration-300 ${
          visible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-br from-[#C4A035]/30 via-[#2B6F5E]/20 to-[#C4A035]/10 rounded-3xl blur-xl opacity-60" />

        <div className="relative bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] overflow-hidden shadow-2xl">
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-[#111111] to-[#1a1a1a] px-6 pt-8 pb-6 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #C4A035 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C4A035]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#2B6F5E]/20 rounded-full blur-3xl" />

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* Icon */}
            <div className="relative flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#a07a20] flex items-center justify-center shadow-xl shadow-[#C4A035]/30">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                {/* pulse */}
                <div className="absolute inset-0 rounded-2xl bg-[#C4A035]/40 animate-ping" />
                {/* sparkle */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4ADE80] border-2 border-[#111111] flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            </div>

            <div className="relative text-center">
              <p className="text-[#C4A035]/70 text-[10px] font-bold uppercase tracking-widest mb-1">
                مرحباً بك 👋
              </p>
              <h2 className="text-xl font-bold text-white leading-tight">
                أهلاً بك في منصتنا!
              </h2>
              <p className="text-white/50 text-xs mt-1.5">
                خطوة واحدة تفصلك عن اكتمال تسجيلك
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Info box */}
            <div className="bg-[#C4A035]/[0.06] dark:bg-[#C4A035]/[0.04] border border-[#C4A035]/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C4A035]/15 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-[#C4A035]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8] mb-1">
                    يجب عليك رفع الوثائق المطلوبة
                  </p>
                  <p className="text-xs text-[#9B8E82] dark:text-[#666666] leading-relaxed">
                    لإتمام عملية التسجيل والاستفادة من جميع خدمات المنصة، يرجى
                    رفع وثائقك الرسمية في أقرب وقت ممكن.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2.5">
              {[
                {
                  step: "01",
                  text: "اذهب إلى صفحة الوثائق",
                  color: "text-[#2B6F5E] dark:text-[#4ADE80]",
                  bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
                },
                {
                  step: "02",
                  text: "ارفع الوثائق المطلوبة",
                  color: "text-[#C4A035] dark:text-[#D4A843]",
                  bg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/8",
                },
                {
                  step: "03",
                  text: "انتظر موافقة الإدارة",
                  color: "text-purple-500",
                  bg: "bg-purple-500/8",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-center gap-3 px-3.5 py-2.5 bg-[#F8F4F0]/60 dark:bg-[#1A1A1A] rounded-xl border border-[#E8DDD4]/50 dark:border-[#2A2A2A]"
                >
                  <span
                    className={`text-[11px] font-black tabular-nums ${item.color} ${item.bg} w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
                  >
                    {item.step}
                  </span>
                  <span className="text-xs font-medium text-[#4A4A4A] dark:text-[#AAAAAA]">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleClose}
                className="flex-1 h-10 rounded-xl border border-[#E8DDD4]/70 dark:border-[#2A2A2A] text-sm font-medium text-[#9B8E82] dark:text-[#666666] hover:bg-[#F8F4F0] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                لاحقاً
              </button>
              <Link
                to="/student/documents"
                className="flex-1"
                onClick={handleClose}
              >
                <Button className="w-full h-10 gap-2 bg-gradient-to-r from-[#C4A035] to-[#a07a20] hover:opacity-90 text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#C4A035]/20">
                  <Upload className="w-4 h-4" />
                  رفع الوثائق الآن
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════ DASHBOARD ═══════ */
export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useStudentDashboard();
  const { data: me } = useMe();
  const { data: fullProfile } = useStudentProfile();

  // ✅ منطق إظهار الـ modal للطالب الجديد
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);

  useEffect(() => {
    if (!data) return;

    const { documents, enrollment } = data;
    const isNewStudent = documents.total === 0 && !enrollment.isReady;

    if (!isNewStudent) return;

    // نتحقق إذا كان المستخدم شاهد الـ modal من قبل
    const modalKey = `new_student_modal_shown_${me?.user_id ?? "unknown"}`;
    const alreadyShown = sessionStorage.getItem(modalKey);

    if (!alreadyShown) {
      // نأخر الظهور قليلاً حتى تتحمل الصفحة
      const timer = setTimeout(() => {
        setShowNewStudentModal(true);
        sessionStorage.setItem(modalKey, "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [data, me]);

  if (isLoading) return <PageLoader />;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-[#9B8E82] dark:text-[#555555]">
          {t("student.error.loading")}
        </p>
      </div>
    );
  }

  const { profile, documents, enrollment } = data;

  const displayName =
    me?.display_name || me?.first_name || me?.email?.split("@")[0] || "Student";

  const completedFields = profile.completedFields;
  const totalFields = profile.totalFields;
  const profileCompletionPercentage = profile.percentage;
  const isProfileComplete = profile.isComplete;

  const docStats = {
    total: documents.total,
    approved: documents.approved,
    pending: documents.pending,
    rejected: documents.rejected,
  };

  const isEnrollmentReady = enrollment.isReady;

  return (
    <div className="space-y-5">
      {/* ✅ Modal الطالب الجديد */}
      {showNewStudentModal && (
        <NewStudentModal onClose={() => setShowNewStudentModal(false)} />
      )}

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-[#111111] dark:bg-[#0A0A0A]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #4ADE80 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2B6F5E]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#C4A035]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/30 to-transparent" />

        <div className="relative p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[#4ADE80]/60 text-xs font-semibold uppercase tracking-widest mb-2">
              {t("student.dashboard.welcomeBack")}
            </p>
            <h1 className="text-2xl font-bold text-white leading-tight">
              {displayName}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {isEnrollmentReady
                ? t("student.dashboard.ready")
                : t("student.dashboard.completeProfile")}
            </p>
          </div>

          <div
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold ${
              isEnrollmentReady
                ? "bg-[#2B6F5E]/15 border-[#2B6F5E]/30 text-[#4ADE80]"
                : "bg-[#C4A035]/10 border-[#C4A035]/25 text-[#D4A843]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isEnrollmentReady ? "bg-[#4ADE80]" : "bg-[#D4A843]"
              }`}
            />
            {isEnrollmentReady ? "Enrollment Active" : "Action Required"}
          </div>
        </div>
      </div>

      {/* ── Enrollment Ready Banner ── */}
      {isEnrollmentReady && (
        <div className="bg-[#2B6F5E]/[0.04] dark:bg-[#4ADE80]/[0.04] border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] flex items-center justify-center shrink-0 shadow-lg shadow-[#2B6F5E]/20">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E8E8E8] mb-1">
                {t("student.dashboard.enrollmentActive")}
              </h3>
              <p className="text-xs text-[#9B8E82] dark:text-[#555555] mb-4">
                {t("student.dashboard.enrollmentActiveDesc")}
              </p>
              <Link to="/student/courses">
                <Button
                  size="sm"
                  className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white gap-2 rounded-xl text-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  {t("student.dashboard.browseCourses")}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Requirements Alert ── */}
      {!isEnrollmentReady && (
        <div className="bg-[#C4A035]/[0.04] dark:bg-[#D4A843]/[0.03] border border-[#C4A035]/20 dark:border-[#D4A843]/15 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#a07a20] flex items-center justify-center shrink-0 shadow-lg shadow-[#C4A035]/20">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E8E8E8] mb-1">
                {t("student.dashboard.actionRequired")}
              </h3>
              <p className="text-xs text-[#9B8E82] dark:text-[#555555] mb-3">
                {t("student.dashboard.actionRequiredDesc")}
              </p>
              <ul className="space-y-1.5">
                {!isProfileComplete && (
                  <li className="flex items-center gap-2 text-xs text-[#9B8E82] dark:text-[#666666]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4A035] shrink-0" />
                    Complete your profile ({completedFields}/{totalFields}{" "}
                    fields)
                  </li>
                )}
                {docStats.total === 0 && (
                  <li className="flex items-center gap-2 text-xs text-[#9B8E82] dark:text-[#666666]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4A035] shrink-0" />
                    {t("student.dashboard.uploadRequiredDocs")}
                  </li>
                )}
                {docStats.pending > 0 && (
                  <li className="flex items-center gap-2 text-xs text-[#9B8E82] dark:text-[#666666]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C4A035] shrink-0" />
                    {t("student.dashboard.waitDocApproval", {
                      count: docStats.pending,
                    })}
                  </li>
                )}
                {docStats.rejected > 0 && (
                  <li className="flex items-center gap-2 text-xs text-[#9B8E82] dark:text-[#666666]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {t("student.dashboard.reuploadRejected", {
                      count: docStats.rejected,
                    })}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ COMPLETED DASHBOARD ═══════ */}
      {isEnrollmentReady ? (
        <>
          {/* Student ID Card */}
          <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] p-6">
            <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8] mb-5 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
              {t("student.dashboard.studentId")}
            </h2>
            <StudentIDCardFlip profile={fullProfile || me || { email: "" }} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: t("student.dashboard.enrolledCourses"),
                value: "5",
                icon: BookOpen,
                iconBg: "bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/10",
                iconColor: "text-[#2B6F5E] dark:text-[#4ADE80]",
                valColor: "text-[#2B6F5E] dark:text-[#4ADE80]",
                accentBar: "from-[#2B6F5E] to-[#2B6F5E]/20",
              },
              {
                label: t("student.dashboard.averageGrade"),
                value: "85%",
                icon: TrendingUp,
                iconBg: "bg-[#8DB896]/10 dark:bg-[#8DB896]/8",
                iconColor: "text-[#2B6F5E] dark:text-[#8DB896]",
                valColor: "text-[#2B6F5E] dark:text-[#8DB896]",
                accentBar: "from-[#8DB896] to-[#8DB896]/20",
              },
              {
                label: t("student.dashboard.achievements"),
                value: "12",
                icon: Award,
                iconBg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/10",
                iconColor: "text-[#C4A035] dark:text-[#D4A843]",
                valColor: "text-[#C4A035] dark:text-[#D4A843]",
                accentBar: "from-[#C4A035] to-[#C4A035]/20",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] p-5 overflow-hidden hover:border-[#D0C8BE] dark:hover:border-[#2A2A2A] transition-colors"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${stat.accentBar}`}
                />
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                  >
                    <stat.icon className={`w-4.5 h-4.5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#9B8E82] dark:text-[#555555] font-medium">
                      {stat.label}
                    </p>
                    <p
                      className={`text-2xl font-bold tabular-nums ${stat.valColor}`}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Courses */}
          <div className="bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8DDD4]/50 dark:border-[#1A1A1A] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
                {t("student.dashboard.currentCourses")}
              </h2>
              <Link to="/student/courses">
                <span className="text-xs text-[#2B6F5E] dark:text-[#4ADE80] font-medium flex items-center gap-1 hover:opacity-70 transition-opacity">
                  {t("student.dashboard.viewAllCourses")}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="divide-y divide-[#E8DDD4]/40 dark:divide-[#1A1A1A]">
              <div className="flex items-center justify-between px-6 py-4 hover:bg-[#F8F4F0]/60 dark:hover:bg-[#161616] transition-colors">
                <div>
                  <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
                    Advanced Mathematics
                  </h3>
                  <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-0.5">
                    {t("student.dashboard.progress", { value: 75 })}
                  </p>
                </div>
                <Link to="/student/courses">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#E8DDD4]/70 dark:border-[#1E1E1E] text-[#6B5D4F] dark:text-[#666666] hover:border-[#2B6F5E]/30 dark:hover:border-[#4ADE80]/20 hover:text-[#2B6F5E] dark:hover:text-[#4ADE80] rounded-xl text-xs"
                  >
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ═══════ INCOMPLETE DASHBOARD ═══════ */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Profile Completion */}
            {!isProfileComplete && (
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] p-6">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] flex items-center justify-center shadow-md shadow-[#2B6F5E]/20">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E8E8E8]">
                      {t("student.dashboard.profileCompletion")}
                    </h2>
                    <p className="text-xs text-[#9B8E82] dark:text-[#555555]">
                      {t("student.dashboard.fieldsCompleted", {
                        completed: completedFields,
                        total: totalFields,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <CircularProgress
                    percentage={profileCompletionPercentage}
                    color="teal"
                  />
                </div>

                <div className="bg-[#C4A035]/[0.04] dark:bg-[#D4A843]/[0.03] border border-[#C4A035]/20 dark:border-[#D4A843]/15 rounded-xl px-4 py-3 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#C4A035] dark:text-[#D4A843] shrink-0" />
                    <p className="text-xs font-medium text-[#6B5D4F] dark:text-[#888888]">
                      {totalFields - completedFields} field
                      {totalFields - completedFields !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                </div>

                <Link to="/student/profile">
                  <Button className="w-full gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl text-sm">
                    <Edit className="w-3.5 h-3.5" />
                    {t("student.dashboard.completeProfileBtn")}
                  </Button>
                </Link>
              </div>
            )}

            {/* Documents Status */}
            {(docStats.total === 0 ||
              docStats.pending > 0 ||
              docStats.rejected > 0 ||
              !isProfileComplete) && (
              <div className="bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] p-6">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#a07a20] flex items-center justify-center shadow-md shadow-[#C4A035]/20">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1B1B1B] dark:text-[#E8E8E8]">
                      {t("student.dashboard.documentsStatus")}
                    </h2>
                    <p className="text-xs text-[#9B8E82] dark:text-[#555555]">
                      {docStats.total} document{docStats.total !== 1 ? "s" : ""}{" "}
                      uploaded
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <DonutChart
                    approved={docStats.approved}
                    pending={docStats.pending}
                    rejected={docStats.rejected}
                    total={docStats.total}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    {
                      label: t("student.dashboard.approved"),
                      count: docStats.approved,
                      dot: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
                      bg: "bg-[#2B6F5E]/[0.04] dark:bg-[#4ADE80]/[0.04]",
                      border: "border-[#2B6F5E]/12 dark:border-[#4ADE80]/12",
                    },
                    {
                      label: t("student.dashboard.pending"),
                      count: docStats.pending,
                      dot: "bg-[#C4A035] dark:bg-[#D4A843]",
                      bg: "bg-[#C4A035]/[0.04] dark:bg-[#D4A843]/[0.03]",
                      border: "border-[#C4A035]/15 dark:border-[#D4A843]/12",
                    },
                    {
                      label: t("student.dashboard.rejected"),
                      count: docStats.rejected,
                      dot: "bg-red-500",
                      bg: "bg-red-50/60 dark:bg-red-950/[0.08]",
                      border: "border-red-200/50 dark:border-red-900/20",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${row.bg} ${row.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${row.dot}`} />
                        <span className="text-xs font-medium text-[#4A4A4A] dark:text-[#AAAAAA]">
                          {row.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E8E8E8] tabular-nums">
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link to="/student/documents" className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-[#E8DDD4]/70 dark:border-[#1E1E1E] text-[#6B5D4F] dark:text-[#666666] hover:border-[#2B6F5E]/25 hover:text-[#2B6F5E] dark:hover:text-[#4ADE80] rounded-xl text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </Link>
                  <Link to="/student/documents" className="flex-1">
                    <Button
                      size="sm"
                      className="w-full gap-1.5 bg-[#C4A035] hover:bg-[#C4A035]/90 text-white rounded-xl text-xs"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8DDD4]/50 dark:border-[#1A1A1A]">
              <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                {t("student.dashboard.quickActions")}
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {!isProfileComplete && (
                <Link to="/student/profile">
                  <button className="w-full h-auto py-4 flex flex-col items-center gap-2 border border-[#E8DDD4]/70 dark:border-[#1E1E1E] hover:border-[#2B6F5E]/25 dark:hover:border-[#4ADE80]/20 hover:bg-[#2B6F5E]/[0.03] dark:hover:bg-[#4ADE80]/[0.03] rounded-xl transition-all">
                    <div className="w-9 h-9 rounded-xl bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/10 flex items-center justify-center">
                      <Edit className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    </div>
                    <span className="text-xs font-medium text-[#4A4A4A] dark:text-[#AAAAAA]">
                      {t("student.dashboard.completeProfileBtn")}
                    </span>
                  </button>
                </Link>
              )}
              {(docStats.total === 0 || docStats.rejected > 0) && (
                <Link to="/student/documents">
                  <button className="w-full h-auto py-4 flex flex-col items-center gap-2 border border-[#E8DDD4]/70 dark:border-[#1E1E1E] hover:border-[#C4A035]/25 dark:hover:border-[#D4A843]/20 hover:bg-[#C4A035]/[0.03] dark:hover:bg-[#D4A843]/[0.03] rounded-xl transition-all">
                    <div className="w-9 h-9 rounded-xl bg-[#C4A035]/8 dark:bg-[#C4A035]/10 flex items-center justify-center">
                      <Upload className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
                    </div>
                    <span className="text-xs font-medium text-[#4A4A4A] dark:text-[#AAAAAA]">
                      {t("student.dashboard.uploadDocuments")}
                    </span>
                  </button>
                </Link>
              )}
              <Link to="/student/documents">
                <button className="w-full h-auto py-4 flex flex-col items-center gap-2 border border-[#E8DDD4]/70 dark:border-[#1E1E1E] hover:border-[#2B6F5E]/25 dark:hover:border-[#4ADE80]/20 hover:bg-[#2B6F5E]/[0.03] dark:hover:bg-[#4ADE80]/[0.03] rounded-xl transition-all">
                  <div className="w-9 h-9 rounded-xl bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                  </div>
                  <span className="text-xs font-medium text-[#4A4A4A] dark:text-[#AAAAAA]">
                    {t("student.dashboard.viewDocuments")}
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Security Notice ── */}
      <div className="flex items-start gap-3 px-5 py-4 bg-[#F8F4F0]/60 dark:bg-[#0D0D0D] border border-[#E8DDD4]/50 dark:border-[#1A1A1A] rounded-2xl">
        <Shield className="w-4 h-4 text-[#BEB29E] dark:text-[#444444] shrink-0 mt-0.5" />
        <p className="text-xs text-[#9B8E82] dark:text-[#555555] leading-relaxed">
          <span className="font-semibold text-[#6B5D4F] dark:text-[#777777]">
            {t("student.dashboard.securityNotice")}
          </span>{" "}
          {t("student.dashboard.securityNoticeDesc")}
        </p>
      </div>
    </div>
  );
}

/* ═══════ CIRCULAR PROGRESS ═══════ */
function CircularProgress({ percentage, color }: CircularProgressProps) {
  const { t } = useTranslation();
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const gradients: Record<string, { from: string; to: string; text: string }> =
    {
      teal: { from: "#2B6F5E", to: "#4ADE80", text: "#2B6F5E" },
      blue: { from: "#2B6F5E", to: "#8DB896", text: "#2B6F5E" },
      green: { from: "#8DB896", to: "#2B6F5E", text: "#2B6F5E" },
    };

  const c = gradients[color] || gradients.teal;

  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full -rotate-90">
        <defs>
          <linearGradient
            id={`cp-grad-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        </defs>
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="#E8DDD4"
          strokeOpacity="0.4"
          strokeWidth="10"
          fill="none"
          className="dark:[stroke-opacity:0.08] dark:[stroke:#FFFFFF]"
        />
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke={`url(#cp-grad-${color})`}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#2B6F5E] dark:text-[#4ADE80] tabular-nums">
          {percentage}%
        </span>
        <span className="text-[10px] text-[#9B8E82] dark:text-[#555555] font-medium uppercase tracking-wider mt-1">
          {t("student.dashboard.complete")}
        </span>
      </div>
    </div>
  );
}

/* ═══════ DONUT CHART ═══════ */
function DonutChart({ approved, pending, rejected, total }: DonutChartProps) {
  const { t } = useTranslation();

  if (total === 0) {
    return (
      <div className="w-44 h-44 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EBE5] dark:bg-[#1E1E1E] flex items-center justify-center mx-auto mb-2">
            <FileText className="w-6 h-6 text-[#BEB29E] dark:text-[#444444]" />
          </div>
          <p className="text-xs text-[#9B8E82] dark:text-[#555555]">
            {t("student.dashboard.noDocuments")}
          </p>
        </div>
      </div>
    );
  }

  const radius = 68;
  const cx = 88;
  const cy = 88;
  const circumference = 2 * Math.PI * radius;

  const approvedLen = (approved / total) * circumference;
  const pendingLen = (pending / total) * circumference;
  const rejectedLen = (rejected / total) * circumference;

  let offset = 0;

  const segments = [
    { len: approvedLen, color: "#2B6F5E", skip: approved === 0 },
    { len: pendingLen, color: "#C4A035", skip: pending === 0 },
    { len: rejectedLen, color: "#EF4444", skip: rejected === 0 },
  ];

  return (
    <div className="relative w-44 h-44">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#E8DDD4"
          strokeOpacity="0.4"
          strokeWidth="18"
          fill="none"
          className="dark:[stroke-opacity:0.08] dark:[stroke:#FFFFFF]"
        />
        {segments.map((seg, i) => {
          if (seg.skip) return null;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              stroke={seg.color}
              strokeWidth="18"
              fill="none"
              strokeDasharray={`${seg.len} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          );
          offset += seg.len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E8E8E8] tabular-nums">
          {total}
        </span>
        <span className="text-[10px] text-[#9B8E82] dark:text-[#555555] font-medium uppercase tracking-wider mt-1">
          {t("student.dashboard.total")}
        </span>
      </div>
    </div>
  );
}
