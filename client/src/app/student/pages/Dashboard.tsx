import { Link } from "react-router-dom";
import { useStudentDashboard } from "../../../hooks/student/useStudentDashboard";
import { useStudentProfile } from "../../../hooks/student/useStudentProfile";
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
} from "../../../types/student";
import { StudentIDCardFlip } from "../components/StudentIDCardFlip";

export default function Dashboard() {
  const { data, isLoading } = useStudentDashboard();
  const { data: me } = useMe();
  const { data: fullProfile } = useStudentProfile(); // Get the full profile data

  if (isLoading) return <PageLoader />;

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-gray-600">Unable to load dashboard</p>
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
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-blue-100">
          {isEnrollmentReady
            ? "Your academic dashboard is ready!"
            : "Complete your profile to unlock all features"}
        </p>
      </div>

      {/* Enrollment Ready Banner */}
      {isEnrollmentReady && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                ✅ Enrollment Active!
              </h3>
              <p className="text-green-700 mb-4">
                Your profile is verified and ready. Browse and enroll in
                available courses.
              </p>
              <Link to="/dashboard/courses">
                <Button className="bg-green-600 hover:bg-green-700 gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Browse Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Requirements Alert (Only if incomplete) */}
      {!isEnrollmentReady && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                ⚠️ Action Required
              </h3>
              <p className="text-amber-800 mb-3">
                Complete the following requirements to enable course enrollment:
              </p>
              <ul className="space-y-2 text-amber-700">
                {!isProfileComplete && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Complete your profile ({completedFields}/{totalFields}{" "}
                    fields filled)
                  </li>
                )}
                {docStats.total === 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Upload required documents
                  </li>
                )}
                {docStats.pending > 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Wait for document approval ({docStats.pending} pending)
                  </li>
                )}
                {docStats.rejected > 0 && (
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Re-upload rejected documents ({docStats.rejected} rejected)
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* CONDITIONAL CONTENT BASED ON ENROLLMENT STATUS */}

      {isEnrollmentReady ? (
        /* ========== COMPLETED DASHBOARD ========== */
        <>
          {/* Student ID Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎓 Your Student ID
            </h2>
            {/* Use fullProfile which has all the complete data including date_of_birth, student_id, etc. */}
            <StudentIDCardFlip profile={fullProfile || me || { email: "" }} />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Enrolled Courses */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </div>

            {/* Average Grade */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📚 Current Courses
            </h2>
            <div className="space-y-3">
              {/* Placeholder for courses */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Advanced Mathematics
                  </h3>
                  <p className="text-sm text-gray-600">Progress: 75%</p>
                </div>
                <Link to="/dashboard/courses">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
              {/* Add more course placeholders or fetch from API */}
            </div>
            <Link to="/dashboard/courses" className="block mt-4">
              <Button variant="outline" className="w-full">
                View All Courses
              </Button>
            </Link>
          </div>
        </>
      ) : (
        /* ========== INCOMPLETE DASHBOARD (Requirements) ========== */
        <>
          {/* Main Dashboard Grid - Show progress circles when incomplete */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Completion Card - Always show when profile incomplete */}
            {!isProfileComplete && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Profile Completion
                      </h2>
                      <p className="text-sm text-gray-600">
                        {completedFields} of {totalFields} fields completed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <CircularProgress
                    percentage={profileCompletionPercentage}
                    color="blue"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm font-medium text-amber-900">
                      {totalFields - completedFields} field
                      {totalFields - completedFields !== 1 ? "s" : ""} remaining
                    </p>
                  </div>
                </div>

                <Link to="/dashboard/profile">
                  <Button className="w-full gap-2">
                    <Edit className="w-4 h-4" />
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* Documents Status Card - Always show when documents incomplete or missing */}
            {(docStats.total === 0 ||
              docStats.pending > 0 ||
              docStats.rejected > 0 ||
              !isProfileComplete) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Documents Status
                      </h2>
                      <p className="text-sm text-gray-600">
                        {docStats.total} document
                        {docStats.total !== 1 ? "s" : ""} uploaded
                      </p>
                    </div>
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
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Approved
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {docStats.approved}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Pending
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {docStats.pending}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Rejected
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {docStats.rejected}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to="/dashboard/documents" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </Link>
                  <Link to="/dashboard/documents" className="flex-1">
                    <Button className="w-full gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ⚡ Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {!isProfileComplete && (
                <Link to="/dashboard/profile">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <Edit className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">Complete Profile</span>
                  </Button>
                </Link>
              )}

              {(docStats.total === 0 || docStats.rejected > 0) && (
                <Link to="/dashboard/documents">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 transition-all"
                  >
                    <Upload className="w-6 h-6 text-purple-600" />
                    <span className="font-medium">Upload Documents</span>
                  </Button>
                </Link>
              )}

              <Link to="/dashboard/documents">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                >
                  <Eye className="w-6 h-6 text-indigo-600" />
                  <span className="font-medium">View Documents</span>
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Security Notice */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Security Notice:</span> Enrollment
              eligibility is automatically verified by our system. Complete all
              requirements to unlock course enrollment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ percentage, color }: CircularProgressProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: {
      gradient: ["#3B82F6", "#6366F1"],
      text: "text-blue-600",
    },
    green: {
      gradient: ["#10B981", "#059669"],
      text: "text-green-600",
    },
  };

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
            <stop offset="0%" stopColor={colors[color].gradient[0]} />
            <stop offset="100%" stopColor={colors[color].gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#E5E7EB"
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
        <span className={`text-4xl font-bold ${colors[color].text}`}>
          {percentage}%
        </span>
        <span className="text-sm text-gray-600 mt-1">Complete</span>
      </div>
    </div>
  );
}

function DonutChart({ approved, pending, rejected, total }: DonutChartProps) {
  if (total === 0) {
    return (
      <div className="w-48 h-48 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No documents yet</p>
        </div>
      </div>
    );
  }

  const radius = 70;
  const centerX = 96;
  const centerY = 96;
  const circumference = 2 * Math.PI * radius;

  const approvedPercentage = (approved / total) * 100;
  const pendingPercentage = (pending / total) * 100;
  const rejectedPercentage = (rejected / total) * 100;

  const approvedLength = (approvedPercentage / 100) * circumference;
  const pendingLength = (pendingPercentage / 100) * circumference;
  const rejectedLength = (rejectedPercentage / 100) * circumference;

  let currentOffset = 0;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="20"
          fill="none"
        />
        {approved > 0 && (
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            stroke="#10B981"
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
                  stroke="#EAB308"
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
        <span className="text-3xl font-bold text-gray-900">{total}</span>
        <span className="text-sm text-gray-600">Total</span>
      </div>
    </div>
  );
}
