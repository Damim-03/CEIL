import { useRef, useState, useEffect, type FormEvent } from "react";
import {
  X,
  Users,
  Loader2,
  ChevronDown,
  GraduationCap,
  User,
  Lock,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import type {
  CreateGroupPayload,
  UpdateGroupPayload,
} from "../../../types/Types";
import { useAdminCourses } from "../../../hooks/admin/useAdmin";
import { useAdminTeachers } from "../../../hooks/admin/useAdmin";

/* =======================
   ✅ CORRECTED FORM STATE TYPE
   Matches Prisma Schema exactly
======================= */

type GroupFormState = {
  name: string;              // ✅ Matches schema
  level: string;
  course_id: string;
  max_students: number;      // ✅ Matches schema
  teacher_id: string | undefined;  // ✅ Matches schema
  current_capacity?: number;
};

interface GroupFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupPayload | UpdateGroupPayload) => void;
  isSubmitting?: boolean;
  initialData?: Partial<GroupFormState>;
  mode?: "create" | "edit";
  injectedCourseId?: string;
}

const EMPTY_FORM: GroupFormState = {
  name: "",                  // ✅ Correct field name
  level: "A1",
  course_id: "",
  max_students: 20,          // ✅ Correct field name
  teacher_id: undefined,     // ✅ Correct field name
  current_capacity: 0,
};

const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

const LEVEL_COLORS = {
  A1: "from-green-500 to-emerald-600",
  A2: "from-blue-500 to-cyan-600",
  B1: "from-purple-500 to-indigo-600",
  B2: "from-orange-500 to-amber-600",
  C1: "from-red-500 to-rose-600",
};

const LEVEL_RING_COLORS = {
  A1: "ring-green-500/20",
  A2: "ring-blue-500/20",
  B1: "ring-purple-500/20",
  B2: "ring-orange-500/20",
  C1: "ring-red-500/20",
};

const CAPACITY_THRESHOLD_PERCENT = 80;

const GroupFormModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = "create",
  injectedCourseId,
}: GroupFormModalProps) => {
  const { data: courses = [], isLoading: coursesLoading } = useAdminCourses();
  const { data: teachers = [], isLoading: teachersLoading } =
    useAdminTeachers();

  const [form, setForm] = useState<GroupFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [courseSearch, setCourseSearch] = useState("");
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [courseHighlightedIndex, setCourseHighlightedIndex] = useState(-1);

  const [instructorSearch, setInstructorSearch] = useState("");
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);
  const [instructorHighlightedIndex, setInstructorHighlightedIndex] =
    useState(-1);

  const courseSelectRef = useRef<HTMLDivElement>(null);
  const instructorSelectRef = useRef<HTMLDivElement>(null);

  // ✅ Initialize form with proper field mapping
  useEffect(() => {
    if (open) {
      if (initialData && mode === "edit") {
        setForm({
          // Support both old and new field names for backward compatibility
          name: initialData.name || (initialData as any).group_name || "",
          level: initialData.level || "A1",
          course_id: initialData.course_id || "",
          max_students: initialData.max_students || (initialData as any).max_capacity || 20,
          teacher_id: initialData.teacher_id || (initialData as any).instructor_id,
          current_capacity: initialData.current_capacity || 0,
        });
      } else {
        setForm({
          ...EMPTY_FORM,
          course_id: injectedCourseId || "",
        });
      }
      setErrors({});
      setCourseSearch("");
      setCourseDropdownOpen(false);
      setCourseHighlightedIndex(-1);
      setInstructorSearch("");
      setInstructorDropdownOpen(false);
      setInstructorHighlightedIndex(-1);
    }
  }, [open, initialData, mode, injectedCourseId]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setCourseSearch("");
    setCourseDropdownOpen(false);
    setCourseHighlightedIndex(-1);
    setInstructorSearch("");
    setInstructorDropdownOpen(false);
    setInstructorHighlightedIndex(-1);
    onClose();
  };

  // Outside-click handlers
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        courseSelectRef.current &&
        !courseSelectRef.current.contains(e.target as Node)
      ) {
        setCourseDropdownOpen(false);
        setCourseHighlightedIndex(-1);
      }
    };
    if (courseDropdownOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [courseDropdownOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        instructorSelectRef.current &&
        !instructorSelectRef.current.contains(e.target as Node)
      ) {
        setInstructorDropdownOpen(false);
        setInstructorHighlightedIndex(-1);
      }
    };
    if (instructorDropdownOpen) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [instructorDropdownOpen]);

  if (!open) return null;

  // Calculate if instructor assignment should be enabled
  const currentCapacity = form.current_capacity || 0;
  const maxCapacity = form.max_students || 20;
  const capacityPercent = maxCapacity > 0 ? (currentCapacity / maxCapacity) * 100 : 0;
  const isInstructorAssignmentEnabled =
    mode === "edit" && capacityPercent >= CAPACITY_THRESHOLD_PERCENT;
  const canAssignInstructor =
    isInstructorAssignmentEnabled || form.teacher_id;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) {
      next.name = "Group name is required";
    }
    if (!form.level) {
      next.level = "Level is required";
    }
    if (!form.course_id) {
      next.course_id = "Course is required";
    }
    if (!form.max_students || form.max_students < 1) {
      next.max_students = "Maximum capacity must be at least 1";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // ✅ Convert FormState to API payload with correct field names
    const payload: CreateGroupPayload | UpdateGroupPayload = {
      name: form.name.trim(),
      level: form.level as any,
      course_id: form.course_id,
      max_students: form.max_students,
    };

    // Only include teacher_id if it's set and allowed
    if (form.teacher_id && canAssignInstructor) {
      payload.teacher_id = form.teacher_id;
    }

    onSubmit(payload);
  };

  // Course dropdown
  const filteredCourses = courses.filter((c) =>
    c.course_name.toLowerCase().includes(courseSearch.toLowerCase()),
  );
  const selectedCourse = courses.find((c) => c.course_id === form.course_id);

  const selectCourse = (courseId: string) => {
    setForm((prev) => ({ ...prev, course_id: courseId }));
    setCourseDropdownOpen(false);
    setCourseHighlightedIndex(-1);
  };

  const handleCourseKeyDown = (e: React.KeyboardEvent) => {
    if (!courseDropdownOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setCourseDropdownOpen(true);
        setCourseHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setCourseDropdownOpen(false);
        setCourseHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setCourseHighlightedIndex((prev) =>
          prev < filteredCourses.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setCourseHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (
          courseHighlightedIndex >= 0 &&
          courseHighlightedIndex < filteredCourses.length
        ) {
          selectCourse(filteredCourses[courseHighlightedIndex].course_id);
        }
        break;
      case "Tab":
        setCourseDropdownOpen(false);
        setCourseHighlightedIndex(-1);
        break;
    }
  };

  // Instructor dropdown
  const filteredInstructors = teachers.filter((t) => {
    const full = `${t.first_name} ${t.last_name}`.toLowerCase();
    return full.includes(instructorSearch.toLowerCase());
  });
  const selectedInstructor = teachers.find(
    (t) => t.teacher_id === form.teacher_id,
  );

  const selectInstructor = (teacherId: string | undefined) => {
    setForm((prev) => ({ ...prev, teacher_id: teacherId }));
    setInstructorDropdownOpen(false);
    setInstructorHighlightedIndex(-1);
  };

  const handleInstructorKeyDown = (e: React.KeyboardEvent) => {
    if (!instructorDropdownOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setInstructorDropdownOpen(true);
        setInstructorHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setInstructorDropdownOpen(false);
        setInstructorHighlightedIndex(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        setInstructorHighlightedIndex((prev) =>
          prev < filteredInstructors.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setInstructorHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (
          instructorHighlightedIndex >= 0 &&
          instructorHighlightedIndex < filteredInstructors.length
        ) {
          selectInstructor(
            filteredInstructors[instructorHighlightedIndex].teacher_id,
          );
        }
        break;
      case "Tab":
        setInstructorDropdownOpen(false);
        setInstructorHighlightedIndex(-1);
        break;
    }
  };

  // Determine if course selection should be disabled
  const isCourseSelectionDisabled = !!injectedCourseId;

  return (
    <>
      {/* Backdrop with animation */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal with slide-up animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 overflow-hidden">
          {/* Enhanced Header with Gradient */}
          <div className={`relative px-6 pt-6 pb-5 bg-gradient-to-br ${LEVEL_COLORS[form.level as keyof typeof LEVEL_COLORS]} overflow-hidden`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-4 ${LEVEL_RING_COLORS[form.level as keyof typeof LEVEL_RING_COLORS]}`}>
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    {mode === "edit" ? "Edit Group" : "Create New Group"}
                    {mode === "create" && <Sparkles className="w-5 h-5" />}
                  </h2>
                  <p className="text-sm text-white/80 mt-0.5">
                    {mode === "edit"
                      ? "Update group information and settings"
                      : "Set up a new learning group"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body with better spacing */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              {/* Group Name with icon */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Group Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="e.g. Advanced English - Group A1"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className={`pl-10 h-11 ${
                      errors.name
                        ? "border-red-400 focus:ring-red-300"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Level Selection with enhanced design */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Proficiency Level
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {LEVELS.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, level }))}
                      disabled={isSubmitting}
                      className={`relative py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                        form.level === level
                          ? `bg-gradient-to-br ${
                              LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
                            } text-white shadow-lg ring-4 ${
                              LEVEL_RING_COLORS[level as keyof typeof LEVEL_RING_COLORS]
                            }`
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                      }`}
                    >
                      {level}
                      {form.level === level && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
                {errors.level && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.level}
                  </p>
                )}
              </div>

              {/* Grid layout for better organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Max Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Capacity
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="20"
                      value={form.max_students || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          max_students: val === "" ? 0 : Number(val),
                        }));
                      }}
                      className={`pl-10 h-11 ${
                        errors.max_students
                          ? "border-red-400 focus:ring-red-300"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.max_students ? (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.max_students}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">
                      Maximum number of students
                    </p>
                  )}
                </div>

                {/* Current Capacity Display (Edit Mode Only) */}
                {mode === "edit" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Enrollment
                    </label>
                    <div className={`h-11 rounded-xl border-2 ${
                      capacityPercent >= 100
                        ? "border-red-200 bg-red-50"
                        : capacityPercent >= CAPACITY_THRESHOLD_PERCENT
                          ? "border-orange-200 bg-orange-50"
                          : "border-blue-200 bg-blue-50"
                    } px-4 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${
                          capacityPercent >= 100
                            ? "text-red-600"
                            : capacityPercent >= CAPACITY_THRESHOLD_PERCENT
                              ? "text-orange-600"
                              : "text-blue-600"
                        }`} />
                        <span className="text-sm font-semibold text-gray-700">
                          {currentCapacity} / {maxCapacity}
                        </span>
                      </div>
                      <span className={`text-xs font-bold ${
                        capacityPercent >= 100
                          ? "text-red-600"
                          : capacityPercent >= CAPACITY_THRESHOLD_PERCENT
                            ? "text-orange-600"
                            : "text-blue-600"
                      }`}>
                        {Math.round(capacityPercent)}%
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
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
                )}
              </div>

              {/* Course Select - Same as before, no changes needed */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign Course
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div
                  ref={courseSelectRef}
                  className="relative"
                  onKeyDown={handleCourseKeyDown}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isCourseSelectionDisabled) {
                        setCourseDropdownOpen((prev) => !prev);
                        setCourseHighlightedIndex(0);
                      }
                    }}
                    disabled={
                      isSubmitting ||
                      coursesLoading ||
                      isCourseSelectionDisabled
                    }
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-xl border-2 bg-white text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      isCourseSelectionDisabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                    } ${
                      errors.course_id
                        ? "border-red-400 focus:ring-red-300"
                        : ""
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={
                        selectedCourse
                          ? "text-gray-900 flex items-center gap-2"
                          : "text-gray-400 flex items-center gap-2"
                      }
                    >
                      {selectedCourse ? (
                        <>
                          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
                            <GraduationCap className="w-4 h-4 text-white" />
                          </span>
                          <span className="font-semibold">{selectedCourse.course_name}</span>
                        </>
                      ) : coursesLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading courses...
                        </>
                      ) : (
                        <>
                          <GraduationCap className="w-4 h-4" />
                          Select a course
                        </>
                      )}
                    </span>
                    {!isCourseSelectionDisabled && (
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          courseDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {isCourseSelectionDisabled && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-3 h-3" />
                      Course is auto-assigned from the current page
                    </div>
                  )}

                  {errors.course_id && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.course_id}
                    </p>
                  )}

                  {courseDropdownOpen && !isCourseSelectionDisabled && (
                    <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <Input
                          placeholder="Search courses..."
                          value={courseSearch}
                          onChange={(e) => {
                            setCourseSearch(e.target.value);
                            setCourseHighlightedIndex(-1);
                          }}
                          className="h-9 text-sm border-gray-300"
                          autoFocus
                        />
                      </div>

                      <ul className="max-h-48 overflow-y-auto py-1">
                        {coursesLoading && (
                          <li className="px-4 py-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading courses...
                          </li>
                        )}

                        {!coursesLoading &&
                          (filteredCourses.length > 0 ? (
                            filteredCourses.map((course, idx) => {
                              const isSelected =
                                form.course_id === course.course_id;
                              const isHighlighted =
                                idx === courseHighlightedIndex;
                              return (
                                <li key={course.course_id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectCourse(course.course_id)
                                    }
                                    onMouseEnter={() =>
                                      setCourseHighlightedIndex(idx)
                                    }
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all duration-150 ${
                                      isSelected
                                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                                        : isHighlighted
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                                        isSelected
                                          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                                          : "bg-gray-200"
                                      }`}
                                    >
                                      <GraduationCap
                                        className={`w-4 h-4 ${
                                          isSelected
                                            ? "text-white"
                                            : "text-gray-500"
                                        }`}
                                      />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">
                                        {course.course_name}
                                      </p>
                                      {course.course_code && (
                                        <p className="text-xs text-gray-400">
                                          {course.course_code}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-8 text-center text-sm text-gray-400">
                              {courseSearch
                                ? "No courses match your search"
                                : "No courses available"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Instructor Select with lock indicator */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  Assign Instructor
                  {!canAssignInstructor && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </label>
                <div
                  ref={instructorSelectRef}
                  className="relative"
                  onKeyDown={handleInstructorKeyDown}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (canAssignInstructor) {
                        setInstructorDropdownOpen((prev) => !prev);
                        setInstructorHighlightedIndex(0);
                      }
                    }}
                    disabled={
                      isSubmitting || teachersLoading || !canAssignInstructor
                    }
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-4 ${
                      !canAssignInstructor
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-300 bg-white hover:border-green-400 hover:shadow-md focus:ring-green-500/20"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={
                        selectedInstructor
                          ? "text-gray-900 flex items-center gap-2"
                          : "text-gray-400 flex items-center gap-2"
                      }
                    >
                      {selectedInstructor ? (
                        <>
                          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow">
                            <User className="w-4 h-4 text-white" />
                          </span>
                          <span className="font-semibold">
                            {selectedInstructor.first_name}{" "}
                            {selectedInstructor.last_name}
                          </span>
                        </>
                      ) : teachersLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : !canAssignInstructor ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Reach {CAPACITY_THRESHOLD_PERCENT}% capacity first
                        </>
                      ) : (
                        <>
                          <User className="w-4 h-4" />
                          Select an instructor
                        </>
                      )}
                    </span>
                    {canAssignInstructor && (
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          instructorDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Enhanced Info Messages */}
                  {mode === "create" && (
                    <div className="mt-2 flex items-start gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        <span className="font-semibold">Note:</span> Instructor assignment unlocks when the group reaches{" "}
                        <span className="font-bold">{CAPACITY_THRESHOLD_PERCENT}%</span> capacity (
                        {Math.ceil(
                          (maxCapacity * CAPACITY_THRESHOLD_PERCENT) / 100,
                        )}{" "}
                        students)
                      </p>
                    </div>
                  )}

                  {mode === "edit" && !canAssignInstructor && (
                    <div className="mt-2 flex items-start gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        <span className="font-semibold">Almost there!</span> Need{" "}
                        <span className="font-bold">
                          {Math.ceil(
                            (maxCapacity * CAPACITY_THRESHOLD_PERCENT) / 100 -
                              currentCapacity,
                          )}
                        </span>{" "}
                        more student(s) to assign an instructor
                      </p>
                    </div>
                  )}

                  {instructorDropdownOpen && canAssignInstructor && (
                    <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                      <div className="p-3 border-b border-gray-100 bg-gray-50">
                        <Input
                          placeholder="Search instructors..."
                          value={instructorSearch}
                          onChange={(e) => {
                            setInstructorSearch(e.target.value);
                            setInstructorHighlightedIndex(-1);
                          }}
                          className="h-9 text-sm border-gray-300"
                          autoFocus
                        />
                      </div>

                      <ul className="max-h-48 overflow-y-auto py-1">
                        {teachersLoading && (
                          <li className="px-4 py-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading instructors...
                          </li>
                        )}

                        {!teachersLoading && form.teacher_id && (
                          <li>
                            <button
                              type="button"
                              onClick={() => selectInstructor(undefined)}
                              className="w-full text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              ✕ Clear selection
                            </button>
                          </li>
                        )}

                        {!teachersLoading &&
                          (filteredInstructors.length > 0 ? (
                            filteredInstructors.map((instructor, idx) => {
                              const isSelected =
                                form.teacher_id === instructor.teacher_id;
                              const isHighlighted =
                                idx === instructorHighlightedIndex;
                              return (
                                <li key={instructor.teacher_id}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      selectInstructor(instructor.teacher_id)
                                    }
                                    onMouseEnter={() =>
                                      setInstructorHighlightedIndex(idx)
                                    }
                                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm transition-all duration-150 ${
                                      isSelected
                                        ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                                        : isHighlighted
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                                        isSelected
                                          ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                          : "bg-gray-200"
                                      }`}
                                    >
                                      <User
                                        className={`w-4 h-4 ${
                                          isSelected
                                            ? "text-white"
                                            : "text-gray-500"
                                        }`}
                                      />
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">
                                        {instructor.first_name}{" "}
                                        {instructor.last_name}
                                      </p>
                                      {instructor.email && (
                                        <p className="text-xs text-gray-400 truncate">
                                          {instructor.email}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-8 text-center text-sm text-gray-400">
                              {instructorSearch
                                ? "No instructors match your search"
                                : "No instructors available"}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Footer with gradient border */}
            <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`gap-2 min-w-[140px] shadow-lg bg-gradient-to-r ${
                    LEVEL_COLORS[form.level as keyof typeof LEVEL_COLORS]
                  } hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {mode === "edit" ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {mode === "edit" ? "Update Group" : "Create Group"}
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GroupFormModal;