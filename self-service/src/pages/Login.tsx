import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function Login() {
  const { user, signInWithOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signInWithOtp(email.trim());

    setLoading(false);

    if (error) {
      setError("Sisselogimislingi saatmine ebaonnestus. Proovi uuesti.");
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Kontrolli oma e-posti!</h1>
        <p className="text-muted-foreground">
          Saatsime sisselogimislingi aadressile{" "}
          <strong>{email}</strong>. Kliki lingil, et siseneda.
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Logi sisse</h1>
        <p className="text-muted-foreground">
          Sisesta oma e-posti aadress, et hallata oma oste
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label htmlFor="email" className="sr-only">E-posti aadress</label>
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sinu@email.ee"
            required
            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Saadan..." : "Saada sisselogimislink"}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
