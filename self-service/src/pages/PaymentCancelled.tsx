import { XCircle } from "lucide-react";

const APP_URLS: Record<string, { name: string; url: string }> = {
  loogikasober: { name: "Loogikasõber", url: "https://loogikasober.tarksober.ee" },
  sonasober: { name: "Sõnasõber", url: "https://sonasober.tarksober.ee" },
  unesober: { name: "Unesõber", url: "https://unesober.tarksober.ee" },
};

export default function PaymentCancelled() {
  const slug = sessionStorage.getItem("checkout_app_slug") || "";
  const app = APP_URLS[slug];

  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center">
      <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Makse katkestati</h1>
      <p className="text-muted-foreground mb-6">
        Makse ei õnnestunud. Saad alati uuesti proovida.
      </p>
      <a
        href={app?.url || "https://tarksober.ee"}
        className="inline-block py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Tagasi {app ? `${app.name} lehele` : "avalehele"}
      </a>
    </div>
  );
}
