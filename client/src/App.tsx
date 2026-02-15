import { Route, Routes, Navigate } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/Guestroute";
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
import PricingCoursesPage from "./app/admin/pages/Pricing/PricingCoursesPage";
import CourseProfileManager from "./app/admin/pages/courses/Courseprofilemanager";
import FormationsPage from "./app/admin/pages/Formation/Formationspage";
import CourseInfoMorePage from "./app/Home/CourseInfoMorePage";
import PublicLayout from "./layouts/Publiclayout";
import AuthPage from "./app/auth/Authpage";
import DepartmentsPage from "./app/admin/pages/Departments/DepartmentsPage";

// ═══ Teacher imports ═══
import TeacherLayout from "./layouts/Teacherlayout";
import TeacherDashboard from "./app/teacher/pages/dashboard/TeacherDashboard";
import TeacherGroups from "./app/teacher/pages/groups/TeacherGroups";
import TeacherSessions from "./app/teacher/pages/sessions/TeacherSessions";
import TeacherAttendance from "./app/teacher/pages/attendance/TeacherAttendance";
import TeacherExams from "./app/teacher/pages/exams/TeacherExams";
import TeacherResults from "./app/teacher/pages/results/TeacherResults";
import TeacherStudents from "./app/teacher/pages/student/TeacherStudents";
import TeacherProfile from "./app/teacher/pages/profile/TeacherProfile";

// ═══ i18n ═══
import { LanguageLayout } from "./i18n/locales/components/LanguageLayout";
import { DEFAULT_LANG } from "./i18n/i18n";
import AdminNotificationsPage from "./app/admin/pages/Notifications/Adminnotificationspage";
import StudentNotificationsPage from "./app/student/pages/StudentNotificationsPage";
import TeacherAnnouncementDetail from "./app/teacher/pages/announcements/TeacherAnnouncementDetail";
import TeacherAnnouncements from "./app/teacher/pages/announcements/TeacherAnnouncements";
import TeacherGroupDetails from "./app/teacher/pages/groups/TeacherGroupDetails";
import TeacherGroupStats from "./app/teacher/pages/groups/TeacherGroupStats";
import TeacherSchedule from "./app/teacher/pages/schedule/TeacherSchedule";
import TeacherStudentDetails from "./app/teacher/pages/student/TeacherStudentDetails";
import OurPlatform from "./app/Home/OurPlatform";
import RoomsPage from "./app/admin/pages/RoomsPage";
import RoomsTimetablePage from "./app/admin/pages/RoomsTimetablePage";

const App = () => {
  return (
    <Routes>
      {/* ═══════════════════════════════════════════
          PUBLIC ROUTES — with language prefix /:lang/
          /ar, /en, /fr → Arabic, English, French
      ═══════════════════════════════════════════ */}
      <Route path="/:lang" element={<LanguageLayout />}>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="languages" element={<LanguagesSection />} />
          <Route path="announcements" element={<AnnouncementsPreview />} />
          <Route
            path="announcements/:id"
            element={<AnnouncementDetailPage />}
          />
          <Route path="pricing" element={<PricingCoursesPage />} />
          <Route path="courses" element={<CoursesHomePage />} />
          <Route path="courses/:id" element={<CourseInfoMorePage />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="OurPlatform" element={<OurPlatform />} />
        </Route>

        {/* ═══ Auth pages under lang prefix too ═══ */}
        <Route
          path="login"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
      </Route>

      {/* ═══════════════════════════════════════════
          REDIRECT: bare "/" → default language
      ═══════════════════════════════════════════ */}
      <Route path="/" element={<Navigate to={`/${DEFAULT_LANG}`} replace />} />

      {/* ═══════════════════════════════════════════
          LEGACY REDIRECTS — old paths without lang prefix
          /courses → /ar/courses, /about-us → /ar/about-us, etc.
      ═══════════════════════════════════════════ */}
      <Route
        path="/languages"
        element={<Navigate to={`/${DEFAULT_LANG}/languages`} replace />}
      />
      <Route
        path="/announcements"
        element={<Navigate to={`/${DEFAULT_LANG}/announcements`} replace />}
      />
      <Route
        path="/announcements/:id"
        element={<RedirectWithLang base="announcements" />}
      />
      <Route
        path="/courses"
        element={<Navigate to={`/${DEFAULT_LANG}/courses`} replace />}
      />
      <Route
        path="/courses/:id"
        element={<RedirectWithLang base="courses" />}
      />
      <Route
        path="/about-us"
        element={<Navigate to={`/${DEFAULT_LANG}/about-us`} replace />}
      />
      <Route
        path="/pricing"
        element={<Navigate to={`/${DEFAULT_LANG}/pricing`} replace />}
      />
      <Route
        path="/login"
        element={<Navigate to={`/${DEFAULT_LANG}/login`} replace />}
      />
      <Route
        path="/register"
        element={<Navigate to={`/${DEFAULT_LANG}/register`} replace />}
      />

      {/* ═══════════════════════════════════════════
          AUTH CALLBACKS — no lang prefix needed
      ═══════════════════════════════════════════ */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

      {/* ═══════════════════════════════════════════
          STUDENT ROUTES — no lang prefix (dashboard is internal)
      ═══════════════════════════════════════════ */}
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
        <Route path="notifications" element={<StudentNotificationsPage />} />
      </Route>

      {/* ═══════════════════════════════════════════
          TEACHER ROUTES — no lang prefix
      ═══════════════════════════════════════════ */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute allowedRoles={["TEACHER"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="groups" element={<TeacherGroups />} />
        <Route path="groups/:groupId" element={<TeacherGroupDetails />} />
        <Route path="groups/:groupId/stats" element={<TeacherGroupStats />} />
        <Route path="sessions" element={<TeacherSessions />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="exams" element={<TeacherExams />} />
        <Route path="results" element={<TeacherResults />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="students/:studentId" element={<TeacherStudentDetails />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route
          path="announcements/:announcementId"
          element={<TeacherAnnouncementDetail />}
        />
        <Route path="profile" element={<TeacherProfile />} />
      </Route>

      {/* ═══════════════════════════════════════════
          ADMIN ROUTES — no lang prefix
      ═══════════════════════════════════════════ */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
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
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="groups/:groupId" element={<GroupDetailsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="fees" element={<FeesPage />} />
        <Route path="enrollments" element={<EnrollmentsPage />} />
        <Route path="Documents" element={<DocumentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="Announcements" element={<AnnouncementsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="users/:userId" element={<UserDetailsPage />} />
        <Route path="formations" element={<FormationsPage />} />
        <Route
          path="formations/:courseId/edit"
          element={<CourseProfileManager />}
        />

        <Route path="rooms" element={<RoomsPage />} />
        <Route path="rooms/timetable" element={<RoomsTimetablePage />} /> 

        
      </Route>
    </Routes>
  );
};

export default App;

/* ═══ Helper: Redirect dynamic routes to lang-prefixed version ═══ */
function RedirectWithLang({ base }: { base: string }) {
  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean);
  // e.g. /courses/abc123 → segments = ["courses", "abc123"]
  const id = segments[1] || "";
  return <Navigate to={`/${DEFAULT_LANG}/${base}/${id}`} replace />;
}
