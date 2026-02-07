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
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-600 mb-1">
          Error loading results
        </h3>
        <p className="text-sm text-gray-600 text-center max-w-sm mb-4">
          {error instanceof Error ? error.message : "Failed to load results"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const results = data?.results || [];
  const summary = data?.summary || {
    total_exams: 0,
    average_score: 0,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getGradeColor = (grade: string) => {
    const upperGrade = grade.toUpperCase();
    if (upperGrade === "A" || upperGrade === "A+") return "text-green-600";
    if (upperGrade === "B" || upperGrade === "B+") return "text-blue-600";
    if (upperGrade === "C" || upperGrade === "C+") return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeBgColor = (grade: string) => {
    const upperGrade = grade.toUpperCase();
    if (upperGrade === "A" || upperGrade === "A+")
      return "bg-green-100 border-green-200";
    if (upperGrade === "B" || upperGrade === "B+")
      return "bg-blue-100 border-blue-200";
    if (upperGrade === "C" || upperGrade === "C+")
      return "bg-yellow-100 border-yellow-200";
    return "bg-red-100 border-red-200";
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 50) return "Pass";
    return "Needs Improvement";
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-600 mt-1">
          View your exam scores and academic performance
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Exams */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Total Exams</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {summary.total_exams}
          </p>
        </div>

        {/* Average Score */}
        <div
          className={`bg-white border rounded-xl p-6 shadow-sm ${
            summary.average_score >= 80
              ? "bg-green-50 border-green-200"
              : summary.average_score >= 60
                ? "bg-blue-50 border-blue-200"
                : summary.average_score >= 50
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${
                summary.average_score >= 80
                  ? "bg-green-100"
                  : summary.average_score >= 60
                    ? "bg-blue-100"
                    : summary.average_score >= 50
                      ? "bg-yellow-100"
                      : "bg-red-100"
              }`}
            >
              <TrendingUp
                className={`w-5 h-5 ${getPerformanceColor(summary.average_score)}`}
              />
            </div>
            <p
              className={`text-sm font-medium ${getPerformanceColor(summary.average_score)}`}
            >
              Average Score
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <p
              className={`text-3xl font-bold ${getPerformanceColor(summary.average_score)}`}
            >
              {summary.average_score.toFixed(1)}%
            </p>
            <span
              className={`text-sm font-semibold ${getPerformanceColor(summary.average_score)}`}
            >
              {getPerformanceLabel(summary.average_score)}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      {summary.total_exams > 0 && (
        <div
          className={`border rounded-xl p-4 ${
            summary.average_score >= 80
              ? "bg-green-50 border-green-200"
              : summary.average_score >= 60
                ? "bg-blue-50 border-blue-200"
                : summary.average_score >= 50
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {summary.average_score >= 80 ? (
              <>
                <Star className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">
                    Outstanding Performance!
                  </p>
                  <p className="text-sm text-green-700">
                    You're performing exceptionally well. Keep up the excellent
                    work!
                  </p>
                </div>
              </>
            ) : summary.average_score >= 60 ? (
              <>
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">
                    Good Performance
                  </p>
                  <p className="text-sm text-blue-700">
                    You're doing well! A little more effort can make you
                    excellent.
                  </p>
                </div>
              </>
            ) : summary.average_score >= 50 ? (
              <>
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Room for Improvement
                  </p>
                  <p className="text-sm text-yellow-700">
                    You're passing, but there's potential to do better. Consider
                    studying more.
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    Needs Attention
                  </p>
                  <p className="text-sm text-red-700">
                    Your performance needs improvement. Please seek help from
                    instructors.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Exam Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        passed ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <Award
                        className={`w-6 h-6 ${
                          passed ? "text-green-600" : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {result.exam.exam_name || "Exam"}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(result.exam.exam_date)}</span>
                        </div>
                        {result.exam.course && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{result.exam.course.course_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Grade Badge */}
                  {result.grade && (
                    <Badge
                      className={`${getGradeBgColor(result.grade)} ${getGradeColor(result.grade)} text-2xl px-6 py-2 font-bold`}
                    >
                      {result.grade}
                    </Badge>
                  )}
                </div>

                {/* Score Details */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.marks_obtained} / {result.exam.max_marks}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Percentage</p>
                    <p
                      className={`text-2xl font-bold ${getPerformanceColor(percentage)}`}
                    >
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Result</p>
                    <Badge
                      className={
                        passed
                          ? "bg-green-100 text-green-700 border-green-200 text-sm"
                          : "bg-red-100 text-red-700 border-red-200 text-sm"
                      }
                    >
                      {passed ? "✓ PASS" : "✗ FAIL"}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Performance</span>
                    <span
                      className={`font-semibold ${getPerformanceColor(percentage)}`}
                    >
                      {getPerformanceLabel(percentage)}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressBarColor(percentage)} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Exam Results Yet
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Your exam results will appear here once you take your first exam
            </p>
          </div>
        )}
      </div>
    </div>
  );
}