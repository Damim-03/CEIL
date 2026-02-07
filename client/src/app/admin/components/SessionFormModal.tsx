import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  useCreateSession,
  useUpdateSession,
  useAdminCourses,
  useAdminTeachers,
  useAdminGroups,
} from "../../../hooks/admin/useAdmin";
import type { Session } from "../../../types/Types";

/* =======================
   FORM STATE TYPE
======================= */

type SessionFormState = {
  course_id: string;
  teacher_id: string;
  group_id: string;
  session_date: string;
  topic: string;
};

interface SessionFormModalProps {
  open: boolean;
  onClose: () => void;
  session?: Session | null;
  onSuccess?: () => void;
}

type StatusType = "idle" | "loading" | "success" | "error";

const EMPTY_FORM: SessionFormState = {
  course_id: "",
  teacher_id: "",
  group_id: "",
  session_date: "",
  topic: "",
};

const SessionFormModal = ({
  open,
  onClose,
  session,
  onSuccess,
}: SessionFormModalProps) => {
  const isEditMode = !!session;

  const [form, setForm] = useState<SessionFormState>(EMPTY_FORM);
  const [status, setStatus] = useState<StatusType>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Fetch data internally
  const { data: courses = [], isLoading: isLoadingCourses } = useAdminCourses();
  const { data: teachers = [], isLoading: isLoadingTeachers } =
    useAdminTeachers();
  const { data: groups = [], isLoading: isLoadingGroups } = useAdminGroups();

  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  // Check if data is loading
  const isLoadingData =
    isLoadingCourses || isLoadingTeachers || isLoadingGroups;

  // Initialize form
  useEffect(() => {
    if (open) {
      if (session) {
        // Edit mode - only date and topic are editable
        setForm({
          course_id: session.group?.course?.course_id || "",
          teacher_id: session.group?.teacher?.teacher_id || "",
          group_id: session.group?.group_id || "",
          session_date: session.session_date
            ? new Date(session.session_date).toISOString().slice(0, 16)
            : "",
          topic: session.topic || "",
        });
      } else {
        // Create mode
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
    setForm((prev) => ({ ...prev, [name]: value }));
    if (status !== "idle") setStatus("idle");
  };

  const validate = () => {
    if (!isEditMode) {
      if (!form.course_id) return "Course is required.";
      if (!form.teacher_id) return "Teacher is required.";
      if (!form.group_id) return "Group is required.";
    }
    if (!form.session_date) return "Session date & time is required.";
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
        // Edit mode - only send session_date and topic
        await updateSession.mutateAsync({
          sessionId: session.session_id,
          payload: {
            session_date: new Date(form.session_date).toISOString(),
            topic: form.topic.trim() || undefined,
          },
        });
      } else {
        // Create mode - send all fields
        await createSession.mutateAsync({
          course_id: form.course_id,
          teacher_id: form.teacher_id,
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

  if (!open) return null;

  const validationError = validate();
  const canSubmit = !validationError && status !== "loading" && !isLoadingData;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden animate-[modalIn_0.25s_cubic-bezier(.4,0,.2,1)_both]">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditMode ? "Edit Session" : "Create Session"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isEditMode
                    ? "Update session date and topic"
                    : "Schedule a new academic session"}
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
            {/* Loading state for data */}
            {isLoadingData && !isEditMode && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="ml-2 text-gray-600">Loading data...</span>
              </div>
            )}

            {/* Course, Teacher, Group (disabled in edit mode) */}
            {!isEditMode && !isLoadingData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Course */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      Course
                      <span className="text-indigo-500">*</span>
                    </label>
                    <select
                      name="course_id"
                      value={form.course_id}
                      onChange={handleChange}
                      disabled={status === "loading" || status === "success"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select course</option>
                      {courses.map((course) => (
                        <option key={course.course_id} value={course.course_id}>
                          {course.course_name}
                        </option>
                      ))}
                    </select>
                    {courses.length === 0 && (
                      <p className="text-xs text-amber-600">
                        No courses available. Please create courses first.
                      </p>
                    )}
                  </div>

                  {/* Teacher */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-indigo-500" />
                      Teacher
                      <span className="text-indigo-500">*</span>
                    </label>
                    <select
                      name="teacher_id"
                      value={form.teacher_id}
                      onChange={handleChange}
                      disabled={status === "loading" || status === "success"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select teacher</option>
                      {teachers.map((teacher) => (
                        <option
                          key={teacher.teacher_id}
                          value={teacher.teacher_id}
                        >
                          {teacher.first_name} {teacher.last_name}
                        </option>
                      ))}
                    </select>
                    {teachers.length === 0 && (
                      <p className="text-xs text-amber-600">
                        No teachers available. Please create teachers first.
                      </p>
                    )}
                  </div>

                  {/* Group */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Group
                      <span className="text-indigo-500">*</span>
                    </label>
                    <select
                      name="group_id"
                      value={form.group_id}
                      onChange={handleChange}
                      disabled={status === "loading" || status === "success"}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select group</option>
                      {groups.map((group) => (
                        <option key={group.group_id} value={group.group_id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    {groups.length === 0 && (
                      <p className="text-xs text-amber-600">
                        No groups available. Please create groups first.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Show read-only info in edit mode */}
            {isEditMode && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Session Info (Read-only)
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Course:</span>
                    <p className="font-semibold text-gray-900">
                      {session.group?.course?.course_name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Teacher:</span>
                    <p className="font-semibold text-gray-900">
                      {session.group?.teacher
                        ? `${session.group.teacher.first_name} ${session.group.teacher.last_name}`
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Group:</span>
                    <p className="font-semibold text-gray-900">
                      {session.group?.name || "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time */}
            {!isLoadingData && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    Session Date & Time
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

                {/* Topic */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Topic{" "}
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    placeholder="e.g. Introduction to Algebra"
                    disabled={status === "loading" || status === "success"}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </div>

          {/* Status banner */}
          {(status === "success" || status === "error") && (
            <div
              className={[
                "mx-7 mb-1 mt-0 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold",
                status === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700",
              ].join(" ")}
            >
              {status === "success" ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              )}
              <span>
                {status === "success"
                  ? isEditMode
                    ? "Session updated successfully!"
                    : "Session created successfully!"
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
              Cancel
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
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? "Update" : "Create"} Session
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default SessionFormModal;
