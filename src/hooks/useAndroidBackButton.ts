import { useEffect } from "react";

const ROOT_PATHS = new Set(["/", "/map"]);

// Android back button handler — Capacitor only (no-op on web)
export function useAndroidBackButton() {
  useEffect(() => {
    // Web builds: just handle browser history navigation
    // Capacitor native builds would need @capacitor/app — skipped here for web compatibility
    const isWeb = typeof window !== 'undefined' && !(window as any).Capacitor?.isNativePlatform?.();
    if (isWeb) return;

    // Native only (won't reach here in web build)
  }, []);
}
