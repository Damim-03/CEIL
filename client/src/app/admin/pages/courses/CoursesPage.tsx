import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
} from "../../../../hooks/admin/useAdmin";
import CourseFormModal from "../../components/CourseFormModal";
import type { CreateCoursePayload } from "../../../../types/Types";
import { toast } from "sonner";

const CoursesPage = () => {
  const { t } = useTranslation();
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

  const handleDelete = async (courseId: string, courseName: string) => {
    if (!window.confirm(t("admin.courses.deleteConfirm", { name: courseName })))
      return;
    setDeletingId(courseId);
    try {
      await deleteCourse.mutateAsync(courseId);
      toast.success("Course deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = async (payload: CreateCoursePayload) => {
    try {
      await createCourse.mutateAsync(payload);
      setOpen(false);
      toast.success("Course created successfully!");
    } catch (error) {
      toast.error("Failed to create course");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.courses.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.courses.subtitle")}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-md shadow-[#2B6F5E]/20"
          >
            <Plus className="w-4 h-4" />
            {t("admin.courses.addCourse")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B5D4F] uppercase tracking-wide">
                {t("admin.courses.totalCourses")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#2B6F5E]/8 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#2B6F5E]" />
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B5D4F] uppercase tracking-wide">
                {t("admin.courses.totalCredits")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] mt-1">
                {stats.totalCredits}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#C4A035]/8 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#C4A035]" />
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#6B5D4F] uppercase tracking-wide">
                {t("admin.courses.avgCredits")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] mt-1">
                {stats.averageCredits}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-[#8DB896]/12 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#3D7A4A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
            <Input
              placeholder={t("admin.courses.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
            />
          </div>
          <p className="text-sm text-[#6B5D4F] whitespace-nowrap">
            <span className="font-semibold text-[#1B1B1B]">
              {filteredCourses.length}
            </span>{" "}
            {t("admin.courses.of")}{" "}
            <span className="font-semibold text-[#1B1B1B]">
              {courses.length}
            </span>{" "}
            {t("admin.courses.courses_label")}
          </p>
        </div>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {filteredCourses.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/40">
            {filteredCourses.map((course) => (
              <div
                key={course.course_id}
                className="flex flex-col lg:flex-row lg:items-center justify-between px-5 py-4 hover:bg-[#D8CDC0]/8 transition-colors duration-150 gap-3"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-[#2B6F5E]/15">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1B1B1B] text-base">
                      {course.course_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {course.course_code && (
                        <span className="inline-flex items-center gap-1 bg-[#D8CDC0]/20 text-[#6B5D4F] text-xs font-medium px-2.5 py-0.5 rounded-md">
                          <span className="text-[#BEB29E]">Code</span>
                          <span className="text-[#1B1B1B] font-semibold">
                            {course.course_code}
                          </span>
                        </span>
                      )}
                      {course.credits != null && (
                        <span className="inline-flex items-center gap-1 bg-[#2B6F5E]/8 text-[#2B6F5E] text-xs font-medium px-2.5 py-0.5 rounded-md">
                          <GraduationCap className="w-3 h-3" />
                          {course.credits} cr
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:shrink-0 ml-auto lg:ml-0">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-[#2B6F5E]/30 text-[#2B6F5E] hover:bg-[#2B6F5E]/8 hover:border-[#2B6F5E]/50"
                  >
                    <Link to={`/admin/courses/${course.course_id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      {t("admin.courses.details")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDelete(course.course_id, course.course_name)
                    }
                    disabled={deletingId === course.course_id}
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === course.course_id
                      ? t("admin.courses.deleting")
                      : t("admin.courses.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-[#BEB29E]" />
            </div>
            <h3 className="text-base font-semibold text-[#1B1B1B]">
              {search
                ? t("admin.courses.noCoursesSearch")
                : t("admin.courses.noCourses")}
            </h3>
            <p className="text-[#6B5D4F] text-sm mt-1 max-w-xs">
              {search
                ? t("admin.courses.noCoursesSearchDesc")
                : t("admin.courses.noCoursesDesc")}
            </p>
            {!search && (
              <Button
                onClick={() => setOpen(true)}
                className="gap-2 mt-4 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-md"
              >
                <Plus className="w-4 h-4" />
                {t("admin.courses.createCourse")}
              </Button>
            )}
          </div>
        )}
      </div>

      <CourseFormModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createCourse.isPending}
      />

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center lg:hidden"
        aria-label={t("admin.courses.addCourse")}
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};

export default CoursesPage;
