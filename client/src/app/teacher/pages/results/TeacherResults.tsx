import { useState, useMemo, useCallback } from "react";
import {
  Award,
  Search,
  AlertCircle,
  Users,
  ClipboardCheck,
  Target,
  Save,
  RotateCcw,
  CheckCircle,
  TrendingUp,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  useTeacherExams,
  useExamResults,
  useAddBulkResults,
} from "../../../../hooks/teacher/Useteacher";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */

interface ExamOption {
  exam_id: string;
  exam_name: string | null;
  exam_date: string;
  max_marks: number;
  course_id: string;
  course: { course_id: string; course_name: string; course_code: string };
  _count: { results: number };
}

interface ResultStudent {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
}

interface ResultRecord {
  result_id: string;
  marks_obtained: number;
  grade: string | null;
  student: ResultStudent;
}

interface ExamResultsData {
  exam: {
    exam_id: string;
    exam_name: string | null;
    exam_date: string;
    max_marks: number;
    course: { course_id: string; course_name: string; course_code: string };
  };
  results: ResultRecord[];
  summary: {
    total: number;
    average: number;
    max_marks: number;
  };
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { weekday: "short", month: "short", day: "numeric" });

const formatFullDate = (d: string) =>
  new Date(d).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" });

const isPast = (d: string) => new Date(d) < new Date();

