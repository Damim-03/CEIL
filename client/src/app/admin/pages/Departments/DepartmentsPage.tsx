import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Building2,
  UsersRound,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  useAdminDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../../../../hooks/admin/useAdmin";
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "../../../../types/Types";

// ─── Dialog ───
function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4 border border-[#D8CDC0]/60">
        {children}
      </div>
    </div>
  );
}

// ─── Create/Edit Form ───
function DepartmentForm({
  department,
  onClose,
}: {
  department?: Department | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = !!department;
  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(department?.description || "");
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!name.trim() || name.trim().length < 2) return;
    if (isEdit && department) {
      const data: UpdateDepartmentPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      updateMutation.mutate(
        { id: department.department_id, data },
        { onSuccess: () => onClose() },
      );
    } else {
      const data: CreateDepartmentPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      createMutation.mutate(data, { onSuccess: () => onClose() });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between p-6 border-b border-[#D8CDC0]/30">
        <h2 className="text-lg font-bold text-[#1B1B1B] flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#2B6F5E]" />
          {isEdit
            ? t("admin.departments.editDepartment")
            : t("admin.departments.createDepartment")}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-[#D8CDC0]/15 transition-colors"
        >
          <X className="w-5 h-5 text-[#BEB29E]" />
        </button>
      </div>
      <div className="p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
            {t("admin.departments.departmentName")}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. English Department"
            className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
          />
          {name.length > 0 && name.trim().length < 2 && (
            <p className="text-xs text-red-500 mt-1">
              {t("admin.departments.nameRequired")}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1B1B1B] mb-1.5">
            {t("admin.departments.description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("admin.departments.descriptionPlaceholder")}
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm resize-none transition-all"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 p-6 border-t border-[#D8CDC0]/30 bg-[#D8CDC0]/8 rounded-b-2xl">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-[#D8CDC0]/60 text-[#6B5D4F]"
        >
          {t("admin.departments.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || name.trim().length < 2 || isLoading}
          className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEdit ? (
            <Edit className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isLoading
            ? t("admin.departments.saving")
            : isEdit
              ? t("admin.departments.saveChanges")
              : t("admin.departments.createDepartment")}
        </Button>
      </div>
    </div>
  );
}

// ─── Delete Confirmation ───
function DeleteConfirm({
  department,
  onClose,
}: {
  department: Department;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteDepartment();
  const hasGroups = department.groups && department.groups.length > 0;

  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-[#1B1B1B] mb-2">
        {t("admin.departments.deleteDepartment")}
      </h3>
      <p className="text-sm text-[#6B5D4F] mb-1">
        {t("admin.departments.deleteConfirm")}
      </p>
      <p className="text-sm font-medium text-[#1B1B1B] mb-4">
        "{department.name}"
      </p>
      {hasGroups && (
        <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-[#C4A035]/10 border border-[#C4A035]/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#C4A035] shrink-0" />
          <p className="text-xs text-[#C4A035]">
            {t("admin.departments.hasGroups", {
              count: department.groups!.length,
            })}
          </p>
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-[#D8CDC0]/60 text-[#6B5D4F]"
        >
          {t("admin.departments.cancel")}
        </Button>
        <Button
          onClick={() =>
            deleteMutation.mutate(department.department_id, {
              onSuccess: () => onClose(),
            })
          }
          disabled={deleteMutation.isPending || !!hasGroups}
          className="bg-red-500 hover:bg-red-600 text-white border-0"
        >
          {deleteMutation.isPending
            ? t("admin.departments.deleting")
            : t("admin.departments.yesDelete")}
        </Button>
      </div>
    </div>
  );
}

// ─── Department Row ───
function DepartmentRow({
  department,
  onEdit,
  onDelete,
}: {
  department: Department;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, i18n } = useTranslation();
  const locale =
    i18n.language === "ar"
      ? "ar-DZ"
      : i18n.language === "fr"
        ? "fr-FR"
        : "en-US";
  const groupCount = department.groups?.length || 0;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-[#D8CDC0]/40 hover:border-[#2B6F5E]/20 hover:bg-[#D8CDC0]/8 transition-all">
      <div className="w-12 h-12 rounded-xl bg-[#2B6F5E]/8 flex items-center justify-center shrink-0">
        <Building2 className="w-6 h-6 text-[#2B6F5E]" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-[#1B1B1B] truncate">
          {department.name}
        </h3>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {department.description && (
            <p className="text-xs text-[#BEB29E] truncate max-w-[300px]">
              {department.description}
            </p>
          )}
          <span className="text-xs text-[#BEB29E] flex items-center gap-1">
            <UsersRound className="w-3 h-3" />
            {groupCount}{" "}
            {groupCount !== 1
              ? t("admin.departments.groups_plural")
              : t("admin.departments.groups")}
          </span>
          {department.created_at && (
            <span className="text-xs text-[#BEB29E]">
              {t("admin.departments.created", {
                date: new Date(department.created_at).toLocaleDateString(
                  locale,
                  { year: "numeric", month: "short", day: "numeric" },
                ),
              })}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-[#C4A035]/10 text-[#C4A035] transition-colors"
          title={t("admin.departments.editDepartment")}
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title={t("admin.departments.deleteDepartment")}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───
const DepartmentsPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const { data: departments = [], isLoading } = useAdminDepartments();

  const filtered = departments.filter(
    (d: Department) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase()),
  );
  const totalGroups = departments.reduce(
    (sum: number, d: Department) => sum + (d.groups?.length || 0),
    0,
  );

  const openCreate = () => {
    setEditDepartment(null);
    setShowForm(true);
  };
  const openEdit = (d: Department) => {
    setEditDepartment(d);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditDepartment(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B]">
                {t("admin.departments.title")}
              </h1>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.departments.subtitle")}
              </p>
            </div>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2 shadow-md shadow-[#2B6F5E]/20 self-start"
          >
            <Plus className="w-4 h-4" />
            {t("admin.departments.newDepartment")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2B6F5E]/8 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#2B6F5E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {departments.length}
              </p>
              <p className="text-xs text-[#6B5D4F]">
                {t("admin.departments.totalDepartments")}
              </p>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C4A035]/8 flex items-center justify-center">
              <UsersRound className="w-5 h-5 text-[#C4A035]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B1B1B]">{totalGroups}</p>
              <p className="text-xs text-[#6B5D4F]">
                {t("admin.departments.totalGroups")}
              </p>
            </div>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8DB896]/12 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#3D7A4A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {
                  departments.filter(
                    (d: Department) => (d.groups?.length || 0) > 0,
                  ).length
                }
              </p>
              <p className="text-xs text-[#6B5D4F]">
                {t("admin.departments.withGroups")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.departments.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-2 focus:ring-[#2B6F5E]/20 outline-none text-sm transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-[#2B6F5E]/20 border-t-[#2B6F5E] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-[#BEB29E]" />
            </div>
            <h3 className="text-base font-semibold text-[#1B1B1B] mb-1">
              {search
                ? t("admin.departments.noDepartmentsSearch")
                : t("admin.departments.noDepartments")}
            </h3>
            <p className="text-sm text-[#BEB29E] mb-4">
              {search
                ? t("admin.departments.noDepartmentsSearchDesc")
                : t("admin.departments.noDepartmentsDesc")}
            </p>
            {!search && (
              <Button
                onClick={openCreate}
                className="bg-[#2B6F5E] hover:bg-[#2B6F5E]/90 text-white border-0 gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("admin.departments.newDepartment")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((d: Department) => (
              <DepartmentRow
                key={d.department_id}
                department={d}
                onEdit={() => openEdit(d)}
                onDelete={() => setDeleteTarget(d)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showForm} onClose={closeForm}>
        <DepartmentForm department={editDepartment} onClose={closeForm} />
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <DeleteConfirm
            department={deleteTarget}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
