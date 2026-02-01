import { Link } from "react-router-dom";
import { useState } from "react";
import {
  GraduationCap,
  Eye,
  Trash2,
  Search,
  UserPlus,
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
} from "../../../../hooks/admin/useAdminStudents";
import ConfirmDeleteCard from "../../components/ConfirmDeleteCard";

const StudentsPage = () => {
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

  // 🔍 Filter students with null safety
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // 📊 Stats
  let active = 0;
  let inactive = 0;

  for (const s of students) {
    if (s.status === "Active") active++;
    else if (s.status === "Inactive") inactive++;
  }

  const stats = {
    total: students.length,
    active,
    inactive,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all student records
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "Active" | "Inactive")
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredStudents.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">{students.length}</span>{" "}
          students
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredStudents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div
                key={student.student_id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  {student.user?.google_avatar ? (
                    <img
                      src={student.user.google_avatar}
                      alt={`${student.first_name || ""} ${student.last_name || ""}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-3xl font-semibold shadow-lg shrink-0">
                      {student.first_name?.charAt(0) || "?"}
                      {student.last_name?.charAt(0) || ""}
                    </div>
                  )}

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg">
                      {student.first_name || ""}{" "}
                      {student.last_name || "Unknown"}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-gray-600">
                      {student.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{student.email}</span>
                        </div>
                      )}
                      {student.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{student.phone_number}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status || "unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 lg:shrink-0">
                  <Link to={`/admin/students/${student.student_id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setSelectedStudent(student)}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <GraduationCap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No students found
            </h3>
            <p className="text-gray-600 text-sm">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No students available at the moment"}
            </p>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {selectedStudent && (
        <ConfirmDeleteCard
          open={!!selectedStudent}
          title="Delete Student"
          message={`Are you sure you want to delete ${selectedStudent.first_name || ""} ${selectedStudent.last_name || "this student"}?`}
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
