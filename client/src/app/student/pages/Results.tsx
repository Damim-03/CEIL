import {
  Award,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Calendar,
  Target,
  Star,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import PageLoader from "../../../components/PageLoader";
import { useStudentResults } from "../../../hooks/student/Usestudent";

export default function Results() {
  const { data, isLoading, isError, error } = useStudentResults();

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
          Error loading results
        </h3>
        <p className="text-sm text-[#6B5D4F] dark:text-[#888888] text-center max-w-sm mb-4">
          {error instanceof Error ? error.message : "Failed to load results"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#2B6F5E] text-white rounded-xl hover:bg-[#2B6F5E]/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const results = data?.results || [];
  const summary = data?.summary || { total_exams: 0, average_score: 0 };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getGradeColor = (grade: string) => {
    const g = grade.toUpperCase();
    if (g === "A" || g === "A+") return "text-[#2B6F5E] dark:text-[#4ADE80]";
    if (g === "B" || g === "B+") return "text-[#2B6F5E] dark:text-[#4ADE80]";
    if (g === "C" || g === "C+") return "text-[#C4A035] dark:text-[#D4A843]";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBg = (grade: string) => {
    const g = grade.toUpperCase();
    if (g === "A" || g === "A+")
      return "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 border-[#8DB896]/25 dark:border-[#4ADE80]/15";
    if (g === "B" || g === "B+")
      return "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/[0.03] border-[#2B6F5E]/20 dark:border-[#4ADE80]/15";
    if (g === "C" || g === "C+")
      return "bg-[#C4A035]/8 dark:bg-[#D4A843]/[0.08] border-[#C4A035]/20 dark:border-[#D4A843]/15";
    return "bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-800/30";
  };

  const getPerfColor = (p: number) => {
    if (p >= 80) return "text-[#2B6F5E] dark:text-[#4ADE80]";
    if (p >= 60) return "text-[#2B6F5E] dark:text-[#4ADE80]";
    if (p >= 50) return "text-[#C4A035] dark:text-[#D4A843]";
    return "text-red-600 dark:text-red-400";
  };

  const getPerfLabel = (p: number) => {
    if (p >= 80) return "Excellent";
    if (p >= 60) return "Good";
    if (p >= 50) return "Pass";
    return "Needs Improvement";
  };

  const getBarColor = (p: number) => {
    if (p >= 80) return "bg-gradient-to-r from-[#2B6F5E] to-[#8DB896]";
    if (p >= 60) return "bg-gradient-to-r from-[#2B6F5E] to-[#2B6F5E]/70";
    if (p >= 50) return "bg-gradient-to-r from-[#C4A035] to-[#C4A035]/70";
    return "bg-gradient-to-r from-red-500 to-red-500/70";
  };

  const getSummaryStyle = (s: number) => {
    if (s >= 80)
      return {
        bg: "bg-[#8DB896]/8 dark:bg-[#4ADE80]/5",
        border: "border-[#8DB896]/25 dark:border-[#4ADE80]/15",
        iconBg: "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10",
      };
    if (s >= 60)
      return {
        bg: "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/[0.03]",
        border: "border-[#2B6F5E]/20 dark:border-[#4ADE80]/15",
        iconBg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/[0.08]",
      };
    if (s >= 50)
      return {
        bg: "bg-[#C4A035]/5 dark:bg-[#D4A843]/[0.03]",
        border: "border-[#C4A035]/20 dark:border-[#D4A843]/15",
        iconBg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/[0.08]",
      };
    return {
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800/30",
      iconBg: "bg-red-100 dark:bg-red-950/30",
    };
  };

  const ss = getSummaryStyle(summary.average_score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-black/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              My Results
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666] mt-0.5">
              View your exam scores and academic performance
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/[0.08] rounded-xl">
              <Award className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            </div>
            <p className="text-sm font-medium text-[#6B5D4F] dark:text-[#888888]">
              Total Exams
            </p>
          </div>
          <p className="text-3xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {summary.total_exams}
          </p>
        </div>
        <div
          className={`relative border rounded-2xl p-6 overflow-hidden ${ss.bg} ${ss.border}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${ss.iconBg} rounded-xl`}>
              <TrendingUp
                className={`w-5 h-5 ${getPerfColor(summary.average_score)}`}
              />
            </div>
            <p
              className={`text-sm font-medium ${getPerfColor(summary.average_score)}`}
            >
              Average Score
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-3xl font-bold ${getPerfColor(summary.average_score)}`}
            >
              {summary.average_score.toFixed(1)}%
            </p>
            <span
              className={`text-sm font-semibold ${getPerfColor(summary.average_score)}`}
            >
              {getPerfLabel(summary.average_score)}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Alert */}
      {summary.total_exams > 0 &&
        (summary.average_score >= 80 ? (
          <div className="bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border border-[#8DB896]/25 dark:border-[#4ADE80]/15 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Outstanding Performance!
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  You're performing exceptionally well. Keep it up!
                </p>
              </div>
            </div>
          </div>
        ) : summary.average_score >= 60 ? (
          <div className="bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/[0.03] border border-[#2B6F5E]/20 dark:border-[#4ADE80]/15 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Good Performance
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  You're doing well! A little more effort can make you
                  excellent.
                </p>
              </div>
            </div>
          </div>
        ) : summary.average_score >= 50 ? (
          <div className="bg-[#C4A035]/5 dark:bg-[#D4A843]/[0.03] border border-[#C4A035]/20 dark:border-[#D4A843]/15 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Room for Improvement
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  You're passing, but there's potential to do better.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  Needs Attention
                </p>
                <p className="text-sm text-[#6B5D4F] dark:text-[#888888]">
                  Your performance needs improvement. Please seek help from
                  instructors.
                </p>
              </div>
            </div>
          </div>
        ))}

      {/* Results List */}
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((result: any, index: number) => {
            const percentage =
              (result.marks_obtained / result.exam.max_marks) * 100;
            const passed = percentage >= 50;

            return (
              <div
                key={result.result_id || index}
                className="bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl p-6 hover:shadow-md dark:hover:shadow-black/20 transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl ${passed ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10" : "bg-red-100 dark:bg-red-950/30"}`}
                    >
                      <Award
                        className={`w-6 h-6 ${passed ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-red-600 dark:text-red-400"}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {result.exam.exam_name || "Exam"}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[#6B5D4F] dark:text-[#888888]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                          <span>{formatDate(result.exam.exam_date)}</span>
                        </div>
                        {result.exam.course && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
                            <span>{result.exam.course.course_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {result.grade && (
                    <Badge
                      className={`${getGradeBg(result.grade)} ${getGradeColor(result.grade)} text-2xl px-6 py-2 font-bold`}
                    >
                      {result.grade}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-[#D8CDC0]/8 dark:bg-[#151515] rounded-xl">
                  <div>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                      Score
                    </p>
                    <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                      {result.marks_obtained} / {result.exam.max_marks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                      Percentage
                    </p>
                    <p
                      className={`text-2xl font-bold ${getPerfColor(percentage)}`}
                    >
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
                      Result
                    </p>
                    <Badge
                      className={
                        passed
                          ? "bg-[#8DB896]/12 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80] border-[#8DB896]/25 dark:border-[#4ADE80]/15 text-sm"
                          : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30 text-sm"
                      }
                    >
                      {passed ? "✓ PASS" : "✗ FAIL"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6B5D4F] dark:text-[#888888]">
                      Performance
                    </span>
                    <span
                      className={`font-semibold ${getPerfColor(percentage)}`}
                    >
                      {getPerfLabel(percentage)}
                    </span>
                  </div>
                  <div className="h-3 bg-[#D8CDC0]/30 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getBarColor(percentage)} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#1A1A1A] border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-2xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] mx-auto mb-4">
              <Award className="w-8 h-8 text-[#BEB29E] dark:text-[#555555]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              No Exam Results Yet
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#888888] max-w-sm mx-auto">
              Your exam results will appear here once you take your first exam
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
