"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Scan, ShoppingCart, Settings, User, Play, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAppStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { t } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t("home.email") + " " + t("common.required"));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success(t("home.sendLogin") + " - " + t("home.email"));
      setEmail("");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to send login link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    setIsDemoMode(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isDemoMode", "true");
      }
    } catch {}
    toast.success(t("common.demoMode"));
    // 自動遷移せず、ホームに留まる
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (user || isDemoMode) {
    return (
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='container mx-auto px-4'>
          <div className='max-w-2xl mx-auto'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                {t("app.title")}
              </h1>
              <p className='text-gray-600'>{t("app.subtitle")}</p>
              {isDemoMode && (
                <div className='mt-4 space-y-2'>
                  <Badge variant='secondary' className='text-sm'>
                    <Play className='w-3 h-3 mr-1' />
                    {t("common.demoMode")}
                  </Badge>
                  <div className='text-xs text-gray-500 max-w-md mx-auto'>
                    <p>{t("home.demoTip1")}</p>
                    <p>{t("home.demoTip2")}</p>
                  </div>
                </div>
              )}
            </div>

            <div className='grid gap-6 md:grid-cols-2'>
              <Card
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() =>
                  router.push(isDemoMode ? "/scan?demo=true" : "/scan")
                }
              >
                <CardHeader>
                  <div className='flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4'>
                    <Scan className='w-6 h-6 text-blue-600' />
                  </div>
                  <CardTitle>{t("nav.scan")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600'>{t("scan.desc")}</p>
                  {isDemoMode && (
                    <div className='mt-2 text-xs text-blue-600'>
                      💡 4901234567890
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() =>
                  router.push(isDemoMode ? "/cart?demo=true" : "/cart")
                }
              >
                <CardHeader>
                  <div className='flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4'>
                    <ShoppingCart className='w-6 h-6 text-green-600' />
                  </div>
                  <CardTitle>{t("nav.cart")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600'>{t("cart.desc")}</p>
                </CardContent>
              </Card>

              <Card
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => router.push("/account")}
              >
                <CardHeader>
                  <div className='flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4'>
                    <Settings className='w-6 h-6 text-purple-600' />
                  </div>
                  <CardTitle>{t("account.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600'>{t("account.desc")}</p>
                </CardContent>
              </Card>

              <Card
                className='cursor-pointer hover:shadow-lg transition-shadow'
                onClick={() => router.push("/account")}
              >
                <CardHeader>
                  <div className='flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4'>
                    <User className='w-6 h-6 text-orange-600' />
                  </div>
                  <CardTitle>{t("nav.account")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600'>Profile & Settings</p>
                </CardContent>
              </Card>
            </div>

            <div className='mt-8 text-center space-y-2'>
              {isDemoMode ? (
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsDemoMode(false);
                    router.push("/");
                  }}
                >
                  {t("home.endDemo")}
                </Button>
              ) : (
                <Button
                  variant='outline'
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                  }}
                >
                  {t("common.logout")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-md mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {t("app.title")}
            </h1>
            <p className='text-gray-600'>{t("app.subtitle")}</p>
          </div>

          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Play className='w-5 h-5' />
                  {t("common.demoMode")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-4'>Try the app without login</p>
                <Button
                  onClick={handleDemoMode}
                  className='w-full'
                  variant='outline'
                >
                  {t("home.startDemo")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("home.login")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className='space-y-4'>
                  <div>
                    <Label htmlFor='email'>{t("home.email")}</Label>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='example@email.com'
                      required
                    />
                  </div>
                  <Button type='submit' disabled={isLoading} className='w-full'>
                    {isLoading ? t("home.sending") : t("home.sendLogin")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
