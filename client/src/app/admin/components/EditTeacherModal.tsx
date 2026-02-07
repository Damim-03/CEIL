import { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useUpdateTeacher } from "../../../hooks/admin/useAdmin";
import type { Teacher } from "../../../types/Types";

interface EditTeacherModalProps {
  open: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSuccess?: () => void;
}

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

type TouchedState = {
  [K in keyof FormState]?: boolean;
};

type StatusType = "idle" | "loading" | "success" | "error";

const EditTeacherModal = ({
  open,
  onClose,
  teacher,
  onSuccess,
}: EditTeacherModalProps) => {
  // ── form state ────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [touched, setTouched] = useState<TouchedState>({});
  const [status, setStatus] = useState<StatusType>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const updateTeacher = useUpdateTeacher();

  // ── sync form when teacher or open changes ───────────────
  useEffect(() => {
    if (teacher && open) {
      setForm({
        first_name: teacher.first_name || "",
        last_name: teacher.last_name || "",
        email: teacher.email || "",
        phone_number: teacher.phone_number || "",
      });
      setTouched({});
      setStatus("idle");
      setErrorMsg("");
    }
  }, [teacher, open]);

  // ── close resets ──────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open]);

  // ── helpers ───────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (status !== "idle") setStatus("idle");
  };

  const hasChanged =
    form.first_name !== (teacher?.first_name || "") ||
    form.last_name !== (teacher?.last_name || "") ||
    form.email !== (teacher?.email || "") ||
    form.phone_number !== (teacher?.phone_number || "");

  const validate = () => {
    if (!form.first_name.trim()) return "First name is required.";
    if (!form.last_name.trim()) return "Last name is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address.";
    return null;
  };

  const validationError = validate();
  const canSubmit = !validationError && hasChanged && status !== "loading";

  // ── submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!teacher) return;

    const err = validate();
    if (err) {
      setStatus("error");
      setErrorMsg(err);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await updateTeacher.mutateAsync({
        teacherId: teacher.teacher_id,
        payload: {
          ...teacher,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || undefined,
          phone_number: form.phone_number.trim() || undefined,
        },
      });
      setStatus("success");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (e: unknown) {
      setStatus("error");
      const error = e as { response?: { data?: { message?: string } } };
      setErrorMsg(
        error?.response?.data?.message || "Something went wrong. Try again.",
      );
    }
  };

  // Don't render if not open OR if teacher is null
  if (!open || !teacher) return null;

  // ── field config ──────────────────────────────────────────
  const fields = [
    {
      group: "Name",
      items: [
        {
          name: "first_name" as const,
          label: "First Name",
          icon: User,
          placeholder: "e.g. Ahmed",
          required: true,
        },
        {
          name: "last_name" as const,
          label: "Last Name",
          icon: User,
          placeholder: "e.g. Benali",
          required: true,
        },
      ],
    },
    {
      group: "Contact",
      items: [
        {
          name: "email" as const,
          label: "Email Address",
          icon: Mail,
          placeholder: "teacher@eduadmin.edu",
          required: false,
        },
        {
          name: "phone_number" as const,
          label: "Phone Number",
          icon: Phone,
          placeholder: "+213 __ __ __ __",
          required: false,
        },
      ],
    },
  ];

  // ── render ────────────────────────────────────────────────
  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* ── Modal ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200/60 overflow-hidden animate-[modalIn_0.25s_cubic-bezier(.4,0,.2,1)_both]">
          {/* top accent bar */}
          <div className="h-1.5 bg-linear-to-r from-indigo-500 via-violet-500 to-blue-500" />

          {/* ── Header ── */}
          <div className="flex items-start justify-between px-7 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Edit Teacher
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {teacher.first_name} {teacher.last_name}
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

          {/* ── Body ── */}
          <div className="px-7 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
            {fields.map((section) => (
              <div key={section.group}>
                {/* section label */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {section.group}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.items.map((field) => {
                    const Icon = field.icon;
                    const value = form[field.name];
                    const isTouched = touched[field.name];
                    const isEmpty = !value.trim();
                    const showError = isTouched && field.required && isEmpty;

                    return (
                      <div key={field.name} className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                          {field.label}
                          {field.required && (
                            <span className="text-indigo-500">*</span>
                          )}
                        </label>

                        <div className="relative">
                          {/* icon */}
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Icon
                              className={`w-4.5 h-4.5 transition-colors ${value ? "text-indigo-500" : "text-gray-300"}`}
                              style={{ width: "18px", height: "18px" }}
                            />
                          </div>

                          <input
                            name={field.name}
                            value={value}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            disabled={
                              status === "loading" || status === "success"
                            }
                            className={[
                              "w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium text-gray-800 placeholder-gray-300",
                              "transition-all duration-200 outline-none",
                              "disabled:opacity-50 disabled:cursor-not-allowed",
                              showError
                                ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
                                : "border-gray-200 bg-gray-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white",
                            ].join(" ")}
                          />
                        </div>

                        {showError && (
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertCircle
                              style={{ width: "13px", height: "13px" }}
                            />
                            {field.label} is required
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Status banner (success / error) ── */}
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
                  ? "Teacher updated successfully!"
                  : errorMsg}
              </span>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-7 py-5 bg-gray-50/70 border-t border-gray-100">
            <p
              className={`text-xs font-semibold transition-colors ${hasChanged ? "text-indigo-500" : "text-gray-400"}`}
            >
              {hasChanged ? "You have unsaved changes" : "No changes made"}
            </p>

            <div className="flex gap-3">
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
                className="gap-2 px-6 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── keyframes ── */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default EditTeacherModal;
