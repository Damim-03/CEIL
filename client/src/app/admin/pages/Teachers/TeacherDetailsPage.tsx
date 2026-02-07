import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { useAdminTeacher } from "../../../../hooks/admin/useAdmin";
import EditTeacherModal from "../../components/EditTeacherModal";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Briefcase,
  Award,
  BookOpen,
  MapPin,
  FileText,
  GraduationCap,
  Activity,
  Edit,
  Trash2,
  Shield,
} from "lucide-react";

const TeacherDetailsPage = () => {
  const { teacherId } = useParams();
  const { data: teacher, isLoading, refetch } = useAdminTeacher(teacherId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) return <PageLoader />;

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-6 p-8 bg-white rounded-3xl shadow-2xl max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-gray-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Teacher not found
            </h2>
            <p className="text-gray-600 text-lg">
              The teacher you're looking for doesn't exist.
            </p>
          </div>
          <Link to="/admin/teachers">
            <Button variant="outline" size="lg" className="gap-2 mt-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Teachers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const enrolledDays = teacher.created_at
    ? Math.floor(
        (new Date().getTime() - new Date(teacher.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ── Back Button ── */}
        <div className="flex items-center justify-between">
          <Link to="/admin/teachers">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-zinc-950/80 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Teachers
            </Button>
          </Link>
        </div>

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          {/* Cover */}
          <div className="h-40 bg-linear-to-r from-indigo-600 via-violet-600 to-blue-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/30" />
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-10 top-20 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Avatar + Info */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 relative">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-36 h-36 rounded-3xl bg-linear-to-br from-indigo-500 via-violet-600 to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                  {teacher.first_name?.charAt(0) || "?"}
                  {teacher.last_name?.charAt(0) || ""}
                </div>
                {/* pulse dot */}
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  <div className="w-5 h-5 bg-indigo-500 rounded-full animate-pulse" />
                </div>
              </div>

              {/* Name / badges / actions */}
              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    {/* Name row */}
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                        {teacher.first_name || ""}{" "}
                        {teacher.last_name || "Unknown"}
                      </h1>
                      <Briefcase className="w-8 h-8 text-indigo-600" />
                    </div>

                    <p className="text-gray-600 text-lg mb-4">
                      Teacher ID: {teacher.teacher_id}
                    </p>

                    {/* Spec / Dept badges */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {teacher.specialization && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
                          <Award className="w-4 h-4" />
                          {teacher.specialization}
                        </span>
                      )}
                      {teacher.department && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-violet-100 text-violet-800 border border-violet-200 shadow-sm">
                          <BookOpen className="w-4 h-4" />
                          {teacher.department}
                        </span>
                      )}
                    </div>

                    {/* Joined Since pill */}
                    {teacher.created_at && (
                      <div className="inline-flex items-center gap-3 bg-linear-to-r from-indigo-50 to-violet-50 backdrop-blur-sm rounded-2xl px-5 py-3 border border-indigo-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                            Joined Since
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {new Date(teacher.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-indigo-600 font-medium">
                            {enrolledDays} days ago
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsEditOpen(true)}
                      className="gap-2 shadow-lg hover:shadow-xl transition-all px-6"
                    >
                      <Edit className="w-5 h-5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="gap-2 shadow-lg hover:shadow-xl transition-all px-6"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main grid: 2/3 info | 1/3 sidebar ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-10 hover:shadow-2xl transition-all duration-300">
            {/* Section title */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Teacher Information
              </h2>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="group hover:bg-linear-to-r hover:from-blue-50 hover:to-indigo-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <Mail className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                      Email Address
                    </p>
                    <p className="text-xl font-semibold text-gray-900 break-all">
                      {teacher.email || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="group hover:bg-linear-to-r hover:from-green-50 hover:to-emerald-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    <Phone className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                      Phone Number
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {teacher.phone_number || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specialization */}
              {teacher.specialization && (
                <div className="group hover:bg-linear-to-r hover:from-indigo-50 hover:to-violet-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <Award className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
                        Specialization
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {teacher.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Department */}
              {teacher.department && (
                <div className="group hover:bg-linear-to-r hover:from-violet-50 hover:to-purple-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-100 to-violet-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <BookOpen className="w-7 h-7 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
                        Department
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {teacher.department}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {teacher.address && (
                <div className="group hover:bg-linear-to-r hover:from-orange-50 hover:to-amber-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-100 to-orange-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <MapPin className="w-7 h-7 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">
                        Address
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {teacher.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio */}
              {teacher.bio && (
                <div className="group hover:bg-linear-to-r hover:from-pink-50 hover:to-rose-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-pink-100 to-pink-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <FileText className="w-7 h-7 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">
                        Biography
                      </p>
                      <p className="text-xl font-semibold text-gray-900 leading-relaxed">
                        {teacher.bio}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {teacher.qualifications && (
                <div className="group hover:bg-linear-to-r hover:from-teal-50 hover:to-emerald-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-teal-100 to-teal-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <GraduationCap className="w-7 h-7 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">
                        Qualifications
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {teacher.qualifications}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ID Card section ── */}
              <div className="mt-10 pt-8 border-t-2 border-gray-100">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-400 via-violet-500 to-blue-600 mb-5 shadow-2xl hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    Teacher ID Card
                  </h3>
                  <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                    Official teacher identification card with complete profile
                    information
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-1.5 w-12 bg-linear-to-r from-indigo-500 to-violet-500 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-violet-400 rounded-full" />
                    <div className="h-1.5 w-1.5 bg-violet-400 rounded-full" />
                  </div>
                </div>

                <div className="max-w-md mx-auto">
                  <UserIDCardFlip
                    profile={{
                      user_id: teacher.teacher_id,
                      email: teacher.email || "",
                      google_avatar: teacher.google_avatar || null,
                      role: "TEACHER",
                      is_active: teacher.status !== "inactive",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">
            {/* Status card – gradient */}
            <div className="rounded-3xl shadow-2xl p-6 text-white bg-linear-to-br from-indigo-500 via-violet-600 to-blue-600 hover:shadow-3xl hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Teacher Status</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                  <p className="text-sm opacity-90 mb-2 font-medium">
                    Current Status
                  </p>
                  <p className="text-3xl font-bold capitalize">
                    {teacher.status === "inactive" ? "Inactive" : "Active"}
                  </p>
                </div>
                <div className="text-sm opacity-95 leading-relaxed bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  {teacher.status === "inactive"
                    ? "This teacher account is currently inactive."
                    : "This teacher is currently active and teaching."}
                </div>
              </div>
            </div>

            {/* Teaching Stats */}
            {(teacher.courses_count !== undefined ||
              teacher.students_count !== undefined) && (
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Teaching Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  {teacher.courses_count !== undefined && (
                    <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">
                        Courses
                      </span>
                      <span className="text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                        {teacher.courses_count}
                      </span>
                    </div>
                  )}
                  {teacher.students_count !== undefined && (
                    <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">
                        Students
                      </span>
                      <span className="text-sm font-bold text-violet-800 bg-violet-100 px-3 py-1 rounded-lg">
                        {teacher.students_count}
                      </span>
                    </div>
                  )}
                  {enrolledDays !== null && (
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-gray-600 font-medium">
                        Days Active
                      </span>
                      <span className="text-sm font-bold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-lg">
                        {enrolledDays}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Info</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    Role
                  </span>
                  <span className="text-sm font-bold text-indigo-800 bg-indigo-100 px-3 py-1 rounded-lg">
                    Teacher
                  </span>
                </div>
                {teacher.department && (
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">
                      Department
                    </span>
                    <span className="text-sm font-bold text-violet-800 bg-violet-100 px-3 py-1 rounded-lg">
                      {teacher.department}
                    </span>
                  </div>
                )}
                {teacher.specialization && (
                  <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                    <span className="text-sm text-gray-600 font-medium">
                      Specialization
                    </span>
                    <span className="text-sm font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg truncate ml-2">
                      {teacher.specialization}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600 font-medium">
                    Status
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${teacher.status === "inactive" ? "text-gray-700 bg-gray-100" : "text-indigo-700 bg-indigo-100"}`}
                  >
                    {teacher.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditTeacherModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        teacher={teacher}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default TeacherDetailsPage;
