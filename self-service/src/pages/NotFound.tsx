import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-muted-foreground mb-6">Lehte ei leitud</p>
      <Link
        to="/"
        className="inline-block py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Tagasi avalehele
      </Link>
    </div>
  );
}
