/* ===============================================================
   UsersPage.tsx — Owner: All Users Management
   
   📁 src/app/owner/pages/Users/UsersPage.tsx
=============================================================== */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useOwnerUsers,
  useOwnerChangeRole,
} from "../../../../hooks/owner/Useowner.hooks";
import type { UserFilters } from "../../../../types/Types";
import { Users, Search, Crown } from "lucide-react";

const ROLES = ["", "OWNER", "ADMIN", "TEACHER", "STUDENT"] as const;

const UsersPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");
  const [roleChange, setRoleChange] = useState<{
    userId: string;
    email: string;
    currentRole: string;
    newRole: string;
  } | null>(null);

  const { data, isLoading } = useOwnerUsers({
    ...filters,
    search: search || undefined,
  });
  const changeRole = useOwnerChangeRole();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("owner.users.title", "All Users")}
          </h1>
          <p className="text-sm text-[#BEB29E] dark:text-[#666666]">
            {data?.meta.total || 0} {t("owner.users.total", "total users")}
          </p>
        </div>
      </div>

      {/* ═══ Filters ═══ */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#BEB29E]" />
            <input
              type="text"
              placeholder={t(
                "owner.users.search",
                "Search by name or email...",
              )}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm w-full pl-9 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
            />
          </div>
        </form>

        <select
          value={filters.role || ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              role: e.target.value || undefined,
              page: 1,
            }))
          }
          className="select select-bordered select-sm bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
        >
          <option value="">{t("owner.users.allRoles", "All Roles")}</option>
          {ROLES.filter(Boolean).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          value={filters.is_active ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              is_active: e.target.value || undefined,
              page: 1,
            }))
          }
          className="select select-bordered select-sm bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
        >
          <option value="">{t("owner.users.allStatus", "All Status")}</option>
          <option value="true">{t("common.active", "Active")}</option>
          <option value="false">{t("common.disabled", "Disabled")}</option>
        </select>
      </div>

      {/* ═══ Users Table ═══ */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.users.user", "User")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.users.role", "Role")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.users.status", "Status")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                  {t("owner.users.created", "Joined")}
                </th>
                <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium text-right">
                  {t("owner.users.changeRole", "Change Role")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((user) => {
                const name = user.student
                  ? `${user.student.first_name} ${user.student.last_name}`
                  : user.teacher
                    ? `${user.teacher.first_name} ${user.teacher.last_name}`
                    : user.email.split("@")[0];

                return (
                  <tr
                    key={user.user_id}
                    className="border-b border-[#D8CDC0]/10 dark:border-[#2A2A2A]/50 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors"
                  >
                    <td>
                      <div>
                        <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {name}
                        </p>
                        <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                          {user.email}
                        </p>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={user.role} />
                    </td>
                    <td>
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          user.is_active ? "bg-emerald-500" : "bg-red-400"
                        }`}
                      />
                      <span className="text-xs ml-1.5 text-[#6B5D4F] dark:text-[#AAAAAA]">
                        {user.is_active
                          ? t("common.active", "Active")
                          : t("common.disabled", "Disabled")}
                      </span>
                    </td>
                    <td className="text-xs text-[#BEB29E] dark:text-[#666666]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex justify-end">
                        <select
                          value={user.role}
                          onChange={(e) => {
                            if (e.target.value !== user.role) {
                              setRoleChange({
                                userId: user.user_id,
                                email: user.email,
                                currentRole: user.role,
                                newRole: e.target.value,
                              });
                            }
                          }}
                          className="select select-bordered select-xs bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                        >
                          {ROLES.filter(Boolean).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.meta.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))
              }
              disabled={(filters.page || 1) <= 1}
              className="btn btn-ghost btn-xs"
            >
              ←
            </button>
            <span className="text-xs text-[#BEB29E] dark:text-[#666666]">
              {filters.page || 1} / {data.meta.pages}
            </span>
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))
              }
              disabled={(filters.page || 1) >= data.meta.pages}
              className="btn btn-ghost btn-xs"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* ═══ Role Change Confirm ═══ */}
      {roleChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 max-w-sm w-full mx-4 border border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              {t("owner.users.confirmRoleChange", "Change User Role?")}
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#AAAAAA] mb-1">
              {roleChange.email}
            </p>
            <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-4">
              {roleChange.currentRole} → {roleChange.newRole}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRoleChange(null)}
                className="btn btn-ghost btn-sm"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={() => {
                  changeRole.mutate({
                    userId: roleChange.userId,
                    role: roleChange.newRole,
                  });
                  setRoleChange(null);
                }}
                className="btn btn-sm bg-[#D4A843] hover:bg-[#B8912E] text-white border-none"
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

export default UsersPage;

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    OWNER:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    ADMIN: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    TEACHER:
      "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    STUDENT:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${map[role] || map.STUDENT}`}
    >
      {role === "OWNER" && <Crown className="h-3 w-3" />}
      {role}
    </span>
  );
}
