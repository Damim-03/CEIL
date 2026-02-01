import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";
import PageLoader from "../../../../components/PageLoader";
import { useAdminDashboard } from "../../../../hooks/admin/useAdminDashboard";
import { useMe } from "../../../../hooks/auth/auth.hooks";
import { EnrollmentsChart } from "../../components/EnrollmentsChart";
import { GenderChart } from "../../components/GenderChart";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";

const AdminDashboard = () => {
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useAdminDashboard();
  const { data: user, isLoading: isUserLoading } = useMe();

  const isLoading = isDashboardLoading || isUserLoading;

  if (isLoading) return <PageLoader />;

  const {
    students = 0,
    teachers = 0,
    courses = 0,
    unpaidFees = 0,
    gender = {},
  } = dashboardData ?? {};

  const totalUsers = students + teachers;

  // Get current date info
  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ================= HEADER SECTION ================= */}
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        {/* Vertical Accent Bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-blue-500 to-indigo-600"></div>

        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Dashboard
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{getCurrentDate()}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Here's what's happening with your platform today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden">
          {/* Vertical Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-blue-500 to-blue-600"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-4xl font-bold text-gray-900">{totalUsers}</p>
        </div>

        {/* Students Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden">
          {/* Vertical Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-purple-500 to-purple-600"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Students</p>
          <p className="text-4xl font-bold text-gray-900">{students}</p>
        </div>

        {/* Courses Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden">
          {/* Vertical Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-orange-500 to-orange-600"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Courses</p>
          <p className="text-4xl font-bold text-gray-900">{courses}</p>
        </div>

        {/* Unpaid Fees Card */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow overflow-hidden">
          {/* Vertical Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-green-500 to-green-600"></div>

          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Unpaid Fees</p>
          <p className="text-4xl font-bold text-gray-900">${unpaidFees}</p>
        </div>
      </div>

      {/* ================= USER ID CARD & QUICK STATS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User ID Card - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full overflow-hidden">
            {/* Vertical Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-blue-500 to-purple-600"></div>

            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-gray-900">Your ID Card</h3>
            </div>
            {user && (
              <UserIDCardFlip
                profile={{
                  user_id: user.user_id,
                  email: user.email,
                  google_avatar: user.google_avatar,
                  role: user.role,
                  is_active: user.is_active ?? true,
                }}
              />
            )}
          </div>
        </div>

        {/* Quick Stats & Platform Overview - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Card */}
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
            {/* Vertical Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-purple-500 to-indigo-600"></div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm text-blue-600 font-semibold mb-2">
                  Teachers
                </p>
                <p className="text-4xl font-bold text-blue-900">{teachers}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                <p className="text-sm text-purple-600 font-semibold mb-2">
                  Student/Teacher
                </p>
                <p className="text-4xl font-bold text-purple-900">
                  {teachers > 0 ? (students / teachers).toFixed(1) : "0"}:1
                </p>
              </div>
              <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                <p className="text-sm text-teal-600 font-semibold mb-2">
                  Avg Students/Course
                </p>
                <p className="text-4xl font-bold text-teal-900">
                  {courses > 0 ? (students / courses).toFixed(1) : "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Platform Overview Card */}
          <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            {/* Vertical Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30"></div>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
            </div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Platform Overview</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-blue-100 text-sm mb-2 font-medium">
                    Total Active Users
                  </p>
                  <p className="text-5xl font-bold mb-2">
                    {totalUsers.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/20">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-blue-100 text-xs mb-2 font-medium">
                      Students
                    </p>
                    <p className="text-3xl font-bold">
                      {students.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-blue-100 text-xs mb-2 font-medium">
                      Teachers
                    </p>
                    <p className="text-3xl font-bold">
                      {teachers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-linear-to-b from-teal-500 to-cyan-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Analytics & Insights
            </h2>
          </div>
          <p className="text-gray-600 ml-4">
            Visualize your platform's data and trends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnrollmentsChart data={[]} />
          </div>
          <div className="lg:col-span-1">
            <GenderChart gender={gender} />
          </div>
        </div>
      </div>

      {/* ================= PAYMENT STATUS ================= */}
      {unpaidFees > 0 && (
        <div className="relative overflow-hidden bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
          {/* Vertical Accent Bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-amber-500 to-orange-600"></div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 rounded-full -translate-y-16 translate-x-16"></div>
          </div>

          <div className="relative flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-amber-900">
                  Payment Alert
                </h3>
                <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  URGENT
                </span>
              </div>
              <p className="text-amber-800 mb-4 text-sm leading-relaxed">
                There are outstanding fees totaling{" "}
                <span className="text-xl font-bold text-amber-900">
                  ${Number(unpaidFees).toLocaleString()}
                </span>{" "}
                that require immediate attention.
              </p>
              <button className="px-6 py-3 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                View Unpaid Fees
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
