import { Link, useParams } from "react-router-dom";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  useAdminCourse,
  useUpdateCourse,
} from "../../../../hooks/admin/useAdminCourses";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Calendar,
  FileText,
  Users,
  Clock,
  Tag,
  Edit,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { CourseUI } from "../../../../types/course.ui";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const { data: course = {} as CourseUI, isLoading } = useAdminCourse(courseId);
  const updateCourse = useUpdateCourse();

  const [open, setOpen] = useState(false);

  if (isLoading) return <PageLoader />;

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Course not found
          </h2>
          <p className="text-gray-600">
            The course you're looking for doesn't exist.
          </p>
          <Link to="/admin/courses">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
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
        <Link to="/admin/courses">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-linear-to-r from-teal-50 to-cyan-50 px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {course.course_name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Course ID: {course.course_id}
                </p>
                {course.course_code && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                      <Tag className="w-3 h-3 mr-1" />
                      {course.course_code}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {course.credits !== null && course.credits !== undefined && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Credits</p>
                <p className="text-3xl font-bold text-teal-600">
                  {course.credits}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Course Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">Course Name</p>
                <p className="text-base text-gray-900 mt-1">
                  {course.course_name}
                </p>
              </div>
            </div>

            {/* Course Code */}
            {course.course_code && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500">
                    Course Code
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.course_code}
                  </p>
                </div>
              </div>
            )}

            {/* Credits */}
            {course.credits !== null && course.credits !== undefined && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Credit Hours
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.credits}
                  </p>
                </div>
              </div>
            )}

            {/* Duration */}
            {course.duration && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.duration}
                  </p>
                </div>
              </div>
            )}

            {/* Created Date */}
            {course.created_at && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Created At
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(course.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Enrollment Count */}
            {course.enrollment_count !== undefined && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Enrolled Students
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.enrollment_count}
                  </p>
                </div>
              </div>
            )}

            {course.teacher && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Teacher</p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.teacher.first_name} {course.teacher.last_name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          {course.description && (
            <div className="mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Course Description
                  </p>
                  <p className="text-base text-gray-900 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section (if available) */}
        {(course.enrollment_count !== undefined ||
          course.completion_rate !== undefined) && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Course Statistics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.enrollment_count !== undefined && (
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Enrollments</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {course.enrollment_count}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {course.completion_rate !== undefined && (
                <div className="bg-linear-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {course.completion_rate}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Additional Info Section (if available) */}
        {(course.prerequisites || course.syllabus || course.instructor) && (
          <div className="px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h2>
            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              {course.prerequisites && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Prerequisites
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.prerequisites}
                  </p>
                </div>
              )}
              {course.instructor && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Instructor
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.instructor}
                  </p>
                </div>
              )}
              {course.syllabus && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Syllabus</p>
                  <p className="text-base text-gray-900 mt-1">
                    {course.syllabus}
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
              Manage course information, enrollments, and curriculum
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setOpen(true)}
              >
                <Edit className="w-4 h-4" />
                Edit Course
              </Button>

              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Course
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;
