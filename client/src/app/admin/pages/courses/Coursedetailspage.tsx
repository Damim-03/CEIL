import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  useAdminCourse,
  useUpdateCourse,
  useDeleteCourse,
  useCreateGroup,
} from "../../../../hooks/admin/useAdmin";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Users,
  Tag,
  Edit,
  Trash2,
  Layers,
  CheckCircle2,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
} from "lucide-react";
import CourseFormModal from "../../components/CourseFormModal";
import GroupFormModal from "../../components/GroupFormModal";
import type {
  UpdateCoursePayload,
  CreateGroupPayload,
  Level,
} from "../../../../types/Types";
import { toast } from "sonner";

const LEVELS: readonly Level[] = ["A1", "A2", "B1", "B2", "C1"];

const LEVEL_COLORS: Record<Level, string> = {
  A1: "from-green-500 to-emerald-600",
  A2: "from-blue-500 to-cyan-600",
  B1: "from-purple-500 to-indigo-600",
  B2: "from-orange-500 to-amber-600",
  C1: "from-red-500 to-rose-600",
};

const LEVEL_BG_COLORS: Record<Level, string> = {
  A1: "bg-green-50",
  A2: "bg-blue-50",
  B1: "bg-purple-50",
  B2: "bg-orange-50",
  C1: "bg-red-50",
};

const LEVEL_BORDER_COLORS: Record<Level, string> = {
  A1: "border-green-200",
  A2: "border-blue-200",
  B1: "border-purple-200",
  B2: "border-orange-200",
  C1: "border-red-200",
};

const CourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useAdminCourse(courseId!);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createGroup = useCreateGroup();

  const getStudentCount = (group: any): number => {
    // Try current_capacity first (most common field from API)
    if (group.current_capacity !== undefined) {
      return group.current_capacity;
    }

    // Try students array
    if (group.students && Array.isArray(group.students)) {
      return group.students.length;
    }

    // Try enrollments array
    if (group.enrollments && Array.isArray(group.enrollments)) {
      return group.enrollments.filter(
        (e: any) =>
          e.registration_status === "VALIDATED" ||
          e.registration_status === "PAID" ||
          e.registration_status === "FINISHED",
      ).length;
    }

    if (group._count?.enrollments !== undefined)
      return group._count.enrollments;
    if (group._count?.students !== undefined) return group._count.students;

    return 0;
  };

  const [editOpen, setEditOpen] = useState(false);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());

  if (isLoading) return <PageLoader />;

  if (!course || !course.course_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Course not found
          </h2>
          <p className="text-gray-600">
            The course you're looking for doesn't exist.
          </p>
          <Link to="/admin/courses">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ FIX: Group courses by level (use correct field names)
  const groupsByLevel =
    course.groups?.reduce(
      (acc, group) => {
        if (!acc[group.level]) {
          acc[group.level] = [];
        }
        acc[group.level].push(group);
        return acc;
      },
      {} as Record<Level, typeof course.groups>,
    ) || {};

  const handleCreateGroup = (level: Level) => {
    setSelectedLevel(level);
    setGroupFormOpen(true);
  };

  const handleGroupSubmit = async (payload: CreateGroupPayload) => {
    try {
      await createGroup.mutateAsync(payload);
      setGroupFormOpen(false);
      setSelectedLevel(null);
      toast.success("Group created successfully!");
    } catch (error) {
      toast.error("Failed to create group");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${course.course_name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteCourse.mutateAsync(course.course_id);
      toast.success("Course deleted successfully!");
      navigate("/admin/courses");
    } catch (error) {
      toast.error("Failed to delete course");
      console.error(error);
    }
  };

  const handleUpdate = async (payload: UpdateCoursePayload) => {
    try {
      await updateCourse.mutateAsync({
        courseId: course.course_id,
        payload,
      });
      setEditOpen(false);
      toast.success("Course updated successfully!");
    } catch (error) {
      toast.error("Failed to update course");
      console.error(error);
    }
  };

  const toggleLevel = (level: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const totalGroups = course.groups?.length || 0;
  const groupsWithTeachers =
    course.groups?.filter((g) => g.teacher_id)?.length || 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link to="/admin/courses">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {course.course_name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Course ID: {course.course_id.slice(0, 8)}
                </p>
                {course.course_code && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {course.course_code}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {course.credits !== null && course.credits !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Credits</p>
                <p className="text-3xl font-bold text-teal-600">
                  {course.credits}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Groups Section */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-600" />
                Course Groups by Level
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Create and manage multiple groups for each proficiency level
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Groups</p>
              <p className="text-2xl font-bold text-gray-900">{totalGroups}</p>
            </div>
          </div>

          {/* Groups by Level */}
          <div className="space-y-3">
            {LEVELS.map((level) => {
              const levelGroups = groupsByLevel[level] || [];
              const isExpanded = expandedLevels.has(level);
              const isCreating =
                createGroup.isPending && selectedLevel === level;

              return (
                <div
                  key={level}
                  className={`rounded-lg border-2 overflow-hidden transition-all ${LEVEL_BORDER_COLORS[level]} ${LEVEL_BG_COLORS[level]}`}
                >
                  {/* Level Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 transition-colors"
                    onClick={() => toggleLevel(level)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-br ${LEVEL_COLORS[level]} text-white shadow-md`}
                      >
                        {level}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Level {level}
                        </p>
                        <p className="text-sm text-gray-600">
                          {levelGroups.length} group(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateGroup(level);
                        }}
                        disabled={isCreating}
                        className="gap-1.5 h-8 text-xs bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Add Group
                          </>
                        )}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Groups List */}
                  {isExpanded && (
                    <div className="bg-white border-t border-gray-200">
                      {levelGroups.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                          {levelGroups.map((group, index) => {
                            // ✅ FIX: Use _count.students instead of current_capacity
                            const currentCapacity = getStudentCount(group);
                            const maxStudents = group.max_students || 25;

                            return (
                              <div
                                key={group.group_id}
                                className="p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      {/* ✅ FIX: Use 'name' instead of 'group_name' */}
                                      <p className="font-medium text-gray-900">
                                        {group.name}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                          <Users className="w-4 h-4" />
                                          <span className="font-semibold">
                                            {currentCapacity}
                                          </span>
                                          <span className="text-gray-400">
                                            /
                                          </span>
                                          <span className="font-semibold">
                                            {maxStudents}
                                          </span>
                                          <span>students</span>
                                        </div>

                                        {/* Teacher Status */}
                                        <div className="flex items-center gap-1 text-sm">
                                          {group.teacher_id ? (
                                            <>
                                              <UserCheck className="w-4 h-4 text-green-600" />
                                              <span className="text-green-700 font-medium">
                                                Teacher assigned
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <UserX className="w-4 h-4 text-amber-600" />
                                              <span className="text-amber-700 font-medium">
                                                No teacher
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    asChild
                                    size="sm"
                                    variant="outline"
                                    className="gap-2"
                                  >
                                    <Link
                                      to={`/admin/groups/${group.group_id}`}
                                    >
                                      View Details
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-sm">
                            No groups created for this level yet
                          </p>
                          <p className="text-xs mt-1">
                            Click "Add Group" to create the first group
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {Object.keys(groupsByLevel).length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-900">
                    {LEVELS.length}
                  </span>{" "}
                  levels
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {totalGroups}
                  </span>{" "}
                  total groups
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {groupsWithTeachers}
                  </span>{" "}
                  with teachers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 text-xs">
                  Click level to expand/collapse
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Course Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Course Name</p>
                <p className="text-base text-gray-900 mt-1">
                  {course.course_name}
                </p>
              </div>
            </div>

            {/* Course Code */}
            {course.course_code && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    Course Code
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.course_code}
                  </p>
                </div>
              </div>
            )}

            {/* Credits */}
            {course.credits !== null && course.credits !== undefined && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Credit Hours
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.credits}
                  </p>
                </div>
              </div>
            )}

            {/* Total Groups */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Total Groups
                </p>
                <p className="text-base text-gray-900 mt-1">{totalGroups}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Manage course information, groups, and curriculum
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Course
              </Button>

              <Button
                variant="destructive"
                className="gap-2"
                onClick={handleDelete}
                disabled={deleteCourse.isPending}
              >
                <Trash2 className="w-4 h-4" />
                {deleteCourse.isPending ? "Deleting..." : "Delete Course"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Course Modal */}
      <CourseFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        isSubmitting={updateCourse.isPending}
        initialData={{
          course_name: course.course_name,
          course_code: course.course_code || undefined,
          credits: course.credits || undefined,
        }}
        mode="edit"
      />

      {/* Create Group Modal */}
      <GroupFormModal
        open={groupFormOpen}
        onClose={() => {
          setGroupFormOpen(false);
          setSelectedLevel(null);
        }}
        onSubmit={handleGroupSubmit}
        isSubmitting={createGroup.isPending}
        initialData={
          selectedLevel
            ? {
                name: `${course.course_name} - ${selectedLevel}`,
                level: selectedLevel,
                course_id: course.course_id,
                max_students: 20,
              }
            : undefined
        }
        mode="create"
      />
    </div>
  );
};

export default CourseDetailsPage;
