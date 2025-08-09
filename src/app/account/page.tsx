"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

interface UserProfile {
  id: string;
  locale: string;
  home_country: string | null;
}

const availableLocales = [
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
];

const availableCurrencies = [
  { code: "JPY", name: "日本円 (¥)", symbol: "¥" },
  { code: "USD", name: "US Dollar ($)", symbol: "$" },
  { code: "EUR", name: "Euro (€)", symbol: "€" },
  { code: "GBP", name: "British Pound (£)", symbol: "£" },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, userProfile, setUserProfile } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    locale: "ja",
    currency: "JPY",
  });
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    if (userProfile) {
      setSettings({
        locale: userProfile.locale || "ja",
        currency: "JPY", // 固定でもOK
      });
    }
  }, [user, userProfile, router]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("user_profiles").upsert({
        id: user.id,
        locale: settings.locale,
        home_country: null,
      });

      if (error) throw error;

      setUserProfile({
        id: user.id,
        locale: settings.locale,
        home_country: null,
      });

      toast.success(t("account.saveSettings"));

      // UI 反映
      try {
        localStorage.setItem("app.locale", settings.locale);
      } catch {}
      i18n.changeLanguage(settings.locale);
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      toast.success("Logged out");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to log out");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-2xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {t("account.title")}
            </h1>
            <p className='text-gray-600'>{t("account.desc")}</p>
          </div>

          <div className='space-y-6'>
            {/* ユーザー情報 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("account.userInfo")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium'>
                      {t("account.email")}
                    </Label>
                    <p className='text-gray-600'>{user.email}</p>
                  </div>
                  <div>
                    <Label className='text-sm font-medium'>
                      {t("account.userId")}
                    </Label>
                    <p className='text-gray-600 font-mono text-sm'>{user.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 言語設定 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("account.languageTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='locale'>
                      {t("account.displayLanguage")}
                    </Label>
                    <Select
                      value={settings.locale}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, locale: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLocales.map((locale) => (
                          <SelectItem key={locale.code} value={locale.code}>
                            <span className='flex items-center gap-2'>
                              <span>{locale.flag}</span>
                              <span>{locale.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 通貨設定 */}
            <Card>
              <CardHeader>
                <CardTitle>{t("account.currencyTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='currency'>
                      {t("account.displayCurrency")}
                    </Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) =>
                        setSettings((prev) => ({ ...prev, currency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <span className='flex items-center gap-2'>
                              <span>{currency.symbol}</span>
                              <span>{currency.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className='text-xs text-gray-500 mt-1'>
                      Currently only JPY (¥) is used
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* オフライン機能 */}
            <Card>
              <CardHeader>
                <CardTitle>オフライン機能</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label className='text-sm font-medium'>
                        オフラインスキャン
                      </Label>
                      <p className='text-xs text-gray-500'>
                        インターネット接続がない場合でもスキャン可能
                      </p>
                    </div>
                    <Badge variant='secondary'>有効</Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <div>
                      <Label className='text-sm font-medium'>データ同期</Label>
                      <p className='text-xs text-gray-500'>
                        オンライン時に自動でデータを同期
                      </p>
                    </div>
                    <Badge variant='secondary'>有効</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクション */}
            <div className='flex gap-4'>
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className='flex-1'
              >
                {isLoading ? "Updating..." : t("account.saveSettings")}
              </Button>
              <Button
                onClick={handleSignOut}
                variant='outline'
                className='flex-1'
              >
                {t("common.logout")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
