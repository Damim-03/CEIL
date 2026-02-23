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
import { useLanguage } from "../../../../hooks/useLanguage";

/* ═══ TYPES ═══ */
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
  summary: { total: number; average: number; max_marks: number };
}

/* ═══ HELPERS ═══ */
const getLocale = (lang: string) =>
  lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-US";
const isPast = (d: string) => new Date(d) < new Date();
const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();
const getScoreColor = (p: number) =>
  p >= 75
    ? {
        text: "text-[#2B6F5E] dark:text-[#4ADE80]",
        bg: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
      }
    : p >= 50
      ? { text: "text-[#C4A035] dark:text-[#C4A035]", bg: "bg-[#C4A035]" }
      : {
          text: "text-red-500 dark:text-red-400",
          bg: "bg-red-50 dark:bg-red-950/200",
        };

/* ═══ SKELETON ═══ */
const ResultsSkeleton = ({ rtl }: { rtl: boolean }) => (
  <div className="space-y-6 animate-pulse" dir={rtl ? "rtl" : "ltr"}>
    <div>
      <div className="h-7 w-36 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded-lg" />
      <div className="h-4 w-52 bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:bg-[#2A2A2A]/20 rounded-lg mt-2" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[400px]" />
      <div className="lg:col-span-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] h-[500px]" />
    </div>
  </div>
);

const Avatar = ({
  src,
  first,
  last,
}: {
  src: string | null;
  first: string;
  last: string;
}) => {
  if (src)
    return (
      <img
        src={src}
        alt={`${first} ${last}`}
        className="w-9 h-9 rounded-full object-cover border-2 border-[#D8CDC0]/30 dark:border-[#2A2A2A]"
      />
    );
  return (
    <div className="w-9 h-9 rounded-full bg-[#2B6F5E]/1 dark:bg-[#4ADE80]/10 dark:bg-[#4ADE80]/10 border-2 border-[#D8CDC0]/3 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A]/80 flex items-center justify-center">
      <span className="text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
        {getInitials(first, last)}
      </span>
    </div>
  );
};

