import { useState, useEffect, type FormEvent } from "react";
import { X, BookOpen, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import type {
  CreateCoursePayload,
  UpdateCoursePayload,
} from "../../../types/Types";

/* =======================
   FORM STATE TYPE
   Separate from API payloads
======================= */

type CourseFormState = {
  course_name: string;
  course_code: string;
  credits: number | undefined;
  description: string;
  duration: string;
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
  duration: "",
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

  // Initialize form with initial data
  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setForm({
          course_name: initialData.course_name || "",
          course_code: initialData.course_code || "",
          credits: initialData.credits,
          description: initialData.description || "",
          duration: initialData.duration || "",
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
      next.course_name = "Course name is required";
    }
    if (form.credits !== undefined && form.credits < 0) {
      next.credits = "Credits cannot be negative";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Convert FormState to API payload
    const payload: CreateCoursePayload | UpdateCoursePayload = {
      course_name: form.course_name.trim(),
    };
    if (form.course_code?.trim()) payload.course_code = form.course_code.trim();
    if (form.credits !== undefined && form.credits >= 0)
      payload.credits = form.credits;
    if (form.description?.trim())
      payload.description = form.description.trim();

    onSubmit(payload);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {mode === "edit" ? "Edit Course" : "Create Course"}
                </h2>
                <p className="text-xs text-gray-500">
                  {mode === "edit"
                    ? "Update course information"
                    : "Fill in the details below"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="border-t border-gray-100 mx-6" />

          {/* Body */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">
              {/* Course Name (required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Course Name
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <Input
                  placeholder="e.g. Introduction to Computer Science"
                  value={form.course_name}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      course_name: e.target.value,
                    }))
                  }
                  className={
                    errors.course_name
                      ? "border-red-400 focus:ring-red-300"
                      : ""
                  }
                  disabled={isSubmitting}
                  autoFocus
                />
                {errors.course_name && (
                  <p className="text-xs text-red-500 mt-1.5">
                    {errors.course_name}
                  </p>
                )}
              </div>

              {/* Course Code + Credits side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Course Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Course Code
                  </label>
                  <Input
                    placeholder="CS-101"
                    value={form.course_code ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        course_code: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">Optional</p>
                </div>

                {/* Credits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Credits
                  </label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder="3"
                    value={form.credits ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        credits: val === "" ? undefined : Number(val),
                      }));
                    }}
                    className={
                      errors.credits ? "border-red-400 focus:ring-red-300" : ""
                    }
                    disabled={isSubmitting}
                  />
                  {errors.credits ? (
                    <p className="text-xs text-red-500 mt-1.5">
                      {errors.credits}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1.5">Optional</p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Duration
                </label>
                <Input
                  placeholder="e.g. 12 weeks, 1 semester"
                  value={form.duration ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-400 mt-1.5">Optional</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <Textarea
                  placeholder="Brief description of the course..."
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">Optional</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 mx-6 mt-2" />
            <div className="flex items-center justify-end gap-3 px-6 py-4 sticky bottom-0 bg-white">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 min-w-35 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "edit" ? "Updating..." : "Creating..."}
                  </>
                ) : mode === "edit" ? (
                  "Update Course"
                ) : (
                  "Create Course"
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