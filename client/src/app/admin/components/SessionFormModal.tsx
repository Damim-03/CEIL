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
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useCreateSession,
  useUpdateSession,
  useAdminGroups,
  useAdminCourses,
} from "../../../hooks/admin/useAdmin";
import type { Session } from "../../../types/Types";

type SessionFormState = {
  course_id: string;
  group_id: string;
  session_date: string;
  topic: string;
};
type StatusType = "idle" | "loading" | "success" | "error";
const EMPTY_FORM: SessionFormState = {
  course_id: "",
  group_id: "",
  session_date: "",
  topic: "",
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

  useEffect(() => {
    if (open) {
      if (session) {
        setForm({
          course_id: session.group?.course?.course_id || "",
          group_id: session.group?.group_id || "",
          session_date: session.session_date
            ? new Date(session.session_date).toISOString().slice(0, 16)
            : "",
          topic: session.topic || "",
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

  const validate = () => {
    if (!isEditMode && !form.course_id)
      return t("admin.sessionForm.courseRequired");
    if (!isEditMode && !form.group_id)
      return t("admin.sessionForm.groupRequired");
    if (!form.session_date) return t("admin.sessionForm.dateRequired");
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
            topic: form.topic.trim() || undefined,
          },
        });
      } else {
        await createSession.mutateAsync({
          group_id: form.group_id,
          session_date: new Date(form.session_date).toISOString(),
          topic: form.topic.trim() || undefined,
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
        className: "bg-red-50 text-red-600 border border-red-200",
      };
    if (group.status === "FINISHED")
      return {
        label: `🔒 ${t("admin.sessionForm.closed")}`,
        className: "bg-gray-100 text-gray-500 border border-gray-200",
      };
    return {
      label: `🟢 ${t("admin.sessionForm.open")}`,
      className: "bg-green-50 text-green-600 border border-green-200",
    };
  };

  if (!open) return null;

  const validationError = validate();
  const canSubmit = !validationError && status !== "loading" && !isLoadingData;
  const availableGroupsCount = filteredGroups.filter(
    (g) => !isGroupDisabled(g),
  ).length;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden animate-[modalIn_0.25s_cubic-bezier(.4,0,.2,1)_both]">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode
                    ? t("admin.sessionForm.editSession")
                    : t("admin.sessionForm.createSession")}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isEditMode
                    ? t("admin.sessionForm.editDesc")
                    : t("admin.sessionForm.createDesc")}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-7 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {isLoadingData && !isEditMode && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">
                  {t("admin.sessionForm.loadingData")}
                </span>
              </div>
            )}

            {!isEditMode && !isLoadingData && (
              <>
                {/* Steps */}
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span
                    className={`px-3 py-1.5 rounded-lg transition-all ${form.course_id ? "bg-green-50 text-green-700 border border-green-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}
                  >
                    {t("admin.sessionForm.stepCourse")}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span
                    className={`px-3 py-1.5 rounded-lg transition-all ${form.group_id ? "bg-green-50 text-green-700 border border-green-200" : form.course_id ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
                  >
                    {t("admin.sessionForm.stepGroup")}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span
                    className={`px-3 py-1.5 rounded-lg transition-all ${form.session_date ? "bg-green-50 text-green-700 border border-green-200" : form.group_id ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}
                  >
                    {t("admin.sessionForm.stepSchedule")}
                  </span>
                </div>

                {/* Course Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    {t("admin.sessionForm.course")}
                    <span className="text-indigo-500">*</span>
                  </label>
                  <select
                    name="course_id"
                    value={form.course_id}
                    onChange={handleChange}
                    disabled={status === "loading" || status === "success"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {t("admin.sessionForm.selectCourse")}
                    </option>
                    {courses.map((course) => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                        {course.course_code ? ` (${course.course_code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group Select */}
                {form.course_id && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-500" />
                      {t("admin.sessionForm.group")}
                      <span className="text-indigo-500">*</span>
                      <span className="text-xs text-gray-400 font-normal ml-1">
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
                                setForm((prev) => ({
                                  ...prev,
                                  group_id: group.group_id,
                                }));
                                if (status !== "idle") setStatus("idle");
                              }}
                              disabled={
                                status === "loading" ||
                                status === "success" ||
                                disabled
                              }
                              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${disabled ? "border-gray-200 bg-gray-50/80 opacity-50 cursor-not-allowed" : isSelected ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50"}`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${disabled ? "border-gray-300 bg-gray-100" : isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"}`}
                              >
                                {isSelected && !disabled && (
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                                {disabled && (
                                  <X className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${disabled ? "bg-gray-100 text-gray-400" : isSelected ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"}`}
                              >
                                <Users className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`font-semibold text-sm ${disabled ? "text-gray-400" : "text-gray-900"}`}
                                >
                                  {group.name}
                                </p>
                                <div
                                  className={`flex items-center gap-3 text-xs mt-0.5 ${disabled ? "text-gray-400" : "text-gray-500"}`}
                                >
                                  {teacher ? (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {teacher.first_name} {teacher.last_name}
                                    </span>
                                  ) : (
                                    <span
                                      className={`flex items-center gap-1 ${disabled ? "text-gray-400" : "text-amber-600"}`}
                                    >
                                      <User className="w-3 h-3" />
                                      {t("admin.sessionForm.noTeacher")}
                                    </span>
                                  )}
                                  {group.level && (
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-xs ${disabled ? "bg-gray-100 text-gray-400" : "bg-gray-100 text-gray-600"}`}
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
                              <div className="shrink-0">
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-lg ${badge.className}`}
                                >
                                  {badge.label}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            {t("admin.sessionForm.noGroupsForCourse")}
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            {t("admin.sessionForm.createGroupFirst", {
                              name: selectedCourse?.course_name,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                    {filteredGroups.length > 0 &&
                      availableGroupsCount === 0 && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                          <p className="text-sm font-medium text-red-700">
                            {t("admin.sessionForm.allGroupsFull")}
                          </p>
                        </div>
                      )}
                  </div>
                )}

                {/* Summary */}
                {selectedGroup && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      {t("admin.sessionForm.sessionWillBeCreated")}
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">
                          {t("admin.sessionForm.courseLabel")}
                        </span>
                        <p className="font-semibold text-gray-900">
                          {selectedCourse?.course_name || "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {t("admin.sessionForm.groupLabel")}
                        </span>
                        <p className="font-semibold text-gray-900">
                          {selectedGroup.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {t("admin.sessionForm.teacherLabel")}
                        </span>
                        <p className="font-semibold text-gray-900">
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

            {/* Edit Mode Info */}
            {isEditMode && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("admin.sessionForm.sessionInfo")}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">
                      {t("admin.sessionForm.courseLabel")}
                    </span>
                    <p className="font-semibold text-gray-900">
                      {session.group?.course?.course_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {t("admin.sessionForm.teacherLabel")}
                    </span>
                    <p className="font-semibold text-gray-900">
                      {session.group?.teacher
                        ? `${session.group.teacher.first_name} ${session.group.teacher.last_name}`
                        : t("admin.sessionForm.noTeacher")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">
                      {t("admin.sessionForm.groupLabel")}
                    </span>
                    <p className="font-semibold text-gray-900">
                      {session.group?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date & Topic */}
            {!isLoadingData && (form.group_id || isEditMode) && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {t("admin.sessionForm.sessionDateTime")}
                    <span className="text-indigo-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="session_date"
                    value={form.session_date}
                    onChange={handleChange}
                    disabled={status === "loading" || status === "success"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    {t("admin.sessionForm.topic")}{" "}
                    <span className="text-gray-400 text-xs">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </div>

          {/* Status */}
          {(status === "success" || status === "error") && (
            <div
              className={`mx-7 mb-1 mt-0 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold ${status === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}
            >
              {status === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
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
          <div className="flex items-center justify-end gap-3 px-7 py-5 bg-gray-50/70 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={status === "loading" || status === "success"}
              className="px-5 rounded-xl"
            >
              {t("admin.sessions.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="gap-2 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
