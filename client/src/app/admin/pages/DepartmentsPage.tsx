import { useState } from "react";
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
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import {
  useAdminDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../../../hooks/admin/useAdmin";
import type {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from "../../../types/Types";

// ─── Format Date ───
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── Dialog Component ───
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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4">
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
  const isEdit = !!department;

  const [name, setName] = useState(department?.name || "");
  const [description, setDescription] = useState(
    department?.description || "",
  );

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
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-brand-teal-dark" />
          {isEdit ? "Edit Department" : "Create New Department"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Department Name <span className="text-red-500">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. English Department"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
          />
          {name.length > 0 && name.trim().length < 2 && (
            <p className="text-xs text-red-500 mt-1">
              Name must be at least 2 characters
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the department..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm resize-none transition-all"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-200 text-gray-600"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || name.trim().length < 2 || isLoading}
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isEdit ? (
            <Edit className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          {isLoading
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Create Department"}
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
  const deleteMutation = useDeleteDepartment();

  const hasGroups = department.groups && department.groups.length > 0;

  const handleDelete = () => {
    deleteMutation.mutate(department.department_id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Delete Department
      </h3>
      <p className="text-sm text-gray-500 mb-1">
        Are you sure you want to delete this department?
      </p>
      <p className="text-sm font-medium text-gray-700 mb-4">
        "{department.name}"
      </p>

      {hasGroups && (
        <div className="flex items-center gap-2 justify-center p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">
            This department has {department.groups!.length} group(s). Remove them
            first before deleting.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gray-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={deleteMutation.isPending || !!hasGroups}
          className="bg-red-500 hover:bg-red-600 text-white border-0"
        >
          {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
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
  const groupCount = department.groups?.length || 0;

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-brand-teal/20 hover:bg-gray-50/50 transition-all">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-brand-teal-dark/10 flex items-center justify-center shrink-0">
        <Building2 className="w-6 h-6 text-brand-teal-dark" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">
          {department.name}
        </h3>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {department.description && (
            <p className="text-xs text-gray-400 truncate max-w-[300px]">
              {department.description}
            </p>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <UsersRound className="w-3 h-3" />
            {groupCount} group{groupCount !== 1 ? "s" : ""}
          </span>
          {department.created_at && (
            <span className="text-xs text-gray-400">
              Created {formatDate(department.created_at)}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───
const DepartmentsPage = () => {
  const [search, setSearch] = useState("");

  // Dialogs
  const [showForm, setShowForm] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const { data: departments = [], isLoading } = useAdminDepartments();

  // Filter
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-teal-dark" />
            Departments
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage organizational departments and their groups
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          New Department
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-dark/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-brand-teal-dark" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.length}
              </p>
              <p className="text-xs text-gray-500">Total Departments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <UsersRound className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalGroups}</p>
              <p className="text-xs text-gray-500">Total Groups</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {departments.filter((d: Department) => (d.groups?.length || 0) > 0).length}
              </p>
              <p className="text-xs text-gray-500">With Groups</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-gray-100 mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-sm transition-all"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-gray-100">
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-brand-teal/20 border-t-brand-teal-dark rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">
                {search ? "No departments found" : "No departments yet"}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {search
                  ? "Try a different search term"
                  : "Start by creating a new department"}
              </p>
              {!search && (
                <Button
                  onClick={openCreate}
                  className="bg-brand-teal-dark hover:bg-brand-teal-dark/90 text-white border-0 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Department
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onClose={closeForm}>
        <DepartmentForm department={editDepartment} onClose={closeForm} />
      </Dialog>

      {/* Delete Dialog */}
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