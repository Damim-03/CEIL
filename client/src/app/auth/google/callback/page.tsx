import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../../lib/api/auth.api";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const finishGoogleLogin = async () => {
      try {
        // 🔑 fetch authenticated user (cookies already set)
        const user = await queryClient.fetchQuery({
          queryKey: ["me"],
          queryFn: authApi.me,
        });

        // 🔑 redirect by role
        navigate(
          user.role === "ADMIN"
            ? "/admin"
            : user.role === "TEACHER"
            ? "/teacher"
            : "/dashboard",
          { replace: true }
        );
      } catch {
        navigate("/login", { replace: true });
      }
    };

    finishGoogleLogin();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Signing you in with Google...
      </p>
    </div>
  );
}
