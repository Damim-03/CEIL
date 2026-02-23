/* ===============================================================
   AdminsPage.tsx — Manage Admin Accounts
   
   📁 src/app/owner/pages/Admins/AdminsPage.tsx
=============================================================== */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useOwnerAdmins,
  useCreateAdmin,
  useActivateAdmin,
  useDeactivateAdmin,
  useDeleteAdmin,
  usePromoteToOwner,
} from "../../../../hooks/owner/Useowner.hooks";
import type { AdminAccount } from "../../../../types/Types";
import {
  ShieldCheck,
  Plus,
  Crown,
  Power,
  Trash2,
  ArrowUpCircle,
  X,
} from "lucide-react";

const AdminsPage = () => {
  const { t } = useTranslation();
  const { data: admins, isLoading } = useOwnerAdmins();
  const createAdmin = useCreateAdmin();
  const activateAdmin = useActivateAdmin();
  const deactivateAdmin = useDeactivateAdmin();
  const deleteAdmin = useDeleteAdmin();
  const promoteToOwner = usePromoteToOwner();

  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "promote" | "deactivate";
    admin: AdminAccount;
  } | null>(null);

  const handleCreate = () => {
    if (!email.trim()) return;
    createAdmin.mutate(
      { email, password: password || undefined },
      {
        onSuccess: () => {
          setShowCreate(false);
          setEmail("");
          setPassword("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("owner.admins.title", "Admin Management")}
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666]">
              {admins?.length || 0} {t("owner.admins.total", "accounts")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-sm bg-[#D4A843] hover:bg-[#B8912E] text-white border-none gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("owner.admins.create", "New Admin")}
        </button>
      </div>

      {/* ═══ Create Modal ═══ */}
      {showCreate && (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("owner.admins.createTitle", "Create New Admin")}
            </h3>
            <button
              onClick={() => setShowCreate(false)}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="email"
              placeholder={t(
                "owner.admins.emailPlaceholder",
                "admin@email.com",
              )}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered input-sm w-full bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            />
            <input
              type="password"
              placeholder={t(
                "owner.admins.passwordPlaceholder",
                "Password (optional)",
              )}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered input-sm w-full bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            />
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="btn btn-ghost btn-sm"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              onClick={handleCreate}
              disabled={createAdmin.isPending || !email.trim()}
              className="btn btn-sm bg-[#D4A843] hover:bg-[#B8912E] text-white border-none"
            >
              {createAdmin.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                t("common.create", "Create")
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Admins Table ═══ */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.admins.email", "Email")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.admins.role", "Role")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.admins.status", "Status")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.admins.created", "Created")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium text-right">
                  {t("owner.admins.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {admins?.map((admin) => (
                <tr
                  key={admin.user_id}
                  className="border-b border-[#D8CDC0]/10 dark:border-[#2A2A2A]/50 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors"
                >
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        {admin.google_avatar ? (
                          <img
                            src={admin.google_avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center text-white text-xs font-semibold">
                            {admin.email.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {admin.email}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                        admin.role === "OWNER"
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {admin.role === "OWNER" && <Crown className="h-3 w-3" />}
                      {admin.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        admin.is_active ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    />
                    <span className="text-xs ml-1.5 text-[#6B5D4F] dark:text-[#AAAAAA]">
                      {admin.is_active
                        ? t("common.active", "Active")
                        : t("common.disabled", "Disabled")}
                    </span>
                  </td>
                  <td className="text-xs text-[#BEB29E] dark:text-[#666666]">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {admin.role !== "OWNER" && (
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() =>
                            admin.is_active
                              ? setConfirmAction({ type: "deactivate", admin })
                              : activateAdmin.mutate(admin.user_id)
                          }
                          className="btn btn-ghost btn-xs"
                          title={
                            admin.is_active
                              ? t("owner.admins.deactivate", "Deactivate")
                              : t("owner.admins.activate", "Activate")
                          }
                        >
                          <Power
                            className={`h-3.5 w-3.5 ${
                              admin.is_active
                                ? "text-orange-500"
                                : "text-emerald-500"
                            }`}
                          />
                        </button>

                        {/* Promote */}
                        <button
                          onClick={() =>
                            setConfirmAction({ type: "promote", admin })
                          }
                          className="btn btn-ghost btn-xs"
                          title={t("owner.admins.promote", "Promote to Owner")}
                        >
                          <ArrowUpCircle className="h-3.5 w-3.5 text-[#D4A843]" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() =>
                            setConfirmAction({ type: "delete", admin })
                          }
                          className="btn btn-ghost btn-xs"
                          title={t("owner.admins.delete", "Delete")}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ Confirm Dialog ═══ */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 max-w-sm w-full mx-4 border border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              {confirmAction.type === "delete"
                ? t("owner.admins.confirmDelete", "Delete Admin?")
                : confirmAction.type === "promote"
                  ? t("owner.admins.confirmPromote", "Promote to Owner?")
                  : t("owner.admins.confirmDeactivate", "Deactivate Admin?")}
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#AAAAAA] mb-1">
              {confirmAction.admin.email}
            </p>
            <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-4">
              {confirmAction.type === "delete"
                ? t(
                    "owner.admins.deleteWarning",
                    "This action cannot be undone.",
                  )
                : confirmAction.type === "promote"
                  ? t(
                      "owner.admins.promoteWarning",
                      "This will grant full system access.",
                    )
                  : t(
                      "owner.admins.deactivateWarning",
                      "The admin will lose access.",
                    )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="btn btn-ghost btn-sm"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === "delete") {
                    deleteAdmin.mutate(confirmAction.admin.user_id);
                  } else if (confirmAction.type === "promote") {
                    promoteToOwner.mutate(confirmAction.admin.user_id);
                  } else {
                    deactivateAdmin.mutate(confirmAction.admin.user_id);
                  }
                  setConfirmAction(null);
                }}
                className={`btn btn-sm border-none text-white ${
                  confirmAction.type === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : confirmAction.type === "promote"
                      ? "bg-[#D4A843] hover:bg-[#B8912E]"
                      : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {t("common.confirm", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage;
