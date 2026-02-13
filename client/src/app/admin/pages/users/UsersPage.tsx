import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../../../../components/ui/input";
import { RoleBadge } from "../../components/RoleBadge";
import { StatusBadge } from "../../components/StatusBadge";
import {
  useAdminUsers,
  useChangeUserRole,
} from "../../../../hooks/admin/useAdmin";
import { Search, Users, Eye, Filter, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { ShieldCheck, Shield, User } from "lucide-react";
import type { UserRole } from "../../../../lib/api/admin/admin.api";
import { useAuth } from "../../../../context/AuthContext";

const UsersPage = () => {
  const { t } = useTranslation();
  const { data: users, isLoading } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [changingUserId, setChangingUserId] = useState<string | null>(null);
  const { mutate: changeRole, isPending: isChangingRole } = useChangeUserRole();

  if (isLoading) return <PageLoader />;

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const user = users?.find((u) => u.user_id === userId);
    if (!user || user.role === newRole) return;
    setChangingUserId(userId);
    changeRole(
      { userId, role: newRole },
      { onSettled: () => setChangingUserId(null) },
    );
  };

  const filtered = users?.filter((u) => {
    const isCurrentUser =
      u.user_id === currentUser?.user_id ||
      String(u.user_id) === String(currentUser?.user_id) ||
      u.email === currentUser?.email;
    if (isCurrentUser) return false;

    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "inactive" && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const usersWithoutCurrent = users?.filter(
    (u) => u.user_id !== currentUser?.user_id,
  );

  const stats = {
    total: usersWithoutCurrent?.length || 0,
    active: usersWithoutCurrent?.filter((u) => u.is_active).length || 0,
    inactive: usersWithoutCurrent?.filter((u) => !u.is_active).length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B1B1B]">
              {t("admin.users.title")}
            </h1>
            <p className="text-sm text-[#BEB29E] mt-0.5">
              {t("admin.users.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-5 overflow-hidden group hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/70 opacity-60 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#2B6F5E]/8 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#2B6F5E]" />
            </div>
            <div>
              <p className="text-xs text-[#6B5D4F] font-medium">
                {t("admin.users.totalUsers")}
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
                {t("admin.users.active")}
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
                {t("admin.users.inactive")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B]">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BEB29E]" />
            <Input
              placeholder={t("admin.users.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#D8CDC0]/60 focus:border-[#2B6F5E] focus:ring-[#2B6F5E]/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#BEB29E]" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-[#D8CDC0]/60 rounded-lg text-sm text-[#1B1B1B] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E] bg-white"
            >
              <option value="all">{t("admin.users.allRoles")}</option>
              <option value="ADMIN">{t("admin.users.admin")}</option>
              <option value="TEACHER">{t("admin.users.teacher")}</option>
              <option value="STUDENT">{t("admin.users.student")}</option>
            </select>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-[#D8CDC0]/60 rounded-lg text-sm text-[#1B1B1B] focus:outline-none focus:ring-2 focus:ring-[#2B6F5E]/20 focus:border-[#2B6F5E] bg-white"
          >
            <option value="all">{t("admin.users.allStatus")}</option>
            <option value="active">{t("admin.users.active")}</option>
            <option value="inactive">{t("admin.users.inactive")}</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-[#6B5D4F]">
          {t("admin.users.showing")}{" "}
          <span className="font-semibold text-[#1B1B1B]">
            {filtered?.length || 0}
          </span>{" "}
          {t("admin.users.of")}{" "}
          <span className="font-semibold text-[#1B1B1B]">{stats.total}</span>{" "}
          {t("admin.users.users_label")}
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-2xl border border-[#D8CDC0]/60 overflow-hidden">
        {filtered && filtered.length > 0 ? (
          <div className="divide-y divide-[#D8CDC0]/40">
            {filtered.map((user) => (
              <div
                key={user.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#D8CDC0]/8 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {user.google_avatar ? (
                    <img
                      src={user.google_avatar}
                      alt={`${user.email} avatar`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#D8CDC0]/60 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/70 flex items-center justify-center text-white font-semibold text-lg shrink-0 shadow-md shadow-[#2B6F5E]/15">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1B1B1B] truncate">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <RoleBadge role={user.role} />
                      <StatusBadge isActive={user.is_active} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-[#D8CDC0]/60 text-[#1B1B1B] hover:bg-[#2B6F5E]/5 hover:text-[#2B6F5E] hover:border-[#2B6F5E]/30"
                        disabled={
                          isChangingRole && changingUserId === user.user_id
                        }
                      >
                        <UserCog className="w-4 h-4" />
                        {t("admin.users.changeRole")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        {t("admin.users.assignRole")}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user.user_id, "ADMIN")}
                        disabled={user.role === "ADMIN"}
                        className="gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t("admin.users.admin")}</span>
                        {user.role === "ADMIN" && (
                          <span className="ml-auto text-xs text-[#BEB29E]">
                            {t("admin.users.current")}
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleRoleChange(user.user_id, "TEACHER")
                        }
                        disabled={user.role === "TEACHER"}
                        className="gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>{t("admin.users.teacher")}</span>
                        {user.role === "TEACHER" && (
                          <span className="ml-auto text-xs text-[#BEB29E]">
                            {t("admin.users.current")}
                          </span>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleRoleChange(user.user_id, "STUDENT")
                        }
                        disabled={user.role === "STUDENT"}
                        className="gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>{t("admin.users.student")}</span>
                        {user.role === "STUDENT" && (
                          <span className="ml-auto text-xs text-[#BEB29E]">
                            {t("admin.users.current")}
                          </span>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2 border-[#2B6F5E]/30 text-[#2B6F5E] hover:bg-[#2B6F5E]/8 hover:border-[#2B6F5E]/50"
                  >
                    <Link to={`/admin/users/${user.user_id}`}>
                      <Eye className="w-4 h-4" />
                      {t("admin.users.view")}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D8CDC0]/20 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#BEB29E]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B1B1B] mb-1">
              {t("admin.users.noUsersFound")}
            </h3>
            <p className="text-[#6B5D4F] text-sm">
              {search || filterRole !== "all" || filterStatus !== "all"
                ? t("admin.users.noUsersDesc")
                : t("admin.users.noUsersEmpty")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
