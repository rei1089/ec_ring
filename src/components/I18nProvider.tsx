"use client";

import { useEffect } from "react";
import i18next, { i18n as I18nInstance } from "i18next";
import { I18nextProvider } from "react-i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "@/i18n/resources";

let initialized = false;

function initI18n(defaultLng: string) {
  if (initialized) return i18next;
  i18next.use(initReactI18next).init({
    resources,
    lng: defaultLng,
    fallbackLng: "ja",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
  initialized = true;
  return i18next as I18nInstance;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("app.locale") : null;
  const initialLang = stored || "ja";

  const i18n = initI18n(initialLang);

  useEffect(() => {
    if (!stored) return;
    if (i18n.language !== stored) {
      i18n.changeLanguage(stored);
    }
  }, [i18n, stored]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
