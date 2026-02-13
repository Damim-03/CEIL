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

const StudentsPage = () => {
  const { t } = useTranslation();
  const { data: students = [], isLoading } = useAdminStudents();
  const deleteStudent = useDeleteStudent();

  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "Active" | "Inactive"
  >("all");

  if (isLoading) return <PageLoader />;

  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  let active = 0;
  let inactive = 0;
  for (const s of students) {
    if (s.status === "Active") active++;
    else if (s.status === "Inactive") inactive++;
  }

  const stats = { total: students.length, active, inactive };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B]">
              {t("admin.students.title")}
            </h1>
            <p className="text-sm text-[#BEB29E] mt-0.5">
              {t("admin.students.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#C4A035]/8 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#C4A035]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.students.totalStudents")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#8DB896]/12 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#3D7A4A]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.students.active")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#BEB29E] to-[#BEB29E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D8CDC0]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6B5D4F]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.students.inactive")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
            <Input
              placeholder={t("admin.students.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "Active" | "Inactive")
            }
            className="px-3 py-2 border border-[#D8CDC0]/60 rounded-lg text-sm text-[#1B1B1B] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E] bg-white"
          >
            <option value="all">{t("admin.students.allStatus")}</option>
            <option value="Active">{t("admin.students.active")}</option>
            <option value="Inactive">{t("admin.students.inactive")}</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-[#6B5D4F]">
          {t("admin.students.showing")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {filteredStudents.length}
          </span>{" "}
          {t("admin.students.of")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {students.length}
          </span>{" "}
          {t("admin.students.students_label")}
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/40">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-5 hover:bg-[#D8CDC0]/8 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {student.user?.google_avatar ? (
                    <img
                      src={student.user.google_avatar}
                      alt={`${student.first_name || ""} ${student.last_name || ""}`}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#D8CDC0]/60 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C4A035] to-[#C4A035]/70 flex items-center justify-center text-white text-xl font-semibold shadow-lg shadow-[#C4A035]/15 shrink-0">
                      {student.first_name?.charAt(0) || "?"}
                      {student.last_name?.charAt(0) || ""}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1B1B1B] text-lg">
                      {student.first_name || ""}{" "}
                      {student.last_name || "Unknown"}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-[#6B5D4F]">
                      {student.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#BEB29E]" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}
                      {student.phone_number && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#BEB29E]" />
                          <span>{student.phone_number}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.status === "Active" ? "bg-[#8DB896]/15 text-[#2B6F5E]" : "bg-[#D8CDC0]/30 text-[#6B5D4F]"}`}
                      >
                        {student.status || t("admin.studentDetails.unknown")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:shrink-0">
                  <Link to={`/admin/students/${student.student_id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-[#2B6F5E]/30 text-[#2B6F5E] hover:bg-[#2B6F5E]/8 hover:border-[#2B6F5E]/50"
                    >
                      <Eye className="h-4 w-4" />
                      {t("admin.students.viewDetails")}
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStudent(student)}
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("admin.students.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-[#BEB29E]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
              {t("admin.students.noStudentsFound")}
            </h3>
            <p className="text-[#6B5D4F] text-sm">
              {search || statusFilter !== "all"
                ? t("admin.students.noStudentsDesc")
                : t("admin.students.noStudentsEmpty")}
            </p>
          </div>
        )}
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
