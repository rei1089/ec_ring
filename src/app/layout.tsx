import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { I18nProvider } from "@/components/I18nProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import MobileTabBar from "@/components/MobileTabBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "日本のお土産カート",
  description: "バーコードスキャンでスマートに商品管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja' suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AuthProvider>
              <div className='pb-16'>
                <div className='w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-50'>
                  <div className='container mx-auto px-4 py-2 flex items-center justify-end'>
                    <LanguageSwitcher compact />
                  </div>
                </div>
                {children}
              </div>
              <MobileTabBar />
              <Toaster />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
