import { Link, useParams } from "react-router-dom";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { useAdminTeacher } from "../../../../hooks/admin/useAdminTeachers";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Briefcase,
  Award,
  BookOpen,
} from "lucide-react";

const TeacherDetailsPage = () => {
  const { teacherId } = useParams();
  const { data: teacher, isLoading } = useAdminTeacher(teacherId);

  if (isLoading) return <PageLoader />;

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Teacher not found
          </h2>
          <p className="text-gray-600">
            The teacher you're looking for doesn't exist.
          </p>
          <Link to="/admin/teachers">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teachers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link to="/admin/teachers">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Teachers
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-linear-to-r from-indigo-50 to-blue-50 px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                {teacher.first_name?.charAt(0)}
                {teacher.last_name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {teacher.first_name} {teacher.last_name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Teacher ID: {teacher.teacher_id}
                </p>
                {teacher.specialization && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <Award className="w-3 h-3 mr-1" />
                      {teacher.specialization}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Teacher Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base text-gray-900 mt-1">
                  {teacher.first_name} {teacher.last_name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Email Address
                </p>
                <p className="text-base text-gray-900 mt-1 break-all">
                  {teacher.email || "—"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Phone Number
                </p>
                <p className="text-base text-gray-900 mt-1">
                  {teacher.phone_number || "—"}
                </p>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Joined On</p>
                <p className="text-base text-gray-900 mt-1">
                  {new Date(teacher.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Department */}
            {teacher.department && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Department
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {teacher.department}
                  </p>
                </div>
              </div>
            )}

            {/* Specialization */}
            {teacher.specialization && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Specialization
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {teacher.specialization}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Teaching Stats Section (if available) */}
        {(teacher.courses_count !== undefined ||
          teacher.students_count !== undefined) && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Teaching Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teacher.courses_count !== undefined && (
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Courses Teaching</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {teacher.courses_count}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {teacher.students_count !== undefined && (
                <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {teacher.students_count}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info Section (if available) */}
        {(teacher.bio || teacher.qualifications || teacher.address) && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h2>
            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              {teacher.bio && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Biography</p>
                  <p className="text-base text-gray-900 mt-1">{teacher.bio}</p>
                </div>
              )}
              {teacher.qualifications && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Qualifications
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {teacher.qualifications}
                  </p>
                </div>
              )}
              {teacher.address && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base text-gray-900 mt-1">
                    {teacher.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Manage teacher information and assignments
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Edit Teacher</Button>
              <Button variant="destructive">Delete Teacher</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailsPage;
