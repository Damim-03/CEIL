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

type RegistrationStatus =
  | "PENDING"
  | "VALIDATED"
  | "PAID"
  | "REJECTED"
  | "FINISHED";

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

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: "text-[#C4A035]",
    bgColor: "bg-[#C4A035]/5",
    borderColor: "border-[#C4A035]/20",
    label: "Pending Review",
    message: "Your enrollment request is pending admin approval.",
  },
  VALIDATED: {
    icon: CheckCircle,
    color: "text-[#2B6F5E]",
    bgColor: "bg-[#8DB896]/8",
    borderColor: "border-[#8DB896]/25",
    label: "Validated",
    message: "Your enrollment has been validated. You can now join a group!",
  },
  PAID: {
    icon: CheckCircle,
    color: "text-[#2B6F5E]",
    bgColor: "bg-[#2B6F5E]/5",
    borderColor: "border-[#2B6F5E]/20",
    label: "Paid & Active",
    message: "Payment confirmed. Ready to start learning!",
  },
  REJECTED: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Rejected",
    message:
      "Your enrollment request was not approved. Contact admin for details.",
  },
  FINISHED: {
    icon: GraduationCap,
    color: "text-[#6B5D4F]",
    bgColor: "bg-[#D8CDC0]/10",
    borderColor: "border-[#D8CDC0]/40",
    label: "Completed",
    message: "Congratulations! You've completed this course.",
  },
} as const;

const getStatusConfig = (status: RegistrationStatus) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
const canJoinGroup = (e: Enrollment) =>
  (e.registration_status === "VALIDATED" || e.registration_status === "PAID") &&
  !e.group_id;
const getEnrollmentCount = (
  enrollments: Enrollment[],
  statuses: RegistrationStatus[],
) => enrollments.filter((e) => statuses.includes(e.registration_status)).length;

