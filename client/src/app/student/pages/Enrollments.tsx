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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useStudentEnrollments } from "../../../hooks/student/student.hooks";
import type { Enrollment } from "../../../types/enrollment";

// Status Configuration
const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Under Review",
    message: "Your enrollment request is currently under review.",
  },
  approved: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    label: "Approved",
    message: "Your enrollment has been approved. Welcome aboard!",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Rejected",
    message: "Your enrollment request was not approved.",
  },
};

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
      <div className="min-h-100 flex items-center justify-center">
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
              {error instanceof Error ? error.message : "Something went wrong"}
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
      <div className="min-h-[600px] flex items-center justify-center">
        <motion.div
          className="text-center space-y-6 max-w-lg px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Illustration */}
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

            {/* Floating Sparkles */}
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

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              No Enrollments Yet
            </h2>
            <p className="text-gray-600 text-lg">
              You haven't enrolled in any program yet. Start your learning
              journey today!
            </p>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
            onClick={() => navigate("/student/enroll")}
          >
            <span>Explore Programs</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Additional Info */}
          <p className="text-sm text-gray-500 mt-4">
            Browse our available programs and submit your enrollment request
          </p>
        </motion.div>
      </div>
    );
  }

  // Enrollments List
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
              Track your enrollment requests and status
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-sm text-emerald-700 font-medium">Approved</p>
              <p className="text-2xl font-bold text-emerald-900">
                {enrollments.filter((e: Enrollment) => e.status === "approved").length}
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
                {enrollments.filter((e: Enrollment) => e.status === "pending").length}
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
                {enrollments.filter((e: Enrollment) => e.status === "rejected").length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enrollments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrollments.map((enrollment: Enrollment, index: number) => {
          const config = statusConfig[enrollment.status];
          const StatusIcon = config.icon;

          return (
            <motion.div
              key={enrollment.enrollment_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
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
                    <span className="text-xs text-gray-500">
                      #{enrollment.enrollment_id}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4">
                  {/* Program Name */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {enrollment.program_name}
                    </h3>
                    {enrollment.course_name && (
                      <p className="text-sm text-gray-600">
                        {enrollment.course_name}
                      </p>
                    )}
                  </div>

                  {/* Status Message */}
                  <div
                    className={`${config.bgColor} rounded-lg p-3 border ${config.borderColor}`}
                  >
                    <p className={`text-sm ${config.color} font-medium`}>
                      {config.message}
                    </p>
                    {enrollment.status === "rejected" &&
                      enrollment.rejection_reason && (
                        <p className="text-sm text-red-700 mt-2 font-medium">
                          Reason: {enrollment.rejection_reason}
                        </p>
                      )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Enrollment Date
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {new Date(
                            enrollment.enrollment_date,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Academic Year
                        </p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {enrollment.academic_year}
                          {enrollment.session && ` - ${enrollment.session}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action for Approved */}
                  {enrollment.status === "approved" && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => navigate("/student/courses")}
                      >
                        <span>Access Resources</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
