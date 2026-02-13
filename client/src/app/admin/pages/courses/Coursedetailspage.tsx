import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  ExternalLink,
} from "lucide-react";
import CourseFormModal from "../../components/CourseFormModal";
import GroupFormModal from "../../components/GroupFormModal";
import type {
  UpdateCoursePayload,
  CreateGroupPayload,
  Level,
} from "../../../../types/Types";
import { toast } from "sonner";
import { DEFAULT_LANG } from "../../../../i18n/i18n";

const LEVELS: readonly Level[] = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_COLORS: Record<Level, string> = {
  A1: "from-[#8DB896] to-[#2B6F5E]",
  A2: "from-[#2B6F5E] to-[#2B6F5E]/80",
  B1: "from-[#C4A035] to-[#C4A035]/80",
  B2: "from-[#BEB29E] to-[#6B5D4F]",
  C1: "from-[#1B1B1B] to-[#1B1B1B]/80",
};
const LEVEL_BG_COLORS: Record<Level, string> = {
  A1: "bg-[#8DB896]/8",
  A2: "bg-[#2B6F5E]/5",
  B1: "bg-[#C4A035]/5",
  B2: "bg-[#D8CDC0]/15",
  C1: "bg-[#1B1B1B]/3",
};
const LEVEL_BORDER_COLORS: Record<Level, string> = {
  A1: "border-[#8DB896]/30",
  A2: "border-[#2B6F5E]/20",
  B1: "border-[#C4A035]/20",
  B2: "border-[#D8CDC0]/50",
  C1: "border-[#1B1B1B]/15",
};

