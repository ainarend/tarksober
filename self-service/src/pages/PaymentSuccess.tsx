import { useState, useRef } from "react";
import { usePurchaseToken } from "@/hooks/usePurchaseToken";
import { collectEmail, type CollectEmailResult } from "@/lib/api";
import LicenseKeyDisplay from "@/components/shared/LicenseKeyDisplay";
import { CheckCircle, Mail, Loader2, ExternalLink } from "lucide-react";

const MAX_RETRIES = 10;
const RETRY_DELAY = 2000;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function PaymentSuccess() {
  const { token, clearToken } = usePurchaseToken();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CollectEmailResult | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    setError(null);
    abortRef.current = false;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (abortRef.current) break;

      try {
        const data = await collectEmail(token, email.trim());
        setResult(data);
        clearToken();
        return;
      } catch (err: any) {
        const msg = err.message || "";
        if (msg.includes("Payment not completed")) {
          setStatusMsg("Viimistlen andmeid, palun oota...");
          await delay(RETRY_DELAY);
          continue;
        }
        setError(msg || "Viga litsentsi loomisel");
        return;
      } finally {
        setSubmitting(false);
        setStatusMsg(null);
      }
    }

    setSubmitting(false);
    setStatusMsg(null);
    setError("Makse kinnitus võtab tavapärasest kauem aega. Proovi mõne hetke pärast uuesti.");
  };

  const deepLinkUrl = result
    ? `https://tarksober.ee/${result.app_slug}/activate?code=${result.license_key}`
    : "";

  if (!token && !result) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 text-center">
        <p className="text-muted-foreground">
          Ostuandmed puuduvad. Kui tegid just makse, proovige uuesti laadida.
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Litsents on valmis!</h1>
          <p className="text-muted-foreground">
            Kehtib kuni{" "}
            {new Date(result.expires_at).toLocaleDateString("et-EE")}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">
              Sinu aktiveerimiskood
            </label>
            <LicenseKeyDisplay licenseKey={result.license_key} />
          </div>

          <div className="bg-card border rounded-xl p-4">
            <h3 className="font-medium mb-2">Kuidas aktiveerida?</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Laadi alla app oma telefonist</li>
              <li>Ava app ja sisesta aktiveerimiskood</li>
              <li>Naudi premium-sisu!</li>
            </ol>
          </div>

          <a
            href={deepLinkUrl}
            className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium text-center hover:opacity-90 transition-opacity"
          >
            Ava appis <ExternalLink className="inline h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Makse õnnestus!</h1>
        <p className="text-muted-foreground">
          Sisesta oma e-posti aadress litsentsi saamiseks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label htmlFor="payment-email" className="sr-only">E-posti aadress</label>
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            id="payment-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sinu@email.ee"
            required
            disabled={submitting}
            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          E-posti aadress on vajalik litsentsi haldamiseks portaalis
          minu.tarksober.ee
        </p>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !email.trim()}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {statusMsg || "Loon litsentsi..."}
            </>
          ) : (
            "Saa litsents"
          )}
        </button>
      </form>
    </div>
  );
}
