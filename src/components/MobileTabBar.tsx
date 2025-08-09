"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Scan as ScanIcon, ShoppingCart, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTranslation } from "react-i18next";

interface TabItem {
  key: string;
  label: string;
  href: string;
  icon: (props: { className?: string }) => JSX.Element;
}

export default function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { user } = useAppStore();
  const { t } = useTranslation();

  useEffect(() => {
    let demo = false;
    try {
      demo = searchParams.get("demo") === "true";
    } catch {}
    if (!demo) {
      try {
        demo =
          typeof window !== "undefined" &&
          sessionStorage.getItem("isDemoMode") === "true";
      } catch {}
    }
    setIsDemoMode(demo);
  }, [searchParams]);

  const tabs: TabItem[] = useMemo(
    () => [
      {
        key: "scan",
        label: t("nav.scan"),
        href: "/scan",
        icon: (p) => <ScanIcon className={p.className} />,
      },
      {
        key: "cart",
        label: t("nav.cart"),
        href: "/cart",
        icon: (p) => <ShoppingCart className={p.className} />,
      },
      {
        key: "account",
        label: t("nav.account"),
        href: "/account",
        icon: (p) => <User className={p.className} />,
      },
    ],
    [t]
  );

  const activeKey = useMemo(() => {
    if (!pathname) return "";
    if (pathname.startsWith("/scan")) return "scan";
    if (pathname.startsWith("/cart")) return "cart";
    if (pathname.startsWith("/account")) return "account";
    return "";
  }, [pathname]);

  const go = (href: string) => {
    const next = isDemoMode ? `${href}?demo=true` : href;
    router.push(next);
  };

  // ホーム未ログイン・非デモ時はタブバー非表示
  if (pathname === "/" && !user && !isDemoMode) {
    return null;
  }

  return (
    <nav
      role='navigation'
      aria-label='Mobile tab bar'
      className='fixed bottom-0 inset-x-0 z-40 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60'
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
    >
      <ul className='mx-auto max-w-md grid grid-cols-3 gap-1 px-4 pt-2'>
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <li key={tab.key} className=''>
              <button
                type='button'
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
                onClick={() => go(tab.href)}
                className={`w-full flex flex-col items-center justify-center rounded-md py-2 text-xs transition-colors ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon
                  className={`h-6 w-6 mb-1 ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                />
                <span className='leading-none'>{tab.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
