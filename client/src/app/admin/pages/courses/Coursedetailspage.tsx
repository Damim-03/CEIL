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
  useDeleteGroup,
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
  Zap,
  Clock,
} from "lucide-react";
import CourseFormModal from "../../components/CourseFormModal";
import GroupFormModal from "../../components/GroupFormModal";
import type {
  UpdateCoursePayload,
  CreateGroupPayload,
  Level,
  UpdateGroupPayload,
} from "../../../../types/Types";
import { toast } from "sonner";
import { DEFAULT_LANG } from "../../../../i18n/i18n";

const LEVELS: readonly Level[] = ["PRE_A1", "A1", "A2", "B1", "B2", "C1"];

const LEVEL_COLORS: Record<Level, string> = {
  PRE_A1: "from-[#7C8FA6] to-[#4A6178]",
  A1: "from-[#8DB896] to-[#2B6F5E]",
  A2: "from-[#2B6F5E] to-[#2B6F5E]/80",
  B1: "from-[#C4A035] to-[#C4A035]/80",
  B2: "from-[#BEB29E] to-[#6B5D4F]",
  C1: "from-[#1B1B1B] to-[#1B1B1B]/80",
};

const LEVEL_BG_COLORS: Record<Level, string> = {
  PRE_A1: "bg-[#7C8FA6]/8 dark:bg-[#94A3B8]/5",
  A1: "bg-[#8DB896]/8 dark:bg-[#8DB896]/5",
  A2: "bg-[#2B6F5E]/5 dark:bg-[#2B6F5E]/5",
  B1: "bg-[#C4A035]/5 dark:bg-[#C4A035]/5",
  B2: "bg-[#D8CDC0]/15 dark:bg-[#555555]/10",
  C1: "bg-[#1B1B1B]/3 dark:bg-[#E5E5E5]/3",
};

const LEVEL_BORDER_COLORS: Record<Level, string> = {
  PRE_A1: "border-[#7C8FA6]/30 dark:border-[#94A3B8]/20",
  A1: "border-[#8DB896]/30 dark:border-[#8DB896]/20",
  A2: "border-[#2B6F5E]/20 dark:border-[#2B6F5E]/15",
  B1: "border-[#C4A035]/20 dark:border-[#C4A035]/15",
  B2: "border-[#D8CDC0]/50 dark:border-[#555555]/30",
  C1: "border-[#1B1B1B]/15 dark:border-[#E5E5E5]/10",
};

