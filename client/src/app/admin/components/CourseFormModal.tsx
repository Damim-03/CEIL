import { useState, useEffect, type FormEvent } from "react";
import { X, BookOpen, Loader2, Zap, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import type {
  CreateCoursePayload,
  UpdateCoursePayload,
  CourseType,
} from "../../../types/Types";

/* =======================
   FORM STATE TYPE
======================= */

type CourseFormState = {
  course_name: string;
  course_code: string;
  credits: number | undefined;
  description: string;
  course_type: CourseType;
  session_duration: number | undefined;
};

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCoursePayload | UpdateCoursePayload) => void;
  isSubmitting?: boolean;
  initialData?: Partial<CourseFormState>;
  mode?: "create" | "edit";
}

const EMPTY_FORM: CourseFormState = {
  course_name: "",
  course_code: "",
  credits: undefined,
  description: "",
  course_type: "NORMAL",
  session_duration: undefined,
};

const CourseFormModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = "create",
}: CourseFormModalProps) => {
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setForm({
          course_name: initialData.course_name || "",
          course_code: initialData.course_code || "",
          credits: initialData.credits,
          description: initialData.description || "",
          course_type: initialData.course_type || "NORMAL",
          session_duration: initialData.session_duration,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
  }, [open, initialData, mode]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  if (!open) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.course_name.trim()) {
      next.course_name = "اسم الدورة مطلوب";
    }
    if (form.credits !== undefined && form.credits < 0) {
      next.credits = "الرصيد لا يمكن أن يكون سالباً";
    }
    if (
      form.session_duration !== undefined &&
      (form.session_duration <= 0 || !Number.isInteger(form.session_duration))
    ) {
      next.session_duration = "يجب أن يكون عدداً صحيحاً موجباً.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateCoursePayload | UpdateCoursePayload = {
      course_name: form.course_name.trim(),
      course_type: form.course_type,
    };
    if (form.course_code?.trim()) payload.course_code = form.course_code.trim();
    if (form.credits !== undefined && form.credits >= 0)
      payload.credits = form.credits;
    if (form.description?.trim()) payload.description = form.description.trim();
    if (form.session_duration !== undefined && form.session_duration > 0)
      payload.session_duration = form.session_duration;

    onSubmit(payload);
  };

  // ─── helpers ───────────────────────────────────────────
  const inputCls = (err?: string) =>
    [
      "h-10 w-full rounded-xl border px-3 text-sm font-medium transition-all outline-none",
      "bg-white dark:bg-[#222222]",
      "text-[#1B1B1B] dark:text-[#E5E5E5]",
      "placeholder:text-[#BEB29E] dark:placeholder:text-[#555555]",
      err
        ? "border-red-400 dark:border-red-600 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-800/40"
        : "border-[#D8CDC0]/60 dark:border-[#2A2A2A] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-2 focus:ring-[#2B6F5E]/15 dark:focus:ring-[#4ADE80]/15",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    ].join(" ");

  const labelCls =
    "block text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1.5";
  const hintCls = "text-xs text-[#BEB29E] dark:text-[#555555] mt-1";
  const errCls = "text-xs text-red-500 dark:text-red-400 mt-1";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-2xl dark:shadow-black/60 w-full max-w-lg border border-[#D8CDC0]/60 dark:border-[#2A2A2A] max-h-[92vh] flex flex-col overflow-hidden">
          {/* Top accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035] rounded-l-2xl" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {mode === "edit" ? "تعديل الدورة" : "إنشاء دورة جديدة"}
                </h2>
                <p className="text-xs text-[#BEB29E] dark:text-[#666666] mt-0.5">
                  {mode === "edit"
                    ? "تحديث معلومات الدورة"
                    : "أدخل تفاصيل الدورة"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[#BEB29E] dark:text-[#666666] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#2A2A2A] transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 overflow-y-auto"
          >
            <div className="px-6 py-5 space-y-5">
              {/* Course Name */}
              <div>
                <label className={labelCls}>
                  اسم الدورة <span className="text-red-500">*</span>
                </label>
                <input
                  className={inputCls(errors.course_name)}
                  placeholder="مثال: اللغة الفرنسية — المستوى A1"
                  value={form.course_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, course_name: e.target.value }))
                  }
                  disabled={isSubmitting}
                  autoFocus
                />
                {errors.course_name && (
                  <p className={errCls}>{errors.course_name}</p>
                )}
              </div>

              {/* Code + Credits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>كود الدورة</label>
                  <input
                    className={inputCls()}
                    placeholder="FR-001"
                    value={form.course_code ?? ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, course_code: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                  <p className={hintCls}>اختياري</p>
                </div>
                <div>
                  <label className={labelCls}>الرصيد (Credits)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className={inputCls(errors.credits)}
                    placeholder="3"
                    value={form.credits ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setForm((p) => ({
                        ...p,
                        credits: v === "" ? undefined : Number(v),
                      }));
                    }}
                    disabled={isSubmitting}
                  />
                  {errors.credits ? (
                    <p className={errCls}>{errors.credits}</p>
                  ) : (
                    <p className={hintCls}>اختياري</p>
                  )}
                </div>
              </div>

              {/* Course Type */}
              <div>
                <label className={labelCls}>
                  نوع الدورة <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["NORMAL", "INTENSIVE"] as CourseType[]).map((type) => {
                    const isSelected = form.course_type === type;
                    const isIntensive = type === "INTENSIVE";
                    return (
                      <button
                        key={type}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          setForm((p) => ({ ...p, course_type: type }))
                        }
                        className={[
                          "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                          isSelected
                            ? isIntensive
                              ? "border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                              : "border-[#2B6F5E] dark:border-[#4ADE80] bg-[#2B6F5E]/6 dark:bg-[#4ADE80]/10"
                            : "border-[#D8CDC0]/60 dark:border-[#2A2A2A] bg-white dark:bg-[#1E1E1E] hover:border-[#D8CDC0] dark:hover:border-[#333333]",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                        ].join(" ")}
                      >
                        {/* Selection ring */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-[#2B6F5E] dark:bg-[#4ADE80]">
                            <svg
                              className="w-3 h-3 text-white dark:text-[#0F0F0F]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}

                        <div
                          className={[
                            "w-9 h-9 rounded-lg flex items-center justify-center",
                            isIntensive
                              ? isSelected
                                ? "bg-amber-100 dark:bg-amber-800/30"
                                : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]"
                              : isSelected
                                ? "bg-[#2B6F5E]/12 dark:bg-[#4ADE80]/15"
                                : "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]",
                          ].join(" ")}
                        >
                          {isIntensive ? (
                            <Zap
                              className={`w-4.5 h-4.5 ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-[#BEB29E] dark:text-[#555555]"}`}
                            />
                          ) : (
                            <BookOpen
                              className={`w-4.5 h-4.5 ${isSelected ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#BEB29E] dark:text-[#555555]"}`}
                            />
                          )}
                        </div>

                        <div className="text-center">
                          <p
                            className={[
                              "text-sm font-bold",
                              isSelected
                                ? isIntensive
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-[#2B6F5E] dark:text-[#4ADE80]"
                                : "text-[#1B1B1B] dark:text-[#E5E5E5]",
                            ].join(" ")}
                          >
                            {type === "NORMAL" ? "عادي" : "مكثّف"}
                          </p>
                          <p className="text-[10px] text-[#BEB29E] dark:text-[#555555] mt-0.5">
                            {type === "NORMAL" ? "Normal" : "Intensif"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Session Duration */}
              <div>
                <label className={labelCls}>
                  <Clock className="inline w-4 h-4 mr-1 text-[#BEB29E] dark:text-[#555555]" />
                  مدة الحصة (بالدقائق)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  className={inputCls(errors.session_duration)}
                  placeholder={form.course_type === "INTENSIVE" ? "180" : "90"}
                  value={form.session_duration ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((p) => ({
                      ...p,
                      session_duration: v === "" ? undefined : Number(v),
                    }));
                  }}
                  disabled={isSubmitting}
                />
                {errors.session_duration ? (
                  <p className={errCls}>{errors.session_duration}</p>
                ) : (
                  <p className={hintCls}>
                    {form.session_duration
                      ? `= ${Math.floor(form.session_duration / 60)}س ${form.session_duration % 60 > 0 ? `${form.session_duration % 60}د` : ""}`.trim()
                      : "اختياري — مثال: 90 أو 180"}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>الوصف</label>
                <Textarea
                  placeholder="وصف مختصر عن الدورة..."
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  disabled={isSubmitting}
                  rows={3}
                  className="resize-none rounded-xl border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/15 dark:focus:ring-[#4ADE80]/15 text-sm"
                />
                <p className={hintCls}>اختياري</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A] px-6 py-4 flex items-center justify-end gap-3 bg-[#F8F6F3]/50 dark:bg-[#111111]">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-[#6B5D4F] dark:text-[#AAAAAA] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#2A2A2A]"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-[130px] bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 dark:bg-[#2B6F5E] dark:hover:bg-[#2B6F5E]/80 text-white shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "edit" ? "جاري التحديث..." : "جاري الإنشاء..."}
                  </>
                ) : mode === "edit" ? (
                  "حفظ التعديلات"
                ) : (
                  "إنشاء الدورة"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CourseFormModal;
