import { useState, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CalendarDays,
  Pencil,
  Trash2,
  X,
  Check,
  ChevronDown,
  BookOpen,
  ClipboardCheck,
  FileText,
  Target,
  Clock,
} from "lucide-react";
import {
  useTeacherExams,
  useTeacherGroups,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
} from "../../../../hooks/teacher/Useteacher";
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
interface ExamCourse {
  course_id: string;
  course_name: string;
  course_code: string;
}
interface ExamData {
  exam_id: string;
  exam_name: string | null;
  exam_date: string;
  max_marks: number;
  course_id: string;
  course: ExamCourse;
  _count: { results: number };
}
interface GroupOption {
  group_id: string;
  name: string;
  course_id: string;
  course: { course_id: string; course_name: string; course_code: string };
}

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const isPast = (d: string) => new Date(d) < new Date();

const useRelativeTime = () => {
  const { t, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  return (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff === 0) return t("teacher.exams.today");
    if (diff === 1) return t("teacher.exams.tomorrow");
    if (diff > 0 && diff <= 7)
      return t("teacher.exams.inDays", { count: diff });
    if (diff === -1) return t("teacher.exams.yesterday");
    if (diff < 0 && diff >= -7)
      return t("teacher.exams.daysAgo", { count: Math.abs(diff) });
    return new Date(d).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
};

const groupByCourse = (exams: ExamData[]) => {
  const map: Record<string, { course: ExamCourse; exams: ExamData[] }> = {};
  exams.forEach((e) => {
    if (!map[e.course_id]) map[e.course_id] = { course: e.course, exams: [] };
    map[e.course_id].exams.push(e);
  });
  return Object.values(map);
};

/* ═══ SKELETON ═══ */
const ExamsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-36 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
        <div className="h-4 w-52 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
      </div>
      <div className="h-10 w-32 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[76px]"
        />
      ))}
    </div>
    <div className="h-11 bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A]" />
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[140px]"
      />
    ))}
  </div>
);

