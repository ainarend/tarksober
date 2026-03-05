import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts, createCheckout, type Product } from "@/lib/api";
import { usePurchaseToken } from "@/hooks/usePurchaseToken";
import { Loader2, Check } from "lucide-react";

interface PaymentMethod {
  name: string;
  display_name: string;
  logo_url: string;
  url: string;
  country?: string;
}

export default function Checkout() {
  const { productId } = useParams<{ productId: string }>();
  const { saveToken } = usePurchaseToken();
  const [product, setProduct] = useState<Product | null>(null);
  const [banklinks, setBanklinks] = useState<PaymentMethod[]>([]);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const appSlugs = ["loogikasober", "sonasober", "unesober"];

    // Fetch product info and create checkout session in parallel
    Promise.all([
      Promise.all(appSlugs.map((slug) => getProducts(slug))).then((results) => {
        const all = results.flat();
        return all.find((p) => p.id === productId) || null;
      }),
      createCheckout(productId),
    ])
      .then(([foundProduct, checkout]) => {
        setProduct(foundProduct);
        if (foundProduct?.app_slug) {
          sessionStorage.setItem("checkout_app_slug", foundProduct.app_slug);
        }
        saveToken(checkout.purchase_token);

        const links = checkout.payment_methods?.banklinks || [];
        const ee = links.filter((b: PaymentMethod) => b.country === "ee");
        setBanklinks(ee);
        setCards(checkout.payment_methods?.cards || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Makse loomine ebaõnnestus");
        setLoading(false);
      });
  }, [productId]);

  if (!productId) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 text-center">
        <p className="text-destructive">Toodet ei leitud</p>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2).replace(".", ",")} \u20ac`;
  };

  const formatDuration = (days: number) => {
    if (days >= 365) return `${Math.round(days / 365)} aasta`;
    if (days >= 30) return `${Math.round(days / 30)} kuud`;
    return `${days} päeva`;
  };

  return (
    <div className="container max-w-lg mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Osta Premium</h1>

      {product && (
        <div className="bg-card border rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
          {product.description && (
            <p className="text-muted-foreground text-sm mb-4">
              {product.description}
            </p>
          )}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-bold">
              {formatPrice(product.price_cents)}
            </span>
            <span className="text-muted-foreground">
              / {formatDuration(product.duration_days)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kuni {product.max_devices} seadet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Ühekordne makse. Ei pikene automaatselt.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Laadin makseviise...</p>
        </div>
      )}

      {error && (
        <p className="text-destructive text-sm text-center mb-4">{error}</p>
      )}

      {!loading && !error && (banklinks.length > 0 || cards.length > 0) && (
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <button
            type="button"
            role="checkbox"
            aria-checked={termsAccepted}
            onClick={() => setTermsAccepted(!termsAccepted)}
            className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 transition-colors flex items-center justify-center ${
              termsAccepted
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/50 group-hover:border-primary"
            }`}
          >
            {termsAccepted && <Check size={14} strokeWidth={3} />}
          </button>
          <span className="text-sm text-muted-foreground">
            Olen tutvunud ja nõustun{" "}
            <a
              href="https://tarksober.ee/muugitingimused"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              müügitingimustega
            </a>
            {" "}ja{" "}
            <a
              href="https://tarksober.ee/privaatsuspoliitika"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              privaatsuspoliitikaga
            </a>
          </span>
        </label>
      )}

      <div className={termsAccepted ? "" : "opacity-50 pointer-events-none"}>
        {banklinks.length > 0 && (
          <>
            <p className="text-sm font-medium text-center mb-4">Pangalink</p>
            <div className="grid grid-cols-3 gap-3">
              {banklinks.map((bank) => (
                <a
                  key={bank.name}
                  href={termsAccepted ? bank.url : undefined}
                  aria-disabled={!termsAccepted}
                  tabIndex={termsAccepted ? undefined : -1}
                  className="flex flex-col items-center gap-2 p-4 border rounded-xl bg-card hover:border-primary hover:shadow-sm transition-all"
                >
                  <img
                    src={bank.logo_url}
                    alt={bank.display_name}
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-muted-foreground text-center">
                    {bank.display_name}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}

        {cards.length > 0 && (
          <>
            <p className="text-sm font-medium text-center mb-4 mt-6">Kaardimakse</p>
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => (
                <a
                  key={card.name}
                  href={termsAccepted ? card.url : undefined}
                  aria-disabled={!termsAccepted}
                  tabIndex={termsAccepted ? undefined : -1}
                  className="flex flex-col items-center gap-2 p-4 border rounded-xl bg-card hover:border-primary hover:shadow-sm transition-all"
                >
                  <img
                    src={card.logo_url}
                    alt={card.display_name}
                    className="h-8 w-auto"
                  />
                  <span className="text-xs text-muted-foreground text-center">
                    {card.display_name}
                  </span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Turvaline makse Maksekeskus vahendusel
      </p>
    </div>
  );
}
