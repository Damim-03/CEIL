import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  GraduationCap,
  FileText,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useStudentEnrollments } from "../../../hooks/student/Usestudent";

// Type definitions matching ACTUAL backend response (UPPERCASE enum)
type RegistrationStatus = "PENDING" | "VALIDATED" | "PAID" | "REJECTED" | "FINISHED";

interface Enrollment {
  enrollment_id: string;
  student_id: string;
  course_id: string;
  group_id?: string | null;
  enrollment_date?: string | null;
  level?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  registration_status: RegistrationStatus;
  course?: {
    course_id: string;
    course_code?: string;
    course_name: string;
    credits?: number;
  };
  group?: {
    group_id: string;
    name: string;
    course_id: string;
    level: string;
    department_id?: string | null;
    teacher_id?: string | null;
    max_students: number;
    status: "OPEN" | "CLOSED" | "FULL" | "FINISHED";
  } | null;
}

// Status Configuration - MATCHES ACTUAL Backend (UPPERCASE)
const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Pending Review",
    message: "Your enrollment request is pending admin approval.",
  },
  VALIDATED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    label: "Validated",
    message: "Your enrollment has been validated. You can now join a group!",
  },
  PAID: {
    icon: CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Paid & Active",
    message: "Payment confirmed. Ready to start learning!",
  },
  REJECTED: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Rejected",
    message: "Your enrollment request was not approved. Contact admin for details.",
  },
  FINISHED: {
    icon: GraduationCap,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    label: "Completed",
    message: "Congratulations! You've completed this course.",
  },
} as const;

// Helper to get safe status config with fallback
const getStatusConfig = (status: RegistrationStatus) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
};

// Helper to check if enrollment can join a group
// Note: Even if status is PENDING, if they have a group_id, they're already assigned
const canJoinGroup = (enrollment: Enrollment) => {
  return (
    (enrollment.registration_status === "VALIDATED" || 
     enrollment.registration_status === "PAID") && 
    !enrollment.group_id
  );
};

// Helper to count enrollments by status
const getEnrollmentCount = (enrollments: Enrollment[], statuses: RegistrationStatus[]) => 
  enrollments.filter(e => statuses.includes(e.registration_status)).length;

export default function Enrollments() {
  const navigate = useNavigate();
  const {
    data: enrollments = [],
    isLoading,
    isError,
    error,
  } = useStudentEnrollments();

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-600 font-medium">
            Loading your enrollments...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Enrollments
            </h3>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : "Something went wrong. Please try again later."}
            </p>
          </div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Empty State
  if (enrollments.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <motion.div
          className="text-center space-y-6 max-w-lg px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <GraduationCap className="w-16 h-16 text-blue-600" />
            </motion.div>

            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: `${20 + i * 30}%`,
                  left: `${15 + i * 35}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              No Enrollments Yet
            </h2>
            <p className="text-gray-600 text-lg">
              You haven't enrolled in any program yet. Start your learning journey today!
            </p>
          </div>

          <Button
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => navigate("/dashboard/courses")}
          >
            <span>Browse Courses</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Browse our available courses and submit your enrollment request
          </p>
        </motion.div>
      </div>
    );
  }

  // Filter enrollments ready for group assignment
  const readyForGroup = enrollments.filter(e => canJoinGroup(e));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Enrollments</h1>
            <p className="text-gray-600">
              Track your enrollment status and group assignments
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Banner - Join Groups */}
      {readyForGroup.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Ready to Join a Group! 🎉
                </h3>
                <p className="text-teal-50 mb-1">
                  You have {readyForGroup.length} enrollment(s) ready for group selection.
                </p>
                <p className="text-teal-100 text-sm">
                  Choose your level and join a group to start learning!
                </p>
              </div>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 shrink-0 bg-white text-teal-600 hover:bg-teal-50"
              onClick={() => navigate("/dashboard/courses")}
            >
              <span>Choose Group</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-sm text-emerald-700 font-medium">Active</p>
              <p className="text-2xl font-bold text-emerald-900">
                {getEnrollmentCount(enrollments, ["VALIDATED", "PAID"])}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-amber-700 font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-900">
                {getEnrollmentCount(enrollments, ["PENDING"])}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Paid</p>
              <p className="text-2xl font-bold text-blue-900">
                {getEnrollmentCount(enrollments, ["PAID"])}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-700 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900">
                {getEnrollmentCount(enrollments, ["REJECTED"])}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enrollments Grid */}
      <EnrollmentsList enrollments={enrollments} />
    </div>
  );
}

/* ==================== ENROLLMENTS LIST ==================== */

interface EnrollmentsListProps {
  enrollments: Enrollment[];
}

function EnrollmentsList({ enrollments }: EnrollmentsListProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {enrollments.map((enrollment, index) => {
        const config = getStatusConfig(enrollment.registration_status);
        const StatusIcon = config.icon;
        const canJoin = canJoinGroup(enrollment);
        const hasGroup = !!enrollment.group_id;

        // Format enrollment date with null safety
        const enrollmentDate = enrollment.enrollment_date 
          ? new Date(enrollment.enrollment_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";

        // Get course name safely
        const courseName = enrollment.course?.course_name || "Unnamed Course";
        const courseCode = enrollment.course?.course_code;

        return (
          <motion.div
            key={enrollment.enrollment_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Status Header */}
              <div className={`${config.bgColor} ${config.borderColor} border-b px-5 py-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    <span className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    #{enrollment.enrollment_id.slice(0, 8)}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 space-y-4">
                {/* Course Name */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {courseName}
                  </h3>
                  {courseCode && (
                    <p className="text-sm text-gray-600">
                      Code: {courseCode}
                    </p>
                  )}
                </div>

                {/* Status Message */}
                <div className={`${config.bgColor} rounded-lg p-3 border ${config.borderColor}`}>
                  <p className={`text-sm ${config.color} font-medium`}>
                    {config.message}
                  </p>
                </div>

                {/* Group Info (if joined) */}
                {hasGroup && enrollment.group && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span className="text-sm font-semibold text-teal-900">
                        {enrollment.registration_status === "PENDING" 
                          ? "Group Assigned (Pending Approval)" 
                          : "Enrolled in Group"}
                      </span>
                    </div>
                    <p className="text-sm text-teal-700">
                      Level {enrollment.level || enrollment.group.level} - {enrollment.group.name}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Enrollment Date</p>
                      <p className="text-sm text-gray-900 font-semibold">{enrollmentDate}</p>
                    </div>
                  </div>

                  {enrollment.level && (
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Level</p>
                        <p className="text-sm text-gray-900 font-semibold">{enrollment.level}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                  {canJoin ? (
                    <Button
                      className="w-full gap-2 bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
                      onClick={() => navigate("/dashboard/courses")}
                    >
                      <Users className="w-4 h-4" />
                      <span>Join a Group</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : hasGroup ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => navigate(`/dashboard/group/${enrollment.group_id}`)}
                      >
                        <span>View My Group</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      {enrollment.registration_status === "PENDING" && (
                        <p className="text-xs text-amber-600 mt-2 text-center flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Waiting for admin approval
                        </p>
                      )}
                    </>
                  ) : enrollment.registration_status === "REJECTED" ? (
                    <div className="text-center">
                      <p className="text-xs text-red-600 font-medium">
                        Contact administration for more information
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}