import { Link, useParams } from "react-router-dom";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { useAdminStudent } from "../../../../hooks/admin/useAdminStudents";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Calendar,
  Activity,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import EditStudentModal from "../../components/EditStudentModal";

const StudentDetailsPage = () => {
  const { studentId } = useParams();
  const { data: student, isLoading, refetch } = useAdminStudent(studentId);

  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) return <PageLoader />;

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Student not found
          </h2>
          <p className="text-gray-600">
            The student you're looking for doesn't exist.
          </p>
          <Link to="/admin/students">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Students
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
        <Link to="/admin/students">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section - FIXED GRADIENTS */}
        <div className="bg-linear-to-r from-purple-50 to-pink-50 px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              {student.user?.google_avatar ? (
                <img
                  src={student.user.google_avatar}
                  alt={`${student.first_name || ""} ${student.last_name || ""}`}
                  className="w-30 h-30 rounded-full object-cover border-2 border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                  {student.first_name?.charAt(0) || "?"}
                  {student.last_name?.charAt(0) || ""}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {student.first_name || ""} {student.last_name || "Unknown"}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Student ID: {student.student_id}
                </p>
              </div>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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

        {/* Details Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Student Information
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
                  {student.first_name || ""} {student.last_name || "Unknown"}
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
                  {student.email || "—"}
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
                  {student.phone_number || "—"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Account Status
                </p>
                <p className="text-base text-gray-900 mt-1 capitalize">
                  {student.status || "unknown"}
                </p>
              </div>
            </div>

            {/* Date of Birth */}
            {student.date_of_birth && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="text-base text-gray-900 mt-1">
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
            )}

            {/* Enrollment Date */}
            {student.created_at && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Enrolled Since
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(student.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Section (if available) */}
        {(student.address || student.emergency_contact) && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 gap-4 bg-gray-50 rounded-lg p-4">
              {student.address && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-base text-gray-900 mt-1">
                    {student.address}
                  </p>
                </div>
              )}
              {student.emergency_contact && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Emergency Contact
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {student.emergency_contact}
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
              Manage student information and enrollment status
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                Edit Student
              </Button>
              <Button variant="destructive">Delete Student</Button>
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
