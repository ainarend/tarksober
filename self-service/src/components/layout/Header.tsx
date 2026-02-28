import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container flex h-14 items-center justify-between">
        <a href="https://tarksober.ee" className="font-extrabold text-lg tracking-tight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded">
          Tark<span className="text-primary">Sõber</span>
        </a>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
              >
                Minu litsentsid
              </Link>
              <button
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
              >
                Logi valja
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
            >
              Logi sisse
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
