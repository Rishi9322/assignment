import { useEffect } from "react";
import { useSettings } from "../hooks/useSettings";

// Applies the admin-configured accent color as a CSS var override and keeps
// the document title in sync with the org name — no visual component of its
// own, mounted once near the app root.
export const BrandingEffect = () => {
  const { data: settings } = useSettings();

  useEffect(() => {
    if (!settings) return;
    document.documentElement.style.setProperty("--color-accent", settings.accent_color);
    document.title = settings.org_name;
  }, [settings]);

  return null;
};
