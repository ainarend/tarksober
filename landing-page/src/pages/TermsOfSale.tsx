import { Link } from "react-router-dom";

export default function TermsOfSale() {
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
        <h1 className="text-3xl font-bold mb-8">Müügitingimused</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3">
          <h2>1. Üldandmed</h2>
          <p>
            Veebilehel tarksober.ee ja minu.tarksober.ee pakutavaid teenuseid osutab:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Ettevõtte nimi:</strong> AA Tekk OÜ</li>
            <li><strong>Registrikood:</strong> 16194325</li>
            <li><strong>Aadress:</strong> Filmi 5-17, Tallinn, Harjumaa, Eesti</li>
            <li><strong>E-post:</strong> info@tarksober.ee</li>
          </ul>

          <h2>2. Tooted ja teenused</h2>
          <p>
            TarkSõber pakub digitaalseid premium-litsentse mobiilirakendustele (Loogikasõber, Unesõber, Sõnasõber).
            Litsents annab ligipääsu rakenduse premium-sisule kindlaks määratud ajaperioodiks.
          </p>

          <h2>3. Ostuprotsess</h2>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Valige soovitud toode rakenduse veebilehelt.</li>
            <li>Teid suunatakse minu.tarksober.ee iseteeninduskeskkonda.</li>
            <li>Valige makseviis ja sooritage makse.</li>
            <li>Pärast edukat makset sisestage oma e-posti aadress.</li>
            <li>Litsentsivõti saadetakse Teie e-posti aadressile.</li>
            <li>Sisestage litsentsivõti rakenduses premium-sisu aktiveerimiseks.</li>
          </ol>

          <h2>4. Makseviisid</h2>
          <p>
            Makseid vahendab{" "}
            <a
              href="https://maksekeskus.ee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Maksekeskus AS
            </a>
            . Toetatud makseviisid:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Eesti pangalingid (Swedbank, SEB, LHV, Coop Pank, Luminor/Citadele)</li>
            <li>Kaardimakse (Visa, Mastercard)</li>
          </ul>
          <p>
            Makse töötlemine ja turvaline suhtlus pangaga toimub Maksekeskus AS
            vahendusel. AA Tekk OÜ ei salvesta ega töötle maksekaardi andmeid.
          </p>

          <h2>5. Kättesaadavus</h2>
          <p>
            Pärast edukat makset ja e-posti sisestamist saadetakse litsentsivõti
            kohe Teie e-posti aadressile. Litsents on kohe kasutatav ja seda saab
            aktiveerida tootega määratud arvul seadmetel. Litsents kehtib alates
            aktiveerimise hetkest tootega määratud ajaperioodi jooksul.
          </p>

          <h2>6. Hinnad</h2>
          <p>
            Kõik hinnad on toodud eurodes ja sisaldavad käibemaksu.
            Tegemist on ühekordse maksega — litsents ei pikene automaatselt.
          </p>

          <h2>7. Tagastuspoliitika</h2>
          <p>
            Kuna tegemist on digitaalse sisuga, mida saab kohe pärast ostu kasutama
            hakata, on tagastamisõigus piiratud vastavalt VÕS § 56 lg 1 p 13.
          </p>
          <p>
            Kui Teil tekib tootega probleeme, võtke meiega ühendust aadressil{" "}
            <a href="mailto:info@tarksober.ee" className="text-primary hover:underline">
              info@tarksober.ee
            </a>
            . Lahendame iga juhtumi individuaalselt ja pakume lahenduse mõistliku aja jooksul.
          </p>
          <p>
            Kui toode ei tööta tehnilistel põhjustel, tagastame makse täies ulatuses.
          </p>

          <h2>8. Maksete vahendaja</h2>
          <p>
            Makseid vahendab Maksekeskus AS (registrikood 12268475), kes on Finantsinspektsiooni
            poolt litsentseeritud makseasutus. Lisainfo:{" "}
            <a
              href="https://maksekeskus.ee"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              maksekeskus.ee
            </a>
            .
          </p>

          <h2>9. Kontakt</h2>
          <p>
            Küsimuste korral võtke meiega ühendust:{" "}
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
