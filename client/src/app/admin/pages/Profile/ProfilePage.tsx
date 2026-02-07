// pages/admin/profile/ProfilePage.tsx
import { useRef, useState } from "react";
import { useMe, useLogout } from "../../../../hooks/auth/auth.hooks";
import { useUpdateAdminAvatar } from "../../../../hooks/admin/useAdmin";
import PageLoader from "../../../../components/PageLoader";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import {
  LogOut,
  Mail,
  Shield,
  Camera,
  Upload,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { UserIDCardFlip } from "../../components/UserIDCardFlip";

const ProfilePage = () => {
  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();
  const updateAvatarMutation = useUpdateAdminAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    updateAvatarMutation.mutate(file, {
      onSuccess: () => {
        setPreviewUrl(null);
      },
      onError: () => {
        setPreviewUrl(null);
      },
    });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  const currentAvatar = previewUrl || user.google_avatar || undefined;

  // Role color mapping
  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "TEACHER":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "STUDENT":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your account and view your information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - ID Card */}
          <div className="lg:col-span-1">
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Digital ID Card
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <UserIDCardFlip profile={user} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Profile Card */}
            <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600 text-white">
                <CardTitle className="text-lg">Profile Information</CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                        <AvatarImage src={currentAvatar} />
                        <AvatarFallback className="text-3xl bg-linear-to-br from-blue-500 to-indigo-600 text-white">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Upload Overlay */}
                      <button
                        onClick={handleAvatarClick}
                        disabled={updateAvatarMutation.isPending}
                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                      >
                        {updateAvatarMutation.isPending ? (
                          <Upload className="h-8 w-8 text-white animate-pulse" />
                        ) : (
                          <Camera className="h-8 w-8 text-white" />
                        )}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.email?.split("@")[0]}
                    </h2>
                    <p className="text-gray-600">{user.email}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge
                        variant="outline"
                        className={`${getRoleColor(user.role)} border px-3 py-1`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${
                          user.is_active
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        } border px-3 py-1`}
                      >
                        {user.is_active ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Click on avatar to update your photo
                    </p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group p-4 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">
                          Email Address
                        </p>
                        <p className="font-semibold text-gray-900 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-lg border-2 border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Role
                        </p>
                        <p className="font-semibold text-gray-900">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-lg border-2 border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          User ID
                        </p>
                        <p className="font-semibold text-gray-900 font-mono">
                          {user.user_id || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group p-4 rounded-lg border-2 border-gray-100 hover:border-green-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">
                          Account Status
                        </p>
                        <p className="font-semibold text-gray-900">
                          {user.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Account Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <Button
                    variant="outline"
                    className="border-2 hover:bg-gray-50"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Security Settings
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    className="bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
