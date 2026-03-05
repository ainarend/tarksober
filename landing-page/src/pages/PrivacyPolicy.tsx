import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="font-extrabold text-lg">
            Tark<span className="text-primary">Sõber</span>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-8">Privaatsuspoliitika</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3">
          <h2>1. Vastutav töötleja</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Ettevõtte nimi:</strong> AA Tekk OÜ</li>
            <li><strong>Registrikood:</strong> 16194325</li>
            <li><strong>Aadress:</strong> Filmi 5-17, Tallinn, Harjumaa, Eesti</li>
            <li><strong>E-post:</strong> info@tarksober.ee</li>
          </ul>

          <h2>2. Kogutavad isikuandmed</h2>
          <p>Kogume ja töötleme järgmisi isikuandmeid:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>E-posti aadress</strong> — litsentsi kohaletoimetamiseks ja kontohalduseks</li>
            <li><strong>Seadme identifikaator</strong> — litsentsi aktiveerimise ja seadmete arvu kontrollimiseks</li>
            <li><strong>Makseinfo</strong> — töötleb Maksekeskus AS maksete vahendajana (me ei salvesta maksekaardi andmeid)</li>
          </ul>

          <h2>3. Andmete töötlemise eesmärgid</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Ostu sooritamine ja litsentsi väljastamine</li>
            <li>Kasutajakonto haldamine</li>
            <li>Klienditoe pakkumine</li>
            <li>Seadmepõhise litsentsi haldamine</li>
          </ul>

          <h2>4. Andmete töötlemise õiguslik alus</h2>
          <p>
            Isikuandmete töötlemine põhineb lepingu täitmise vajadusele (GDPR art 6 lg 1 p b)
            — andmed on vajalikud Teile teenuse osutamiseks.
          </p>

          <h2>5. Maksekeskus kui andmete volitatud töötleja</h2>
          <p>
            Maksete töötlemiseks kasutame Maksekeskus AS-i (registrikood 12268475) teenust.
            Maksekeskus töötleb maksega seotud isikuandmeid volitatud töötlejana meie nimel.
            Maksekeskus ei kasuta andmeid muul eesmärgil. Lisainfo:{" "}
            <a
              href="https://maksekeskus.ee/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Maksekeskuse privaatsuspoliitika
            </a>
            .
          </p>

          <h2>6. Andmete saajad</h2>
          <p>Isikuandmeid võivad töödelda:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Maksekeskus AS</strong> — maksete töötlemine</li>
            <li><strong>Supabase Inc.</strong> — andmebaasi ja autentimise teenus (serverid EL-is)</li>
          </ul>
          <p>Me ei müü ega jaga Teie isikuandmeid kolmandate osapooltega turunduslikel eesmärkidel.</p>

          <h2>7. Andmete säilitustähtaeg</h2>
          <p>
            Isikuandmeid säilitatakse kuni konto kustutamiseni või seadusest tuleneva
            kohustuse lõppemiseni (raamatupidamisandmed 7 aastat).
          </p>

          <h2>8. Teie õigused</h2>
          <p>Teil on õigus:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Taotleda juurdepääsu oma isikuandmetele</li>
            <li>Nõuda andmete parandamist või kustutamist</li>
            <li>Piirata andmete töötlemist</li>
            <li>Esitada vastuväide andmete töötlemisele</li>
            <li>Nõuda andmete ülekandmist</li>
            <li>Esitada kaebus Andmekaitse Inspektsioonile (aki.ee)</li>
          </ul>

          <h2>9. Küpsised</h2>
          <p>
            Kasutame ainult tehniliselt vajalikke küpsiseid (autentimine, sessiooni haldamine).
            Me ei kasuta turundus- ega analüütikaküpsiseid.
          </p>

          <h2>10. Kontakt</h2>
          <p>
            Privaatsusega seotud küsimuste korral võtke meiega ühendust:{" "}
            <a href="mailto:info@tarksober.ee" className="text-primary hover:underline">
              info@tarksober.ee
            </a>
          </p>

          <p className="text-xs mt-8">Kehtib alates: 05.03.2026</p>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AA Tekk OÜ. Kõik õigused kaitstud.</p>
      </footer>
    </div>
  );
}