/* ═══ EXAM SELECTOR ═══ */
const ExamSelector = ({
  exams,
  selectedId,
  onSelect,
}: {
  exams: ExamOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) => {
  const { t, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const courses = useMemo(() => {
    const m = new Map<string, string>();
    exams.forEach((e) => m.set(e.course_id, e.course.course_name));
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [exams]);
  const filtered = useMemo(
    () =>
      courseFilter === "all"
        ? exams
        : exams.filter((e) => e.course_id === courseFilter),
    [exams, courseFilter],
  );

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#C4A035]/8 dark:bg-[#C4A035]/10 dark:bg-[#C4A035]/10 flex items-center justify-center">
            <Award className="w-[18px] h-[18px] text-[#C4A035] dark:text-[#C4A035]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("teacher.results.selectExam")}
            </h2>
            <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              {t("teacher.results.examCount", { count: exams.length })}
            </p>
          </div>
        </div>
        {courses.length > 1 && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className={`h-8 ${isRTL ? "pr-3 pl-6" : "pl-3 pr-6"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-lg text-[11px] text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none appearance-none cursor-pointer`}
          >
            <option value="all">{t("teacher.results.all")}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="p-3 max-h-[360px] overflow-y-auto space-y-1.5">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {t("teacher.results.noExams")}
          </div>
        ) : (
          filtered.map((exam) => {
            const isSel = exam.exam_id === selectedId;
            const past = isPast(exam.exam_date);
            const hasRes = exam._count.results > 0;
            return (
              <button
                key={exam.exam_id}
                onClick={() => onSelect(exam.exam_id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${isRTL ? "text-right" : "text-left"} transition-all ${isSel ? "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 border border-[#2B6F5E]/20 dark:border-[#4ADE80]/20 shadow-sm" : "hover:bg-[#FAFAF8] dark:bg-[#111111] border border-transparent"}`}
              >
                <div
                  className={`flex flex-col items-center justify-center w-11 h-11 rounded-lg shrink-0 ${isSel ? "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15" : past ? "bg-[#D8CDC0]/10 dark:bg-[#2A2A2A]/10" : "bg-[#C4A035]/8 dark:bg-[#C4A035]/8"}`}
                >
                  <span className="text-[10px] font-medium text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] leading-tight">
                    {new Date(exam.exam_date).toLocaleDateString(locale, {
                      month: "short",
                    })}
                  </span>
                  <span
                    className={`text-sm font-bold leading-tight ${isSel ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                  >
                    {new Date(exam.exam_date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${isSel ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-[#1B1B1B] dark:text-[#E5E5E5]"}`}
                  >
                    {exam.exam_name || exam.course.course_name}
                  </p>
                  <p className="text-[10px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] truncate">
                    {exam.course.course_name} · /{exam.max_marks}
                  </p>
                </div>
                {hasRes && (
                  <span className="text-[10px] font-bold text-[#2B6F5E] dark:text-[#4ADE80] bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 px-2 py-0.5 rounded-full shrink-0">
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

/* ═══ RESULTS PANEL ═══ */
const ResultsPanel = ({ examId }: { examId: string }) => {
  const { t, isRTL, currentLang } = useLanguage();
  const locale = getLocale(currentLang);
  const { data, isLoading, isError } = useExamResults(examId);
  const bulkMut = useAddBulkResults();
  const [localMarks, setLocalMarks] = useState<Record<string, string>>({});
  const [localGrades, setLocalGrades] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [search, setSearch] = useState("");
  const examResults = data as ExamResultsData | undefined;

  const getMark = useCallback(
    (sid: string, srv?: number): string =>
      localMarks[sid] !== undefined
        ? localMarks[sid]
        : srv !== undefined
          ? String(srv)
          : "",
    [localMarks],
  );
  const getGrade = useCallback(
    (sid: string, srv?: string | null): string =>
      localGrades[sid] !== undefined ? localGrades[sid] : srv || "",
    [localGrades],
  );
  const updateMark = (sid: string, v: string) => {
    setLocalMarks((p) => ({ ...p, [sid]: v }));
    setHasChanges(true);
  };
  const updateGrade = (sid: string, v: string) => {
    setLocalGrades((p) => ({ ...p, [sid]: v }));
    setHasChanges(true);
  };
  const resetChanges = () => {
    setLocalMarks({});
    setLocalGrades({});
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!examResults) return;
    const results: Array<{
      student_id: string;
      marks_obtained: number;
      grade?: string;
    }> = [];
    examResults.results.forEach((r) => {
      const ms = getMark(r.student.student_id, r.marks_obtained);
      const g = getGrade(r.student.student_id, r.grade);
      const m = Number(ms);
      if (!isNaN(m) && m >= 0 && m <= examResults.exam.max_marks)
        results.push({
          student_id: r.student.student_id,
          marks_obtained: m,
          grade: g || undefined,
        });
    });
    if (results.length === 0) return;
    await bulkMut.mutateAsync({ examId, results });
    setLocalMarks({});
    setLocalGrades({});
    setHasChanges(false);
  };

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

  const liveSummary = useMemo(() => {
    if (!examResults)
      return {
        filled: 0,
        total: 0,
        avg: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
      };
    const mx = examResults.exam.max_marks;
    let f = 0,
      s = 0,
      hi = 0,
      lo = mx,
      pc = 0;
    examResults.results.forEach((r) => {
      const ms = getMark(r.student.student_id, r.marks_obtained);
      const m = Number(ms);
      if (!isNaN(m) && ms !== "") {
        f++;
        s += m;
        if (m > hi) hi = m;
        if (m < lo) lo = m;
        if (m >= mx * 0.5) pc++;
      }
    });
    return {
      filled: f,
      total: examResults.results.length,
      avg: f > 0 ? Math.round((s / f) * 100) / 100 : 0,
      highest: hi,
      lowest: f > 0 ? lo : 0,
      passRate: f > 0 ? Math.round((pc / f) * 100) : 0,
    };
  }, [examResults, getMark]);

  const fmtFull = (d: string) =>
    new Date(d).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (isLoading)
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-8 animate-pulse">
        <div className="h-5 w-40 bg-[#D8CDC0]/3 dark:bg-[#2A2A2A]/30 dark:bg-[#2A2A2A]/30 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/10 dark:bg-[#2A2A2A]/15 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  if (isError || !examResults)
    return (
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] p-8 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-[#6B5D4F]/70 dark:text-[#AAAAAA]/70">
          {t("teacher.results.loadError")}
        </p>
      </div>
    );

  const { exam } = examResults;
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#D8CDC0]/25 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/8 flex items-center justify-center">
            <ClipboardCheck className="w-[18px] h-[18px] text-[#2B6F5E] dark:text-[#4ADE80]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {exam.exam_name || t("teacher.results.examResults")}
            </h2>
            <p className="text-[11px] text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
              {exam.course.course_name} · {fmtFull(exam.exam_date)} ·{" "}
              {t("teacher.results.maxMarks")}: {exam.max_marks}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
          {[
            {
              label: t("teacher.results.entered"),
              value: `${liveSummary.filled}/${liveSummary.total}`,
              icon: Users,
            },
            {
              label: t("teacher.results.average"),
              value: liveSummary.avg,
              icon: BarChart3,
            },
            {
              label: t("teacher.results.highest"),
              value: liveSummary.highest,
              icon: TrendingUp,
            },
            {
              label: t("teacher.results.lowest"),
              value: liveSummary.lowest,
              icon: Target,
            },
            {
              label: t("teacher.results.passRate"),
              value: `${liveSummary.passRate}%`,
              icon: Award,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="px-3 py-2 rounded-lg bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 text-center"
            >
              <p className="text-[10px] text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] mb-0.5">
                {s.label}
              </p>
              <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {s.value}
              </p>
            </div>
          ))}
        </div>
        <div className="relative">
          <Search
            className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#BEB29E] dark:text-[#888888] pointer-events-none`}
          />
          <input
            type="text"
            placeholder={t("teacher.results.searchStudent")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full h-9 ${isRTL ? "pr-8 pl-3" : "pl-8 pr-3"} bg-[#FAFAF8] dark:bg-[#111111] border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] rounded-lg text-xs text-[#1B1B1B] dark:text-[#E5E5E5] placeholder:text-[#BEB29E] dark:text-[#888888] focus:outline-none focus:border-[#2B6F5E] dark:focus:border-[#4ADE80]/30 dark:border-[#4ADE80]/30 transition-all`}
          />
        </div>
      </div>
      <div className="grid grid-cols-[32px_40px_1fr_90px_70px_60px] gap-2 px-5 py-2.5 bg-[#FAFAF8]/7 dark:bg-[#1A1A1A]/70 dark:bg-[#1A1A1A]/70 border-b border-[#D8CDC0]/1 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/50 text-[10px] font-medium text-[#6B5D4F]/5 dark:text-[#AAAAAA]/50 dark:text-[#777777] uppercase tracking-wider">
        <span></span>
        <span></span>
        <span>{t("teacher.results.student")}</span>
        <span className="text-center">
          {t("teacher.results.mark")} /{exam.max_marks}
        </span>
        <span className="text-center">{t("teacher.results.grade")}</span>
        <span className="text-center">%</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto divide-y divide-[#D8CDC0] dark:divide-[#2A2A2A]/8">
        {filteredResults.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#6B5D4F]/50 dark:text-[#AAAAAA]/50">
            {examResults.results.length === 0
              ? t("teacher.results.noStudents")
              : t("teacher.results.noSearchResults")}
          </div>
        ) : (
          filteredResults.map((result, idx) => {
            const ms = getMark(
              result.student.student_id,
              result.marks_obtained,
            );
            const grade = getGrade(result.student.student_id, result.grade);
            const mn = Number(ms);
            const valid =
              !isNaN(mn) && ms !== "" && mn >= 0 && mn <= exam.max_marks;
            const over = !isNaN(mn) && mn > exam.max_marks;
            const pct = valid ? Math.round((mn / exam.max_marks) * 100) : null;
            const sc = pct !== null ? getScoreColor(pct) : null;
            return (
              <div
                key={result.student.student_id}
                className={`grid grid-cols-[32px_40px_1fr_90px_70px_60px] gap-2 items-center px-5 py-2.5 transition-colors ${over ? "bg-red-50 dark:bg-red-950/20/50" : ""}`}
              >
                <span className="text-[11px] text-[#BEB29E] dark:text-[#888888] text-center">
                  {idx + 1}
                </span>
                <Avatar
                  src={result.student.avatar_url}
                  first={result.student.first_name}
                  last={result.student.last_name}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                    {result.student.first_name} {result.student.last_name}
                  </p>
                </div>
                <div className="flex justify-center">
                  <input
                    type="number"
                    min="0"
                    max={exam.max_marks}
                    step="0.5"
                    value={ms}
                    onChange={(e) =>
                      updateMark(result.student.student_id, e.target.value)
                    }
                    placeholder="—"
                    className={`w-20 h-8 text-center text-sm font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 ${over ? "border-red-300 bg-red-50 dark:bg-red-950/20 text-red-500 dark:text-red-400 focus:ring-red-200" : valid && sc ? `border-[#D8CDC0]/40 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] ${sc.text} focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10` : "border-[#D8CDC0]/40 dark:border-[#2A2A2A] bg-[#FAFAF8] dark:bg-[#111111] text-[#1B1B1B] dark:text-[#E5E5E5] focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10"}`}
                  />
                </div>
                <div className="flex justify-center">
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) =>
                      updateGrade(result.student.student_id, e.target.value)
                    }
                    placeholder="—"
                    maxLength={5}
                    className="w-16 h-8 text-center text-xs font-medium rounded-lg border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] bg-[#FAFAF8] dark:bg-[#111111] text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E] dark:ring-[#4ADE80]/10 transition-all"
                  />
                </div>
                <div className="flex justify-center">
                  {pct !== null && sc ? (
                    <span className={`text-xs font-bold ${sc.text}`}>
                      {pct}%
                    </span>
                  ) : (
                    <span className="text-xs text-[#BEB29E] dark:text-[#888888]">
                      —
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div
        className={`flex items-center justify-between px-5 py-3.5 border-t border-[#D8CDC0]/2 dark:border-[#2A2A2A]5 dark:border-[#2A2A2A]/70 bg-[#FAFAF8]/7 dark:bg-[#1A1A1A]/70 dark:bg-[#1A1A1A]/70 transition-all ${hasChanges ? "opacity-100" : "opacity-60"}`}
      >
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={resetChanges}
              className="h-9 px-3 text-xs font-medium text-[#6B5D4F] dark:text-[#AAAAAA] hover:bg-[#D8CDC0]/2 dark:bg-[#2A2A2A]/20 dark:hover:bg-[#222222] rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t("teacher.results.undo")}
            </button>
          )}
          {hasChanges && (
            <span className="text-[11px] text-[#C4A035] dark:text-[#C4A035]">
              {t("teacher.results.unsavedChanges")}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || bulkMut.isPending}
          className="h-10 px-6 text-sm font-medium text-white bg-[#2B6F5E] dark:bg-[#4ADE80] hover:bg-[#2B6F5E]/9 dark:bg-[#4ADE80]/90 dark:hover:bg-[#4ADE80]/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
        >
          {bulkMut.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t("teacher.results.saveResults")}
        </button>
      </div>
      {bulkMut.isSuccess && !hasChanges && (
        <div className="px-5 py-2.5 bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border-t border-[#2B6F5E]/1 dark:border-[#4ADE80]/10 dark:border-[#4ADE80]/10 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#2B6F5E] dark:text-[#4ADE80]" />
          <span className="text-xs font-medium text-[#2B6F5E] dark:text-[#4ADE80]">
            {t("teacher.results.savedSuccess")}
          </span>
        </div>
      )}
    </div>
  );
};

/* ═══ MAIN ═══ */
export default function TeacherResults() {
  const { t, dir, isRTL } = useLanguage();
  const { data: examsData, isLoading } = useTeacherExams();
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const exams: ExamOption[] = examsData ?? [];
  if (isLoading) return <ResultsSkeleton rtl={isRTL} />;
  return (
    <div dir={dir} className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {t("teacher.results.title")}
        </h1>
        <p className="text-sm text-[#6B5D4F]/7 dark:text-[#AAAAAA]/70 dark:text-[#999999] mt-0.5">
          {t("teacher.results.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <ExamSelector
            exams={exams}
            selectedId={selectedExamId}
            onSelect={setSelectedExamId}
          />
        </div>
        <div className="lg:col-span-8">
          {!selectedExamId ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/4 dark:border-[#2A2A2A]0 dark:border-[#2A2A2A] flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/1 dark:bg-[#2A2A2A]/15 dark:bg-[#2A2A2A]/30 flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-[#BEB29E] dark:text-[#888888]" />
              </div>
              <h3 className="text-base font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
                {t("teacher.results.noExamSelected")}
              </h3>
              <p className="text-sm text-[#6B5D4F]/6 dark:text-[#AAAAAA]/60 dark:text-[#888888] max-w-xs">
                {t("teacher.results.selectExamDesc")}
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