/* ═══ MODAL ═══ */
const ExamModal = ({
  courses,
  initial,
  onClose,
}: {
  courses: { course_id: string; course_name: string }[];
  initial?: {
    exam_id: string;
    course_id: string;
    exam_name: string | null;
    exam_date: string;
    max_marks: number;
  };
  onClose: () => void;
}) => {
  const { t, dir, isRTL } = useLanguage();
  const isEdit = !!initial;
  const createMut = useCreateExam();
  const updateMut = useUpdateExam();
  const [courseId, setCourseId] = useState(initial?.course_id || "");
  const [examName, setExamName] = useState(initial?.exam_name || "");
  const [date, setDate] = useState(
    initial ? new Date(initial.exam_date).toISOString().slice(0, 10) : "",
  );
  const [maxMarks, setMaxMarks] = useState(
    initial?.max_marks?.toString() || "20",
  );
  const busy = createMut.isPending || updateMut.isPending;

  const submit = async () => {
    if (!isEdit && (!courseId || !date || !maxMarks)) return;
    if (isEdit && (!date || !maxMarks)) return;
    const marks = Number(maxMarks);
    if (marks <= 0) return;
    if (isEdit && initial)
      await updateMut.mutateAsync({
        examId: initial.exam_id,
        exam_name: examName || undefined,
        exam_date: new Date(date).toISOString(),
        max_marks: marks,
      });
    else
      await createMut.mutateAsync({
        course_id: courseId,
        exam_name: examName || undefined,
        exam_date: new Date(date).toISOString(),
        max_marks: marks,
      });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
          <h2 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {isEdit
              ? t("teacher.exams.editExam")
              : t("teacher.exams.createExam")}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#6B5D4F] dark:text-[#AAAAAA]" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
                {t("teacher.exams.course")}
              </label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className={`w-full h-11 ${isRTL ? "pr-4 pl-8" : "pl-4 pr-8"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer`}
                >
                  <option value="">{t("teacher.exams.selectCourse")}</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
              {t("teacher.exams.examName")}{" "}
              <span className="text-[#BEB29E] dark:text-[#888888] font-normal">
                ({t("teacher.exams.optional")})
              </span>
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder={t("teacher.exams.examNamePlaceholder")}
              className="w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
                {t("teacher.exams.date")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1.5">
                {t("teacher.exams.maxMarks")}
              </label>
              <input
                type="number"
                min="1"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full h-11 px-4 bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D8CDC0]/2 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/70 bg-[#FAFAF8]/50 dark:bg-[#1A1A1A]/50">
          <button
            onClick={onClose}
            className="h-10 px-5 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-xl transition-colors"
          >
            {t("teacher.exams.cancel")}
          </button>
          <button
            onClick={submit}
            disabled={
              busy ||
              (!isEdit && (!courseId || !date || !maxMarks)) ||
              (isEdit && (!date || !maxMarks))
            }
            className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
          >
            {busy ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit ? t("teacher.exams.save") : t("teacher.exams.create")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ DELETE MODAL ═══ */
const DeleteExamModal = ({
  examId,
  onClose,
}: {
  examId: string;
  onClose: () => void;
}) => {
  const { t, dir } = useLanguage();
  const del = useDeleteExam();
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir={dir}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            {t("teacher.exams.deleteExam")}
          </h3>
          <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
            {t("teacher.exams.deleteConfirm")}
          </p>
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#D8CDC0]/2 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/70 bg-[#FAFAF8]/50 dark:bg-[#1A1A1A]/50">
          <button
            onClick={onClose}
            className="flex-1 h-10 text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-xl transition-colors"
          >
            {t("teacher.exams.cancel")}
          </button>
          <button
            onClick={async () => {
              await del.mutateAsync(examId);
              onClose();
            }}
            disabled={del.isPending}
            className="flex-1 h-10 text-sm font-medium text-white bg-red-50 dark:bg-red-950/200 hover:bg-red-600 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {del.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {t("teacher.exams.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══ EXAM CARD ═══ */
const ExamCard = ({
  exam,
  onEdit,
  onDelete,
}: {
  exam: ExamData;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { t, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const relTime = useRelativeTime();
  const past = isPast(exam.exam_date);
  const hasResults = exam._count.results > 0;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 hover:border-[#D8CDC0]/50 dark:border-[#2A2A2A] hover:shadow-md transition-all group/exam">
      <div
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${past ? "bg-[#D8CDC0]/12 dark:bg-[#2A2A2A]/12" : "bg-[#C4A035]/8 dark:bg-[#C4A035]/8"}`}
      >
        <span
          className={`text-[11px] font-medium leading-tight ${past ? "text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50" : "text-[#C4A035]/70 dark:text-[#C4A035]/70"}`}
        >
          {new Date(exam.exam_date).toLocaleDateString(locale, {
            month: "short",
          })}
        </span>
        <span
          className={`text-lg font-bold leading-tight ${past ? "text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70" : "text-[#C4A035] dark:text-[#C4A035]"}`}
        >
          {new Date(exam.exam_date).getDate()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
            {exam.exam_name || t("teacher.exams.exam")}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${past ? "bg-[#D8CDC0]/15 dark:bg-[#2A2A2A]/15 text-[#6B5D4F]/60 dark:text-[#AAAAAA]/60" : "bg-[#C4A035]/10 dark:bg-[#C4A035]/10 text-[#C4A035] dark:text-[#C4A035]"}`}
          >
            {relTime(exam.exam_date)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] flex-wrap">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />/{exam.max_marks}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {fmtDate(exam.exam_date)}
          </span>
        </div>
      </div>
      <div className="shrink-0">
        {hasResults ? (
          <Link
            to="/teacher/exams"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 hover:bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/15 dark:hover:bg-[#4ADE80]/15 px-2.5 py-1.5 rounded-full transition-colors"
          >
            <ClipboardCheck className="w-3 h-3" />
            {exam._count.results} {t("teacher.exams.result")}
          </Link>
        ) : past ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4A035] dark:text-[#C4A035] dark:text-[#C4A035] bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 px-2.5 py-1.5 rounded-full">
            <FileText className="w-3 h-3" />
            {t("teacher.exams.noResults")}
          </span>
        ) : (
          <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 px-2.5 py-1.5 rounded-full">
            {t("teacher.exams.upcoming")}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/exam:opacity-100 transition-opacity shrink-0">
        {!hasResults && (
          <>
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/8 flex items-center justify-center transition-colors"
              title={t("teacher.exams.edit")}
            >
              <Pencil className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg hover:bg-red-50 dark:bg-red-950/20 flex items-center justify-center transition-colors"
              title={t("teacher.exams.delete")}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherExams() {
  const { t, dir, isRTL, currentLang } = useLanguage();
  const { data: examsData, isLoading, isError } = useTeacherExams();
  const { data: groupsData } = useTeacherGroups();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<ExamData | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const allExams: ExamData[] = examsData ?? [];
  const groups: GroupOption[] = groupsData ?? [];

  const courses = useMemo(() => {
    const m = new Map<string, { course_id: string; course_name: string }>();
    groups.forEach((g) => {
      if (!m.has(g.course_id))
        m.set(g.course_id, {
          course_id: g.course_id,
          course_name: g.course.course_name,
        });
    });
    return Array.from(m.values());
  }, [groups]);
  const stats = useMemo(
    () => ({
      total: allExams.length,
      upcoming: allExams.filter((e) => !isPast(e.exam_date)).length,
      withResults: allExams.filter((e) => e._count.results > 0).length,
      coursesCount: new Set(allExams.map((e) => e.course_id)).size,
    }),
    [allExams],
  );

  const filtered = useMemo(() => {
    let r = allExams;
    if (courseFilter !== "all")
      r = r.filter((e) => e.course_id === courseFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (e) =>
          e.exam_name?.toLowerCase().includes(q) ||
          e.course.course_name.toLowerCase().includes(q) ||
          e.course.course_code?.toLowerCase().includes(q),
      );
    }
    return r;
  }, [allExams, search, courseFilter]);
  const grouped = useMemo(() => groupByCourse(filtered), [filtered]);
  const hasFilters = search.trim() !== "" || courseFilter !== "all";

  const PILL = {
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      val: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    gold: {
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/8",
      icon: "text-[#C4A035] dark:text-[#C4A035]",
      val: "text-[#C4A035] dark:text-[#C4A035]",
    },
    green: {
      bg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/12",
      icon: "text-[#3D7A4A] dark:text-[#4ADE80]",
      val: "text-[#3D7A4A] dark:text-[#4ADE80]",
    },
    beige: {
      bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20",
      icon: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      val: "text-[#6B5D4F] dark:text-[#AAAAAA]",
    },
  };

  if (isLoading) return <ExamsSkeleton rtl={isRTL} />;
  if (isError)
    return (
      <div
        dir={dir}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
          {t("teacher.exams.errorTitle")}
        </h3>
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.exams.errorDesc")}
        </p>
      </div>
    );

  return (
    <div dir={dir} className="space-y-6 pb-8">
      {(showModal || editExam) && (
        <ExamModal
          courses={courses}
          initial={
            editExam
              ? {
                  exam_id: editExam.exam_id,
                  course_id: editExam.course_id,
                  exam_name: editExam.exam_name,
                  exam_date: editExam.exam_date,
                  max_marks: editExam.max_marks,
                }
              : undefined
          }
          onClose={() => {
            setShowModal(false);
            setEditExam(null);
          }}
        />
      )}
      {deleteExamId && (
        <DeleteExamModal
          examId={deleteExamId}
          onClose={() => setDeleteExamId(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("teacher.exams.title")}
          </h1>
          <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
            {t("teacher.exams.subtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t("teacher.exams.newExam")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: t("teacher.exams.totalExams"),
            value: stats.total,
            icon: Award,
            color: "teal" as const,
          },
          {
            label: t("teacher.exams.upcoming"),
            value: stats.upcoming,
            icon: CalendarDays,
            color: "gold" as const,
          },
          {
            label: t("teacher.exams.withResults"),
            value: stats.withResults,
            icon: ClipboardCheck,
            color: "green" as const,
          },
          {
            label: t("teacher.exams.courses"),
            value: stats.coursesCount,
            icon: BookOpen,
            color: "beige" as const,
          },
        ].map((s) => {
          const c = PILL[s.color];
          return (
            <div
              key={s.label}
              className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] px-4 py-3 flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}
              >
                <s.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-tight ${c.val}`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] truncate">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <input
            type="text"
            placeholder={t("teacher.exams.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-11 ${isRTL ? "pr-10 pl-9" : "pl-10 pr-9"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 transition-all`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 hover:bg-[#D8CDC0]/5 dark:hover:bg-[#222222]0 dark:bg-[#2A2A2A]/50 flex items-center justify-center transition-colors`}
            >
              <X className="w-3 h-3 text-[#6B5D4F] dark:text-[#AAAAAA]" />
            </button>
          )}
        </div>
        <div className="relative shrink-0">
          <Filter
            className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className={`h-11 ${isRTL ? "pr-10 pl-8" : "pl-10 pr-8"} bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/5 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-xl text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/40 dark:border-[#4ADE80]/40 focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 appearance-none cursor-pointer transition-all min-w-[160px]`}
          >
            <option value="all">{t("teacher.exams.allCourses")}</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>
                {c.course_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
              {t("teacher.exams.results")}:
            </span>
            <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
              {filtered.length}
            </span>
          </div>
          <button
            onClick={() => {
              setSearch("");
              setCourseFilter("all");
            }}
            className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E] dark:hover:text-[#4ADE80]/70 dark:text-[#4ADE80]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            {t("teacher.exams.clear")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
            <Award className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
            {allExams.length === 0
              ? t("teacher.exams.noExams")
              : t("teacher.exams.noMatchResults")}
          </h3>
          <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] max-w-xs">
            {allExams.length === 0
              ? t("teacher.exams.noExamsDesc")
              : t("teacher.exams.noMatchDesc")}
          </p>
          {allExams.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("teacher.exams.newExam")}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ course, exams }) => (
            <Fragment key={course.course_id}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 px-3 py-1.5 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.course_name}
                  {course.course_code && (
                    <span className="font-mono text-[#BEB29E] dark:text-[#888888] font-normal">
                      ({course.course_code})
                    </span>
                  )}
                </div>
                <div className="flex-1 h-px bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]/20" />
                <span className="text-[11px] text-[#BEB29E] dark:text-[#888888]">
                  {exams.length}{" "}
                  {exams.length === 1
                    ? t("teacher.exams.examSingular")
                    : t("teacher.exams.examPlural")}
                </span>
              </div>
              <div className="space-y-2">
                {exams.map((exam) => (
                  <ExamCard
                    key={exam.exam_id}
                    exam={exam}
                    onEdit={() => setEditExam(exam)}
                    onDelete={() => setDeleteExamId(exam.exam_id)}
                  />
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
