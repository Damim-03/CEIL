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

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { weekday: "short", month: "short", day: "numeric" });

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });

const isPast = (d: string) => new Date(d) < new Date();

const getRelativeTime = (d: string) => {
  const now = new Date();
  const date = new Date(d);
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "غداً";
  if (diffDays > 0 && diffDays <= 7) return `بعد ${diffDays} أيام`;
  if (diffDays === -1) return "أمس";
  if (diffDays < 0 && diffDays >= -7) return `منذ ${Math.abs(diffDays)} أيام`;
  return formatDate(d);
};

const groupByCourse = (exams: ExamData[]) => {
  const map: Record<string, { course: ExamCourse; exams: ExamData[] }> = {};
  exams.forEach((e) => {
    if (!map[e.course_id]) {
      map[e.course_id] = { course: e.course, exams: [] };
    }
    map[e.course_id].exams.push(e);
  });
  return Object.values(map);
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const ExamsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-7 w-36 bg-[#D8CDC0]/30 rounded-lg" />
        <div className="h-4 w-52 bg-[#D8CDC0]/20 rounded-lg mt-2" />
      </div>
      <div className="h-10 w-32 bg-[#D8CDC0]/30 rounded-xl" />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#D8CDC0]/40 h-[76px]" />
      ))}
    </div>
    <div className="h-11 bg-white rounded-xl border border-[#D8CDC0]/40" />
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-[#D8CDC0]/40 h-[140px]" />
    ))}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   CREATE / EDIT MODAL
═══════════════════════════════════════════════════════════ */

interface ExamModalProps {
  courses: { course_id: string; course_name: string }[];
  initial?: { exam_id: string; course_id: string; exam_name: string | null; exam_date: string; max_marks: number };
  onClose: () => void;
}

