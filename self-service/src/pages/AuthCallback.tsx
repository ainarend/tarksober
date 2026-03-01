import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      });
    } else {
      // No code — check if tokens are in hash (implicit flow fallback)
      supabase.auth.getSession().then(({ data: { session } }) => {
        navigate(session ? "/dashboard" : "/login", { replace: true });
      });
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">Sisselogimine...</p>
    </div>
  );
}
