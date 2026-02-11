import { UserCircle } from "lucide-react";

const TeacherProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <UserCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your profile information</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-12 text-center">
        <UserCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">This page is under construction.</p>
      </div>
    </div>
  );
};

export default TeacherProfile;