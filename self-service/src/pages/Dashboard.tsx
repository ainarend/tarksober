import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getMyLicenses, type LicenseWithDevices } from "@/lib/api";
import LicenseKeyDisplay from "@/components/shared/LicenseKeyDisplay";
import { Key, Monitor, ChevronRight, Loader2 } from "lucide-react";

function LicenseCard({ license }: { license: LicenseWithDevices }) {
  const isExpired = license.is_expired || license.is_revoked;
  const expiresDate = new Date(license.expires_at).toLocaleDateString("et-EE");

  return (
    <Link
      to={`/dashboard/license/${license.id}`}
      className={`block bg-card border rounded-xl p-5 hover:border-primary/30 transition-colors ${
        isExpired ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{license.product?.name || license.app_slug}</h3>
          <p className="text-sm text-muted-foreground">
            {isExpired ? "Aegunud" : `Kehtib kuni ${expiresDate}`}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
      </div>

      <LicenseKeyDisplay licenseKey={license.license_key} />

      <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
        <Monitor className="h-4 w-4" />
        <span>
          {license.active_device_count} / {license.max_devices} seadet
        </span>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { data: licenses, isLoading, error } = useQuery({
    queryKey: ["my-licenses"],
    queryFn: getMyLicenses,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
        <p className="text-destructive">Litsentside laadimine ebaõnnestus</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Minu litsentsid</h1>

      {licenses && licenses.length > 0 ? (
        <div className="space-y-4">
          {licenses.map((license) => (
            <LicenseCard key={license.id} license={license} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-medium mb-2">Litsentse ei leitud</h2>
          <p className="text-muted-foreground mb-4">
            Sul pole veel uhtegi litsentsi. Tutvu meie appidega!
          </p>
          <a
            href="https://tarksober.ee"
            className="inline-block py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Vaata appe
          </a>
        </div>
      )}
    </div>
  );
}
