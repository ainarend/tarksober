import { ExternalLink, User } from "lucide-react";
import iconLoogikasober from "@/assets/icon-loogikasober.png";
import iconUnesober from "@/assets/icon-unesober.png";
import iconSonasober from "@/assets/icon-sonasober.png";

const SELF_SERVICE_URL = "https://minu.tarksober.ee";

const apps = [
  {
    name: "Loogikasõber",
    description: "Nutikas õppemäng lastele. 23 minimängu ja igapäevased mõistatused 3–12-aastastele.",
    icon: iconLoogikasober,
    status: "live" as const,
    href: "https://loogikasober.tarksober.ee/",
  },
  {
    name: "Unesõber",
    description: "Personaalsed unujutud Sinu või lapse fantaasia põhjal.",
    icon: iconUnesober,
    status: "coming" as const,
  },
  {
    name: "Sõnasõber",
    description: "Igapäev uus lihtsate sõnade ja kordustega lugu, et aidata lastel lugema õppida.",
    icon: iconSonasober,
    status: "coming" as const,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        Liigu põhisisu juurde
      </a>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-extrabold text-lg">
            Tark<span className="text-primary">Sõber</span>
          </span>
          <a
            href={SELF_SERVICE_URL}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
          >
            <User size={16} aria-hidden="true" />
            Minu konto
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="main-content" className="relative overflow-hidden px-4 pt-28 pb-20 md:pt-40 md:pb-32 text-center bg-hero-gradient">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 leading-relaxed">
            Targad äpid Eesti lastele
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-10">
            Loome kvaliteetseid, turvalisi ja reklaamivabasid rakendusi, mis aitavad Eesti lastel mängides õppida.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span>🇪🇪 Loodud Eestis</span>
            <span>🔒 Turvaline</span>
            <span>⭐ Eesti peredele</span>
            <span>🚫 Ilma reklaamideta</span>
          </div>
        </div>
      </section>

      {/* Apps */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Meie äpid</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {apps.map((app) => (
              <div
                key={app.name}
                className="group relative rounded-2xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
              >
                {app.status === "coming" && (
                  <span className="absolute top-4 right-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Tulekul
                  </span>
                )}
                <img
                  src={app.icon}
                  alt={`${app.name} ikoon`}
                  className="mx-auto mb-4 h-20 w-20 rounded-2xl"
                />
                <h3 className="text-lg font-bold mb-2">{app.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {app.description}
                </p>
                {app.status === "live" && app.href ? (
                  <a
                    href={app.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={`Uuri lähemalt – ${app.name} (avaneb uues aknas)`}
                  >
                    Uuri lähemalt <ExternalLink size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <button disabled className="inline-block rounded-xl bg-muted px-5 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed">
                    Peagi saadaval
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Meie missioon</h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            TarkSõber on Eesti asutajate loodud bränd, mille eesmärk on pakkuda lastele kvaliteetset ekraaniaega. 
            Kõik meie äpid on eestikeelsed, reklaamivabad ja loodud laste arengut silmas pidades. 
            Usume, et tehnoloogia saab olla lapse tark sõber - arendav, innustav ja positiivne - kui seda õigesti rakendada.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">TarkSõber</p>
        <p>© {new Date().getFullYear()} TarkSõber. Kõik õigused kaitstud.</p>
      </footer>
    </div>
  );
};

export default Index;
