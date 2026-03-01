import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import { linkAccount } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const linked = useRef(false);

  useEffect(() => {
    if (user && !linked.current) {
      linked.current = true;
      linkAccount().catch((err) => {
        if (err?.message === "NOT_AUTHENTICATED") {
          signOut();
        }
      });
    }
  }, [user, signOut]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Laadin...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