const ExamModal = ({ courses, initial, onClose }: ExamModalProps) => {
  const isEdit = !!initial;
  const createMutation = useCreateExam();
  const updateMutation = useUpdateExam();

  const [courseId, setCourseId] = useState(initial?.course_id || "");
  const [examName, setExamName] = useState(initial?.exam_name || "");
  const [date, setDate] = useState(
    initial ? new Date(initial.exam_date).toISOString().slice(0, 10) : "",
  );
  const [maxMarks, setMaxMarks] = useState(initial?.max_marks?.toString() || "20");

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!isEdit && (!courseId || !date || !maxMarks)) return;
    if (isEdit && (!date || !maxMarks)) return;

    const marks = Number(maxMarks);
    if (marks <= 0) return;

    if (isEdit && initial) {
      await updateMutation.mutateAsync({
        examId: initial.exam_id,
        exam_name: examName || undefined,
        exam_date: new Date(date).toISOString(),
        max_marks: marks,
      });
    } else {
      await createMutation.mutateAsync({
        course_id: courseId,
        exam_name: examName || undefined,
        exam_date: new Date(date).toISOString(),
        max_marks: marks,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/40 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25">
          <h2 className="text-base font-semibold text-[#1B1B1B]">
            {isEdit ? "تعديل الامتحان" : "إنشاء امتحان جديد"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#D8CDC0]/20 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-[#6B5D4F]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Course */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">المادة</label>
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full h-11 pr-4 pl-8 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer"
                >
                  <option value="">اختر المادة</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">
              اسم الامتحان <span className="text-[#BEB29E] font-normal">(اختياري)</span>
            </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="مثال: الامتحان الجزئي الأول"
              className="w-full h-11 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
            />
          </div>

          {/* Date + Max marks row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">التاريخ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B5D4F] mb-1.5">الدرجة القصوى</label>
              <input
                type="number"
                min="1"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                className="w-full h-11 px-4 bg-[#FAFAF8] border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[#D8CDC0]/25 bg-[#FAFAF8]/50">
          <button onClick={onClose} className="h-10 px-5 text-sm font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-xl transition-colors">
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isEdit && (!courseId || !date || !maxMarks)) || (isEdit && (!date || !maxMarks))}
            className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {isEdit ? "حفظ" : "إنشاء"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   DELETE MODAL
═══════════════════════════════════════════════════════════ */

const DeleteExamModal = ({ examId, onClose }: { examId: string; onClose: () => void }) => {
  const deleteMutation = useDeleteExam();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(examId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/40 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">حذف الامتحان</h3>
          <p className="text-sm text-[#6B5D4F]/70">هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-4 border-t border-[#D8CDC0]/25 bg-[#FAFAF8]/50">
          <button onClick={onClose} className="flex-1 h-10 text-sm font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-xl transition-colors">
            إلغاء
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 h-10 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {deleteMutation.isPending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            حذف
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EXAM CARD
═══════════════════════════════════════════════════════════ */

const ExamCard = ({
  exam,
  onEdit,
  onDelete,
}: {
  exam: ExamData;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const past = isPast(exam.exam_date);
  const hasResults = exam._count.results > 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white border border-[#D8CDC0]/30 hover:border-[#D8CDC0]/50 hover:shadow-md transition-all group/exam">
      {/* Date box */}
      <div
        className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 ${
          past ? "bg-[#D8CDC0]/12" : "bg-[#C4A035]/8"
        }`}
      >
        <span className={`text-[11px] font-medium leading-tight ${past ? "text-[#6B5D4F]/50" : "text-[#C4A035]/70"}`}>
          {new Date(exam.exam_date).toLocaleDateString("ar-DZ", { month: "short" })}
        </span>
        <span className={`text-lg font-bold leading-tight ${past ? "text-[#6B5D4F]/70" : "text-[#C4A035]"}`}>
          {new Date(exam.exam_date).getDate()}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="text-sm font-semibold text-[#1B1B1B] truncate">
            {exam.exam_name || "امتحان"}
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            past ? "bg-[#D8CDC0]/15 text-[#6B5D4F]/60" : "bg-[#C4A035]/10 text-[#C4A035]"
          }`}>
            {getRelativeTime(exam.exam_date)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#6B5D4F]/60 flex-wrap">
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            /{exam.max_marks}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(exam.exam_date)}
          </span>
        </div>
      </div>

      {/* Results badge */}
      <div className="shrink-0">
        {hasResults ? (
          <Link
            to={`/teacher/exams`}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2B6F5E] bg-[#2B6F5E]/8 hover:bg-[#2B6F5E]/15 px-2.5 py-1.5 rounded-full transition-colors"
          >
            <ClipboardCheck className="w-3 h-3" />
            {exam._count.results} نتيجة
          </Link>
        ) : past ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C4A035] bg-[#C4A035]/8 px-2.5 py-1.5 rounded-full">
            <FileText className="w-3 h-3" />
            بدون نتائج
          </span>
        ) : (
          <span className="text-[11px] text-[#BEB29E] bg-[#D8CDC0]/10 px-2.5 py-1.5 rounded-full">
            قادم
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover/exam:opacity-100 transition-opacity shrink-0">
        {!hasResults && (
          <>
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg hover:bg-[#2B6F5E]/8 flex items-center justify-center transition-colors"
              title="تعديل"
            >
              <Pencil className="w-3.5 h-3.5 text-[#2B6F5E]" />
            </button>
            <button
              onClick={onDelete}
              className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherExams() {
  const { data: examsData, isLoading, isError } = useTeacherExams();
  const { data: groupsData } = useTeacherGroups();

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<ExamData | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);

  const allExams: ExamData[] = examsData ?? [];
  const groups: GroupOption[] = groupsData ?? [];

  /* ── Unique courses from groups ── */
  const courses = useMemo(() => {
    const map = new Map<string, { course_id: string; course_name: string }>();
    groups.forEach((g) => {
      if (!map.has(g.course_id)) {
        map.set(g.course_id, { course_id: g.course_id, course_name: g.course.course_name });
      }
    });
    return Array.from(map.values());
  }, [groups]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = allExams.length;
    const upcoming = allExams.filter((e) => !isPast(e.exam_date)).length;
    const withResults = allExams.filter((e) => e._count.results > 0).length;
    const coursesCount = new Set(allExams.map((e) => e.course_id)).size;
    return { total, upcoming, withResults, coursesCount };
  }, [allExams]);

  /* ── Filter ── */
  const filtered = useMemo(() => {
    let result = allExams;

    if (courseFilter !== "all") {
      result = result.filter((e) => e.course_id === courseFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.exam_name?.toLowerCase().includes(q) ||
          e.course.course_name.toLowerCase().includes(q) ||
          e.course.course_code?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allExams, search, courseFilter]);

  /* ── Group by course ── */
  const grouped = useMemo(() => groupByCourse(filtered), [filtered]);

  const hasFilters = search.trim() !== "" || courseFilter !== "all";

  if (isLoading) return <ExamsSkeleton />;

  if (isError) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">حدث خطأ أثناء تحميل الامتحانات</h3>
        <p className="text-sm text-[#6B5D4F]/70">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ── Modals ── */}
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
          onClose={() => { setShowModal(false); setEditExam(null); }}
        />
      )}
      {deleteExamId && (
        <DeleteExamModal examId={deleteExamId} onClose={() => setDeleteExamId(null)} />
      )}

      {/* ══════════════════════════════════════════
         HEADER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B1B1B]">الامتحانات</h1>
          <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
            إنشاء وإدارة الامتحانات وإدخال النتائج
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          امتحان جديد
        </button>
      </div>

      {/* ══════════════════════════════════════════
         STATS
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الامتحانات", value: stats.total, icon: Award, color: "teal" as const },
          { label: "قادمة", value: stats.upcoming, icon: CalendarDays, color: "gold" as const },
          { label: "بنتائج", value: stats.withResults, icon: ClipboardCheck, color: "green" as const },
          { label: "مواد", value: stats.coursesCount, icon: BookOpen, color: "beige" as const },
        ].map((stat) => {
          const colors = {
            teal: { bg: "bg-[#2B6F5E]/8", icon: "text-[#2B6F5E]", val: "text-[#2B6F5E]" },
            gold: { bg: "bg-[#C4A035]/8", icon: "text-[#C4A035]", val: "text-[#C4A035]" },
            green: { bg: "bg-[#8DB896]/12", icon: "text-[#3D7A4A]", val: "text-[#3D7A4A]" },
            beige: { bg: "bg-[#D8CDC0]/20", icon: "text-[#6B5D4F]", val: "text-[#6B5D4F]" },
          };
          const c = colors[stat.color];
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-[#D8CDC0]/40 px-4 py-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-[18px] h-[18px] ${c.icon}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-xl font-bold leading-tight ${c.val}`}>{stat.value}</p>
                <p className="text-[11px] text-[#6B5D4F]/60 truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
         SEARCH + FILTER
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو المادة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pr-10 pl-9 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#D8CDC0]/30 hover:bg-[#D8CDC0]/50 flex items-center justify-center transition-colors">
              <X className="w-3 h-3 text-[#6B5D4F]" />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] pointer-events-none" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-11 pr-10 pl-8 bg-white border border-[#D8CDC0]/50 rounded-xl text-sm text-[#1B1B1B] focus:outline-none focus:border-[#2B6F5E]/40 focus:ring-2 focus:ring-[#2B6F5E]/10 appearance-none cursor-pointer transition-all min-w-[160px]"
          >
            <option value="all">جميع المواد</option>
            {courses.map((c) => (
              <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between bg-[#2B6F5E]/5 border border-[#2B6F5E]/10 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6B5D4F]/70">النتائج:</span>
            <span className="font-semibold text-[#2B6F5E]">{filtered.length}</span>
          </div>
          <button
            onClick={() => { setSearch(""); setCourseFilter("all"); }}
            className="text-xs font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/70 flex items-center gap-1 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
            مسح
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
         EXAMS LIST (grouped by course)
      ══════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
            <Award className="w-7 h-7 text-[#BEB29E]" />
          </div>
          <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
            {allExams.length === 0 ? "لا توجد امتحانات" : "لا توجد نتائج مطابقة"}
          </h3>
          <p className="text-sm text-[#6B5D4F]/60 max-w-xs">
            {allExams.length === 0
              ? "ابدأ بإنشاء امتحان جديد"
              : "جرّب تغيير البحث أو الفلتر"}
          </p>
          {allExams.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 h-10 px-5 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              امتحان جديد
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ course, exams }) => (
            <Fragment key={course.course_id}>
              {/* Course divider */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2B6F5E] bg-[#2B6F5E]/5 border border-[#2B6F5E]/10 px-3 py-1.5 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  {course.course_name}
                  {course.course_code && (
                    <span className="font-mono text-[#BEB29E] font-normal">({course.course_code})</span>
                  )}
                </div>
                <div className="flex-1 h-px bg-[#D8CDC0]/20" />
                <span className="text-[11px] text-[#BEB29E]">
                  {exams.length} {exams.length === 1 ? "امتحان" : "امتحانات"}
                </span>
              </div>

              {/* Exams */}
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