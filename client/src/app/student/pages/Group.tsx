import { motion } from "framer-motion";
import {
  Users,
  ArrowLeft,
  AlertCircle,
  Calendar,
  GraduationCap,
  User,
  School,
  Clock,
  type LucideIcon,
  BookOpen,
  Award,
  MapPin,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useStudentEnrollments } from "../../../hooks/student/Usestudent"; // ✅ FIXED: lowercase 's'
import PageLoader from "../../../components/PageLoader";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Separator } from "../../../components/ui/separator";

// Type definitions matching ACTUAL backend response
type RegistrationStatus =
  | "PENDING"
  | "VALIDATED"
  | "PAID"
  | "REJECTED"
  | "FINISHED";
type GroupStatus = "OPEN" | "CLOSED" | "FULL" | "FINISHED";

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
    description?: string;
  };
  group?: {
    group_id: string;
    name: string;
    course_id: string;
    level: string;
    department_id?: string | null;
    teacher_id?: string | null;
    max_students: number;
    status: GroupStatus;
    teacher?: {
      teacher_id: string;
      first_name: string;
      last_name: string;
      email?: string;
    } | null;
    department?: {
      department_id: string;
      name: string;
      description?: string;
    } | null;
    _count?: {
      students: number;
    };
  } | null;
}

