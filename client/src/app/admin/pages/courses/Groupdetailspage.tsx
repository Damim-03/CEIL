import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
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
  Unlock,
  Plus,
  Search,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import GroupFormModal from "../../components/GroupFormModal";
import AssignInstructorModal from "../../components/Assigninstructormodal";
import type { UpdateGroupPayload } from "../../../../types/Types";

const LEVEL_COLORS = {
  BASICS: "from-[#7C8FA6] to-[#4A6178]",
  A1: "from-[#8DB896] to-[#2B6F5E]",
  A2: "from-[#2B6F5E] to-[#2B6F5E]/80",
  B1: "from-[#C4A035] to-[#C4A035]/80",
  B2: "from-[#BEB29E] to-[#6B5D4F]",
  C1: "from-[#1B1B1B] to-[#1B1B1B]/80",
};

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
      className={`rounded-xl shadow-lg dark:shadow-black/30 p-4 ${type === "success" ? "bg-[#2B6F5E]" : "bg-red-500"} text-white flex items-center gap-3`}
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

  const getNestedValue = (
    obj: Record<string, any>,
    path: string,
    defaultValue: any = null,
  ): any => {
    try {
      const value = path
        .split(".")
        .reduce((acc: any, part: string) => acc?.[part], obj);
      return value !== undefined && value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md space-y-4 p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A]">
          <AlertCircle
            className="mx-auto text-red-500 dark:text-red-400"
            size={48}
          />
          <h2 className="text-2xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("admin.groupDetails.errorLoading")}
          </h2>
          <p className="text-[#6B5D4F] dark:text-[#AAAAAA]">
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
              className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:text-[#E5E5E5] dark:hover:bg-[#222222]"
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
        <div className="text-center space-y-4 p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A]">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center">
            <Users className="w-8 h-8 text-[#BEB29E] dark:text-[#666666]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("admin.groupDetails.groupNotFound")}
          </h2>
          <p className="text-[#6B5D4F] dark:text-[#AAAAAA]">
            {t("admin.groupDetails.groupNotFoundDesc")}
          </p>
          <Link to="/admin/groups">
            <Button
              variant="outline"
              className="border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:text-[#E5E5E5] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222]"
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
  const hasInstructor = !!group.teacher_id;

  const students = Array.isArray(group.students) ? group.students : [];
  const filteredStudents = students.filter((student: any) => {
    if (!student) return false;
    const sl = searchTerm.toLowerCase();
    return (
      (student.first_name || "").toLowerCase().includes(sl) ||
      (student.last_name || "").toLowerCase().includes(sl) ||
      (student.email || "").toLowerCase().includes(sl) ||
      (student.student_id || "").toLowerCase().includes(sl)
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

  const handleUpdate = async (payload: UpdateGroupPayload) => {
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
            className="gap-2 text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.groupDetails.backToCourse")}
          </Button>
        </Link>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222]"
        >
          <RefreshCw className="w-4 h-4" />
          {t("admin.groupDetails.refresh")}
        </Button>
      </div>

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2B6F5E]/5 dark:from-[#2B6F5E]/10 to-[#C4A035]/5 dark:to-[#C4A035]/10 px-6 py-8 border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${LEVEL_COLORS[group.level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS.A1} flex items-center justify-center text-white shadow-xl`}
              >
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {group.name || "Unnamed Group"}
                </h1>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888] mt-1">
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
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                      group.status === "OPEN"
                        ? "bg-[#8DB896]/15 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#8DB896]/30 dark:border-[#4ADE80]/20"
                        : (group.status as string) === "CLOSED"
                          ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/40"
                          : "bg-[#D8CDC0]/30 dark:bg-[#555555]/20 text-[#6B5D4F] dark:text-[#AAAAAA] border border-[#D8CDC0]/50 dark:border-[#555555]/30"
                    }`}
                  >
                    {group.status === "OPEN"
                      ? t("admin.groupDetails.open")
                      : (group.status as string) === "CLOSED"
                        ? t("admin.groupDetails.closed")
                        : group.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                {t("admin.groupDetails.enrollment")}
              </p>
              <p className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {currentCapacity}/{maxCapacity}
              </p>
              <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-1">
                {t("admin.groupDetails.full", {
                  percent: Math.round(capacityPercent),
                })}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="w-full bg-[#D8CDC0]/30 dark:bg-[#2A2A2A] rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  capacityPercent >= 100
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : capacityPercent >= 80
                      ? "bg-gradient-to-r from-[#C4A035] to-[#C4A035]/80"
                      : "bg-gradient-to-r from-[#2B6F5E] to-[#8DB896]"
                }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Teacher — Always unlocked */}
        <div className="border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A] px-6 py-5 bg-gradient-to-r from-[#2B6F5E]/3 dark:from-[#2B6F5E]/5 to-[#8DB896]/5 dark:to-[#8DB896]/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
                {t("admin.groupDetails.assignedTeacher")}
              </h2>
              <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
                {t("admin.groupDetails.teacherAvailable")}
              </p>
            </div>
            <Unlock className="w-6 h-6 text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <div className="mt-4">
            {hasInstructor && group.teacher ? (
              <div className="bg-white dark:bg-[#1A1A1A] border border-[#8DB896]/30 dark:border-[#4ADE80]/15 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {getNestedValue(group, "teacher.first_name", "")}{" "}
                        {getNestedValue(group, "teacher.last_name", "")}
                      </p>
                      {group.teacher.email && (
                        <p className="text-sm text-[#6B5D4F] dark:text-[#888888] flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-[#BEB29E] dark:text-[#666666]" />
                          {group.teacher.email}
                        </p>
                      )}
                      {group.teacher.phone_number && (
                        <p className="text-sm text-[#6B5D4F] dark:text-[#888888] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-[#BEB29E] dark:text-[#666666]" />
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
                      className="gap-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] hover:bg-[#C4A035]/8 dark:hover:bg-[#C4A035]/10 hover:border-[#C4A035]/40 dark:hover:border-[#C4A035]/30 dark:text-[#E5E5E5]"
                    >
                      <Edit className="w-3 h-3" />
                      {t("admin.groupDetails.change")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemoveInstructor}
                      className="gap-2 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <XCircle className="w-3 h-3" />
                      {t("admin.groupDetails.remove")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-6 text-center border-[#8DB896]/40 dark:border-[#4ADE80]/20 bg-[#8DB896]/5 dark:bg-[#4ADE80]/5">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10">
                  <UserCheck className="w-8 h-8 text-[#2B6F5E] dark:text-[#4ADE80]" />
                </div>
                <p className="font-medium mb-2 text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("admin.groupDetails.noTeacherYet")}
                </p>
                <p className="text-sm mb-4 text-[#6B5D4F] dark:text-[#AAAAAA]">
                  {t("admin.groupDetails.groupReachedCapacity")}
                </p>
                <Button
                  size="sm"
                  onClick={() => setAssignInstructorOpen(true)}
                  className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
                >
                  <Plus className="w-4 h-4" />{" "}
                  {t("admin.groupDetails.assignTeacher")}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Students */}
        <div className="border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
                {t("admin.groupDetails.enrolledStudents")}
              </h2>
              <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
                {t("admin.groupDetails.enrolledCount", {
                  current: currentCapacity,
                  max: maxCapacity,
                })}
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
              <input
                type="text"
                placeholder={t("admin.groupDetails.searchStudents")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] bg-white dark:bg-[#222222] text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:placeholder:text-[#555555] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20 focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]"
              />
            </div>
          </div>
          {filteredStudents.length > 0 ? (
            <div className="border border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#D8CDC0]/10 dark:bg-[#0F0F0F] border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      {t("admin.groupDetails.studentId")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      {t("admin.groupDetails.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      {t("admin.groupDetails.email")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      {t("admin.groupDetails.phone")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      {t("admin.groupDetails.enrollmentDate")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#6B5D4F] dark:text-[#888888] uppercase tracking-wider">
                      {t("admin.groupDetails.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A] bg-white dark:bg-[#1A1A1A]">
                  {filteredStudents.map((student: any, index: number) => (
                    <tr
                      key={student.student_id || index}
                      className="hover:bg-[#D8CDC0]/8 dark:hover:bg-[#222222] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-[#BEB29E] dark:text-[#666666]">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {student.student_id?.slice(0, 8) || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#C4A035]/10 dark:bg-[#D4A843]/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
                          </div>
                          <span className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                            {student.first_name || ""} {student.last_name || ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B5D4F] dark:text-[#888888]">
                        {student.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B5D4F] dark:text-[#888888]">
                        {student.phone_number || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B5D4F] dark:text-[#888888]">
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
                          className="gap-1 text-[#2B6F5E] dark:text-[#4ADE80] hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/10"
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
            <div className="border-2 border-dashed border-[#D8CDC0]/40 dark:border-[#2A2A2A] rounded-xl p-12 text-center">
              <Users className="w-16 h-16 mx-auto text-[#D8CDC0] dark:text-[#555555] mb-3" />
              <p className="text-[#6B5D4F] dark:text-[#AAAAAA] font-medium">
                {searchTerm
                  ? t("admin.groupDetails.noStudentsSearch")
                  : t("admin.groupDetails.noStudents")}
              </p>
              <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-1">
                {searchTerm
                  ? t("admin.groupDetails.noStudentsSearchHint")
                  : t("admin.groupDetails.noStudentsHint")}
              </p>
            </div>
          )}
        </div>

        {/* Group Info */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-4">
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
                  : (group.status as string) === "CLOSED"
                    ? t("admin.groupDetails.closed")
                    : group.status
              }
            />
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#D8CDC0]/10 dark:bg-[#0F0F0F] px-6 py-4 border-t border-[#D8CDC0]/40 dark:border-[#2A2A2A]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.groupDetails.manageDesc")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditOpen(true)}
                className="gap-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#1B1B1B] dark:text-[#E5E5E5] hover:bg-[#C4A035]/8 dark:hover:bg-[#C4A035]/10 hover:border-[#C4A035]/40 dark:hover:border-[#C4A035]/30 hover:text-[#C4A035] dark:hover:text-[#D4A843]"
              >
                <Edit className="w-4 h-4" />
                {t("admin.groupDetails.editGroup")}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="gap-2 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700/50"
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
          teacher_id: group.teacher_id ?? undefined,
          department_id: group.department_id ?? undefined,
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
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    mustard: {
      bg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/10",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
    },
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
        <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
          {label}
        </p>
        <p className="text-base text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}
