import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyLicenses, deactivateDevice } from "@/lib/api";
import LicenseKeyDisplay from "@/components/shared/LicenseKeyDisplay";
import { toast } from "sonner";
import { ArrowLeft, Monitor, Trash2, Loader2 } from "lucide-react";

export default function LicenseDetail() {
  const { licenseId } = useParams<{ licenseId: string }>();
  const queryClient = useQueryClient();

  const { data: licenses, isLoading } = useQuery({
    queryKey: ["my-licenses"],
    queryFn: getMyLicenses,
  });

  const license = licenses?.find((l) => l.id === licenseId);

  const [pendingDeactivation, setPendingDeactivation] = useState<string | null>(null);

  const deactivateMutation = useMutation({
    mutationFn: deactivateDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-licenses"] });
      toast.success("Seade eemaldatud");
    },
    onError: () => {
      toast.error("Seadme eemaldamine ebaonnestus");
    },
  });

  const handleDeactivate = (activationId: string) => {
    setPendingDeactivation(activationId);
  };

  const confirmDeactivate = () => {
    if (pendingDeactivation) {
      deactivateMutation.mutate(pendingDeactivation);
      setPendingDeactivation(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!license) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-muted-foreground">Litsentsi ei leitud</p>
        <Link to="/dashboard" className="text-primary hover:underline mt-2 block">
          Tagasi
        </Link>
      </div>
    );
  }

  const isExpired = license.is_expired || license.is_revoked;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Tagasi
      </Link>

      <h1 className="text-2xl font-bold mb-1">
        {license.product?.name || license.app_slug}
      </h1>
      <p className={`text-sm mb-6 ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
        {isExpired
          ? "Aegunud"
          : `Kehtib: ${new Date(license.starts_at).toLocaleDateString("et-EE")} \u2013 ${new Date(license.expires_at).toLocaleDateString("et-EE")}`}
      </p>

      <div className="mb-8">
        <label className="text-sm font-medium text-muted-foreground block mb-2">
          Aktiveerimiskood
        </label>
        <LicenseKeyDisplay licenseKey={license.license_key} />
      </div>

      <div>
        <h2 className="font-semibold mb-3">
          Seadmed ({license.active_device_count} / {license.max_devices})
        </h2>

        {license.devices.length > 0 ? (
          <div className="space-y-2">
            {license.devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between bg-card border rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-mono">
                      {device.device_id.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aktiveeritud{" "}
                      {new Date(device.activated_at).toLocaleDateString("et-EE")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeactivate(device.id)}
                  disabled={deactivateMutation.isPending}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                  title="Eemalda seade"
                  aria-label="Eemalda seade"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm py-4">
            Uhtegi seadet pole veel aktiveeritud
          </p>
        )}
      </div>

      {pendingDeactivation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="bg-card rounded-xl border shadow-lg p-6 max-w-sm mx-4">
            <h3 id="confirm-title" className="font-bold text-lg mb-2">Eemalda seade</h3>
            <p className="text-muted-foreground text-sm mb-6">Kas oled kindel, et soovid seadme eemaldada?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPendingDeactivation(null)}
                className="px-4 py-2 rounded-lg border text-sm font-medium hover:bg-muted transition-colors"
              >
                Tühista
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Eemalda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
