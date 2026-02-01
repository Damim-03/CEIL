import { Link, useParams } from "react-router-dom";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  useAdminUser,
  useToggleUserStatus,
} from "../../../../hooks/admin/useAdminUsers";
import { RoleBadge } from "../../components/RoleBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { ArrowLeft, Mail, Calendar, Shield, User } from "lucide-react";

const UserDetailsPage = () => {
  const { userId } = useParams();
  const { data: user, isLoading } = useAdminUser(userId!);
  const toggleStatus = useToggleUserStatus();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-900">
            User not found
          </h2>
          <p className="text-gray-600">
            The user you're looking for doesn't exist.
          </p>
          <Link to="/admin/users">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link to="/admin/users">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-8 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.email}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  User ID: {user.user_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge isActive={user.is_active} />
              <RoleBadge role={user.role} />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Email Address
                </p>
                <p className="text-base text-gray-900 mt-1 break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Role</p>
                <div className="mt-1">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">
                  Account Status
                </p>
                <div className="mt-1">
                  <StatusBadge isActive={user.is_active} />
                </div>
              </div>
            </div>

            {/* Created At */}
            {user.created_at && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">
                    Created At
                  </p>
                  <p className="text-base text-gray-900 mt-1">
                    {new Date(user.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {user.is_active
                ? "Disabling this user will prevent them from accessing the system."
                : "Enabling this user will restore their access to the system."}
            </p>
            <Button
              variant={user.is_active ? "destructive" : "default"}
              onClick={() =>
                toggleStatus.mutate({
                  userId: user.user_id,
                  isActive: user.is_active,
                })
              }
              disabled={toggleStatus.isPending}
            >
              {toggleStatus.isPending
                ? "Processing..."
                : user.is_active
                  ? "Disable User"
                  : "Enable User"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
