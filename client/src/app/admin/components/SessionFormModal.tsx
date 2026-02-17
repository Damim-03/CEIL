import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Save,
  Loader2,
  Calendar,
  BookOpen,
  User,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  DoorOpen,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useCreateSession,
  useUpdateSession,
  useAdminGroups,
  useAdminCourses,
  useAdminRooms,
} from "../../../hooks/admin/useAdmin";
import type { Session } from "../../../types/Types";

type SessionFormState = {
  course_id: string;
  group_id: string;
  session_date: string;
  end_time: string;
  topic: string;
  room_id: string;
};
type StatusType = "idle" | "loading" | "success" | "error";
const EMPTY_FORM: SessionFormState = {
  course_id: "",
  group_id: "",
  session_date: "",
  end_time: "",
  topic: "",
  room_id: "",
};

interface SessionFormModalProps {
  open: boolean;
  onClose: () => void;
  session?: Session | null;
  onSuccess?: () => void;
}

const SessionFormModal = ({
  open,
  onClose,
  session,
  onSuccess,
}: SessionFormModalProps) => {
  const { t } = useTranslation();
  const isEditMode = !!session;
  const [form, setForm] = useState<SessionFormState>(EMPTY_FORM);
  const [status, setStatus] = useState<StatusType>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: courses = [], isLoading: isLoadingCourses } = useAdminCourses();
  const { data: groups = [], isLoading: isLoadingGroups } = useAdminGroups();
  const { data: rooms = [], isLoading: isLoadingRooms } = useAdminRooms({
    active_only: true,
  });
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const isLoadingData = isLoadingCourses || isLoadingGroups;

  const filteredGroups = useMemo(() => {
    if (!form.course_id) return [];
    return groups.filter((g) => {
      const gci = (g as any).course?.course_id || (g as any).course_id;
      return gci === form.course_id;
    });
  }, [form.course_id, groups]);

  const selectedGroup = groups.find((g) => g.group_id === form.group_id);
  const groupTeacher = (selectedGroup as any)?.teacher;
  const selectedCourse = courses.find((c) => c.course_id === form.course_id);
  const selectedRoom = rooms.find((r: any) => r.room_id === form.room_id);

  useEffect(() => {
    if (open) {
      if (session) {
        setForm({
          course_id: session.group?.course?.course_id || "",
          group_id: session.group?.group_id || "",
          session_date: session.session_date
            ? new Date(session.session_date).toISOString().slice(0, 16)
            : "",
          end_time: (session as any).end_time
            ? new Date((session as any).end_time).toISOString().slice(0, 16)
            : "",
          topic: session.topic || "",
          room_id:
            (session as any).room_id || (session as any).room?.room_id || "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open, session]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "course_id")
      setForm((prev) => ({ ...prev, course_id: value, group_id: "" }));
    else setForm((prev) => ({ ...prev, [name]: value }));
    if (status !== "idle") setStatus("idle");
  };

  const durationMinutes = useMemo(() => {
    if (!form.session_date || !form.end_time) return null;
    const diff =
      new Date(form.end_time).getTime() - new Date(form.session_date).getTime();
    if (diff <= 0) return null;
    return Math.round(diff / 60000);
  }, [form.session_date, form.end_time]);

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} دقيقة`;
    if (m === 0) return `${h} ساعة`;
    return `${h} ساعة و ${m} دقيقة`;
  };

  const validate = () => {
    if (!isEditMode && !form.course_id)
      return t("admin.sessionForm.courseRequired");
    if (!isEditMode && !form.group_id)
      return t("admin.sessionForm.groupRequired");
    if (!form.session_date) return t("admin.sessionForm.dateRequired");
    if (
      form.end_time &&
      form.session_date &&
      new Date(form.end_time) <= new Date(form.session_date)
    )
      return "وقت الانتهاء يجب أن يكون بعد وقت البداية";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setStatus("error");
      setErrorMsg(err);
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      if (isEditMode) {
        await updateSession.mutateAsync({
          sessionId: session.session_id,
          payload: {
            session_date: new Date(form.session_date).toISOString(),
            end_time: form.end_time
              ? new Date(form.end_time).toISOString()
              : null,
            topic: form.topic.trim() || undefined,
            room_id: form.room_id || null,
          },
        });
      } else {
        await createSession.mutateAsync({
          group_id: form.group_id,
          session_date: new Date(form.session_date).toISOString(),
          end_time: form.end_time
            ? new Date(form.end_time).toISOString()
            : undefined,
          topic: form.topic.trim() || undefined,
          room_id: form.room_id || undefined,
        });
      }
      setStatus("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(
        e?.response?.data?.message || "Something went wrong. Try again.",
      );
    }
  };

  const isGroupDisabled = (group: any) =>
    group.status === "FULL" || group.status === "FINISHED";
  const getStatusBadge = (group: any) => {
    if (group.status === "FULL")
      return {
        label: `🔴 ${t("admin.sessionForm.full")}`,
        className:
          "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40",
      };
    if (group.status === "FINISHED")
      return {
        label: `🔒 ${t("admin.sessionForm.closed")}`,
        className:
          "bg-[#D8CDC0]/15 dark:bg-[#555555]/20 text-[#6B5D4F] dark:text-[#AAAAAA] border border-[#D8CDC0]/40 dark:border-[#555555]/30",
      };
    return {
      label: `🟢 ${t("admin.sessionForm.open")}`,
      className:
        "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#2B6F5E]/20 dark:border-[#4ADE80]/15",
    };
  };

  if (!open) return null;

  const validationError = validate();
  const canSubmit = !validationError && status !== "loading" && !isLoadingData;
  const availableGroupsCount = filteredGroups.filter(
    (g) => !isGroupDisabled(g),
  ).length;

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#222222] text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-2 focus:ring-[#2B6F5E]/10 dark:focus:ring-[#4ADE80]/10 focus:bg-white dark:focus:bg-[#1A1A1A] transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const labelCls =
    "text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-1.5";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white dark:bg-[#1A1A1A] rounded-3xl shadow-2xl dark:shadow-black/50 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden animate-[modalIn_0.25s_cubic-bezier(.4,0,.2,1)_both]">
          <div className="h-1.5 bg-gradient-to-r from-[#2B6F5E] via-[#8DB896] to-[#C4A035]" />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#8DB896] flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {isEditMode
                    ? t("admin.sessionForm.editSession")
                    : t("admin.sessionForm.createSession")}
                </h2>
                <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
                  {isEditMode
                    ? t("admin.sessionForm.editDesc")
                    : t("admin.sessionForm.createDesc")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#BEB29E] dark:text-[#666666] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-7 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {isLoadingData && !isEditMode && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#2B6F5E] dark:text-[#4ADE80]" />
                <span className="ml-2 text-[#6B5D4F] dark:text-[#888888]">
                  {t("admin.sessionForm.loadingData")}
                </span>
              </div>
            )}

            {!isEditMode && !isLoadingData && (
              <>
                {/* Steps */}
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span
                    className={`px-3 py-1.5 rounded-lg transition-all ${form.course_id ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#2B6F5E]/20 dark:border-[#4ADE80]/15" : "bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843] border border-[#C4A035]/20 dark:border-[#D4A843]/15"}`}
                  >
                    {t("admin.sessionForm.stepCourse")}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#D8CDC0] dark:text-[#555555]" />
                  <span
                    className={`px-3 py-1.5 rounded-lg transition-all ${form.group_id ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#2B6F5E]/20 dark:border-[#4ADE80]/15" : form.course_id ? "bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843] border border-[#C4A035]/20 dark:border-[#D4A843]/15" : "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A] text-[#BEB29E] dark:text-[#666666] border border-[#D8CDC0]/30 dark:border-[#2A2A2A]"}`}
                  >
                    {t("admin.sessionForm.stepGroup")}
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#D8CDC0] dark:text-[#555555]" />
                  <span
                    className={`px-3 py-1.5 rounded-lg transition-all ${form.session_date ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#2B6F5E]/20 dark:border-[#4ADE80]/15" : form.group_id ? "bg-[#C4A035]/8 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843] border border-[#C4A035]/20 dark:border-[#D4A843]/15" : "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A] text-[#BEB29E] dark:text-[#666666] border border-[#D8CDC0]/30 dark:border-[#2A2A2A]"}`}
                  >
                    {t("admin.sessionForm.stepSchedule")}
                  </span>
                </div>

                {/* Course */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>
                    <BookOpen className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    {t("admin.sessionForm.course")}
                    <span className="text-[#2B6F5E] dark:text-[#4ADE80]">
                      *
                    </span>
                  </label>
                  <select
                    name="course_id"
                    value={form.course_id}
                    onChange={handleChange}
                    disabled={status === "loading" || status === "success"}
                    className={inputCls}
                  >
                    <option value="">
                      {t("admin.sessionForm.selectCourse")}
                    </option>
                    {courses.map((c) => (
                      <option key={c.course_id} value={c.course_id}>
                        {c.course_name}
                        {c.course_code ? ` (${c.course_code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Groups */}
                {form.course_id && (
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>
                      <Users className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                      {t("admin.sessionForm.group")}
                      <span className="text-[#2B6F5E] dark:text-[#4ADE80]">
                        *
                      </span>
                      <span className="text-xs text-[#BEB29E] dark:text-[#666666] font-normal ml-1">
                        ({availableGroupsCount}{" "}
                        {t("admin.sessionForm.available")} /{" "}
                        {filteredGroups.length} {t("admin.sessionForm.total")})
                      </span>
                    </label>
                    {filteredGroups.length > 0 ? (
                      <div className="space-y-2">
                        {filteredGroups.map((group) => {
                          const teacher = (group as any).teacher;
                          const studentCount =
                            (group as any).current_capacity ||
                            (group as any)._count?.enrollments ||
                            0;
                          const isSelected = form.group_id === group.group_id;
                          const disabled = isGroupDisabled(group);
                          const badge = getStatusBadge(group);
                          return (
                            <button
                              key={group.group_id}
                              type="button"
                              onClick={() => {
                                if (disabled) return;
                                setForm((p) => ({
                                  ...p,
                                  group_id: group.group_id,
                                }));
                                if (status !== "idle") setStatus("idle");
                              }}
                              disabled={
                                status === "loading" ||
                                status === "success" ||
                                disabled
                              }
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${disabled ? "border-[#D8CDC0]/30 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#222222]/50 opacity-50 cursor-not-allowed" : isSelected ? "border-[#2B6F5E] dark:border-[#4ADE80] bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 shadow-sm" : "border-[#D8CDC0]/40 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] hover:border-[#2B6F5E]/40 dark:hover:border-[#4ADE80]/30 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222]"}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${disabled ? "border-[#D8CDC0] dark:border-[#555555] bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]" : isSelected ? "border-[#2B6F5E] dark:border-[#4ADE80] bg-[#2B6F5E] dark:bg-[#4ADE80]" : "border-[#D8CDC0] dark:border-[#555555]"}`}
                              >
                                {isSelected && !disabled && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                                {disabled && (
                                  <X className="w-3 h-3 text-[#BEB29E] dark:text-[#666666]" />
                                )}
                              </div>
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${disabled ? "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A] text-[#BEB29E] dark:text-[#666666]" : isSelected ? "bg-[#2B6F5E] dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F]" : "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888]"}`}
                              >
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-semibold text-sm ${disabled ? "text-[#BEB29E] dark:text-[#666666]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                                >
                                  {group.name}
                                </p>
                                <div
                                  className={`flex items-center gap-3 text-xs mt-0.5 ${disabled ? "text-[#BEB29E] dark:text-[#666666]" : "text-[#6B5D4F] dark:text-[#888888]"}`}
                                >
                                  {teacher ? (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {teacher.first_name} {teacher.last_name}
                                    </span>
                                  ) : (
                                    <span
                                      className={`flex items-center gap-1 ${disabled ? "" : "text-[#C4A035] dark:text-[#D4A843]"}`}
                                    >
                                      <User className="w-3 h-3" />
                                      {t("admin.sessionForm.noTeacher")}
                                    </span>
                                  )}
                                  {group.level && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-xs ${disabled ? "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A] text-[#BEB29E] dark:text-[#666666]" : "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA]"}`}
                                    >
                                      {group.level}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {studentCount}/{group.max_students}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded-lg shrink-0 ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#C4A035]/8 dark:bg-[#D4A843]/8 border border-[#C4A035]/20 dark:border-[#D4A843]/15">
                        <AlertCircle className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843] shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-[#8B6914] dark:text-[#D4A843]">
                            {t("admin.sessionForm.noGroupsForCourse")}
                          </p>
                          <p className="text-xs text-[#C4A035]/80 dark:text-[#D4A843]/70 mt-0.5">
                            {t("admin.sessionForm.createGroupFirst", {
                              name: selectedCourse?.course_name,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {filteredGroups.length > 0 &&
                      availableGroupsCount === 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40">
                          <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 shrink-0" />
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            {t("admin.sessionForm.allGroupsFull")}
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Summary */}
                {selectedGroup && (
                  <div className="bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 rounded-xl p-4 border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15">
                    <p className="text-xs font-bold text-[#2B6F5E]/60 dark:text-[#4ADE80]/60 uppercase tracking-wider mb-2">
                      {t("admin.sessionForm.sessionWillBeCreated")}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-[#6B5D4F] dark:text-[#888888]">
                          {t("admin.sessionForm.courseLabel")}
                        </span>
                        <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {selectedCourse?.course_name || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#6B5D4F] dark:text-[#888888]">
                          {t("admin.sessionForm.groupLabel")}
                        </span>
                        <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {selectedGroup.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-[#6B5D4F] dark:text-[#888888]">
                          {t("admin.sessionForm.teacherLabel")}
                        </span>
                        <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {groupTeacher
                            ? `${groupTeacher.first_name} ${groupTeacher.last_name}`
                            : t("admin.sessionForm.noTeacher")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Edit Info */}
            {isEditMode && (
              <div className="bg-[#D8CDC0]/8 dark:bg-[#222222] rounded-xl p-4 border border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                <p className="text-xs font-bold text-[#BEB29E] dark:text-[#666666] uppercase tracking-wider mb-2">
                  {t("admin.sessionForm.sessionInfo")}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-[#6B5D4F] dark:text-[#888888]">
                      {t("admin.sessionForm.courseLabel")}
                    </span>
                    <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {session.group?.course?.course_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6B5D4F] dark:text-[#888888]">
                      {t("admin.sessionForm.teacherLabel")}
                    </span>
                    <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {session.group?.teacher
                        ? `${session.group.teacher.first_name} ${session.group.teacher.last_name}`
                        : t("admin.sessionForm.noTeacher")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6B5D4F] dark:text-[#888888]">
                      {t("admin.sessionForm.groupLabel")}
                    </span>
                    <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {session.group?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Fields */}
            {!isLoadingData && (form.group_id || isEditMode) && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>
                    <Calendar className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    {t("admin.sessionForm.sessionDateTime")}
                    <span className="text-[#2B6F5E] dark:text-[#4ADE80]">
                      *
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    name="session_date"
                    value={form.session_date}
                    onChange={handleChange}
                    disabled={status === "loading" || status === "success"}
                    className={inputCls}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>
                    <Clock className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
                    وقت الانتهاء
                    <span className="text-[#BEB29E] dark:text-[#666666] text-xs font-normal">
                      (اختياري)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    min={form.session_date || undefined}
                    disabled={
                      status === "loading" ||
                      status === "success" ||
                      !form.session_date
                    }
                    className={inputCls}
                  />
                  {!form.session_date && (
                    <p className="text-[11px] text-[#BEB29E] dark:text-[#666666]">
                      حدد وقت البداية أولاً
                    </p>
                  )}
                  {durationMinutes && durationMinutes > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#C4A035]/8 dark:bg-[#D4A843]/8 border border-[#C4A035]/15 dark:border-[#D4A843]/15 text-xs">
                      <Clock className="w-3.5 h-3.5 text-[#C4A035] dark:text-[#D4A843]" />
                      <span className="font-semibold text-[#8B6914] dark:text-[#D4A843]">
                        المدة: {formatDuration(durationMinutes)}
                      </span>
                    </div>
                  )}
                  {form.end_time &&
                    form.session_date &&
                    new Date(form.end_time) <= new Date(form.session_date) && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-800/40 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                        <span className="font-semibold text-red-600 dark:text-red-400">
                          وقت الانتهاء يجب أن يكون بعد وقت البداية
                        </span>
                      </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>
                    <DoorOpen className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    القاعة
                    <span className="text-[#BEB29E] dark:text-[#666666] text-xs font-normal">
                      (اختياري)
                    </span>
                  </label>
                  {isLoadingRooms ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#222222]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#BEB29E] dark:text-[#666666]" />
                      <span className="text-sm text-[#BEB29E] dark:text-[#666666]">
                        جارٍ تحميل القاعات...
                      </span>
                    </div>
                  ) : rooms.length > 0 ? (
                    <>
                      <select
                        name="room_id"
                        value={form.room_id}
                        onChange={handleChange}
                        disabled={status === "loading" || status === "success"}
                        className={inputCls}
                      >
                        <option value="">بدون قاعة</option>
                        {(rooms as any[]).map((r: any) => (
                          <option key={r.room_id} value={r.room_id}>
                            {r.name}
                            {r.location ? ` — ${r.location}` : ""}
                            {` (${r.capacity} مقعد)`}
                          </option>
                        ))}
                      </select>
                      {selectedRoom && (
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/10 dark:border-[#4ADE80]/10 text-xs text-[#2B6F5E] dark:text-[#4ADE80]">
                          <DoorOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-medium">
                            {(selectedRoom as any).name}
                          </span>
                          {(selectedRoom as any).location && (
                            <>
                              <span className="text-[#2B6F5E]/30 dark:text-[#4ADE80]/30">
                                •
                              </span>
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{(selectedRoom as any).location}</span>
                            </>
                          )}
                          <span className="text-[#2B6F5E]/30 dark:text-[#4ADE80]/30">
                            •
                          </span>
                          <Users className="w-3 h-3 shrink-0" />
                          <span>{(selectedRoom as any).capacity} مقعد</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] bg-[#D8CDC0]/5 dark:bg-[#222222] text-xs text-[#BEB29E] dark:text-[#666666]">
                      <DoorOpen className="w-4 h-4" />
                      <span>لا توجد قاعات. يمكنك إضافتها من صفحة القاعات.</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>
                    <FileText className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                    {t("admin.sessionForm.topic")}{" "}
                    <span className="text-[#BEB29E] dark:text-[#666666] text-xs">
                      ({t("admin.sessionForm.topicOptional")})
                    </span>
                  </label>
                  <textarea
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    placeholder={t("admin.sessionForm.topicPlaceholder")}
                    disabled={status === "loading" || status === "success"}
                    rows={3}
                    className={`${inputCls} placeholder-[#BEB29E] dark:placeholder-[#555555] resize-none`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Status */}
          {(status === "success" || status === "error") && (
            <div
              className={`mx-7 mb-1 mt-0 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold ${status === "success" ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 border border-[#2B6F5E]/20 dark:border-[#4ADE80]/15 text-[#2B6F5E] dark:text-[#4ADE80]" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400"}`}
            >
              {status === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>
                {status === "success"
                  ? isEditMode
                    ? t("admin.sessionForm.sessionUpdated")
                    : t("admin.sessionForm.sessionCreated")
                  : errorMsg}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-5 bg-[#D8CDC0]/8 dark:bg-[#0F0F0F] border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={status === "loading" || status === "success"}
              className="px-5 rounded-xl border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] dark:hover:bg-[#222222]"
            >
              {t("admin.sessions.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="gap-2 px-6 rounded-xl bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("admin.sessionForm.saving")}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode
                    ? t("admin.sessionForm.updateSession")
                    : t("admin.sessionForm.createSession")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </>
  );
};

export default SessionFormModal;
