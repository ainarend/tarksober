import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface LicenseKeyDisplayProps {
  licenseKey: string;
}

export default function LicenseKeyDisplay({ licenseKey }: LicenseKeyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-3">
      <code className="text-lg font-mono font-bold tracking-widest flex-1">
        {licenseKey}
      </code>
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-background rounded transition-colors"
        title="Kopeeri"
        aria-label="Kopeeri litsentsivõti"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}
