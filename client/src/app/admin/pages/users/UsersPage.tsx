import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "../../../../components/ui/input";
import { RoleBadge } from "../../components/RoleBadge";
import { StatusBadge } from "../../components/StatusBadge";
import {
  useAdminUsers,
  useChangeUserRole,
} from "../../../../hooks/admin/useAdminUsers";
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
import type { UserRole } from "../../../../lib/api/admin/adminUsers.api";
import { useAuth } from "../../../../context/AuthContext";

const UsersPage = () => {
  const { data: users, isLoading } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [changingUserId, setChangingUserId] = useState<string | null>(null);
  const { mutate: changeRole, isLoading: isChangingRole } = useChangeUserRole();

  if (isLoading) return <PageLoader />;

  // Function to handle role change
  const handleRoleChange = (userId: string, newRole: UserRole) => {
    const user = users?.find((u) => u.user_id === userId);
    if (!user || user.role === newRole) return;

    setChangingUserId(userId);

    changeRole(
      { userId, role: newRole },
      {
        onSettled: () => {
          setChangingUserId(null);
        },
      },
    );
  };

  const filtered = users?.filter((u) => {
    // Try multiple comparison methods to ensure current user is excluded
    const isCurrentUser =
      u.user_id === currentUser?.user_id ||
      String(u.user_id) === String(currentUser?.user_id) ||
      u.email === currentUser?.email;

    if (isCurrentUser) {
      console.log("Filtering out current user:", u);
      return false;
    }

    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && u.is_active) ||
      (filterStatus === "inactive" && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Exclude current user from stats
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
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all platform users
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inactive Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TEACHER">Teacher</option>
              <option value="STUDENT">Student</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filtered?.length || 0}
          </span>{" "}
          of <span className="font-semibold text-gray-900">{stats.total}</span>{" "}
          users
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered && filtered.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filtered.map((user) => (
              <div
                key={user.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <RoleBadge role={user.role} />
                      <StatusBadge isActive={user.is_active} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:shrink-0">
                  {/* Change Role Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={
                          isChangingRole && changingUserId === user.user_id
                        }
                      >
                        <UserCog className="w-4 h-4" />
                        Change Role
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Assign Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(user.user_id, "ADMIN")}
                        disabled={user.role === "ADMIN"}
                        className="gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin</span>
                        {user.role === "ADMIN" && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Current
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
                        <span>Teacher</span>
                        {user.role === "TEACHER" && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Current
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
                        <span>Student</span>
                        {user.role === "STUDENT" && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            Current
                          </span>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* View Details Button */}
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link to={`/admin/users/${user.user_id}`}>
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No users found
            </h3>
            <p className="text-gray-600 text-sm">
              {search || filterRole !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "No users available at the moment"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