export default function GroupDetails() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();

  const {
    data: enrollments = [],
    isLoading,
    isError,
    error,
  } = useStudentEnrollments();

  // Loading state
  if (isLoading) {
    return <PageLoader />;
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-200 bg-red-50/50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Error Loading Group
              </h2>
              <p className="text-gray-600 mt-2">
                {error instanceof Error
                  ? error.message
                  : "Failed to load group details"}
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/enrollments")}
              className="w-full"
            >
              Back to Enrollments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Find enrollment matching the URL group ID
  const enrollment = enrollments.find((e: Enrollment) => {
    return e.group_id === groupId || e.group?.group_id === groupId;
  });

  // Group not found state
  if (!enrollment || !enrollment.group) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Group Not Found
              </h2>
              <p className="text-gray-600 mt-2">
                {groupId
                  ? `We couldn't find a group with ID: ${groupId.slice(0, 8)}...`
                  : "No group ID provided"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
              <Button
                onClick={() => navigate("/dashboard/enrollments")}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                View All Enrollments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract group and course data
  const group = enrollment.group;
  const course = enrollment.course;

  // Format dates safely
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not scheduled";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  // Get group status config
  const groupStatusConfig: Record<
    GroupStatus,
    {
      label: string;
      color: string;
      bgColor: string;
      borderColor: string;
      icon: LucideIcon;
      description: string;
    }
  > = {
    OPEN: {
      label: "Active & Open",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: CheckCircle2,
      description: "Currently accepting new enrollments",
    },
    FULL: {
      label: "Full Capacity",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: Users,
      description: "Maximum capacity reached",
    },
    FINISHED: {
      label: "Course Completed",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: Award,
      description: "This course has concluded",
    },
    CLOSED: {
      label: "Closed",
      color: "text-gray-700",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: XCircle,
      description: "Not currently accepting enrollments",
    },
  };

  const statusConfig =
    groupStatusConfig[group.status as GroupStatus] || groupStatusConfig.CLOSED;
  const StatusIcon = statusConfig.icon;

  const studentCount = group._count?.students ?? 0;
  const maxStudents = group.max_students;
  const capacityPercentage = Math.min((studentCount / maxStudents) * 100, 100);
  const isFull = studentCount >= maxStudents;

  // Registration status display
  const registrationStatusConfig: Record<
    RegistrationStatus,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      color: string;
      bgColor: string;
      icon: LucideIcon;
      description: string;
    }
  > = {
    PENDING: {
      label: "Pending Approval",
      variant: "outline",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: Clock,
      description: "Your enrollment is awaiting administrative review",
    },
    VALIDATED: {
      label: "Validated",
      variant: "default",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      icon: CheckCircle2,
      description: "Your enrollment has been approved",
    },
    PAID: {
      label: "Paid & Active",
      variant: "default",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: CreditCard,
      description: "Payment confirmed, access granted",
    },
    REJECTED: {
      label: "Rejected",
      variant: "destructive",
      color: "text-red-700",
      bgColor: "bg-red-50",
      icon: XCircle,
      description: "Enrollment request was declined",
    },
    FINISHED: {
      label: "Completed",
      variant: "secondary",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: Award,
      description: "Course successfully completed",
    },
  };

  const regStatus =
    registrationStatusConfig[
      enrollment.registration_status as RegistrationStatus
    ];
  const RegIcon = regStatus.icon;

  return (
    <motion.div
      className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header Section */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/enrollments")}
          className="gap-2 text-gray-600 hover:text-gray-900 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Enrollments
        </Button>

        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          <motion.div
            className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xl shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Users className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {group.name}
              </h1>
              <Badge
                variant={regStatus.variant}
                className={`${regStatus.bgColor} ${regStatus.color} border-0 w-fit`}
              >
                <RegIcon className="w-3 h-3 mr-1" />
                {regStatus.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {course?.course_name}
                </span>
                {course?.course_code && (
                  <span className="text-gray-400">({course.course_code})</span>
                )}
              </div>
              <Separator
                orientation="vertical"
                className="h-4 hidden sm:block"
              />
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-gray-400" />
                <span>Level {group.level}</span>
              </div>
              {course?.credits && (
                <>
                  <Separator
                    orientation="vertical"
                    className="h-4 hidden sm:block"
                  />
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span>{course.credits} Credits</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Alert Card */}
          <Card
            className={`border-l-4 ${statusConfig.borderColor} ${statusConfig.bgColor} shadow-sm`}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${statusConfig.bgColor} ${statusConfig.color}`}
                >
                  <StatusIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {statusConfig.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Approval Notice */}
          {enrollment.registration_status === "PENDING" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900">
                    Awaiting Admin Approval
                  </h4>
                  <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    Your enrollment is pending review by the administration.
                    You've been assigned to this group, but access to course
                    materials will be granted once your enrollment is approved.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Course Information Card */}
          {course && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {course.course_name}
                  </h3>
                  {course.course_code && (
                    <p className="text-sm font-medium text-blue-600">
                      {course.course_code} • {course.credits || 0} Credits
                    </p>
                  )}
                </div>
                {course.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {course.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Group Details Grid */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Group Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={User}
                  label="Instructor"
                  value={
                    group.teacher
                      ? `${group.teacher.first_name} ${group.teacher.last_name}`
                      : "Not Assigned"
                  }
                  subValue={group.teacher?.email}
                />
                <InfoItem
                  icon={Calendar}
                  label="Enrollment Date"
                  value={formatDate(enrollment.enrollment_date)}
                />
                <InfoItem
                  icon={Award}
                  label="Proficiency Level"
                  value={`Level ${group.level}`}
                />
                <InfoItem
                  icon={MapPin}
                  label="Location"
                  value={group.department?.name || "Main Campus"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Department Info */}
          {group.department && (
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-900">
                  <School className="w-5 h-5 text-purple-600" />
                  Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {group.department.name}
                </h4>
                {group.department.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {group.department.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Enrollment Status Card */}
          <Card className="shadow-sm border-t-4 border-t-teal-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Enrollment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Capacity</span>
                <span className="text-sm font-bold text-gray-900">
                  {studentCount} / {maxStudents}
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isFull
                        ? "bg-red-500"
                        : capacityPercentage >= 80
                          ? "bg-amber-500"
                          : "bg-teal-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${capacityPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {isFull ? (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Group is full
                    </span>
                  ) : capacityPercentage >= 80 ? (
                    <span className="text-amber-600 font-medium">
                      Only {maxStudents - studentCount} spots left
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">
                      {maxStudents - studentCount} spots available
                    </span>
                  )}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Your Status</span>
                  <span className={`font-medium ${regStatus.color}`}>
                    {regStatus.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Enrollment ID</span>
                  <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {enrollment.enrollment_id.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Enrolled On</span>
                  <span className="text-gray-900">
                    {formatDate(enrollment.enrollment_date)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card - ✅ FIXED */}
          <Card className="shadow-sm bg-gray-50/50">
            <CardContent className="p-4 space-y-3">
              {/* ✅ UPDATED: Removed non-existent sessions route */}
              <Button
                className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-md"
                onClick={() => navigate("/dashboard/attendance")}
                disabled={enrollment.registration_status === "PENDING"}
              >
                {enrollment.registration_status === "PENDING" ? (
                  <>
                    <Clock className="w-4 h-4" />
                    Awaiting Approval
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    View My Attendance
                  </>
                )}
              </Button>

              {/* ✅ ADDED: View Fees button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/dashboard/fees")}
                disabled={enrollment.registration_status === "PENDING"}
              >
                <CreditCard className="w-4 h-4" />
                View My Fees
              </Button>

              {/* ✅ ADDED: View Results button */}
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/dashboard/results")}
                disabled={enrollment.registration_status === "PENDING"}
              >
                <Award className="w-4 h-4" />
                View My Results
              </Button>

              <Separator />

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => navigate("/dashboard/enrollments")}
              >
                <Users className="w-4 h-4" />
                All Enrollments
              </Button>
            </CardContent>
          </Card>

          {/* Registration Status Info */}
          <div
            className={`rounded-lg p-4 ${regStatus.bgColor} border border-opacity-20 ${regStatus.color.replace("text-", "border-")}`}
          >
            <div className="flex items-start gap-2">
              <RegIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className={`text-sm font-medium ${regStatus.color}`}>
                  {regStatus.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

interface InfoItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
}

function InfoItem({ icon: Icon, label, value, subValue }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-4 h-4 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-1 break-words">{subValue}</p>
        )}
      </div>
    </div>
  );
}
