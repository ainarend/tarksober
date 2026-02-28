import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts, createCheckout, type Product } from "@/lib/api";
import { usePurchaseToken } from "@/hooks/usePurchaseToken";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { saveToken } = usePurchaseToken();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We need the product info — fetch all products for this app and find ours
  // Since we only have productId, we fetch by querying all apps and finding the match
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) return;

    // Try known app slugs to find the product
    const appSlugs = ["loogikasober", "sonasober", "unesober"];

    Promise.all(appSlugs.map((slug) => getProducts(slug)))
      .then((results) => {
        const allProducts = results.flat();
        const found = allProducts.find((p) => p.id === productId);
        setProduct(found || null);
      })
      .catch(() => setError("Toote laadimine ebaonnestus"));
  }, [productId]);

  const handlePay = async () => {
    if (!productId) return;
    setCreating(true);
    setError(null);

    try {
      const result = await createCheckout(productId);
      saveToken(result.purchase_token);

      // Redirect to Maksekeskus hosted payment page
      const hostedUrl = result.payment_methods?.other?.redirect;
      if (hostedUrl) {
        window.location.href = hostedUrl;
      } else {
        setError("Makseviisi ei leitud");
        setCreating(false);
      }
    } catch (err: any) {
      setError(err.message || "Makse loomine ebaonnestus");
      setCreating(false);
    }
  };

  if (!productId) {
    return (
      <div className="container max-w-lg mx-auto py-16 px-4 text-center">
        <p className="text-destructive">Toodet ei leitud</p>
      </div>
    );
  }

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)} \u20ac`;
  };

  const formatDuration = (days: number) => {
    if (days >= 365) return `${Math.round(days / 365)} aasta`;
    if (days >= 30) return `${Math.round(days / 30)} kuud`;
    return `${days} paeva`;
  };

  return (
    <div className="container max-w-lg mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Osta Premium</h1>

      {product ? (
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
        </div>
      ) : !error ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}

      {error && (
        <p className="text-destructive text-sm text-center mb-4">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={creating || !product}
        className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {creating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Suunan maksma...
          </>
        ) : (
          "Maksa pangalingiga"
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Turvaline makse Maksekeskus vahendusel
      </p>
    </div>
  );
}
