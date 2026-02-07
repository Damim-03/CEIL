import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  useAdminGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAssignInstructor,
} from "../../../../hooks/admin/useAdmin";
import {
  ArrowLeft,
  Users,
  User,
  Calendar,
  Tag,
  Edit,
  Trash2,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Plus,
  Search,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import GroupFormModal from "../../components/GroupFormModal";
import AssignInstructorModal from "../../components/Assigninstructormodal";

const LEVEL_COLORS = {
  A1: "from-green-500 to-emerald-600",
  A2: "from-blue-500 to-cyan-600",
  B1: "from-purple-500 to-indigo-600",
  B2: "from-orange-500 to-amber-600",
  C1: "from-red-500 to-rose-600",
};

// Threshold percentage for instructor assignment
const CAPACITY_THRESHOLD_PERCENT = 80;

// Toast Component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => (
  <div className="fixed top-4 right-4 z-[100] animate-slide-in">
    <div
      className={`rounded-lg shadow-lg p-4 ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white flex items-center gap-3`}
    >
      {type === "success" ? (
        <CheckCircle2 size={20} />
      ) : (
        <AlertCircle size={20} />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <XCircle size={16} />
      </button>
    </div>
  </div>
);

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const {
    data: group,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminGroup(groupId);
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const assignInstructor = useAssignInstructor();

  const [editOpen, setEditOpen] = useState(false);
  const [assignInstructorOpen, setAssignInstructorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Show toast helper
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Safe data access helper
  const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
    try {
      const value = path.split(".").reduce((acc, part) => acc?.[part], obj);
      return value !== undefined && value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Debug logging
  useEffect(() => {
    if (group) {
      console.group("📋 Group Details Debug");
      console.log("Group Data:", group);
      console.log("Has students array?", Array.isArray(group.students));
      console.log("Students count:", group.students?.length || 0);
      console.log("Has teacher?", !!group.teacher);
      console.groupEnd();
    }
  }, [group]);

  // Loading state
  if (isLoading) {
    return <PageLoader />;
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h2 className="text-2xl font-semibold text-gray-900">
            Error Loading Data
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => refetch()} className="gap-2">
              <RefreshCw size={16} />
              Retry
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/groups")}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!group || !group.group_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Group Not Found
          </h2>
          <p className="text-gray-600">The group you're looking for doesn't exist</p>
          <Link to="/admin/groups">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate capacity metrics
  const currentCapacity = group.current_capacity ?? 0;
  const maxCapacity = group.max_students ?? 25;
  const capacityPercent =
    maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
  const canAssignInstructor = capacityPercent >= CAPACITY_THRESHOLD_PERCENT;
  const hasInstructor = !!group.teacher_id;

  // Filter students with safe checks
  const students = Array.isArray(group.students) ? group.students : [];
  const filteredStudents = students.filter((student) => {
    if (!student) return false;

    const searchLower = searchTerm.toLowerCase();
    const firstName = getNestedValue(student, "first_name", "").toLowerCase();
    const lastName = getNestedValue(student, "last_name", "").toLowerCase();
    const email = getNestedValue(student, "email", "").toLowerCase();
    const studentId = getNestedValue(student, "student_id", "").toLowerCase();

    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      email.includes(searchLower) ||
      studentId.includes(searchLower)
    );
  });

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteGroup.mutateAsync(group.group_id);
      showToast("Group deleted successfully", "success");
      navigate("/admin/groups");
    } catch (error) {
      showToast("Failed to delete group", "error");
      console.error("Delete error:", error);
    }
  };

  const handleUpdate = async (payload: any) => {
    try {
      await updateGroup.mutateAsync({
        groupId: group.group_id,
        payload,
      });
      showToast("Group updated successfully", "success");
      setEditOpen(false);
    } catch (error) {
      showToast("Failed to update group", "error");
      console.error("Update error:", error);
    }
  };

  const handleAssignInstructor = async (instructorId: string) => {
    try {
      await assignInstructor.mutateAsync({
        groupId: group.group_id,
        instructorId,
      });
      showToast("Teacher assigned successfully", "success");
      setAssignInstructorOpen(false);
    } catch (error) {
      showToast("Failed to assign teacher", "error");
      console.error("Assign error:", error);
    }
  };

  const handleRemoveInstructor = async () => {
    if (!window.confirm("Are you sure you want to remove the teacher?")) {
      return;
    }

    try {
      await assignInstructor.mutateAsync({
        groupId: group.group_id,
        instructorId: null,
      });
      showToast("Teacher removed successfully", "success");
    } catch (error) {
      showToast("Failed to remove teacher", "error");
      console.error("Remove error:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Link to={`/admin/courses/${group.course_id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Button>
        </Link>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            🔍 Debug Information
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>• Students count: {students.length}</p>
            <p>
              • Current capacity: {currentCapacity}/{maxCapacity}
            </p>
            <p>• Capacity percentage: {Math.round(capacityPercent)}%</p>
            <p>• Can assign teacher? {canAssignInstructor ? "Yes ✅" : "No ❌"}</p>
            <p>• Has teacher? {hasInstructor ? "Yes ✅" : "No ❌"}</p>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-lg bg-gradient-to-br ${
                  LEVEL_COLORS[group.level as keyof typeof LEVEL_COLORS] ||
                  LEVEL_COLORS.A1
                } flex items-center justify-center text-white shadow-lg`}
              >
                <Users className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {group.name || "Unnamed Group"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Group ID: {group.group_id.slice(0, 8)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-br ${
                      LEVEL_COLORS[group.level as keyof typeof LEVEL_COLORS] ||
                      LEVEL_COLORS.A1
                    } text-white shadow-md`}
                  >
                    Level {group.level || "N/A"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      group.status === "OPEN"
                        ? "bg-green-100 text-green-800"
                        : group.status === "CLOSED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {group.status === "OPEN"
                      ? "Open"
                      : group.status === "CLOSED"
                        ? "Closed"
                        : group.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Enrollment</p>
              <p className="text-3xl font-bold text-gray-900">
                {currentCapacity}/{maxCapacity}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(capacityPercent)}% full
              </p>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  capacityPercent >= 100
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : capacityPercent >= CAPACITY_THRESHOLD_PERCENT
                      ? "bg-gradient-to-r from-orange-500 to-amber-600"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Instructor Section */}
        <div className="border-b border-gray-200 px-6 py-5 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-600" />
                Assigned Teacher
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {canAssignInstructor
                  ? "Teacher assignment available"
                  : `Requires ${CAPACITY_THRESHOLD_PERCENT}% capacity to assign teacher`}
              </p>
            </div>

            {/* Instructor Assignment Status Icon */}
            {canAssignInstructor ? (
              <Unlock className="w-6 h-6 text-green-600" />
            ) : (
              <Lock className="w-6 h-6 text-amber-600" />
            )}
          </div>

          {/* Instructor Card */}
          <div className="mt-4">
            {hasInstructor && group.teacher ? (
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getNestedValue(group, "teacher.first_name", "")}{" "}
                        {getNestedValue(group, "teacher.last_name", "")}
                      </p>
                      {group.teacher.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {group.teacher.email}
                        </p>
                      )}
                      {group.teacher.phone_number && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {group.teacher.phone_number}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAssignInstructorOpen(true)}
                      className="gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      Change
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveInstructor}
                      className="gap-2"
                    >
                      <XCircle className="w-3 h-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  canAssignInstructor
                    ? "border-green-300 bg-green-50"
                    : "border-amber-300 bg-amber-50"
                }`}
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    canAssignInstructor ? "bg-green-100" : "bg-amber-100"
                  }`}
                >
                  {canAssignInstructor ? (
                    <UserCheck className="w-8 h-8 text-green-600" />
                  ) : (
                    <Lock className="w-8 h-8 text-amber-600" />
                  )}
                </div>
                <p
                  className={`font-medium mb-2 ${
                    canAssignInstructor ? "text-gray-900" : "text-amber-900"
                  }`}
                >
                  {canAssignInstructor
                    ? "No teacher assigned yet"
                    : "Teacher assignment locked"}
                </p>
                <p
                  className={`text-sm mb-4 ${
                    canAssignInstructor ? "text-gray-600" : "text-amber-700"
                  }`}
                >
                  {canAssignInstructor
                    ? "Group has reached required capacity. You can now assign a teacher."
                    : `Need ${Math.ceil((maxCapacity * CAPACITY_THRESHOLD_PERCENT) / 100 - currentCapacity)} more student(s) to unlock teacher assignment`}
                </p>
                <Button
                  size="sm"
                  onClick={() => setAssignInstructorOpen(true)}
                  disabled={!canAssignInstructor}
                  className={`gap-2 ${
                    canAssignInstructor
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      : ""
                  }`}
                >
                  {canAssignInstructor ? (
                    <>
                      <Plus className="w-4 h-4" />
                      Assign Teacher
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Locked
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Students Section */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Enrolled Students
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {currentCapacity} of {maxCapacity} students enrolled
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.student_id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.student_id?.slice(0, 8) || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getNestedValue(student, "first_name", "")}{" "}
                            {getNestedValue(student, "last_name", "")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.phone_number || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {student.created_at
                          ? new Date(student.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                        >
                          <Link to={`/admin/students/${student.student_id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                {searchTerm
                  ? "No matching students found"
                  : "No students enrolled yet"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchTerm
                  ? "Try a different search term"
                  : "Students will appear here after enrollment"}
              </p>
            </div>
          )}
        </div>

        {/* Group Information Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Group Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Group Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Group Name
                </p>
                <p className="text-base text-gray-900 mt-1">
                  {group.name || "Not specified"}
                </p>
              </div>
            </div>

            {/* Level */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Level</p>
                <p className="text-base text-gray-900 mt-1">
                  {group.level || "Not specified"}
                </p>
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Course</p>
                <p className="text-base text-gray-900 mt-1">
                  {getNestedValue(group, "course.course_name", "Not specified")}
                </p>
              </div>
            </div>

            {/* Max Capacity */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Maximum Capacity
                </p>
                <p className="text-base text-gray-900 mt-1">{maxCapacity}</p>
              </div>
            </div>

            {/* Created Date */}
            {group.created_at && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Created Date
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(group.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-base text-gray-900 mt-1">
                  {group.status === "OPEN"
                    ? "Open"
                    : group.status === "CLOSED"
                      ? "Closed"
                      : group.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Manage group information and enrollment
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Group
              </Button>

              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete Group
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Group Modal */}
      <GroupFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={updateGroup.isPending}
        initialData={{
          name: group.name,
          level: group.level,
          course_id: group.course_id,
          max_students: maxCapacity,
          teacher_id: group.teacher_id,
        }}
        mode="edit"
      />

      {/* Assign Instructor Modal */}
      <AssignInstructorModal
        open={assignInstructorOpen}
        onClose={() => setAssignInstructorOpen(false)}
        onSubmit={handleAssignInstructor}
        isSubmitting={assignInstructor.isPending}
        currentInstructorId={group.teacher_id}
      />
    </div>
  );
};

export default GroupDetailsPage;