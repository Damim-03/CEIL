import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import StudentLayout from "./layouts/StudentLayout";
import GoogleCallbackPage from "./app/auth/google/callback/page";
import HomePage from "./app/Home/HomePage";
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
import AnnouncementsPage from "./app/admin/pages/Announcements/AnnouncementsPage";
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
import GroupDetailsPage from "./app/admin/pages/courses/Groupdetailspage";
import Group from "./app/student/pages/Group";
import Fees from "./app/student/pages/Fees";
import Attendance from "./app/student/pages/Attendance";
import Results from "./app/student/pages/Results";
import { LanguagesSection } from "./app/Home/LanguagesSection";
import { AnnouncementsPreview } from "./app/Home/announcementspreview";
import AboutUs from "./app/Home/AboutUs";
import CoursesHomePage from "./app/Home/CoursesHomePage";
import AnnouncementDetailPage from "./app/Home/Announcementdetailpage";
import PricingCoursesPage from "./app/admin/pages/PricingCoursesPage";
import CourseProfileManager from "./app/admin/pages/courses/Courseprofilemanager";
import FormationsPage from "./app/admin/pages/Formationspage";
import CourseInfoMorePage from "./app/Home/CourseInfoMorePage";
import PublicLayout from "./layouts/Publiclayout";
import AuthPage from "./app/auth/Authpage";

const App = () => {
  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/languages" element={<LanguagesSection />} />
          <Route path="/announcements" element={<AnnouncementsPreview />} />
          <Route
            path="/announcements/:id"
            element={<AnnouncementDetailPage />}
          />
          <Route path="/pricing" element={<PricingCoursesPage />} />
          <Route path="/courses" element={<CoursesHomePage />} />
          <Route path="/courses/:id" element={<CourseInfoMorePage />} />
          <Route path="/about-us" element={<AboutUs />} />
        </Route>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
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
          <Route path="group/:groupId" element={<Group />} />

          <Route path="fees" element={<Fees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="results" element={<Results />} />
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
          <Route
            path="courses/:courseId/profile"
            element={<CourseProfileManager />}
          />
          <Route path="groups/:groupId" element={<GroupDetailsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="Documents" element={<DocumentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="Announcements" element={<AnnouncementsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="users/:userId" element={<UserDetailsPage />} />
          <Route path="formations" element={<FormationsPage />} />
          <Route
            path="formations/:courseId/edit"
            element={<CourseProfileManager />}
          />
        </Route>
      </Routes>
    </>
  );
};

export default App;