const CourseDetailsPage = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useAdminCourse(courseId!);
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();
  const createGroup = useCreateGroup();
  const deleteGroup = useDeleteGroup();

  const getStudentCount = (group: {
    current_capacity?: number;
    students?: unknown[];
    enrollments?: { registration_status: string }[];
    _count?: { enrollments?: number; students?: number };
  }): number => {
    if (group.current_capacity !== undefined) return group.current_capacity;
    if (group.students && Array.isArray(group.students))
      return group.students.length;
    if (group.enrollments && Array.isArray(group.enrollments))
      return group.enrollments.filter(
        (e: { registration_status: string }) =>
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
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4 p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige/60 dark:border-[#2A2A2A]">
          <div className="w-16 h-16 mx-auto rounded-full bg-brand-beige/20 dark:bg-[#2A2A2A] flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-brand-brown dark:text-[#666666]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("admin.courseDetails.courseNotFound")}
          </h2>
          <p className="text-[#6B5D4F] dark:text-[#AAAAAA]">
            {t("admin.courseDetails.courseNotFoundDesc")}
          </p>
          <Link to="/admin/courses">
            <Button
              variant="outline"
              className="border-brand-beige/60 dark:border-[#2A2A2A] dark:text-[#E5E5E5] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222]"
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
      (acc: Record<string, typeof course.groups>, group) => {
        if (!acc[group.level]) acc[group.level] = [];
        acc[group.level].push(group);
        return acc;
      },
      {} as Record<string, typeof course.groups>,
    ) || ({} as Record<string, typeof course.groups>);

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
    } catch {
      toast.error(t("admin.courseDetails.groupCreateFailed"));
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (
      !window.confirm(
        t("admin.courseDetails.deleteGroupConfirm", { name: groupName }),
      )
    )
      return;
    try {
      await deleteGroup.mutateAsync(groupId);
      toast.success(
        t("admin.courseDetails.groupDeleted", "تم حذف الفوج بنجاح"),
      );
    } catch {
      toast.error(t("admin.courseDetails.groupDeleteFailed", "فشل حذف الفوج"));
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
    } catch {
      toast.error(t("admin.courseDetails.courseDeleteFailed"));
    }
  };
  const handleUpdate = async (payload: UpdateCoursePayload) => {
    try {
      await updateCourse.mutateAsync({
        courseId: course.course_id,
        payload: {
          course_name: payload.course_name ?? course.course_name,
          course_code: payload.course_code,
          credits: payload.credits,
          course_type: payload.course_type,
          session_duration: payload.session_duration,
        },
      });
      setEditOpen(false);
      toast.success(t("admin.courseDetails.courseUpdated"));
    } catch {
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
            className="gap-2 text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/15 dark:hover:bg-[#222222] hover:text-[#1B1B1B] dark:hover:text-[#E5E5E5]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.courseDetails.backToCourses")}
          </Button>
        </Link>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2 border-[#2B6F5E]/30 dark:border-[#4ADE80]/20 text-[#2B6F5E] dark:text-[#4ADE80] hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/10"
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

      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#2B6F5E]/5 dark:from-[#2B6F5E]/10 to-[#C4A035]/5 dark:to-[#C4A035]/10 px-6 py-8 border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A]">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center text-white shadow-xl shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {course.course_name}
                  </h1>
                  {(course as any).course_type === "INTENSIVE" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40 shadow-sm">
                      <Zap className="w-4 h-4" />
                      مكثف
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/15 text-[#2B6F5E] dark:text-[#4ADE80] border border-[#2B6F5E]/20 dark:border-[#2B6F5E]/25">
                      <BookOpen className="w-4 h-4" />
                      عادي
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888] mt-1">
                  {t("admin.courseDetails.courseId", {
                    id: course.course_id.slice(0, 8),
                  })}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {course.course_code && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[#C4A035]/10 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843] border border-[#C4A035]/20 dark:border-[#D4A843]/15">
                      <Tag className="w-3 h-3 mr-1" />
                      {course.course_code}
                    </span>
                  )}
                  {(course as any).session_duration && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] border border-[#D8CDC0]/40 dark:border-[#333333]">
                      <Clock className="w-3 h-3" />
                      {Math.floor((course as any).session_duration / 60) > 0
                        ? `${Math.floor((course as any).session_duration / 60)}س${(course as any).session_duration % 60 > 0 ? ` ${(course as any).session_duration % 60}د` : ""}`
                        : `${(course as any).session_duration}د`}{" "}
                      / حصة
                    </span>
                  )}
                </div>
              </div>
            </div>
            {course.credits !== null && course.credits !== undefined && (
              <div className="text-right">
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  {t("admin.courseDetails.credits")}
                </p>
                <p className="text-3xl font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                  {course.credits}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Groups Section */}
        <div className="border-b border-[#D8CDC0]/40 dark:border-[#2A2A2A] px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C4A035]" />
                {t("admin.courseDetails.groupsByLevel")}
              </h2>
              <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
                {t("admin.courseDetails.groupsByLevelDesc")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                {t("admin.courseDetails.totalGroups")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {totalGroups}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {LEVELS.map((level) => {
              const levelGroups = (groupsByLevel[level] || []) as NonNullable<
                typeof course.groups
              >;
              const isExpanded = expandedLevels.has(level);
              const isCreating =
                createGroup.isPending && selectedLevel === level;
              return (
                <div
                  key={level}
                  className={`rounded-xl border-2 overflow-hidden transition-all ${LEVEL_BORDER_COLORS[level]} ${LEVEL_BG_COLORS[level]}`}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
                    onClick={() => toggleLevel(level)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-br ${LEVEL_COLORS[level]} text-white shadow-md`}
                      >
                        {level}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {t("admin.courseDetails.level", { level })}
                        </p>
                        <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
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
                        <ChevronUp className="w-5 h-5 text-[#BEB29E] dark:text-[#666666]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#BEB29E] dark:text-[#666666]" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-white dark:bg-[#1A1A1A] border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                      {levelGroups.length > 0 ? (
                        <div className="divide-y divide-[#D8CDC0]/30 dark:divide-[#2A2A2A]">
                          {levelGroups.map(
                            (
                              group: (typeof course.groups)[number],
                              index: number,
                            ) => {
                              const currentCapacity = getStudentCount(group);
                              const maxStudents = group.max_students || 25;
                              return (
                                <div
                                  key={group.group_id}
                                  className="p-4 hover:bg-[#D8CDC0]/8 dark:hover:bg-[#222222] transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#AAAAAA] font-semibold text-sm">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                                          {group.name}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                                          <div className="flex items-center gap-1 text-sm text-[#6B5D4F] dark:text-[#888888]">
                                            <Users className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                                            <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                                              {currentCapacity}
                                            </span>
                                            <span className="text-[#BEB29E] dark:text-[#666666]">
                                              /
                                            </span>
                                            <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                                              {maxStudents}
                                            </span>
                                            <span>
                                              {t(
                                                "admin.courseDetails.students",
                                              )}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 text-sm">
                                            {group.teacher_id ? (
                                              <>
                                                <UserCheck className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                                                <span className="text-[#2B6F5E] dark:text-[#4ADE80] font-medium">
                                                  {t(
                                                    "admin.courseDetails.teacherAssigned",
                                                  )}
                                                </span>
                                              </>
                                            ) : (
                                              <>
                                                <UserX className="w-4 h-4 text-[#C4A035] dark:text-[#D4A843]" />
                                                <span className="text-[#C4A035] dark:text-[#D4A843] font-medium">
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
                                    <div className="flex items-center gap-2">
                                      <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="gap-2 border-[#2B6F5E]/30 dark:border-[#4ADE80]/20 text-[#2B6F5E] dark:text-[#4ADE80] hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/10"
                                      >
                                        <Link
                                          to={`/admin/groups/${group.group_id}`}
                                        >
                                          {t("admin.courseDetails.viewDetails")}
                                        </Link>
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleDeleteGroup(
                                            group.group_id,
                                            group.name,
                                          )
                                        }
                                        disabled={deleteGroup.isPending}
                                        className="gap-1.5 border-red-200 dark:border-red-800/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700/50"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-[#BEB29E] dark:text-[#666666]">
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

          <div className="mt-4 pt-4 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                <span className="text-[#6B5D4F] dark:text-[#888888]">
                  <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {Object.keys(groupsByLevel).length}
                  </span>{" "}
                  {t("admin.courseDetails.levelsOf")}{" "}
                  <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {LEVELS.length}
                  </span>{" "}
                  {t("admin.courseDetails.levels")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                <span className="text-[#6B5D4F] dark:text-[#888888]">
                  <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {totalGroups}
                  </span>{" "}
                  {t("admin.courseDetails.totalGroupsLabel")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
                <span className="text-[#6B5D4F] dark:text-[#888888]">
                  <span className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {groupsWithTeachers}
                  </span>{" "}
                  {t("admin.courseDetails.withTeachers")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                <span className="text-[#BEB29E] dark:text-[#666666] text-xs">
                  {t("admin.courseDetails.clickToExpand")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-4">
            {t("admin.courseDetails.courseInfo")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
                  {t("admin.courseDetails.courseName")}
                </p>
                <p className="text-base text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
                  {course.course_name}
                </p>
              </div>
            </div>
            {course.course_code && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C4A035]/8 dark:bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
                    {t("admin.courseDetails.courseCode")}
                  </p>
                  <p className="text-base text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
                    {course.course_code}
                  </p>
                </div>
              </div>
            )}
            {course.credits !== null && course.credits !== undefined && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8DB896]/12 dark:bg-[#8DB896]/10 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-[#3D7A4A] dark:text-[#8DB896]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
                    {t("admin.courseDetails.creditHours")}
                  </p>
                  <p className="text-base text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
                    {course.credits}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D8CDC0]/20 dark:bg-[#555555]/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#6B5D4F] dark:text-[#AAAAAA]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
                  {t("admin.courseDetails.totalGroups")}
                </p>
                <p className="text-base text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
                  {totalGroups}
                </p>
              </div>
            </div>

            {/* نوع الدورة */}
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  (course as any).course_type === "INTENSIVE"
                    ? "bg-amber-50 dark:bg-amber-900/20"
                    : "bg-[#2B6F5E]/8 dark:bg-[#2B6F5E]/10"
                }`}
              >
                {(course as any).course_type === "INTENSIVE" ? (
                  <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                ) : (
                  <BookOpen className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
                  نوع الدورة
                </p>
                <p
                  className={`text-base font-semibold mt-1 ${
                    (course as any).course_type === "INTENSIVE"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-[#2B6F5E] dark:text-[#4ADE80]"
                  }`}
                >
                  {(course as any).course_type === "INTENSIVE"
                    ? "مكثفة ⚡"
                    : "عادية"}
                </p>
              </div>
            </div>

            {/* مدة الحصة */}
            {(course as any).session_duration && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#6B5D4F] dark:text-[#AAAAAA]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
                    مدة الحصة
                  </p>
                  <p className="text-base text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
                    {Math.floor((course as any).session_duration / 60) > 0
                      ? `${Math.floor((course as any).session_duration / 60)} ساعة${
                          (course as any).session_duration % 60 > 0
                            ? ` و${(course as any).session_duration % 60} دقيقة`
                            : ""
                        }`
                      : `${(course as any).session_duration} دقيقة`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#D8CDC0]/10 dark:bg-[#0F0F0F] px-6 py-4 border-t border-[#D8CDC0]/40 dark:border-[#2A2A2A]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
              {t("admin.courseDetails.manageDesc")}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] text-[#1B1B1B] dark:text-[#E5E5E5] hover:bg-[#C4A035]/8 dark:hover:bg-[#C4A035]/10 hover:border-[#C4A035]/40 dark:hover:border-[#C4A035]/30 hover:text-[#C4A035] dark:hover:text-[#D4A843]"
                onClick={() => setEditOpen(true)}
              >
                <Edit className="w-4 h-4" />
                {t("admin.courseDetails.editCourse")}
              </Button>
              <Button
                variant="outline"
                className="gap-2 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700/50"
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
          course_type: (course as any).course_type ?? "NORMAL",
          session_duration: (course as any).session_duration ?? undefined,
        }}
        mode="edit"
      />
      <GroupFormModal
        open={groupFormOpen}
        onClose={() => {
          setGroupFormOpen(false);
          setSelectedLevel(null);
        }}
        onSubmit={
          handleGroupSubmit as (
            data: CreateGroupPayload | UpdateGroupPayload,
          ) => void
        }
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
