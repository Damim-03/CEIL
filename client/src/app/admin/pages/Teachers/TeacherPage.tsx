import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Eye,
  Trash2,
  Search,
  UserPlus,
  Users,
  Mail,
  Phone,
  X,
  Loader2,
} from "lucide-react";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  useAdminTeachers,
  useDeleteTeacher,
  useCreateTeacher,
} from "../../../../hooks/admin/useAdmin";

/* ═══════════════════════════════════════════════════════
   ADD TEACHER DIALOG
═══════════════════════════════════════════════════════ */
interface AddTeacherDialogProps {
  open: boolean;
  onClose: () => void;
}

const AddTeacherDialog = ({ open, onClose }: AddTeacherDialogProps) => {
  const { t } = useTranslation();
  const createTeacher = useCreateTeacher();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError(t("admin.teachers.nameRequired"));
      return;
    }
    createTeacher.mutate(form, {
      onSuccess: () => {
        setForm({ first_name: "", last_name: "", email: "", phone_number: "" });
        setError("");
        onClose();
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.message || t("admin.teachers.createFailed"),
        );
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 border border-[#D8CDC0]/60">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2B6F5E]/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#2B6F5E]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1B1B1B]">
                {t("admin.teachers.addTeacher")}
              </h2>
              <p className="text-sm text-[#BEB29E]">
                {t("admin.teachers.createRecord")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 transition-colors"
          >
            <X className="w-5 h-5 text-[#6B5D4F]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
                {t("admin.teachers.firstName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Ahmed"
                className="border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
                {t("admin.teachers.lastName")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Benali"
                className="border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.teachers.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
              <Input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="teacher@example.com"
                className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
              {t("admin.teachers.phoneNumber")}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
              <Input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="0555 123 456"
                className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
              />
            </div>
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#D8CDC0]/60 text-[#6B5D4F] hover:bg-[#D8CDC0]/10"
              disabled={createTeacher.isPending}
            >
              {t("admin.teachers.cancel")}
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white"
              disabled={createTeacher.isPending}
            >
              {createTeacher.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("admin.teachers.creating")}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {t("admin.teachers.addTeacher")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TEACHERS PAGE
═══════════════════════════════════════════════════════ */
const TeachersPage = () => {
  const { t } = useTranslation();
  const { data: teachers = [], isLoading } = useAdminTeachers();
  const deleteTeacher = useDeleteTeacher();
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  if (isLoading) return <PageLoader />;

  const filteredTeachers = teachers.filter((tc) =>
    `${tc.first_name} ${tc.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const stats = {
    total: teachers.length,
    active:
      teachers.filter((tc) => tc.status === "active").length || teachers.length,
    inactive: teachers.filter((tc) => tc.status === "inactive").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.teachers.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.teachers.subtitle")}
              </p>
            </div>
          </div>
          <Button
            className="gap-2 bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white shadow-md shadow-[#2B6F5E]/20"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="w-4 h-4" />
            {t("admin.teachers.addTeacher")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2B6F5E]/8 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[#2B6F5E]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.teachers.total")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#8DB896]/12 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#3D7A4A]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.teachers.active")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#BEB29E] to-[#BEB29E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D8CDC0]/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#6B5D4F]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.teachers.inactive")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
          <Input
            placeholder={t("admin.teachers.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
          />
        </div>
        <div className="mt-3 text-sm text-[#6B5D4F]">
          {t("admin.teachers.showing")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {filteredTeachers.length}
          </span>{" "}
          {t("admin.teachers.of")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {teachers.length}
          </span>{" "}
          {t("admin.teachers.teachers_label")}
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {filteredTeachers.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/40">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.teacher_id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-5 hover:bg-[#D8CDC0]/8 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/70 flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-md shadow-[#2B6F5E]/15">
                    {teacher.first_name?.charAt(0)}
                    {teacher.last_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1B1B1B] text-lg">
                      {teacher.first_name} {teacher.last_name}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm text-[#6B5D4F]">
                      {teacher.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#BEB29E]" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                      )}
                      {teacher.phone_number && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#BEB29E]" />
                          <span>{teacher.phone_number}</span>
                        </div>
                      )}
                    </div>
                    {teacher.specialization && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#C4A035]/10 text-[#C4A035] border border-[#C4A035]/20">
                          {teacher.specialization}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 lg:shrink-0">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-[#2B6F5E]/30 text-[#2B6F5E] hover:bg-[#2B6F5E]/8 hover:border-[#2B6F5E]/50"
                  >
                    <Link to={`/admin/teachers/${teacher.teacher_id}`}>
                      <Eye className="h-4 w-4" />
                      {t("admin.teachers.viewDetails")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          t("admin.teachers.deleteConfirm", {
                            name: `${teacher.first_name} ${teacher.last_name}`,
                          }),
                        )
                      )
                        deleteTeacher.mutate(teacher.teacher_id);
                    }}
                    disabled={deleteTeacher.isPending}
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("admin.teachers.delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-[#BEB29E]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
              {t("admin.teachers.noTeachersFound")}
            </h3>
            <p className="text-[#6B5D4F] text-sm">
              {search
                ? t("admin.teachers.noTeachersDesc")
                : t("admin.teachers.noTeachersEmpty")}
            </p>
          </div>
        )}
      </div>

      <AddTeacherDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
};

export default TeachersPage;
