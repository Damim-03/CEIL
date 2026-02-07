import { Link, useParams } from "react-router-dom";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { useAdminStudent } from "../../../../hooks/admin/useAdmin";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Activity,
  GraduationCap,
  MapPin,
  AlertCircle,
  Edit,
  Trash2,
  Shield,
} from "lucide-react";
import { useState } from "react";
import EditStudentModal from "../../components/EditStudentModal";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";

const StudentDetailsPage = () => {
  const { studentId } = useParams();
  const { data: student, isLoading, refetch } = useAdminStudent(studentId);

  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) return <PageLoader />;

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center space-y-6 p-8 bg-white rounded-3xl shadow-2xl max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-gray-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Student not found
            </h2>
            <p className="text-gray-600 text-lg">
              The student you're looking for doesn't exist.
            </p>
          </div>
          <Link to="/admin/students">
            <Button variant="outline" size="lg" className="gap-2 mt-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pb-12">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Link to="/admin/students">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:bg-zinc-950/80 transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Students
            </Button>
          </Link>
        </div>

        {/* Hero Section - Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm hover:shadow-3xl transition-all duration-300">
          {/* Cover with gradient */}
          <div className="h-40 bg-linear-to-r from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/30"></div>
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 top-20 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 relative">
              {/* Avatar */}
              <div className="relative group">
                {student.user?.google_avatar ? (
                  <img
                    src={student.user.google_avatar}
                    alt={`${student.first_name || ""} ${student.last_name || ""}`}
                    className="w-36 h-36 rounded-3xl object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-3xl bg-linear-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white group-hover:scale-105 transition-transform duration-300">
                    {student.first_name?.charAt(0) || "?"}
                    {student.last_name?.charAt(0) || ""}
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                  {student.status === "Active" ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Student Info */}
              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
                        {student.first_name || ""}{" "}
                        {student.last_name || "Unknown"}
                      </h1>
                      <GraduationCap className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-gray-600 text-lg mb-4">
                      Student ID: {student.student_id}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {student.status || "unknown"}
                      </span>
                    </div>

                    {/* Enrolled Since */}
                    {student.created_at && (
                      <div className="inline-flex items-center gap-3 bg-linear-to-r from-green-50 to-emerald-50 backdrop-blur-sm rounded-2xl px-5 py-3 border border-green-200/50 shadow-sm hover:shadow-md transition-all">
                        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                            Enrolled Since
                          </p>
                          <p className="text-base font-bold text-gray-900">
                            {new Date(student.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            {Math.floor(
                              (new Date().getTime() -
                                new Date(student.created_at).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            days ago
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
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

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-10 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Student Information
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
                      {student.email || "—"}
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
                      {student.phone_number || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              {student.date_of_birth && (
                <div className="group hover:bg-linear-to-r hover:from-purple-50 hover:to-pink-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <Calendar className="w-7 h-7 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">
                        Date of Birth
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {new Date(student.date_of_birth).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {student.address && (
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
                        {student.address}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {student.emergency_contact && (
                <div className="group hover:bg-linear-to-r hover:from-red-50 hover:to-rose-50 -mx-6 px-6 py-5 rounded-2xl transition-all duration-300">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-red-100 to-red-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                      <AlertCircle className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                        Emergency Contact
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {student.emergency_contact}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Student ID Card */}
              <div className="mt-10 pt-8 border-t-2 border-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-green-400 via-emerald-500 to-teal-600 mb-5 shadow-2xl hover:scale-110 transition-transform duration-300">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                    Student ID Card
                  </h3>
                  <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">
                    Official student identification card with complete profile
                    information
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="h-1.5 w-12 bg-linear-to-r from-green-500 to-emerald-500 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></div>
                    <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></div>
                  </div>
                </div>

                <div className="max-w-md mx-auto">
                  <UserIDCardFlip
                    profile={{
                      user_id: student.student_id,
                      email: student.email || "",
                      google_avatar: student.user?.google_avatar,
                      role: "STUDENT",
                      is_active: student.status === "Active",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            {/* Status Card */}
            <div
              className={`rounded-3xl shadow-2xl p-6 text-white hover:shadow-3xl hover:scale-105 transition-all duration-300 ${
                student.status === "Active"
                  ? "bg-linear-to-br from-green-500 via-emerald-600 to-teal-600"
                  : "bg-linear-to-br from-gray-500 via-slate-600 to-zinc-600"
              }`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Student Status</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 shadow-lg">
                  <p className="text-sm opacity-90 mb-2 font-medium">
                    Current Status
                  </p>
                  <p className="text-3xl font-bold capitalize">
                    {student.status || "unknown"}
                  </p>
                </div>
                <div className="text-sm opacity-95 leading-relaxed bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  {student.status === "Active"
                    ? "This student is currently enrolled and active"
                    : "This student account is inactive"}
                </div>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/50 p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Info</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    Student Type
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-indigo-100 px-3 py-1 rounded-lg">
                    Student
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b-2 border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">
                    Status
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      student.status === "Active"
                        ? "text-green-700 bg-green-100"
                        : "text-gray-700 bg-gray-100"
                    }`}
                  >
                    {student.status || "unknown"}
                  </span>
                </div>
                {student.created_at && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600 font-medium">
                      Enrollment Age
                    </span>
                    <span className="text-sm font-bold text-gray-900 bg-blue-100 px-3 py-1 rounded-lg">
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(student.created_at).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        student={student}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default StudentDetailsPage;
