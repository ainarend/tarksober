import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancelled() {
  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center">
      <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Makse katkestati</h1>
      <p className="text-muted-foreground mb-6">
        Makse ei onnestunud. Saad alati uuesti proovida.
      </p>
      <Link
        to="/"
        className="inline-block py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        Tagasi avalehele
      </Link>
    </div>
  );
}
