import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePurchaseToken } from "@/hooks/usePurchaseToken";
import { Loader2 } from "lucide-react";

const FUNCTIONS_BASE = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : "";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token: existingToken, saveToken } = usePurchaseToken();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have a token in session, go straight to success page
    if (existingToken) {
      navigate("/payment/success", { replace: true });
      return;
    }

    // Extract transaction ID from Maksekeskus callback json param
    const jsonParam = searchParams.get("json");
    if (!jsonParam) {
      setError("Makseandmed puuduvad.");
      return;
    }

    let transactionId: string;
    try {
      const data = JSON.parse(jsonParam);
      transactionId = data.transaction;
    } catch {
      setError("Vigased makseandmed.");
      return;
    }

    if (!transactionId) {
      setError("Tehingu ID puudub.");
      return;
    }

    // Look up purchase token by transaction ID
    fetch(
      `${FUNCTIONS_BASE}/lookup-purchase?transaction_id=${encodeURIComponent(transactionId)}`,
      { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || "" } },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.purchase_token) {
          saveToken(data.purchase_token);
          navigate("/payment/success", { replace: true });
        } else {
          setError("Ostu andmeid ei leitud.");
        }
      })
      .catch(() => setError("Viga andmete laadimisel."));
  }, []);

  if (error) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Suunan edasi...</p>
    </div>
  );
}
