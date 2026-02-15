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
} from "lucide-react";
import { useMe } from "../../../hooks/auth/auth.hooks";
import type {
  CircularProgressProps,
  DonutChartProps,
} from "../../../types/Types";
import { StudentIDCardFlip } from "../components/StudentIDCardFlip";

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = useStudentDashboard();
  const { data: me } = useMe();
  const { data: fullProfile } = useStudentProfile();

  if (isLoading) return <PageLoader />;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-[#6B5D4F]">{t("student.error.loading")}</p>
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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E]/90 to-[#1a4a3d]"></div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        ></div>
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#C4A035]/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#8DB896]/15 rounded-full blur-3xl"></div>

        <div className="relative p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t("student.dashboard.welcomeBack")}, {displayName}!
          </h1>
          <p className="text-white/60">
            {isEnrollmentReady
              ? t("student.dashboard.ready")
              : t("student.dashboard.completeProfile")}
          </p>
        </div>
      </div>

      {/* Enrollment Ready Banner */}
      {isEnrollmentReady && (
        <div className="bg-[#8DB896]/8 border border-[#8DB896]/25 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shrink-0 shadow-lg shadow-[#2B6F5E]/20">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1B1B1B] mb-2">
                {t("student.dashboard.enrollmentActive")}
              </h3>
              <p className="text-[#6B5D4F] mb-4">
                {t("student.dashboard.enrollmentActiveDesc")}
              </p>
              <Link to="/dashboard/courses">
                <Button className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white gap-2 shadow-md shadow-[#2B6F5E]/20 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                  {t("student.dashboard.browseCourses")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Requirements Alert */}
      {!isEnrollmentReady && (
        <div className="bg-[#C4A035]/5 border border-[#C4A035]/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shrink-0 shadow-lg shadow-[#C4A035]/20">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#1B1B1B] mb-2">
                {t("student.dashboard.actionRequired")}
              </h3>
              <p className="text-[#6B5D4F] mb-3">
                {t("student.dashboard.actionRequiredDesc")}
              </p>
              <ul className="space-y-2 text-[#6B5D4F]">
                {!isProfileComplete && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C4A035]" />
                    Complete your profile ({completedFields}/{totalFields}{" "}
                  </li>
                )}
                {docStats.total === 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C4A035]" />
                    {t("student.dashboard.uploadRequiredDocs")}
                  </li>
                )}
                {docStats.pending > 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C4A035]" />
                    {t("student.dashboard.waitDocApproval", {
                      count: docStats.pending,
                    })}
                  </li>
                )}
                {docStats.rejected > 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
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
          <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1B1B1B] mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#2B6F5E]" />
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
                color: "#2B6F5E",
                gradient: "from-[#2B6F5E] to-[#2B6F5E]/80",
              },
              {
                label: t("student.dashboard.averageGrade"),
                value: "85%",
                icon: TrendingUp,
                color: "#8DB896",
                gradient: "from-[#8DB896] to-[#2B6F5E]",
              },
              {
                label: t("student.dashboard.achievements"),
                value: "12",
                icon: Award,
                color: "#C4A035",
                gradient: "from-[#C4A035] to-[#C4A035]/80",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="relative bg-white rounded-2xl border border-[#D8CDC0]/50 p-6 overflow-hidden group hover:shadow-md transition-all"
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${stat.gradient} opacity-60 group-hover:opacity-100 transition-opacity`}
                ></div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${stat.color}, ${stat.color}cc)`,
                    }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#6B5D4F]">{stat.label}</p>
                    <p className="text-2xl font-bold text-[#1B1B1B]">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* {t("student.dashboard.currentCourses")} */}
          <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1B1B1B] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#C4A035]" />
              {t("student.dashboard.currentCourses")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-[#D8CDC0]/40 rounded-xl hover:bg-[#D8CDC0]/5 transition-colors">
                <div>
                  <h3 className="font-semibold text-[#1B1B1B]">
                    Advanced Mathematics
                  </h3>
                  <p className="text-sm text-[#6B5D4F]">
                    {t("student.dashboard.progress", { value: 75 })}
                  </p>
                </div>
                <Link to="/dashboard/courses">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#2B6F5E]/5 hover:border-[#2B6F5E]/30 rounded-xl"
                  >
                    View
                  </Button>
                </Link>
              </div>
            </div>
            <Link to="/dashboard/courses" className="block mt-4">
              <Button
                variant="outline"
                className="w-full border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#2B6F5E]/5 hover:border-[#2B6F5E]/30 rounded-xl"
              >
                {t("student.dashboard.viewAllCourses")}
              </Button>
            </Link>
          </div>
        </>
      ) : (
        /* ═══════ INCOMPLETE DASHBOARD ═══════ */
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* {t("student.dashboard.profileCompletion")} */}
            {!isProfileComplete && (
              <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1B1B1B]">
                      {t("student.dashboard.profileCompletion")}
                    </h2>
                    <p className="text-sm text-[#6B5D4F]">
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

                <div className="bg-[#C4A035]/5 border border-[#C4A035]/15 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#C4A035] shrink-0" />
                    <p className="text-sm font-medium text-[#1B1B1B]">
                      {totalFields - completedFields} field
                    </p>
                  </div>
                </div>

                <Link to="/dashboard/profile">
                  <Button className="w-full gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl">
                    <Edit className="w-4 h-4" />{" "}
                    {t("student.dashboard.completeProfileBtn")}
                  </Button>
                </Link>
              </div>
            )}

            {/* {t("student.dashboard.documentsStatus")} */}
            {(docStats.total === 0 ||
              docStats.pending > 0 ||
              docStats.rejected > 0 ||
              !isProfileComplete) && (
              <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1B1B1B]">
                      {t("student.dashboard.documentsStatus")}
                    </h2>
                    <p className="text-sm text-[#6B5D4F]">
                      {docStats.total} document
                      {docStats.total !== 1 ? "s" : ""}{" "}
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
                  <div className="flex items-center justify-between p-2.5 bg-[#8DB896]/8 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#2B6F5E]" />
                      <span className="text-sm font-medium text-[#1B1B1B]">
                        {t("student.dashboard.approved")}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#1B1B1B]">
                      {docStats.approved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#C4A035]/5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#C4A035]" />
                      <span className="text-sm font-medium text-[#1B1B1B]">
                        {t("student.dashboard.pending")}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#1B1B1B]">
                      {docStats.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-[#1B1B1B]">
                        {t("student.dashboard.rejected")}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#1B1B1B]">
                      {docStats.rejected}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to="/dashboard/documents" className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#D8CDC0]/10 rounded-xl"
                    >
                      <Eye className="w-4 h-4" /> View
                    </Button>
                  </Link>
                  <Link to="/dashboard/documents" className="flex-1">
                    <Button className="w-full gap-2 bg-[#C4A035] hover:bg-[#C4A035]/90 text-white rounded-xl">
                      <Upload className="w-4 h-4" /> Upload
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* {t("student.dashboard.quickActions")} */}
          <div className="bg-white rounded-2xl border border-[#D8CDC0]/50 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1B1B1B] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2B6F5E]" />
              {t("student.dashboard.quickActions")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {!isProfileComplete && (
                <Link to="/dashboard/profile">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex-col gap-2 border-[#D8CDC0]/60 hover:border-[#2B6F5E]/30 hover:bg-[#2B6F5E]/5 rounded-xl transition-all"
                  >
                    <Edit className="w-6 h-6 text-[#2B6F5E]" />
                    <span className="font-medium text-[#1B1B1B]">
                      {t("student.dashboard.completeProfileBtn")}
                    </span>
                  </Button>
                </Link>
              )}
              {(docStats.total === 0 || docStats.rejected > 0) && (
                <Link to="/dashboard/documents">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex-col gap-2 border-[#D8CDC0]/60 hover:border-[#C4A035]/30 hover:bg-[#C4A035]/5 rounded-xl transition-all"
                  >
                    <Upload className="w-6 h-6 text-[#C4A035]" />
                    <span className="font-medium text-[#1B1B1B]">
                      {t("student.dashboard.uploadDocuments")}
                    </span>
                  </Button>
                </Link>
              )}
              <Link to="/dashboard/documents">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex-col gap-2 border-[#D8CDC0]/60 hover:border-[#2B6F5E]/30 hover:bg-[#2B6F5E]/5 rounded-xl transition-all"
                >
                  <Eye className="w-6 h-6 text-[#2B6F5E]" />
                  <span className="font-medium text-[#1B1B1B]">
                    {t("student.dashboard.viewDocuments")}
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Security Notice */}
      <div className="bg-[#D8CDC0]/8 border border-[#D8CDC0]/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#BEB29E] shrink-0 mt-0.5" />
          <p className="text-sm text-[#6B5D4F]">
            <span className="font-semibold text-[#1B1B1B]">
              {t("student.dashboard.securityNotice")}
            </span>{" "}
            {t("student.dashboard.securityNoticeDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════ CIRCULAR PROGRESS ═══════ */

function CircularProgress({ percentage, color }: CircularProgressProps) {
  const { t } = useTranslation();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors: Record<string, { gradient: string[]; text: string }> = {
    teal: { gradient: ["#2B6F5E", "#1a4a3d"], text: "text-[#2B6F5E]" },
    blue: { gradient: ["#2B6F5E", "#8DB896"], text: "text-[#2B6F5E]" },
    green: { gradient: ["#8DB896", "#2B6F5E"], text: "text-[#2B6F5E]" },
  };

  const c = colors[color] || colors.teal;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient
            id={`gradient-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={c.gradient[0]} />
            <stop offset="100%" stopColor={c.gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#D8CDC0"
          strokeOpacity="0.3"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${c.text}`}>{percentage}%</span>
        <span className="text-sm text-[#BEB29E] mt-1">
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
      <div className="w-48 h-48 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-[#D8CDC0] mx-auto mb-2" />
          <p className="text-sm text-[#BEB29E]">
            {t("student.dashboard.noDocuments")}
          </p>
        </div>
      </div>
    );
  }

  const radius = 70;
  const centerX = 96;
  const centerY = 96;
  const circumference = 2 * Math.PI * radius;

  const approvedLength = (approved / total) * circumference;
  const pendingLength = (pending / total) * circumference;
  const rejectedLength = (rejected / total) * circumference;

  let currentOffset = 0;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="#D8CDC0"
          strokeOpacity="0.3"
          strokeWidth="20"
          fill="none"
        />
        {approved > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke="#2B6F5E"
            strokeWidth="20"
            fill="none"
            strokeDasharray={`${approvedLength} ${circumference}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        )}
        {pending > 0 && (
          <>
            {(() => {
              currentOffset += approvedLength;
              return (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  stroke="#C4A035"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${pendingLength} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              );
            })()}
          </>
        )}
        {rejected > 0 && (
          <>
            {(() => {
              currentOffset += pendingLength;
              return (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  stroke="#EF4444"
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${rejectedLength} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              );
            })()}
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#1B1B1B]">{total}</span>
        <span className="text-sm text-[#BEB29E]">
          {t("student.dashboard.total")}
        </span>
      </div>
    </div>
  );
}
