import { Redirect } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { PageLoader } from "@/src/components/ui";

export default function Index() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) return <Redirect href="/auth/login" />;

  const redirectMap: Record<string, string> = {
    STUDENT: "/(student)",
    TEACHER: "/(teacher)",
    ADMIN: "/(admin)",
    OWNER: "/(owner)",
  };

  return (
    <Redirect href={(redirectMap[user?.role ?? ""] ?? "/(student)") as any} />
  );
}
