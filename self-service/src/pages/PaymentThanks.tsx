import { useSearchParams } from "react-router-dom";
import { Heart } from "lucide-react";
import { APPS } from "@/lib/apps";

/** After a donation: no license and no email step, just a thank-you. */
export default function PaymentThanks() {
  const [searchParams] = useSearchParams();
  const app = APPS[searchParams.get("app") || ""];

  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center">
      <Heart className="h-12 w-12 text-primary mx-auto mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold mb-2">Aitäh toetuse eest!</h1>
      <p className="text-muted-foreground mb-6">
        {app
          ? `Sinu toetus aitab ${app.genitive} arendust jätkata, et äpp jääks kõigile tasuta.`
          : "Sinu toetus aitab TarkSõbra äppide arendust jätkata."}
      </p>
      <a
        href={app?.url || "https://tarksober.ee"}
        className="inline-block py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Tagasi {app ? `${app.genitive} lehele` : "avalehele"}
      </a>
    </div>
  );
}
