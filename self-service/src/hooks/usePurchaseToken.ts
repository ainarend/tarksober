import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "tarksober_purchase_token";

export function usePurchaseToken() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Priority: URL param > sessionStorage
    const urlToken = searchParams.get("token");
    const storedToken = sessionStorage.getItem(STORAGE_KEY);
    const resolvedToken = urlToken || storedToken;

    if (resolvedToken) {
      setToken(resolvedToken);
      sessionStorage.setItem(STORAGE_KEY, resolvedToken);
    }
  }, [searchParams]);

  const saveToken = (newToken: string) => {
    setToken(newToken);
    sessionStorage.setItem(STORAGE_KEY, newToken);
  };

  const clearToken = () => {
    setToken(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return { token, saveToken, clearToken };
}