const CourseDetailsPage = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useAdminCourse(courseId!);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createGroup = useCreateGroup();

  const getStudentCount = (group: any): number => {
    if (group.current_capacity !== undefined) return group.current_capacity;
    if (group.students && Array.isArray(group.students))
      return group.students.length;
    if (group.enrollments && Array.isArray(group.enrollments))
      return group.enrollments.filter(
        (e: any) =>
          e.registration_status === "VALIDATED" ||
          e.registration_status === "PAID" ||
          e.registration_status === "FINISHED",
      ).length;
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
        <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-[#D8CDC0]/60">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#D8CDC0]/20 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#BEB29E]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1B1B1B]">
            {t("admin.courseDetails.courseNotFound")}
          </h2>
          <p className="text-[#6B5D4F]">
            {t("admin.courseDetails.courseNotFoundDesc")}
          </p>
          <Link to="/admin/courses">
            <Button
              variant="outline"
              className="border-[#D8CDC0]/60 hover:bg-[#D8CDC0]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("admin.courseDetails.backToCourses")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const groupsByLevel =
    course.groups?.reduce(
      (acc, group) => {
        if (!acc[group.level]) acc[group.level] = [];
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
      toast.success(t("admin.courseDetails.groupCreated"));
    } catch (error) {
      toast.error(t("admin.courseDetails.groupCreateFailed"));
    }
  };
  const handleDelete = async () => {
    if (
      !window.confirm(
        t("admin.courses.deleteConfirm", { name: course.course_name }),
      )
    )
      return;
    try {
      await deleteCourse.mutateAsync(course.course_id);
      toast.success(t("admin.courseDetails.courseDeleted"));
      navigate("/admin/courses");
    } catch (error) {
      toast.error(t("admin.courseDetails.courseDeleteFailed"));
    }
  };
  const handleUpdate = async (payload: UpdateCoursePayload) => {
    try {
      await updateCourse.mutateAsync({ courseId: course.course_id, payload });
      setEditOpen(false);
      toast.success(t("admin.courseDetails.courseUpdated"));
    } catch (error) {
      toast.error(t("admin.courseDetails.courseUpdateFailed"));
    }
  };
  const toggleLevel = (level: string) => {
    const n = new Set(expandedLevels);
    if (n.has(level)) n.delete(level);
    else n.add(level);
    setExpandedLevels(n);
  };

  const totalGroups = course.groups?.length || 0;
  const groupsWithTeachers =
    course.groups?.filter((g) => g.teacher_id)?.length || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/admin/courses">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#6B5D4F] hover:bg-[#D8CDC0]/15 hover:text-[#1B1B1B]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.courseDetails.backToCourses")}
          </Button>
        </Link>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 border-[#2B6F5E]/30 text-[#2B6F5E] hover:bg-[#2B6F5E]/8"
        >
          <Link
            to={`/${DEFAULT_LANG}/courses/${course.course_id}`}
            target="_blank"
          >
            <ExternalLink className="w-4 h-4" />
            {t("admin.courseDetails.viewPublicPage")}
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2B6F5E]/5 to-[#C4A035]/5 px-6 py-8 border-b border-[#D8CDC0]/40">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center text-white shadow-xl shadow-[#2B6F5E]/20">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1B1B1B]">
                  {course.course_name}
                </h1>
                <p className="text-sm text-[#6B5D4F] mt-1">
                  {t("admin.courseDetails.courseId", {
                    id: course.course_id.slice(0, 8),
                  })}
                </p>
                {course.course_code && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#C4A035]/10 text-[#C4A035] border border-[#C4A035]/20">
                      <Tag className="w-3 h-3 mr-1" />
                      {course.course_code}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {course.credits !== null && course.credits !== undefined && (
              <div className="text-right">
                <p className="text-sm text-[#6B5D4F]">
                  {t("admin.courseDetails.credits")}
                </p>
                <p className="text-3xl font-bold text-[#2B6F5E]">
                  {course.credits}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Groups Section */}
        <div className="border-b border-[#D8CDC0]/40 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C4A035]" />
                {t("admin.courseDetails.groupsByLevel")}
              </h2>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.courseDetails.groupsByLevelDesc")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B5D4F]">
                {t("admin.courseDetails.totalGroups")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">{totalGroups}</p>
            </div>
          </div>

          <div className="space-y-3">
            {LEVELS.map((level) => {
              const levelGroups = groupsByLevel[level] || [];
              const isExpanded = expandedLevels.has(level);
              const isCreating =
                createGroup.isPending && selectedLevel === level;
              return (
                <div
                  key={level}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${LEVEL_BORDER_COLORS[level]} ${LEVEL_BG_COLORS[level]}`}
                >
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
                        <p className="font-semibold text-[#1B1B1B]">
                          {t("admin.courseDetails.level", { level })}
                        </p>
                        <p className="text-sm text-[#6B5D4F]">
                          {t("admin.courseDetails.groupCount", {
                            count: levelGroups.length,
                          })}
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
                        className="gap-1.5 h-8 text-xs bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            {t("admin.courseDetails.creating")}
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />{" "}
                            {t("admin.courseDetails.addGroup")}
                          </>
                        )}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#BEB29E]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#BEB29E]" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-white border-t border-[#D8CDC0]/30">
                      {levelGroups.length > 0 ? (
                        <div className="divide-y divide-[#D8CDC0]/30">
                          {levelGroups.map((group, index) => {
                            const currentCapacity = getStudentCount(group);
                            const maxStudents = group.max_students || 25;
                            return (
                              <div
                                key={group.group_id}
                                className="p-4 hover:bg-[#D8CDC0]/8 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D8CDC0]/20 text-[#6B5D4F] font-semibold text-sm">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-[#1B1B1B]">
                                        {group.name}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                                        <div className="flex items-center gap-1 text-sm text-[#6B5D4F]">
                                          <Users className="w-4 h-4 text-[#BEB29E]" />
                                          <span className="font-semibold text-[#1B1B1B]">
                                            {currentCapacity}
                                          </span>
                                          <span className="text-[#BEB29E]">
                                            /
                                          </span>
                                          <span className="font-semibold text-[#1B1B1B]">
                                            {maxStudents}
                                          </span>
                                          <span>
                                            {t("admin.courseDetails.students")}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm">
                                          {group.teacher_id ? (
                                            <>
                                              <UserCheck className="w-4 h-4 text-[#2B6F5E]" />
                                              <span className="text-[#2B6F5E] font-medium">
                                                {t(
                                                  "admin.courseDetails.teacherAssigned",
                                                )}
                                              </span>
                                            </>
                                          ) : (
                                            <>
                                              <UserX className="w-4 h-4 text-[#C4A035]" />
                                              <span className="text-[#C4A035] font-medium">
                                                {t(
                                                  "admin.courseDetails.noTeacher",
                                                )}
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
                                    className="gap-2 border-[#2B6F5E]/30 text-[#2B6F5E] hover:bg-[#2B6F5E]/8"
                                  >
                                    <Link
                                      to={`/admin/groups/${group.group_id}`}
                                    >
                                      {t("admin.courseDetails.viewDetails")}
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-[#BEB29E]">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                          <p className="text-sm">
                            {t("admin.courseDetails.noGroupsYet")}
                          </p>
                          <p className="text-xs mt-1">
                            {t("admin.courseDetails.noGroupsHint")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-[#D8CDC0]/30">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#BEB29E]" />
                <span className="text-[#6B5D4F]">
                  <span className="font-semibold text-[#1B1B1B]">
                    {Object.keys(groupsByLevel).length}
                  </span>{" "}
                  {t("admin.courseDetails.levelsOf")}{" "}
                  <span className="font-semibold text-[#1B1B1B]">
                    {LEVELS.length}
                  </span>{" "}
                  {t("admin.courseDetails.levels")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#BEB29E]" />
                <span className="text-[#6B5D4F]">
                  <span className="font-semibold text-[#1B1B1B]">
                    {totalGroups}
                  </span>{" "}
                  {t("admin.courseDetails.totalGroupsLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2B6F5E]" />
                <span className="text-[#6B5D4F]">
                  <span className="font-semibold text-[#1B1B1B]">
                    {groupsWithTeachers}
                  </span>{" "}
                  {t("admin.courseDetails.withTeachers")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#BEB29E]" />
                <span className="text-[#BEB29E] text-xs">
                  {t("admin.courseDetails.clickToExpand")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#1B1B1B] mb-4">
            {t("admin.courseDetails.courseInfo")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B6F5E]/8 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#2B6F5E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#6B5D4F]">
                  {t("admin.courseDetails.courseName")}
                </p>
                <p className="text-base text-[#1B1B1B] mt-1">
                  {course.course_name}
                </p>
              </div>
            </div>
            {course.course_code && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C4A035]/8 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-[#C4A035]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#6B5D4F]">
                    {t("admin.courseDetails.courseCode")}
                  </p>
                  <p className="text-base text-[#1B1B1B] mt-1">
                    {course.course_code}
                  </p>
                </div>
              </div>
            )}
            {course.credits !== null && course.credits !== undefined && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8DB896]/12 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#3D7A4A]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#6B5D4F]">
                    {t("admin.courseDetails.creditHours")}
                  </p>
                  <p className="text-base text-[#1B1B1B] mt-1">
                    {course.credits}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D8CDC0]/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#6B5D4F]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#6B5D4F]">
                  {t("admin.courseDetails.totalGroups")}
                </p>
                <p className="text-base text-[#1B1B1B] mt-1">{totalGroups}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#D8CDC0]/10 px-6 py-4 border-t border-[#D8CDC0]/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-[#6B5D4F]">
              {t("admin.courseDetails.manageDesc")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 border-[#D8CDC0]/60 text-[#1B1B1B] hover:bg-[#C4A035]/8 hover:border-[#C4A035]/40 hover:text-[#C4A035]"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="w-4 h-4" />
                {t("admin.courseDetails.editCourse")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={handleDelete}
                disabled={deleteCourse.isPending}
              >
                <Trash2 className="w-4 h-4" />
                {deleteCourse.isPending
                  ? t("admin.courses.deleting")
                  : t("admin.courseDetails.deleteCourse")}
              </Button>
            </div>
          </div>
        </div>
      </div>

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
