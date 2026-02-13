import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const { teacherId } = useParams();
  const { data: teacher, isLoading, refetch } = useAdminTeacher(teacherId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";

  if (isLoading) return <PageLoader />;

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 p-8 bg-white rounded-2xl shadow-xl border border-[#D8CDC0]/60 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#D8CDC0]/20 flex items-center justify-center">
            <Briefcase className="w-12 h-12 text-[#BEB29E]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1B1B1B] mb-2">
              {t("admin.teacherDetails.teacherNotFound")}
            </h2>
            <p className="text-[#6B5D4F] text-lg">
              {t("admin.teacherDetails.teacherNotFoundDesc")}
            </p>
          </div>
          <Link to="/admin/teachers">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 mt-4 border-[#D8CDC0]/60 hover:bg-[#D8CDC0]/10"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("admin.teacherDetails.backToTeachers")}
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
    <div className="pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to="/admin/teachers">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#6B5D4F] hover:bg-[#D8CDC0]/15 hover:text-[#1B1B1B]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.teacherDetails.backToTeachers")}
          </Button>
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#D8CDC0]/60 overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-[#C4A035] via-[#C4A035]/90 to-[#C4A035]/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#2B6F5E]/15 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 top-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2B6F5E] via-[#2B6F5E]/60 to-transparent"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 relative">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white group-hover:shadow-2xl transition-all duration-300">
                  {teacher.first_name?.charAt(0) || "?"}
                  {teacher.last_name?.charAt(0) || ""}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="w-4 h-4 bg-[#C4A035] rounded-full animate-pulse"></div>
                </div>
              </div>

              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl sm:text-4xl font-bold text-[#1B1B1B]">
                        {teacher.first_name || ""}{" "}
                        {teacher.last_name || "Unknown"}
                      </h1>
                      <Briefcase className="w-7 h-7 text-[#C4A035]" />
                    </div>
                    <p className="text-[#6B5D4F] text-sm mb-3">
                      {t("admin.teacherDetails.teacherId", {
                        id: teacher.teacher_id,
                      })}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {teacher.specialization && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#C4A035]/10 text-[#C4A035] border border-[#C4A035]/25">
                          <Award className="w-3.5 h-3.5" />
                          {teacher.specialization}
                        </span>
                      )}
                      {teacher.department && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[#2B6F5E]/8 text-[#2B6F5E] border border-[#2B6F5E]/20">
                          <BookOpen className="w-3.5 h-3.5" />
                          {teacher.department}
                        </span>
                      )}
                    </div>
                    {teacher.created_at && (
                      <div className="inline-flex items-center gap-3 bg-[#C4A035]/5 rounded-xl px-4 py-2.5 border border-[#C4A035]/15">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shrink-0 shadow-md shadow-[#C4A035]/20">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#C4A035] uppercase tracking-wider">
                            {t("admin.teacherDetails.joinedSince")}
                          </p>
                          <p className="text-sm font-bold text-[#1B1B1B]">
                            {new Date(teacher.created_at).toLocaleDateString(
                              locale,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-[10px] text-[#C4A035]">
                            {t("admin.teacherDetails.daysAgo", {
                              count: enrolledDays,
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsEditOpen(true)}
                      className="gap-2 border-[#D8CDC0]/60 text-[#1B1B1B] hover:bg-[#C4A035]/8 hover:border-[#C4A035]/40 hover:text-[#C4A035] transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      {t("admin.teacherDetails.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("admin.teachers.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative bg-white rounded-2xl shadow-lg border border-[#D8CDC0]/60 p-6 sm:p-8 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.teacherDetails.teacherInfo")}
              </h2>
            </div>
            <div className="space-y-2">
              <InfoRow
                icon={Mail}
                label={t("admin.teacherDetails.emailAddress")}
                value={teacher.email || "—"}
                color="teal"
              />
              <InfoRow
                icon={Phone}
                label={t("admin.teacherDetails.phoneNumber")}
                value={teacher.phone_number || "—"}
                color="mustard"
              />
              {teacher.specialization && (
                <InfoRow
                  icon={Award}
                  label={t("admin.teacherDetails.specialization")}
                  value={teacher.specialization}
                  color="teal"
                />
              )}
              {teacher.department && (
                <InfoRow
                  icon={BookOpen}
                  label={t("admin.teacherDetails.department")}
                  value={teacher.department}
                  color="mustard"
                />
              )}
              {teacher.address && (
                <InfoRow
                  icon={MapPin}
                  label={t("admin.teacherDetails.address")}
                  value={teacher.address}
                  color="teal"
                />
              )}
              {teacher.bio && (
                <InfoRow
                  icon={FileText}
                  label={t("admin.teacherDetails.biography")}
                  value={teacher.bio}
                  color="mustard"
                />
              )}
              {teacher.qualifications && (
                <InfoRow
                  icon={GraduationCap}
                  label={t("admin.teacherDetails.qualifications")}
                  value={teacher.qualifications}
                  color="teal"
                />
              )}
            </div>

            <div className="mt-10 pt-8 border-t-2 border-[#D8CDC0]/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 mb-4 shadow-xl shadow-[#C4A035]/20">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1B1B1B] mb-2">
                  {t("admin.teacherDetails.teacherIdCard")}
                </h3>
                <p className="text-sm text-[#6B5D4F] max-w-md mx-auto">
                  {t("admin.teacherDetails.teacherIdCardDesc")}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-1 w-10 bg-gradient-to-r from-[#C4A035] to-[#2B6F5E] rounded-full"></div>
                  <div className="h-1 w-1 bg-[#2B6F5E] rounded-full"></div>
                  <div className="h-1 w-1 bg-[#2B6F5E] rounded-full"></div>
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

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl p-6 text-white bg-gradient-to-br from-[#1B1B1B] via-[#1B1B1B] to-[#2B6F5E]/40">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
              <div className="absolute inset-0 opacity-[0.04]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C4A035] rounded-full -translate-y-16 translate-x-16"></div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#C4A035]/20 flex items-center justify-center border border-[#C4A035]/20">
                    <Activity className="w-5 h-5 text-[#C4A035]" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {t("admin.teacherDetails.teacherStatus")}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-white/50 mb-1">
                      {t("admin.teacherDetails.currentStatus")}
                    </p>
                    <p className="text-2xl font-bold text-[#C4A035] capitalize">
                      {teacher.status === "inactive"
                        ? t("admin.teachers.inactive")
                        : t("admin.teachers.active")}
                    </p>
                  </div>
                  <div className="text-sm text-white/60 bg-white/5 rounded-lg p-3">
                    {teacher.status === "inactive"
                      ? t("admin.teacherDetails.statusInactiveDesc")
                      : t("admin.teacherDetails.statusActiveDesc")}
                  </div>
                </div>
              </div>
            </div>

            {(teacher.courses_count !== undefined ||
              teacher.students_count !== undefined) && (
              <div className="relative bg-white rounded-2xl shadow-lg border border-[#D8CDC0]/60 p-6 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/60"></div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B1B1B]">
                    {t("admin.teacherDetails.teachingStats")}
                  </h3>
                </div>
                <div className="space-y-3">
                  {teacher.courses_count !== undefined && (
                    <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                      <span className="text-sm text-[#6B5D4F]">
                        {t("admin.teacherDetails.courses")}
                      </span>
                      <span className="text-sm font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1 rounded-lg">
                        {teacher.courses_count}
                      </span>
                    </div>
                  )}
                  {teacher.students_count !== undefined && (
                    <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                      <span className="text-sm text-[#6B5D4F]">
                        {t("admin.teacherDetails.students_label")}
                      </span>
                      <span className="text-sm font-bold text-[#C4A035] bg-[#C4A035]/8 px-3 py-1 rounded-lg">
                        {teacher.students_count}
                      </span>
                    </div>
                  )}
                  {enrolledDays !== null && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-[#6B5D4F]">
                        {t("admin.teacherDetails.daysActive")}
                      </span>
                      <span className="text-sm font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1 rounded-lg">
                        {enrolledDays}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="relative bg-white rounded-2xl shadow-lg border border-[#D8CDC0]/60 p-6 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1B1B1B]">
                  {t("admin.teacherDetails.quickInfo")}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                  <span className="text-sm text-[#6B5D4F]">
                    {t("admin.teacherDetails.role")}
                  </span>
                  <span className="text-sm font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1 rounded-lg">
                    {t("admin.teacherDetails.teacher")}
                  </span>
                </div>
                {teacher.department && (
                  <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                    <span className="text-sm text-[#6B5D4F]">
                      {t("admin.teacherDetails.department")}
                    </span>
                    <span className="text-sm font-bold text-[#C4A035] bg-[#C4A035]/8 px-3 py-1 rounded-lg">
                      {teacher.department}
                    </span>
                  </div>
                )}
                {teacher.specialization && (
                  <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                    <span className="text-sm text-[#6B5D4F]">
                      {t("admin.teacherDetails.specialization")}
                    </span>
                    <span className="text-sm font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1 rounded-lg truncate ml-2">
                      {teacher.specialization}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-[#6B5D4F]">
                    {t("admin.teacherDetails.status")}
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${teacher.status === "inactive" ? "text-[#6B5D4F] bg-[#D8CDC0]/30" : "text-[#2B6F5E] bg-[#8DB896]/15"}`}
                  >
                    {teacher.status === "inactive"
                      ? t("admin.teachers.inactive")
                      : t("admin.teachers.active")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditTeacherModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        teacher={teacher}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default TeacherDetailsPage;

function InfoRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "teal" | "mustard";
}) {
  const styles = {
    teal: {
      iconBg: "bg-[#2B6F5E]/10",
      icon: "text-[#2B6F5E]",
      label: "text-[#2B6F5E]",
      hover: "hover:bg-[#2B6F5E]/8",
    },
    mustard: {
      iconBg: "bg-[#C4A035]/10",
      icon: "text-[#C4A035]",
      label: "text-[#C4A035]",
      hover: "hover:bg-[#C4A035]/8",
    },
  };
  const s = styles[color];
  return (
    <div
      className={`group ${s.hover} -mx-4 px-4 py-4 rounded-xl transition-all duration-200`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
        >
          <Icon className={`w-5 h-5 ${s.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-[10px] font-bold ${s.label} uppercase tracking-wider mb-1`}
          >
            {label}
          </p>
          <p className="text-lg font-semibold text-[#1B1B1B] break-all">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
