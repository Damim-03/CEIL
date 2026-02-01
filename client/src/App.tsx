import { Route, Routes } from "react-router";
import LoginPage from "./app/auth/login/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";
import RegisterPage from "./app/auth/register/RegisterPage";
import GoogleCallbackPage from "./app/auth/google/callback/page";
import HomePage from "./app/Home/HomePage";
import AnnouncementsPage from "./app/Home/AnnouncementPage";
import AboutUs from "./app/Home/AboutUs";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./app/admin/pages/Dashboard/AdminDashboard";
import Unauthorized from "./app/admin/components/Unauthorized";
import UserDetailsPage from "./app/admin/pages/users/UserDetailsPage";
import UsersPage from "./app/admin/pages/users/UsersPage";
import StudentsPage from "./app/admin/pages/student/StudentsPage";
import TeacherPage from "./app/admin/pages/Teachers/TeacherPage";
import SessionsPage from "./app/admin/pages/Session/SessionsPage";
import FeesPage from "./app/admin/pages/Fees/FeesPage";
import EnrollmentsPage from "./app/admin/pages/Enrollments/EnrollmentsPage";
import DocumentsPage from "./app/admin/pages/Documents/DocumentsPage";
import ReportsPage from "./app/admin/pages/Raports/ReportsPage";
import SettingsPage from "./app/admin/pages/Settings/SettingsPage";
import ProfilePage from "./app/admin/pages/Profile/ProfilePage";
import StudentDetailsPage from "./app/admin/pages/student/StudentDetailsPage";
import TeacherDetailsPage from "./app/admin/pages/Teachers/TeacherDetailsPage";
import CoursesPage from "./app/admin/pages/courses/CoursesPage";
import CourseDetailsPage from "./app/admin/pages/courses/Coursedetailspage";
import Dashboard from "./app/student/pages/Dashboard";
import Documents from "./app/student/pages/Documents";
import Profile from "./app/student/pages/Profile";
import Courses from "./app/student/pages/Courses";
import Enrollements from "./app/student/pages/Enrollments";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["STUDENT"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="courses" element={<Courses />} />
          <Route path="enrollments" element={<Enrollements />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:studentId" element={<StudentDetailsPage />} />
          <Route path="teachers" element={<TeacherPage />} />
          <Route path="teachers/:teacherId" element={<TeacherDetailsPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:courseId" element={<CourseDetailsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="Documents" element={<DocumentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
