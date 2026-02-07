import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Briefcase,
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
  useAdminTeachers,
  useDeleteTeacher,
} from "../../../../hooks/admin/useAdmin";

const TeachersPage = () => {
  const { data: teachers = [], isLoading } = useAdminTeachers();
  const deleteTeacher = useDeleteTeacher();
  const [search, setSearch] = useState("");

  if (isLoading) return <PageLoader />;

  const filteredTeachers = teachers.filter((t) =>
    `${t.first_name} ${t.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const stats = {
    total: teachers.length,
    active:
      teachers.filter((t) => t.status === "active").length || teachers.length,
    inactive: teachers.filter((t) => t.status === "inactive").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all teaching staff
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Teachers</p>
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
              <p className="text-sm text-gray-600">Active Teachers</p>
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
              <p className="text-sm text-gray-600">Inactive Teachers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
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
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredTeachers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-900">{teachers.length}</span>{" "}
          teachers
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredTeachers.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.teacher_id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {teacher.first_name?.charAt(0)}
                    {teacher.last_name?.charAt(0)}
                  </div>

                  {/* Teacher Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg">
                      {teacher.first_name} {teacher.last_name}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-gray-600">
                      {teacher.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      )}
                      {teacher.phone_number && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{teacher.phone_number}</span>
                        </div>
                      )}
                    </div>
                    {teacher.specialization && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {teacher.specialization}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 lg:shrink-0">
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <Link to={`/admin/teachers/${teacher.teacher_id}`}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete ${teacher.first_name} ${teacher.last_name}?`,
                        )
                      ) {
                        deleteTeacher.mutate(teacher.teacher_id);
                      }
                    }}
                    disabled={deleteTeacher.isPending}
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
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No teachers found
            </h3>
            <p className="text-gray-600 text-sm">
              {search
                ? "Try adjusting your search"
                : "No teachers available at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachersPage;