const getInitials = (first: string, last: string) =>
  `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();

const getScoreColor = (percent: number) => {
  if (percent >= 75) return { text: "text-[#2B6F5E]", bg: "bg-[#2B6F5E]", ring: "ring-[#2B6F5E]/20" };
  if (percent >= 50) return { text: "text-[#C4A035]", bg: "bg-[#C4A035]", ring: "ring-[#C4A035]/20" };
  return { text: "text-red-500", bg: "bg-red-500", ring: "ring-red-500/20" };
};

/* ═══════════════════════════════════════════════════════════
   SKELETON
═══════════════════════════════════════════════════════════ */

const ResultsSkeleton = () => (
  <div className="space-y-6 animate-pulse" dir="rtl">
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/20 rounded-lg mt-2" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 bg-white rounded-2xl border border-[#D8CDC0]/40 h-[400px]" />
      <div className="lg:col-span-8 bg-white rounded-2xl border border-[#D8CDC0]/40 h-[500px]" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
   AVATAR
═══════════════════════════════════════════════════════════ */

const Avatar = ({ src, first, last }: { src: string | null; first: string; last: string }) => {
  if (src) {
    return <img src={src} alt={`${first} ${last}`} className="w-9 h-9 rounded-full object-cover border-2 border-[#D8CDC0]/30" />;
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#2B6F5E]/10 border-2 border-[#D8CDC0]/30 flex items-center justify-center">
      <span className="text-xs font-semibold text-[#2B6F5E]">{getInitials(first, last)}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   EXAM SELECTOR
═══════════════════════════════════════════════════════════ */

const ExamSelector = ({
  exams,
  selectedId,
  onSelect,
}: {
  exams: ExamOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const courses = useMemo(() => {
    const map = new Map<string, string>();
    exams.forEach((e) => map.set(e.course_id, e.course.course_name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [exams]);

  const filtered = useMemo(() => {
    if (courseFilter === "all") return exams;
    return exams.filter((e) => e.course_id === courseFilter);
  }, [exams, courseFilter]);

  return (
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#C4A035]/8 flex items-center justify-center">
            <Award className="w-[18px] h-[18px] text-[#C4A035]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1B1B1B]">اختر الامتحان</h2>
            <p className="text-[11px] text-[#6B5D4F]/50">{exams.length} امتحان</p>
          </div>
        </div>
        {courses.length > 1 && (
          <div className="relative">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="h-8 pr-3 pl-6 bg-[#FAFAF8] border border-[#D8CDC0]/40 rounded-lg text-[11px] text-[#1B1B1B] focus:outline-none appearance-none cursor-pointer"
            >
              <option value="all">الكل</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="p-3 max-h-[360px] overflow-y-auto space-y-1.5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#6B5D4F]/50">لا توجد امتحانات</div>
        ) : (
          filtered.map((exam) => {
            const isSelected = exam.exam_id === selectedId;
            const past = isPast(exam.exam_date);
            const hasResults = exam._count.results > 0;

            return (
              <button
                key={exam.exam_id}
                onClick={() => onSelect(exam.exam_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                  isSelected
                    ? "bg-[#2B6F5E]/8 border border-[#2B6F5E]/20 shadow-sm"
                    : "hover:bg-[#FAFAF8] border border-transparent"
                }`}
              >
                <div className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg shrink-0 ${
                  isSelected ? "bg-[#2B6F5E]/15" : past ? "bg-[#D8CDC0]/10" : "bg-[#C4A035]/8"
                }`}>
                  <span className="text-[10px] font-medium text-[#6B5D4F]/50 leading-tight">
                    {new Date(exam.exam_date).toLocaleDateString("ar-DZ", { month: "short" })}
                  </span>
                  <span className={`text-sm font-bold leading-tight ${isSelected ? "text-[#2B6F5E]" : "text-[#1B1B1B]"}`}>
                    {new Date(exam.exam_date).getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? "text-[#2B6F5E]" : "text-[#1B1B1B]"}`}>
                    {exam.exam_name || exam.course.course_name}
                  </p>
                  <p className="text-[10px] text-[#6B5D4F]/50 truncate">
                    {exam.course.course_name} · /{exam.max_marks}
                  </p>
                </div>

                {hasResults && (
                  <span className="text-[10px] font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-2 py-0.5 rounded-full shrink-0">
                    {exam._count.results}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   RESULTS PANEL
═══════════════════════════════════════════════════════════ */

const ResultsPanel = ({ examId }: { examId: string }) => {
  const { data, isLoading, isError } = useExamResults(examId);
  const bulkMutation = useAddBulkResults();

  const [localMarks, setLocalMarks] = useState<Record<string, string>>({});
  const [localGrades, setLocalGrades] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [search, setSearch] = useState("");

  const examResults = data as ExamResultsData | undefined;

  /* ── Get effective mark ── */
  const getMark = useCallback(
    (studentId: string, serverMark?: number): string => {
      if (localMarks[studentId] !== undefined) return localMarks[studentId];
      return serverMark !== undefined ? String(serverMark) : "";
    },
    [localMarks],
  );

  const getGrade = useCallback(
    (studentId: string, serverGrade?: string | null): string => {
      if (localGrades[studentId] !== undefined) return localGrades[studentId];
      return serverGrade || "";
    },
    [localGrades],
  );

  /* ── Update mark ── */
  const updateMark = (studentId: string, value: string) => {
    setLocalMarks((prev) => ({ ...prev, [studentId]: value }));
    setHasChanges(true);
  };

  const updateGrade = (studentId: string, value: string) => {
    setLocalGrades((prev) => ({ ...prev, [studentId]: value }));
    setHasChanges(true);
  };

  /* ── Reset ── */
  const resetChanges = () => {
    setLocalMarks({});
    setLocalGrades({});
    setHasChanges(false);
  };

  /* ── Save ── */
  const handleSave = async () => {
    if (!examResults) return;

    const results: Array<{ student_id: string; marks_obtained: number; grade?: string }> = [];

    examResults.results.forEach((r) => {
      const markStr = getMark(r.student.student_id, r.marks_obtained);
      const grade = getGrade(r.student.student_id, r.grade);
      const marks = Number(markStr);

      if (!isNaN(marks) && marks >= 0 && marks <= examResults.exam.max_marks) {
        results.push({
          student_id: r.student.student_id,
          marks_obtained: marks,
          grade: grade || undefined,
        });
      }
    });

    if (results.length === 0) return;

    await bulkMutation.mutateAsync({ examId, results });
    setLocalMarks({});
    setLocalGrades({});
    setHasChanges(false);
  };

  /* ── Filter ── */
  const filteredResults = useMemo(() => {
    if (!examResults) return [];
    if (!search.trim()) return examResults.results;
    const q = search.trim().toLowerCase();
    return examResults.results.filter(
      (r) =>
        r.student.first_name.toLowerCase().includes(q) ||
        r.student.last_name.toLowerCase().includes(q),
    );
  }, [examResults, search]);

  /* ── Live summary ── */
  const liveSummary = useMemo(() => {
    if (!examResults) return { filled: 0, total: 0, avg: 0, highest: 0, lowest: 0, passRate: 0 };

    const maxM = examResults.exam.max_marks;
    let filled = 0;
    let sum = 0;
    let highest = 0;
    let lowest = maxM;
    let passCount = 0;

    examResults.results.forEach((r) => {
      const markStr = getMark(r.student.student_id, r.marks_obtained);
      const m = Number(markStr);
      if (!isNaN(m) && markStr !== "") {
        filled++;
        sum += m;
        if (m > highest) highest = m;
        if (m < lowest) lowest = m;
        if (m >= maxM * 0.5) passCount++;
      }
    });

    return {
      filled,
      total: examResults.results.length,
      avg: filled > 0 ? Math.round((sum / filled) * 100) / 100 : 0,
      highest,
      lowest: filled > 0 ? lowest : 0,
      passRate: filled > 0 ? Math.round((passCount / filled) * 100) : 0,
    };
  }, [examResults, getMark]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-8 animate-pulse">
        <div className="h-5 w-40 bg-[#D8CDC0]/30 rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#D8CDC0]/10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !examResults) {
    return (
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-[#6B5D4F]/70">تعذّر تحميل النتائج</p>
      </div>
    );
  }

  const { exam } = examResults;

  return (
    <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-[#D8CDC0]/25">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 flex items-center justify-center">
              <ClipboardCheck className="w-[18px] h-[18px] text-[#2B6F5E]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1B1B1B]">
                {exam.exam_name || "نتائج الامتحان"}
              </h2>
              <p className="text-[11px] text-[#6B5D4F]/50">
                {exam.course.course_name} · {formatFullDate(exam.exam_date)} · الدرجة القصوى: {exam.max_marks}
              </p>
            </div>
          </div>
        </div>

        {/* Live summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          {[
            { label: "تم إدخالهم", value: `${liveSummary.filled}/${liveSummary.total}`, icon: Users },
            { label: "المعدل", value: liveSummary.avg, icon: BarChart3 },
            { label: "الأعلى", value: liveSummary.highest, icon: TrendingUp },
            { label: "الأدنى", value: liveSummary.lowest, icon: Target },
            { label: "نسبة النجاح", value: `${liveSummary.passRate}%`, icon: Award },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#D8CDC0]/15 text-center">
              <p className="text-[10px] text-[#6B5D4F]/50 mb-0.5">{s.label}</p>
              <p className="text-sm font-bold text-[#1B1B1B]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#BEB29E] pointer-events-none" />
          <input
            type="text"
            placeholder="ابحث عن طالب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pr-8 pl-3 bg-[#FAFAF8] border border-[#D8CDC0]/40 rounded-lg text-xs text-[#1B1B1B] placeholder:text-[#BEB29E] focus:outline-none focus:border-[#2B6F5E]/30 transition-all"
          />
        </div>
      </div>

      {/* ── Table header ── */}
      <div className="grid grid-cols-[32px_40px_1fr_90px_70px_60px] gap-2 px-5 py-2.5 bg-[#FAFAF8]/70 border-b border-[#D8CDC0]/15 text-[10px] font-medium text-[#6B5D4F]/50 uppercase tracking-wider">
        <span></span>
        <span></span>
        <span>الطالب</span>
        <span className="text-center">الدرجة /{exam.max_marks}</span>
        <span className="text-center">التقدير</span>
        <span className="text-center">%</span>
      </div>

      {/* ── Students ── */}
      <div className="max-h-[400px] overflow-y-auto divide-y divide-[#D8CDC0]/8">
        {filteredResults.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#6B5D4F]/50">
            {examResults.results.length === 0 ? "لا يوجد طلاب" : "لا توجد نتائج للبحث"}
          </div>
        ) : (
          filteredResults.map((result, idx) => {
            const markStr = getMark(result.student.student_id, result.marks_obtained);
            const grade = getGrade(result.student.student_id, result.grade);
            const markNum = Number(markStr);
            const isValid = !isNaN(markNum) && markStr !== "" && markNum >= 0 && markNum <= exam.max_marks;
            const isOverMax = !isNaN(markNum) && markNum > exam.max_marks;
            const percent = isValid ? Math.round((markNum / exam.max_marks) * 100) : null;
            const scoreColor = percent !== null ? getScoreColor(percent) : null;

            return (
              <div
                key={result.student.student_id}
                className={`grid grid-cols-[32px_40px_1fr_90px_70px_60px] gap-2 items-center px-5 py-2.5 transition-colors ${
                  isOverMax ? "bg-red-50/50" : ""
                }`}
              >
                {/* Index */}
                <span className="text-[11px] text-[#BEB29E] text-center">{idx + 1}</span>

                {/* Avatar */}
                <Avatar
                  src={result.student.avatar_url}
                  first={result.student.first_name}
                  last={result.student.last_name}
                />

                {/* Name */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1B1B1B] truncate">
                    {result.student.first_name} {result.student.last_name}
                  </p>
                </div>

                {/* Marks input */}
                <div className="flex justify-center">
                  <input
                    type="number"
                    min="0"
                    max={exam.max_marks}
                    step="0.5"
                    value={markStr}
                    onChange={(e) => updateMark(result.student.student_id, e.target.value)}
                    placeholder="—"
                    className={`w-20 h-8 text-center text-sm font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                      isOverMax
                        ? "border-red-300 bg-red-50 text-red-500 focus:ring-red-200"
                        : isValid && scoreColor
                          ? `border-[#D8CDC0]/40 bg-white ${scoreColor.text} focus:ring-[#2B6F5E]/10`
                          : "border-[#D8CDC0]/40 bg-[#FAFAF8] text-[#1B1B1B] focus:ring-[#2B6F5E]/10"
                    }`}
                  />
                </div>

                {/* Grade input */}
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => updateGrade(result.student.student_id, e.target.value)}
                    placeholder="—"
                    maxLength={5}
                    className="w-16 h-8 text-center text-xs font-medium rounded-lg border border-[#D8CDC0]/40 bg-[#FAFAF8] text-[#1B1B1B] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/10 transition-all"
                  />
                </div>

                {/* Percent */}
                <div className="flex justify-center">
                  {percent !== null && scoreColor ? (
                    <span className={`text-xs font-bold ${scoreColor.text}`}>
                      {percent}%
                    </span>
                  ) : (
                    <span className="text-xs text-[#BEB29E]">—</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Save bar ── */}
      <div className={`flex items-center justify-between px-5 py-3.5 border-t border-[#D8CDC0]/25 bg-[#FAFAF8]/70 transition-all ${hasChanges ? "opacity-100" : "opacity-60"}`}>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={resetChanges}
              className="h-9 px-3 text-xs font-medium text-[#6B5D4F] hover:bg-[#D8CDC0]/20 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              تراجع
            </button>
          )}
          {hasChanges && (
            <span className="text-[11px] text-[#C4A035]">تغييرات غير محفوظة</span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges || bulkMutation.isPending}
          className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
        >
          {bulkMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          حفظ النتائج
        </button>
      </div>

      {/* Success */}
      {bulkMutation.isSuccess && !hasChanges && (
        <div className="px-5 py-2.5 bg-[#2B6F5E]/5 border-t border-[#2B6F5E]/10 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E]" />
          <span className="text-xs font-medium text-[#2B6F5E]">تم حفظ النتائج بنجاح</span>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */

export default function TeacherResults() {
  const { data: examsData, isLoading } = useTeacherExams();
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  const exams: ExamOption[] = examsData ?? [];

  if (isLoading) return <ResultsSkeleton />;

  return (
    <div dir="rtl" className="space-y-6 pb-8">
      {/* ══════════════════════════════════════════
         HEADER
      ══════════════════════════════════════════ */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B1B1B]">النتائج</h1>
        <p className="text-sm text-[#6B5D4F]/70 mt-0.5">
          اختر امتحان ثم أدخل درجات الطلاب
        </p>
      </div>

      {/* ══════════════════════════════════════════
         LAYOUT: Selector + Panel
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Exam selector (4/12) */}
        <div className="lg:col-span-4">
          <ExamSelector
            exams={exams}
            selectedId={selectedExamId}
            onSelect={setSelectedExamId}
          />
        </div>

        {/* Results panel (8/12) */}
        <div className="lg:col-span-8">
          {!selectedExamId ? (
            <div className="bg-white rounded-2xl border border-[#D8CDC0]/40 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/15 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-[#BEB29E]" />
              </div>
              <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
                لم يتم اختيار امتحان
              </h3>
              <p className="text-sm text-[#6B5D4F]/60 max-w-xs">
                اختر امتحاناً من القائمة على اليمين لعرض وإدخال النتائج
              </p>
            </div>
          ) : (
            <ResultsPanel examId={selectedExamId} />
          )}
        </div>
      </div>
    </div>
  );
}