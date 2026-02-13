import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  A1: "from-[#8DB896] to-[#2B6F5E]",
  A2: "from-[#2B6F5E] to-[#2B6F5E]/80",
  B1: "from-[#C4A035] to-[#C4A035]/80",
  B2: "from-[#BEB29E] to-[#6B5D4F]",
  C1: "from-[#1B1B1B] to-[#1B1B1B]/80",
};
const CAPACITY_THRESHOLD_PERCENT = 80;

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
      className={`rounded-xl shadow-lg p-4 ${type === "success" ? "bg-[#2B6F5E]" : "bg-red-500"} text-white flex items-center gap-3`}
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
  const { t, i18n } = useTranslation();
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

  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";

  const [editOpen, setEditOpen] = useState(false);
  const [assignInstructorOpen, setAssignInstructorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
    try {
      const value = path.split(".").reduce((acc, part) => acc?.[part], obj);
      return value !== undefined && value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  useEffect(() => {
    if (group && process.env.NODE_ENV === "development") {
      console.group("📋 Group Details Debug");
      console.log("Group Data:", group);
      console.groupEnd();
    }
  }, [group]);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md space-y-4 p-8 bg-white rounded-2xl border border-[#D8CDC0]/60">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h2 className="text-2xl font-semibold text-[#1B1B1B]">
            {t("admin.groupDetails.errorLoading")}
          </h2>
          <p className="text-[#6B5D4F]">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => refetch()}
              className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
            >
              <RefreshCw size={16} />
              {t("admin.groupDetails.retry")}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/groups")}
              className="border-[#D8CDC0]/60"
            >
              <ArrowLeft size={16} className="mr-2" />
              {t("admin.groupDetails.backToGroups")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!group || !group.group_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-[#D8CDC0]/60">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#D8CDC0]/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-[#BEB29E]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1B1B1B]">
            {t("admin.groupDetails.groupNotFound")}
          </h2>
          <p className="text-[#6B5D4F]">
            {t("admin.groupDetails.groupNotFoundDesc")}
          </p>
          <Link to="/admin/groups">
            <Button
              variant="outline"
              className="border-[#D8CDC0]/60 hover:bg-[#D8CDC0]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("admin.groupDetails.backToGroups")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCapacity = group.current_capacity ?? 0;
  const maxCapacity = group.max_students ?? 25;
  const capacityPercent =
    maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
  const canAssignInstructor = capacityPercent >= CAPACITY_THRESHOLD_PERCENT;
  const hasInstructor = !!group.teacher_id;

  const students = Array.isArray(group.students) ? group.students : [];
  const filteredStudents = students.filter((student) => {
    if (!student) return false;
    const sl = searchTerm.toLowerCase();
    return (
      getNestedValue(student, "first_name", "").toLowerCase().includes(sl) ||
      getNestedValue(student, "last_name", "").toLowerCase().includes(sl) ||
      getNestedValue(student, "email", "").toLowerCase().includes(sl) ||
      getNestedValue(student, "student_id", "").toLowerCase().includes(sl)
    );
  });

  const handleDelete = async () => {
    if (
      !window.confirm(
        t("admin.groupDetails.deleteConfirm", { name: group.name }),
      )
    )
      return;
    try {
      await deleteGroup.mutateAsync(group.group_id);
      showToast(t("admin.groupDetails.groupDeleted"), "success");
      navigate("/admin/groups");
    } catch {
      showToast(t("admin.groupDetails.deleteFailed"), "error");
    }
  };
  const handleUpdate = async (payload: any) => {
    try {
      await updateGroup.mutateAsync({ groupId: group.group_id, payload });
      showToast(t("admin.groupDetails.groupUpdated"), "success");
      setEditOpen(false);
    } catch {
      showToast(t("admin.groupDetails.updateFailed"), "error");
    }
  };
  const handleAssignInstructor = async (instructorId: string) => {
    try {
      await assignInstructor.mutateAsync({
        groupId: group.group_id,
        instructorId,
      });
      showToast(t("admin.groupDetails.teacherAssigned"), "success");
      setAssignInstructorOpen(false);
    } catch {
      showToast(t("admin.groupDetails.assignFailed"), "error");
    }
  };
  const handleRemoveInstructor = async () => {
    if (!window.confirm(t("admin.groupDetails.removeTeacherConfirm"))) return;
    try {
      await assignInstructor.mutateAsync({
        groupId: group.group_id,
        instructorId: null,
      });
      showToast(t("admin.groupDetails.teacherRemoved"), "success");
    } catch {
      showToast(t("admin.groupDetails.removeFailed"), "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <Link to={`/admin/courses/${group.course_id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#6B5D4F] hover:bg-[#D8CDC0]/15 hover:text-[#1B1B1B]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.groupDetails.backToCourse")}
          </Button>
        </Link>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2 border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#D8CDC0]/10"
        >
          <RefreshCw className="w-4 h-4" />
          {t("admin.groupDetails.refresh")}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2B6F5E]/5 to-[#C4A035]/5 px-6 py-8 border-b border-[#D8CDC0]/40">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[group.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.A1} flex items-center justify-center text-white shadow-xl`}
              >
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1B1B1B]">
                  {group.name || "Unnamed Group"}
                </h1>
                <p className="text-sm text-[#6B5D4F] mt-1">
                  {t("admin.groupDetails.groupId", {
                    id: group.group_id.slice(0, 8),
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-br ${LEVEL_COLORS[group.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.A1} text-white shadow-md`}
                  >
                    {t("admin.groupDetails.level")} {group.level || "N/A"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${group.status === "OPEN" ? "bg-[#8DB896]/15 text-[#2B6F5E] border border-[#8DB896]/30" : group.status === "CLOSED" ? "bg-red-50 text-red-700 border border-red-200" : "bg-[#D8CDC0]/30 text-[#6B5D4F] border border-[#D8CDC0]/50"}`}
                  >
                    {group.status === "OPEN"
                      ? t("admin.groupDetails.open")
                      : group.status === "CLOSED"
                        ? t("admin.groupDetails.closed")
                        : group.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B5D4F]">
                {t("admin.groupDetails.enrollment")}
              </p>
              <p className="text-3xl font-bold text-[#1B1B1B]">
                {currentCapacity}/{maxCapacity}
              </p>
              <p className="text-xs text-[#BEB29E] mt-1">
                {t("admin.groupDetails.full", {
                  percent: Math.round(capacityPercent),
                })}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-[#D8CDC0]/30 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${capacityPercent >= 100 ? "bg-gradient-to-r from-red-500 to-red-600" : capacityPercent >= CAPACITY_THRESHOLD_PERCENT ? "bg-gradient-to-r from-[#C4A035] to-[#C4A035]/80" : "bg-gradient-to-r from-[#2B6F5E] to-[#8DB896]"}`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Teacher */}
        <div className="border-b border-[#D8CDC0]/40 px-6 py-5 bg-gradient-to-r from-[#2B6F5E]/3 to-[#8DB896]/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2B6F5E]" />
                {t("admin.groupDetails.assignedTeacher")}
              </h2>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {canAssignInstructor
                  ? t("admin.groupDetails.teacherAvailable")
                  : t("admin.groupDetails.teacherRequires", {
                      percent: CAPACITY_THRESHOLD_PERCENT,
                    })}
              </p>
            </div>
            {canAssignInstructor ? (
              <Unlock className="w-6 h-6 text-[#2B6F5E]" />
            ) : (
              <Lock className="w-6 h-6 text-[#C4A035]" />
            )}
          </div>
          <div className="mt-4">
            {hasInstructor && group.teacher ? (
              <div className="bg-white border border-[#8DB896]/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2B6F5E]/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2B6F5E]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1B1B1B]">
                        {getNestedValue(group, "teacher.first_name", "")}{" "}
                        {getNestedValue(group, "teacher.last_name", "")}
                      </p>
                      {group.teacher.email && (
                        <p className="text-sm text-[#6B5D4F] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#BEB29E]" />
                          {group.teacher.email}
                        </p>
                      )}
                      {group.teacher.phone_number && (
                        <p className="text-sm text-[#6B5D4F] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#BEB29E]" />
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
                      className="gap-2 border-[#D8CDC0]/60 hover:bg-[#C4A035]/8 hover:border-[#C4A035]/40"
                    >
                      <Edit className="w-3 h-3" />
                      {t("admin.groupDetails.change")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveInstructor}
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-3 h-3" />
                      {t("admin.groupDetails.remove")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center ${canAssignInstructor ? "border-[#8DB896]/40 bg-[#8DB896]/5" : "border-[#C4A035]/30 bg-[#C4A035]/5"}`}
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${canAssignInstructor ? "bg-[#2B6F5E]/10" : "bg-[#C4A035]/10"}`}
                >
                  {canAssignInstructor ? (
                    <UserCheck className="w-8 h-8 text-[#2B6F5E]" />
                  ) : (
                    <Lock className="w-8 h-8 text-[#C4A035]" />
                  )}
                </div>
                <p
                  className={`font-medium mb-2 ${canAssignInstructor ? "text-[#1B1B1B]" : "text-[#C4A035]"}`}
                >
                  {canAssignInstructor
                    ? t("admin.groupDetails.noTeacherYet")
                    : t("admin.groupDetails.teacherLocked")}
                </p>
                <p
                  className={`text-sm mb-4 ${canAssignInstructor ? "text-[#6B5D4F]" : "text-[#C4A035]/80"}`}
                >
                  {canAssignInstructor
                    ? t("admin.groupDetails.groupReachedCapacity")
                    : t("admin.groupDetails.needMoreStudents", {
                        count: Math.ceil(
                          (maxCapacity * CAPACITY_THRESHOLD_PERCENT) / 100 -
                            currentCapacity,
                        ),
                      })}
                </p>
                <Button
                  size="sm"
                  onClick={() => setAssignInstructorOpen(true)}
                  disabled={!canAssignInstructor}
                  className={`gap-2 ${canAssignInstructor ? "bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white" : ""}`}
                >
                  {canAssignInstructor ? (
                    <>
                      <Plus className="w-4 h-4" />{" "}
                      {t("admin.groupDetails.assignTeacher")}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />{" "}
                      {t("admin.groupDetails.locked")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Students */}
        <div className="border-b border-[#D8CDC0]/40 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C4A035]" />
                {t("admin.groupDetails.enrolledStudents")}
              </h2>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.groupDetails.enrolledCount", {
                  current: currentCapacity,
                  max: maxCapacity,
                })}
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
              <input
                type="text"
                placeholder={t("admin.groupDetails.searchStudents")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#D8CDC0]/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E]"
              />
            </div>
          </div>
          {filteredStudents.length > 0 ? (
            <div className="border border-[#D8CDC0]/40 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#D8CDC0]/10 border-b border-[#D8CDC0]/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      {t("admin.groupDetails.studentId")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      {t("admin.groupDetails.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      {t("admin.groupDetails.email")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      {t("admin.groupDetails.phone")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      {t("admin.groupDetails.enrollmentDate")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] uppercase tracking-wider">
                      {t("admin.groupDetails.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8CDC0]/30 bg-white">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.student_id || index}
                      className="hover:bg-[#D8CDC0]/8 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-[#BEB29E]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1B1B1B]">
                        {student.student_id?.slice(0, 8) || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#C4A035]/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-[#C4A035]" />
                          </div>
                          <span className="text-sm font-medium text-[#1B1B1B]">
                            {getNestedValue(student, "first_name", "")}{" "}
                            {getNestedValue(student, "last_name", "")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B5D4F]">
                        {student.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B5D4F]">
                        {student.phone_number || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B5D4F]">
                        {student.created_at
                          ? new Date(student.created_at).toLocaleDateString(
                              locale,
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-[#2B6F5E] hover:bg-[#2B6F5E]/8"
                        >
                          <Link to={`/admin/students/${student.student_id}`}>
                            {t("admin.groupDetails.view")}
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#D8CDC0]/40 rounded-xl p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-[#D8CDC0] mb-3" />
              <p className="text-[#6B5D4F] font-medium">
                {searchTerm
                  ? t("admin.groupDetails.noStudentsSearch")
                  : t("admin.groupDetails.noStudents")}
              </p>
              <p className="text-sm text-[#BEB29E] mt-1">
                {searchTerm
                  ? t("admin.groupDetails.noStudentsSearchHint")
                  : t("admin.groupDetails.noStudentsHint")}
              </p>
            </div>
          )}
        </div>

        {/* Group Info */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#1B1B1B] mb-4">
            {t("admin.groupDetails.groupInfo")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={Tag}
              color="teal"
              label={t("admin.groupDetails.groupName")}
              value={group.name || t("admin.groupDetails.notSpecified")}
            />
            <InfoItem
              icon={GraduationCap}
              color="mustard"
              label={t("admin.groupDetails.level")}
              value={group.level || t("admin.groupDetails.notSpecified")}
            />
            <InfoItem
              icon={GraduationCap}
              color="teal"
              label={t("admin.groupDetails.course")}
              value={getNestedValue(
                group,
                "course.course_name",
                t("admin.groupDetails.notSpecified"),
              )}
            />
            <InfoItem
              icon={Users}
              color="mustard"
              label={t("admin.groupDetails.maxCapacity")}
              value={String(maxCapacity)}
            />
            {group.created_at && (
              <InfoItem
                icon={Calendar}
                color="teal"
                label={t("admin.groupDetails.createdDate")}
                value={new Date(group.created_at).toLocaleDateString(locale)}
              />
            )}
            <InfoItem
              icon={CheckCircle2}
              color="mustard"
              label={t("admin.groupDetails.status")}
              value={
                group.status === "OPEN"
                  ? t("admin.groupDetails.open")
                  : group.status === "CLOSED"
                    ? t("admin.groupDetails.closed")
                    : group.status
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#D8CDC0]/10 px-6 py-4 border-t border-[#D8CDC0]/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-[#6B5D4F]">
              {t("admin.groupDetails.manageDesc")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 border-[#D8CDC0]/60 text-[#1B1B1B] hover:bg-[#C4A035]/8 hover:border-[#C4A035]/40 hover:text-[#C4A035]"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="w-4 h-4" />
                {t("admin.groupDetails.editGroup")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                {t("admin.groupDetails.deleteGroup")}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
          department_id: group.department_id,
          current_capacity: currentCapacity,
        }}
        mode="edit"
      />
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

function InfoItem({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: React.ElementType;
  color: "teal" | "mustard";
  label: string;
  value: string;
}) {
  const styles = {
    teal: { bg: "bg-[#2B6F5E]/8", icon: "text-[#2B6F5E]" },
    mustard: { bg: "bg-[#C4A035]/8", icon: "text-[#C4A035]" },
  };
  const s = styles[color];
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
      >
        <Icon className={`w-5 h-5 ${s.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#6B5D4F]">{label}</p>
        <p className="text-base text-[#1B1B1B] mt-1">{value}</p>
      </div>
    </div>
  );
}
