import { useEffect } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

const ROOT_PATHS = new Set(["/", "/map"]);

export function useAndroidBackButton() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const sub = App.addListener("backButton", ({ canGoBack }) => {
      if (ROOT_PATHS.has(window.location.pathname) || !canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });

    return () => {
      sub.then((s) => s.remove());
    };
  }, []);
}
