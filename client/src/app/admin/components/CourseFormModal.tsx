import { useRef, useState, useEffect, type FormEvent } from "react";
import { X, BookOpen, Loader2, ChevronDown, User } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type { CoursePayload } from "../../../lib/api/admin/adminCourses.api";
import { useAdminTeachers } from "../../../hooks/admin/useAdminTeachers";

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CoursePayload) => void;
  isSubmitting?: boolean;

  initialData?: Partial<CoursePayload>; // 👈 جديد
  mode?: "create" | "edit";
}

const EMPTY: CoursePayload = {
  course_name: "",
  course_code: "",
  credits: undefined,
  teacher_id: undefined,
};

const CourseFormModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CourseFormModalProps) => {
  const { data: teachers = [], isLoading: teachersLoading } =
    useAdminTeachers();

  const [form, setForm] = useState<CoursePayload>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Ref on the teacher select container — used for outside-click detection
  const teacherSelectRef = useRef<HTMLDivElement>(null);

  // Wraps onClose: resets every piece of local state before telling the
  // parent to close.  Clearing state here — inside an event handler —
  // avoids the "setState synchronously inside an effect" lint error.
  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    setTeacherSearch("");
    setTeacherDropdownOpen(false);
    setHighlightedIndex(-1);
    onClose();
  };

  // Outside-click: compare against the container ref, not stopPropagation.
  // This avoids the mousedown-vs-click mismatch that caused the flicker.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        teacherSelectRef.current &&
        !teacherSelectRef.current.contains(e.target as Node)
      ) {
        setTeacherDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (teacherDropdownOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [teacherDropdownOpen]);

  if (!open) return null;

  // ── validation ──
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

    const payload: CoursePayload = {
      course_name: form.course_name.trim(),
    };
    if (form.course_code?.trim()) payload.course_code = form.course_code.trim();
    if (form.credits !== undefined && form.credits >= 0)
      payload.credits = form.credits;
    if (form.teacher_id) payload.teacher_id = form.teacher_id;

    onSubmit(payload);
  };

  // ── teacher dropdown helpers ──
  const filteredTeachers = teachers.filter((t) => {
    const full = `${t.first_name} ${t.last_name}`.toLowerCase();
    return full.includes(teacherSearch.toLowerCase());
  });

  const selectedTeacher = teachers.find(
    (t) => t.teacher_id === form.teacher_id,
  );

  const selectTeacher = (teacherId: string | undefined) => {
    setForm((prev) => ({ ...prev, teacher_id: teacherId }));
    setTeacherDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  // Keyboard nav inside the dropdown
  const handleTeacherKeyDown = (e: React.KeyboardEvent) => {
    if (!teacherDropdownOpen) {
      // Open on Enter / Space / ArrowDown when focused on trigger
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setTeacherDropdownOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setTeacherDropdownOpen(false);
        setHighlightedIndex(-1);
        break;

      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredTeachers.length - 1 ? prev + 1 : prev,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;

      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredTeachers.length
        ) {
          selectTeacher(filteredTeachers[highlightedIndex].teacher_id);
        }
        break;

      case "Tab":
        // Let Tab close the dropdown naturally
        setTeacherDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal — overflow-hidden removed so the teacher dropdown is not clipped */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Create Course
                </h2>
                <p className="text-xs text-gray-500">
                  Fill in the details below
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

          {/* ── Divider ── */}
          <div className="border-t border-gray-100 mx-6" />

          {/* ── Body ── */}
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
                  <p className="text-xs text-gray-400 mt-1.5">
                    Unique identifier (optional)
                  </p>
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
                    <p className="text-xs text-gray-400 mt-1.5">
                      Credit hours (optional)
                    </p>
                  )}
                </div>
              </div>

              {/* ── Teacher select ── */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Assign Teacher
                </label>

                {/* Container ref — outside-click checks against this */}
                <div
                  ref={teacherSelectRef}
                  className="relative"
                  onKeyDown={handleTeacherKeyDown}
                >
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherDropdownOpen((prev) => !prev);
                      setHighlightedIndex(0);
                    }}
                    disabled={isSubmitting || teachersLoading}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span
                      className={
                        selectedTeacher
                          ? "text-gray-900 flex items-center gap-2"
                          : "text-gray-400"
                      }
                    >
                      {selectedTeacher ? (
                        <>
                          <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-teal-600" />
                          </span>
                          {selectedTeacher.first_name}{" "}
                          {selectedTeacher.last_name}
                        </>
                      ) : teachersLoading ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        "Select a teacher (optional)"
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${teacherDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {teacherDropdownOpen && (
                    <div className="absolute z-10 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg">
                      {/* Search */}
                      <div className="p-2 border-b border-gray-100">
                        <Input
                          placeholder="Search teachers..."
                          value={teacherSearch}
                          onChange={(e) => {
                            setTeacherSearch(e.target.value);
                            setHighlightedIndex(-1);
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                      </div>

                      {/* List */}
                      <ul className="max-h-40 overflow-y-auto py-1">
                        {/* While teachers are still fetching */}
                        {teachersLoading && (
                          <li className="px-3 py-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Loading teachers...
                          </li>
                        )}

                        {/* Clear option — only when a teacher is already selected */}
                        {!teachersLoading && form.teacher_id && (
                          <li>
                            <button
                              type="button"
                              onClick={() => selectTeacher(undefined)}
                              className="w-full text-left px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                              Clear selection
                            </button>
                          </li>
                        )}

                        {/* Teacher options */}
                        {!teachersLoading &&
                          (filteredTeachers.length > 0 ? (
                            filteredTeachers.map((teacher, idx) => {
                              const isSelected =
                                form.teacher_id === teacher.teacher_id;
                              const isHighlighted = idx === highlightedIndex;
                              return (
                                <li key={teacher.teacher_id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectTeacher(teacher.teacher_id)
                                    }
                                    onMouseEnter={() =>
                                      setHighlightedIndex(idx)
                                    }
                                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 text-sm transition-colors ${
                                      isSelected
                                        ? "bg-teal-50 text-teal-700"
                                        : isHighlighted
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span
                                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? "bg-teal-100"
                                          : "bg-gray-100"
                                      }`}
                                    >
                                      <User
                                        className={`w-3.5 h-3.5 ${isSelected ? "text-teal-600" : "text-gray-500"}`}
                                      />
                                    </span>
                                    <span className="truncate">
                                      {teacher.first_name} {teacher.last_name}
                                    </span>
                                    {teacher.email && (
                                      <span className="text-xs text-gray-400 ml-auto truncate">
                                        {teacher.email}
                                      </span>
                                    )}
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-3 py-3 text-center text-xs text-gray-400">
                              {teacherSearch
                                ? "No teachers match your search"
                                : "No teachers available"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-gray-100 mx-6 mt-2" />
            <div className="flex items-center justify-end gap-3 px-6 py-4">
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
                    Creating...
                  </>
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
