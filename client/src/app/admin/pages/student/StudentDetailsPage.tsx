import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const { studentId } = useParams();
  const { data: student, isLoading, refetch } = useAdminStudent(studentId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";

  if (isLoading) return <PageLoader />;

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 p-8 bg-white rounded-3xl shadow-xl border border-[#D8CDC0]/60 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#D8CDC0]/20 flex items-center justify-center">
            <GraduationCap className="w-12 h-12 text-[#BEB29E]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[#1B1B1B] mb-2">
              {t("admin.studentDetails.studentNotFound")}
            </h2>
            <p className="text-[#6B5D4F] text-lg">
              {t("admin.studentDetails.studentNotFoundDesc")}
            </p>
          </div>
          <Link to="/admin/students">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 mt-4 border-[#D8CDC0]/60 hover:bg-[#D8CDC0]/10"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("admin.studentDetails.backToStudents")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const enrolledDays = student.created_at
    ? Math.floor(
        (new Date().getTime() - new Date(student.created_at).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <Link to="/admin/students">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-[#6B5D4F] hover:bg-[#D8CDC0]/15 hover:text-[#1B1B1B]"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("admin.studentDetails.backToStudents")}
          </Button>
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#D8CDC0]/60 overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-[#2B6F5E] via-[#2B6F5E]/90 to-[#2B6F5E]/80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#C4A035]/15 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 top-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C4A035] via-[#C4A035]/60 to-transparent"></div>
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 relative">
              <div className="relative group">
                {student.user?.google_avatar ? (
                  <img
                    src={student.user.google_avatar}
                    alt={`${student.first_name || ""} ${student.last_name || ""}`}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white group-hover:shadow-2xl transition-all duration-300">
                    {student.first_name?.charAt(0) || "?"}
                    {student.last_name?.charAt(0) || ""}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  {student.status === "Active" ? (
                    <div className="w-4 h-4 bg-[#8DB896] rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-4 h-4 bg-[#BEB29E] rounded-full"></div>
                  )}
                </div>
              </div>

              <div className="flex-1 sm:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl sm:text-4xl font-bold text-[#1B1B1B]">
                        {student.first_name || ""}{" "}
                        {student.last_name || "Unknown"}
                      </h1>
                      <GraduationCap className="w-7 h-7 text-[#C4A035]" />
                    </div>
                    <p className="text-[#6B5D4F] text-sm mb-3">
                      {t("admin.studentDetails.studentId", {
                        id: student.student_id,
                      })}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold ${student.status === "Active" ? "bg-[#8DB896]/15 text-[#2B6F5E] border border-[#8DB896]/30" : "bg-[#D8CDC0]/30 text-[#6B5D4F] border border-[#D8CDC0]/50"}`}
                      >
                        {student.status || t("admin.studentDetails.unknown")}
                      </span>
                    </div>
                    {student.created_at && (
                      <div className="inline-flex items-center gap-3 bg-[#2B6F5E]/5 rounded-xl px-4 py-2.5 border border-[#2B6F5E]/15">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shrink-0 shadow-md shadow-[#2B6F5E]/20">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#2B6F5E] uppercase tracking-wider">
                            {t("admin.studentDetails.enrolledSince")}
                          </p>
                          <p className="text-sm font-bold text-[#1B1B1B]">
                            {new Date(student.created_at).toLocaleDateString(
                              locale,
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-[10px] text-[#2B6F5E]">
                            {t("admin.studentDetails.daysAgo", {
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
                      {t("admin.studentDetails.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t("admin.students.delete")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative bg-white rounded-2xl shadow-lg border border-[#D8CDC0]/60 p-6 sm:p-8 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.studentDetails.studentInfo")}
              </h2>
            </div>
            <div className="space-y-2">
              <InfoRow
                icon={Mail}
                label={t("admin.studentDetails.emailAddress")}
                value={student.email || "—"}
                color="teal"
              />
              <InfoRow
                icon={Phone}
                label={t("admin.studentDetails.phoneNumber")}
                value={student.phone_number || "—"}
                color="mustard"
              />
              {student.date_of_birth && (
                <InfoRow
                  icon={Calendar}
                  label={t("admin.studentDetails.dateOfBirth")}
                  value={new Date(student.date_of_birth).toLocaleDateString(
                    locale,
                    { year: "numeric", month: "long", day: "numeric" },
                  )}
                  color="teal"
                />
              )}
              {student.address && (
                <InfoRow
                  icon={MapPin}
                  label={t("admin.studentDetails.address")}
                  value={student.address}
                  color="mustard"
                />
              )}
              {student.emergency_contact && (
                <InfoRow
                  icon={AlertCircle}
                  label={t("admin.studentDetails.emergencyContact")}
                  value={student.emergency_contact}
                  color="teal"
                />
              )}
            </div>

            <div className="mt-10 pt-8 border-t-2 border-[#D8CDC0]/30">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 mb-4 shadow-xl shadow-[#2B6F5E]/20">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#1B1B1B] mb-2">
                  {t("admin.studentDetails.studentIdCard")}
                </h3>
                <p className="text-sm text-[#6B5D4F] max-w-md mx-auto">
                  {t("admin.studentDetails.studentIdCardDesc")}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="h-1 w-10 bg-gradient-to-r from-[#2B6F5E] to-[#C4A035] rounded-full"></div>
                  <div className="h-1 w-1 bg-[#C4A035] rounded-full"></div>
                  <div className="h-1 w-1 bg-[#C4A035] rounded-full"></div>
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

          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl p-6 text-white bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E] to-[#2B6F5E]/90">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
              <div className="absolute inset-0 opacity-[0.06]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/10">
                    <Activity className="w-5 h-5 text-[#C4A035]" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {t("admin.studentDetails.studentStatus")}
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-white/60 mb-1">
                      {t("admin.studentDetails.currentStatus")}
                    </p>
                    <p className="text-2xl font-bold text-[#C4A035] capitalize">
                      {student.status || t("admin.studentDetails.unknown")}
                    </p>
                  </div>
                  <div className="text-sm text-white/70 bg-white/5 rounded-lg p-3">
                    {student.status === "Active"
                      ? t("admin.studentDetails.statusActiveDesc")
                      : t("admin.studentDetails.statusInactiveDesc")}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-lg border border-[#D8CDC0]/60 p-6 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1B1B1B]">
                  {t("admin.studentDetails.quickInfo")}
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                  <span className="text-sm text-[#6B5D4F]">
                    {t("admin.studentDetails.type")}
                  </span>
                  <span className="text-sm font-bold text-[#2B6F5E] bg-[#2B6F5E]/8 px-3 py-1 rounded-lg">
                    {t("admin.studentDetails.student")}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#D8CDC0]/30">
                  <span className="text-sm text-[#6B5D4F]">
                    {t("admin.studentDetails.status")}
                  </span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-lg ${student.status === "Active" ? "text-[#2B6F5E] bg-[#8DB896]/15" : "text-[#6B5D4F] bg-[#D8CDC0]/30"}`}
                  >
                    {student.status || t("admin.studentDetails.unknown")}
                  </span>
                </div>
                {enrolledDays !== null && (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-[#6B5D4F]">
                      {t("admin.studentDetails.enrollmentAge")}
                    </span>
                    <span className="text-sm font-bold text-[#C4A035] bg-[#C4A035]/8 px-3 py-1 rounded-lg">
                      {t("admin.studentDetails.days", { count: enrolledDays })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditStudentModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        student={student}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default StudentDetailsPage;

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
