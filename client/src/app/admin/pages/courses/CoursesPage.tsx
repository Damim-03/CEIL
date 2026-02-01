import { Link } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen,
  Eye,
  Trash2,
  Plus,
  Search,
  GraduationCap,
  Award,
  Layers,
} from "lucide-react";

import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

import {
  useAdminCourses,
  useDeleteCourse,
  useCreateCourse,
} from "../../../../hooks/admin/useAdminCourses";

import CourseFormModal from "../../components/CourseFormModal";
import type { CoursePayload } from "../../../../lib/api/admin/admincourses.api";
import type { CourseUI } from "../../../../types/course";

const CoursesPage = () => {
  const { data: courses = [], isLoading } = useAdminCourses();
  const deleteCourse = useDeleteCourse();
  const createCourse = useCreateCourse();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (isLoading) return <PageLoader />;

  const filteredCourses = courses.filter((course) =>
    course.course_name.toLowerCase().includes(search.toLowerCase()),
  );

  const stats = {
    total: courses.length,
    totalCredits: courses.reduce(
      (sum, course) => sum + (course.credits || 0),
      0,
    ),
    averageCredits:
      courses.length > 0
        ? (
            courses.reduce((sum, course) => sum + (course.credits || 0), 0) /
            courses.length
          ).toFixed(1)
        : "0",
  };

  const handleDelete = (courseId: string, courseName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${courseName}"?`))
      return;
    setDeletingId(courseId);
    deleteCourse.mutate(courseId, {
      onFinally: () => setDeletingId(null),
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Manage all course offerings and curriculum
          </p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Add Course
        </Button>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Total Credits */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Credits
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.totalCredits}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Avg Credits */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Avg Credits
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.averageCredits}
              </p>
            </div>
            <div className="w-11 h-11 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Search ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by course name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-lg"
          />
        </div>
        <p className="text-sm text-gray-500 whitespace-nowrap">
          <span className="font-semibold text-gray-700">
            {filteredCourses.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">{courses.length}</span>{" "}
          courses
        </p>
      </div>

      {/* ─── Course List ─── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredCourses.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredCourses.map((course: CourseUI) => (
              <div
                key={course.course_id}
                className="flex flex-col lg:flex-row lg:items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors duration-150 gap-3"
              >
                {/* Left: icon + info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-base">
                      {course.course_name}
                    </p>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {course.course_code && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-md">
                          <span className="text-gray-400">Code</span>
                          <span className="text-gray-800 font-semibold">
                            {course.course_code}
                          </span>
                        </span>
                      )}
                      {course.credits != null && (
                        <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 text-xs font-medium px-2.5 py-0.5 rounded-md">
                          <GraduationCap className="w-3 h-3" />
                          {course.credits} cr
                        </span>
                      )}
                    </div>

                    {course.description && (
                      <p className="text-sm text-gray-500 mt-1.5 line-clamp-1">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 lg:shrink-0 ml-auto lg:ml-0">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-gray-600 hover:text-gray-900"
                  >
                    <Link to={`/admin/courses/${course.course_id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      Details
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() =>
                      handleDelete(course.course_id, course.course_name)
                    }
                    disabled={deletingId === course.course_id}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === course.course_id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">
              {search ? "No matching courses" : "No courses yet"}
            </h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              {search
                ? "Try a different search term or clear the filter."
                : "Create your first course to get started with the curriculum."}
            </p>
            {!search && (
              <Button
                onClick={() => setOpen(true)}
                className="gap-2 mt-4 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ─── Modal ─── */}
      <CourseFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data: CoursePayload) => {
          createCourse.mutate(data, {
            onSuccess: () => setOpen(false),
          });
        }}
      />

      {/* ─── FAB (mobile only) ─── */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center lg:hidden"
        aria-label="Add Course"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default CoursesPage;