export default function Enrollments() {
  const navigate = useNavigate();
  const {
    data: enrollments = [],
    isLoading,
    isError,
    error,
  } = useStudentEnrollments();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-[#6B5D4F] font-medium">
            Loading your enrollments...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-[#1B1B1B] mb-2">
            Unable to Load Enrollments
          </h3>
          <p className="text-[#6B5D4F]">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#2B6F5E]/10 to-[#C4A035]/10 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <GraduationCap className="w-16 h-16 text-[#2B6F5E]" />
            </motion.div>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: `${20 + i * 30}%`, left: `${15 + i * 35}%` }}
                animate={{ y: [-10, 10, -10], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                <Sparkles className="w-4 h-4 text-[#C4A035]" />
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#1B1B1B]">
              No Enrollments Yet
            </h2>
            <p className="text-[#6B5D4F] text-lg">
              You haven't enrolled in any program yet. Start your learning
              journey today!
            </p>
          </div>
          <Button
            size="lg"
            className="gap-2 shadow-lg bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl"
            onClick={() => navigate("/dashboard/courses")}
          >
            Browse Courses <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-[#BEB29E] mt-4">
            Browse our available courses and submit your enrollment request
          </p>
        </motion.div>
      </div>
    );
  }

  const readyForGroup = enrollments.filter((e) => canJoinGroup(e));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                My Enrollments
              </h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                Track your enrollment status and group assignments
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Banner */}
      {readyForGroup.length > 0 && (
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E]/90 to-[#1a4a3d]"></div>
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#C4A035]/15 rounded-full blur-3xl"></div>
          <div className="relative p-6 text-white">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Ready to Join a Group!
                  </h3>
                  <p className="text-white/60 mb-1">
                    You have {readyForGroup.length} enrollment(s) ready for
                    group selection.
                  </p>
                  <p className="text-white/40 text-sm">
                    Choose your level and join a group to start learning!
                  </p>
                </div>
              </div>
              <Button
                size="lg"
                className="gap-2 shrink-0 bg-white text-[#2B6F5E] hover:bg-white/90 rounded-xl font-semibold"
                onClick={() => navigate("/dashboard/courses")}
              >
                Choose Group <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {[
          {
            label: "Active",
            icon: CheckCircle,
            value: getEnrollmentCount(enrollments, ["VALIDATED", "PAID"]),
            color: "#2B6F5E",
            bg: "bg-[#8DB896]/8",
            border: "border-[#8DB896]/25",
          },
          {
            label: "Pending",
            icon: Clock,
            value: getEnrollmentCount(enrollments, ["PENDING"]),
            color: "#C4A035",
            bg: "bg-[#C4A035]/5",
            border: "border-[#C4A035]/20",
          },
          {
            label: "Paid",
            icon: FileText,
            value: getEnrollmentCount(enrollments, ["PAID"]),
            color: "#2B6F5E",
            bg: "bg-[#2B6F5E]/5",
            border: "border-[#2B6F5E]/20",
          },
          {
            label: "Rejected",
            icon: XCircle,
            value: getEnrollmentCount(enrollments, ["REJECTED"]),
            color: "#dc2626",
            bg: "bg-red-50",
            border: "border-red-200",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-2xl p-4 border ${stat.border}`}
          >
            <div className="flex items-center gap-3">
              <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: stat.color }}
                >
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-[#1B1B1B]">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Enrollments Grid */}
      <EnrollmentsList enrollments={enrollments} />
    </div>
  );
}

/* ==================== ENROLLMENTS LIST ==================== */

function EnrollmentsList({ enrollments }: { enrollments: Enrollment[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {enrollments.map((enrollment, index) => {
        const config = getStatusConfig(enrollment.registration_status);
        const StatusIcon = config.icon;
        const canJoin = canJoinGroup(enrollment);
        const hasGroup = !!enrollment.group_id;
        const enrollmentDate = enrollment.enrollment_date
          ? new Date(enrollment.enrollment_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A";
        const courseName = enrollment.course?.course_name || "Unnamed Course";
        const courseCode = enrollment.course?.course_code;

        return (
          <motion.div
            key={enrollment.enrollment_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
          >
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden hover:shadow-lg hover:shadow-black/[0.03] transition-shadow">
              {/* Status Header */}
              <div
                className={`${config.bgColor} ${config.borderColor} border-b px-5 py-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    <span className={`text-sm font-semibold ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-xs text-[#BEB29E]">
                    #{enrollment.enrollment_id.slice(0, 8)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1B1B1B] mb-1">
                    {courseName}
                  </h3>
                  {courseCode && (
                    <p className="text-sm text-[#6B5D4F]">Code: {courseCode}</p>
                  )}
                </div>

                <div
                  className={`${config.bgColor} rounded-xl p-3 border ${config.borderColor}`}
                >
                  <p className={`text-sm ${config.color} font-medium`}>
                    {config.message}
                  </p>
                </div>

                {hasGroup && enrollment.group && (
                  <div className="bg-[#2B6F5E]/5 border border-[#2B6F5E]/15 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-[#2B6F5E]" />
                      <span className="text-sm font-semibold text-[#1B1B1B]">
                        {enrollment.registration_status === "PENDING"
                          ? "Group Assigned (Pending Approval)"
                          : "Enrolled in Group"}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B5D4F]">
                      Level {enrollment.level || enrollment.group.level} -{" "}
                      {enrollment.group.name}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[#BEB29E] mt-0.5" />
                    <div>
                      <p className="text-xs text-[#BEB29E] font-medium">
                        Enrollment Date
                      </p>
                      <p className="text-sm text-[#1B1B1B] font-semibold">
                        {enrollmentDate}
                      </p>
                    </div>
                  </div>
                  {enrollment.level && (
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-[#BEB29E] mt-0.5" />
                      <div>
                        <p className="text-xs text-[#BEB29E] font-medium">
                          Level
                        </p>
                        <p className="text-sm text-[#1B1B1B] font-semibold">
                          {enrollment.level}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  {canJoin ? (
                    <Button
                      className="w-full gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-xl shadow-md shadow-[#2B6F5E]/20"
                      onClick={() => navigate("/dashboard/courses")}
                    >
                      <Users className="w-4 h-4" /> Join a Group{" "}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : hasGroup ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#2B6F5E]/5 hover:border-[#2B6F5E]/30 rounded-xl"
                        onClick={() =>
                          navigate(`/dashboard/group/${enrollment.group_id}`)
                        }
                      >
                        View My Group <ArrowRight className="w-4 h-4" />
                      </Button>
                      {enrollment.registration_status === "PENDING" && (
                        <p className="text-xs text-[#C4A035] mt-2 text-center flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> Waiting for admin
                          approval
                        </p>
                      )}
                    </>
                  ) : enrollment.registration_status === "REJECTED" ? (
                    <p className="text-xs text-red-600 font-medium text-center">
                      Contact administration for more information
                    </p>
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
