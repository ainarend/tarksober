import { XCircle } from "lucide-react";
import { APPS, CHECKOUT_APP_KEY } from "@/lib/apps";

export default function PaymentCancelled() {
  const slug = sessionStorage.getItem(CHECKOUT_APP_KEY) || "";
  const app = APPS[slug];

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
