"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Lng = "ja" | "en";

const options: { code: Lng; label: string }[] = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [value, setValue] = useState<Lng>((i18n.language as Lng) || "ja");

  useEffect(() => {
    setValue((i18n.language as Lng) || "ja");
  }, [i18n.language]);

  const changeLanguage = (lng: Lng) => {
    localStorage.setItem("app.locale", lng);
    i18n.changeLanguage(lng);
    setValue(lng);
  };

  if (compact) {
    return (
      <Select value={value} onValueChange={(v) => changeLanguage(v as Lng)}>
        <SelectTrigger className='h-8 w-[110px]'>
          <SelectValue placeholder={t("common.language")} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.code} value={opt.code}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-gray-600'>{t("common.language")}</span>
      <Select value={value} onValueChange={(v) => changeLanguage(v as Lng)}>
        <SelectTrigger className='h-8 w-[140px]'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.code} value={opt.code}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
