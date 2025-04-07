import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        // Show loading state while checking authentication
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        // Redirect to auth page if not authenticated
        if (!user) {
          const currentPath = window.location.pathname;
          const searchParams = new URLSearchParams();
          if (currentPath !== "/") {
            searchParams.set("redirect", currentPath);
          }
          const redirectUrl =
            "/auth" +
            (searchParams.toString() ? `?${searchParams.toString()}` : "");
          return <Redirect to={redirectUrl} />;
        }

        // Render the protected component
        return <Component {...params} />;
      }}
    </Route>
  );
}
