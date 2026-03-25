import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Eye,
  Trash2,
  Search,
  Users,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

import {
  useAdminStudents,
  useDeleteStudent,
  type AdminStudent,
} from "../../../../hooks/admin/useAdmin";
import ConfirmDeleteCard from "../../components/ConfirmDeleteCard";
import {
  getProfileCompletion,
  getCompletionColor,
  getCompletionLabel,
} from "../../../../lib/utils/profileCompletion";

// ─── Mini Completion Badge (للقائمة) ──────────────────────────
function CompletionBadge({ student }: { student: AdminStudent }) {
  const { percentage, isComplete, steps } = getProfileCompletion(student);
  const color = getCompletionColor(percentage);
  const { ar: label } = getCompletionLabel(percentage);
  const missing = steps.filter((s) => !s.done);

  return (
    <div
      className="flex items-center gap-2"
      title={missing.map((m) => m.labelAr).join(" · ")}
    >
      {/* شريط صغير */}
      <div className="w-20 h-1.5 rounded-full bg-brand-beige/40 dark:bg-[#2A2A2A] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
      {/* نسبة */}
      <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
        {percentage}%
      </span>
      {/* أيقونة */}
      {isComplete ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      ) : (
        <span
          className="w-3.5 h-3.5 rounded-full border-2 shrink-0"
          style={{ borderColor: color }}
        />
      )}
      {/* تسمية */}
      <span
        className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md hidden sm:inline-block"
        style={{ background: color + "15", color }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Filter للاكتمال ──────────────────────────────────────────
type CompletionFilter = "all" | "complete" | "incomplete";

const StudentsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminStudents({ page, limit: 20 });

  const students = data?.data ?? [];
  const meta = data?.meta;
  const deleteStudent = useDeleteStudent();

  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ACTIVE" | "INACTIVE"
  >("all");
  const [completionFilter, setCompletionFilter] =
    useState<CompletionFilter>("all");

  if (isLoading) return <PageLoader />;

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    let matchesCompletion = true;
    if (completionFilter !== "all") {
      const { isComplete } = getProfileCompletion(s);
      matchesCompletion =
        completionFilter === "complete" ? isComplete : !isComplete;
    }

    return matchesSearch && matchesStatus && matchesCompletion;
  });

  let active = 0;
  let inactive = 0;
  let complete = 0;
  let incomplete = 0;
  for (const s of students) {
    if (s.status === "ACTIVE") active++;
    else if (s.status === "INACTIVE") inactive++;
    const { isComplete } = getProfileCompletion(s);
    if (isComplete) complete++;
    else incomplete++;
  }

  const stats = {
    total: meta?.total ?? students.length,
    active,
    inactive,
    complete,
    incomplete,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-brand-beige/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-[#C4A035] to-[#2B6F5E]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("admin.students.title")}
            </h1>
            <p className="text-sm text-brand-brown dark:text-[#666666] mt-0.5">
              {t("admin.students.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats — 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {/* Total */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C4A035]/8 dark:bg-[#D4A843]/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#C4A035] dark:text-[#D4A843]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] dark:text-[#888888] font-medium">
                {t("admin.students.totalStudents")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {stats.total}
              </p>
            </div>
          </div>
        </div>
        {/* Active */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8DB896]/12 dark:bg-[#8DB896]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#3D7A4A] dark:text-[#8DB896]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] dark:text-[#888888] font-medium">
                {t("admin.students.active")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        {/* Inactive */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#BEB29E] to-[#BEB29E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D8CDC0]/20 dark:bg-[#555555]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6B5D4F] dark:text-[#AAAAAA]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] dark:text-[#888888] font-medium">
                {t("admin.students.inactive")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
        {/* Complete */}
        <div
          className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onClick={() =>
            setCompletionFilter(
              completionFilter === "complete" ? "all" : "complete",
            )
          }
          style={{
            outline:
              completionFilter === "complete" ? "2px solid #2B6F5E" : undefined,
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#2B6F5E] dark:text-[#4ADE80]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] dark:text-[#888888] font-medium">
                مكتمل الحساب
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {stats.complete}
              </p>
            </div>
          </div>
        </div>
        {/* Incomplete */}
        <div
          className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden group hover:shadow-md transition-all cursor-pointer"
          onClick={() =>
            setCompletionFilter(
              completionFilter === "incomplete" ? "all" : "incomplete",
            )
          }
          style={{
            outline:
              completionFilter === "incomplete"
                ? "2px solid #ef4444"
                : undefined,
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ef4444] to-[#ef4444]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] dark:text-[#888888] font-medium">
                غير مكتمل
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {stats.incomplete}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E] dark:text-[#666666]" />
            <Input
              placeholder={t("admin.students.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 dark:border-[#2A2A2A] dark:bg-[#222222] dark:text-[#E5E5E5] dark:placeholder:text-[#555555] focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "ACTIVE" | "INACTIVE")
            }
            className="px-3 py-2 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-lg text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20 focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] bg-white dark:bg-[#222222]"
          >
            <option value="all">{t("admin.students.allStatus")}</option>
            <option value="ACTIVE">{t("admin.students.active")}</option>
            <option value="INACTIVE">{t("admin.students.inactive")}</option>
          </select>
          <select
            value={completionFilter}
            onChange={(e) =>
              setCompletionFilter(e.target.value as CompletionFilter)
            }
            className="px-3 py-2 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] rounded-lg text-sm text-[#1B1B1B] dark:text-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 dark:focus:ring-[#4ADE80]/20 focus:border-[#2B6F5E] dark:focus:border-[#4ADE80] bg-white dark:bg-[#222222]"
          >
            <option value="all">كل الحسابات</option>
            <option value="complete">مكتمل الحساب</option>
            <option value="incomplete">غير مكتمل</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-[#6B5D4F] dark:text-[#888888]">
          {t("admin.students.showing")} <span>{filteredStudents.length}</span>{" "}
          {t("admin.students.of")} <span>{meta?.total ?? students.length}</span>
          {t("admin.students.students_label")}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] overflow-hidden">
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/40 dark:divide-[#2A2A2A]">
            {filteredStudents.map((student) => {
              const { percentage, isComplete } = getProfileCompletion(student);
              const borderColor = isComplete
                ? "border-l-[#2B6F5E]"
                : percentage >= 70
                  ? "border-l-[#C4A035]"
                  : percentage >= 40
                    ? "border-l-[#f97316]"
                    : "border-l-[#ef4444]";

              return (
                <div
                  key={student.student_id}
                  className={`flex flex-col lg:flex-row lg:items-center justify-between p-5 hover:bg-[#D8CDC0]/8 dark:hover:bg-[#222222] transition-colors gap-4 border-l-4 ${borderColor}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {student.user?.google_avatar ? (
                        <img
                          src={student.user.google_avatar}
                          alt={`${student.first_name || ""} ${student.last_name || ""}`}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#D8CDC0]/60 dark:border-[#2A2A2A] shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C4A035] to-[#C4A035]/70 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
                          {student.first_name?.charAt(0) || "?"}
                          {student.last_name?.charAt(0) || ""}
                        </div>
                      )}
                      {/* نقطة الاكتمال */}
                      {isComplete && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-[#2B6F5E]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] text-lg">
                        {student.first_name || ""}{" "}
                        {student.last_name || "Unknown"}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-[#6B5D4F] dark:text-[#888888]">
                        {student.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#666666]" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        )}
                        {student.phone_number && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#BEB29E] dark:text-[#666666]" />
                            <span>{student.phone_number}</span>
                          </div>
                        )}
                      </div>

                      {/* ✅ مؤشر الاكتمال */}
                      <div className="mt-2 flex items-center gap-3 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "ACTIVE"
                              ? "bg-[#8DB896]/15 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]"
                              : "bg-[#D8CDC0]/30 dark:bg-[#555555]/20 text-[#6B5D4F] dark:text-[#AAAAAA]"
                          }`}
                        >
                          {student.status || t("admin.studentDetails.unknown")}
                        </span>
                        <CompletionBadge student={student} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:shrink-0">
                    <Link to={`/admin/students/${student.student_id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-[#2B6F5E]/30 dark:border-[#4ADE80]/20 text-[#2B6F5E] dark:text-[#4ADE80] hover:bg-[#2B6F5E]/8 dark:hover:bg-[#4ADE80]/10 hover:border-[#2B6F5E]/50 dark:hover:border-[#4ADE80]/30"
                      >
                        <Eye className="h-4 w-4" />
                        {t("admin.students.viewDetails")}
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedStudent(student)}
                      className="gap-1.5 border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700/50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("admin.students.delete")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-[#BEB29E] dark:text-[#666666]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
              {t("admin.students.noStudentsFound")}
            </h3>
            <p className="text-[#6B5D4F] dark:text-[#888888] text-sm">
              {search || statusFilter !== "all" || completionFilter !== "all"
                ? t("admin.students.noStudentsDesc")
                : t("admin.students.noStudentsEmpty")}
            </p>
          </div>
        )}
      </div>

      {/* ✅ Pagination هنا */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          السابق
        </button>

        <span className="text-sm">
          صفحة {meta?.page} من {meta?.pages}
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === meta?.pages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          التالي
        </button>
      </div>

      {selectedStudent && (
        <ConfirmDeleteCard
          open={!!selectedStudent}
          title={t("admin.students.deleteStudent")}
          message={t("admin.students.deleteConfirm", {
            name:
              `${selectedStudent.first_name || ""} ${selectedStudent.last_name || ""}`.trim() ||
              t("admin.studentDetails.unknown"),
          })}
          isLoading={deleteStudent.isPending}
          onCancel={() => setSelectedStudent(null)}
          onConfirm={() => {
            deleteStudent.mutate(selectedStudent.student_id, {
              onSuccess: () => setSelectedStudent(null),
            });
          }}
        />
      )}
    </div>
  );
};

export default StudentsPage;
