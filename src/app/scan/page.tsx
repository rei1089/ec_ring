"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { offlineStorage } from "@/lib/offline";
import { useTranslation } from "react-i18next";

interface Product {
  id: string;
  title: string;
  brand: string | null;
  category: string | null;
  cover_image_url: string | null;
  description: string | null;
  weight_g: number | null;
  estimated_price?: number;
}

// デモ用フォールバック商品マップ（DB未登録でも体験可能）
const demoProductsByBarcode: Record<string, Product> = {
  "4901234567890": {
    id: "demo-4901234567890",
    title: "抹茶クッキー",
    brand: "お菓子の森",
    category: "お菓子",
    cover_image_url: null,
    description: "京都産抹茶を使用した上品なクッキー",
    weight_g: 150,
    estimated_price: 580,
  },
  "4901234567891": {
    id: "demo-4901234567891",
    title: "抹茶チョコレート",
    brand: "明治",
    category: "お菓子",
    cover_image_url: null,
    description: "濃厚な抹茶味のチョコレート",
    weight_g: 80,
    estimated_price: 380,
  },
  "4901234567892": {
    id: "demo-4901234567892",
    title: "抹茶ラテミックス",
    brand: "AGF",
    category: "飲料",
    cover_image_url: null,
    description: "お湯で溶くだけで本格抹茶ラテ",
    weight_g: 200,
    estimated_price: 680,
  },
  "4901234567893": {
    id: "demo-4901234567893",
    title: "抹茶アイスクリーム",
    brand: "ハーゲンダッツ",
    category: "冷菓",
    cover_image_url: null,
    description: "濃厚な抹茶味のアイスクリーム",
    weight_g: 300,
    estimated_price: 480,
  },
  "4901234567894": {
    id: "demo-4901234567894",
    title: "抹茶ケーキ",
    brand: "不二家",
    category: "お菓子",
    cover_image_url: null,
    description: "しっとりとした抹茶ケーキ",
    weight_g: 250,
    estimated_price: 780,
  },
  "4901234567895": {
    id: "demo-4901234567895",
    title: "東京ばな奈",
    brand: "東京ばな奈",
    category: "お土産",
    cover_image_url: null,
    description: "東京限定のバナナ味のお菓子",
    weight_g: 120,
    estimated_price: 1200,
  },
  "4901234567896": {
    id: "demo-4901234567896",
    title: "雷おこし",
    brand: "雷おこし本舗",
    category: "お土産",
    cover_image_url: null,
    description: "浅草名物の雷おこし",
    weight_g: 200,
    estimated_price: 800,
  },
  "4901234567897": {
    id: "demo-4901234567897",
    title: "東京スカイツリークッキー",
    brand: "東京スカイツリー",
    category: "お土産",
    cover_image_url: null,
    description: "東京スカイツリー限定クッキー",
    weight_g: 150,
    estimated_price: 1500,
  },
  "4901234567898": {
    id: "demo-4901234567898",
    title: "SK-II 化粧水",
    brand: "SK-II",
    category: "化粧品",
    cover_image_url: null,
    description: "高級化粧水",
    weight_g: 230,
    estimated_price: 15000,
  },
  "4901234567899": {
    id: "demo-4901234567899",
    title: "資生堂 洗顔フォーム",
    brand: "資生堂",
    category: "化粧品",
    cover_image_url: null,
    description: "マイルドな洗顔フォーム",
    weight_g: 120,
    estimated_price: 1200,
  },
};

interface ScanResult {
  barcode: string;
  product: Product | null;
  timestamp: number;
}

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppStore();
  const [scannedBarcodes, setScannedBarcodes] = useState<ScanResult[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoReady, setDemoReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsMounted(true);
    // URLパラメータ/セッションからデモモードを確認
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
    if (demo) setIsDemoMode(true);
    setDemoReady(true);
  }, [searchParams]);

  useEffect(() => {
    // デモ判定が終わるまでリダイレクトしない
    if (!demoReady) return;
    if (!user && !isDemoMode) {
      router.push("/");
      return;
    }

    // ネットワーク状態の監視（クライアントサイドのみ）
    if (typeof window !== "undefined") {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      setIsOnline(navigator.onLine);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [user, router, isDemoMode, demoReady]);

  const handleScan = async (barcode: string) => {
    setIsLoading(true);
    const timestamp = Date.now();

    try {
      let product: Product | null = null;

      if (isOnline) {
        const response = await fetch("/api/scan/resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rawBarcode: barcode }),
        });

        const data = await response.json();
        if (data.product) {
          product = data.product;
          toast.success(t("scan.found"));
        } else if (isDemoMode && demoProductsByBarcode[barcode]) {
          // デモモード: モック商品にフォールバック
          product = demoProductsByBarcode[barcode];
          toast.success(t("scan.demoFallback"));
        } else {
          toast.info(t("scan.notFound"));
          // 未解決の場合は補完フォームへ自動遷移
          router.push(`/capture/new?barcode=${barcode}`);
          return;
        }
      } else {
        // オフライン時はローカルに保存
        await offlineStorage.saveScan({
          barcode,
          status: "pending",
        });
        toast.info(t("common.offlineSync"));
      }

      const scanResult: ScanResult = {
        barcode,
        product,
        timestamp,
      };

      setScannedBarcodes((prev) => [...prev, scanResult]);
      setCurrentProduct(product);

      if (!isContinuousMode) {
        // 単発スキャンモードの場合は結果を表示
        if (product) {
          setCurrentProduct(product);
        }
      }
    } catch (error) {
      console.error("Scan resolve error:", error);
      toast.error(t("scan.errorSearching"));

      // エラー時もスキャン結果を記録
      const scanResult: ScanResult = {
        barcode,
        product: null,
        timestamp,
      };
      setScannedBarcodes((prev) => [...prev, scanResult]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    if (!user && !isDemoMode) {
      toast.error(t("common.loginRequired"));
      return;
    }

    setIsAddingToCart(true);

    try {
      if (isDemoMode) {
        // デモモードの場合はローカルストレージに保存
        const demoCart = JSON.parse(localStorage.getItem("demoCart") || "[]");
        const existingItem = demoCart.find(
          (item: any) => item.productId === productId
        );

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          demoCart.push({
            productId,
            quantity,
            product: currentProduct,
            addedAt: new Date().toISOString(),
          });
        }

        localStorage.setItem("demoCart", JSON.stringify(demoCart));
        toast.success(t("common.addedToDemoCart"));
      } else if (isOnline && user) {
        const response = await fetch("/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to cart");
        }

        toast.success(t("common.addedToCart"));
      } else {
        // オフライン時はローカルに保存
        await offlineStorage.saveCartItem({
          productId,
          quantity,
          status: "pending",
        });
        toast.success(t("common.offlineAddedToCart"));
      }

      if (!isContinuousMode) {
        router.push(isDemoMode ? "/cart?demo=true" : "/cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("カートへの追加に失敗しました");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleManualInput = (barcode: string) => {
    router.push(`/capture/new?barcode=${barcode}`);
  };

  const clearScannedBarcodes = () => {
    setScannedBarcodes([]);
    setCurrentProduct(null);
  };

  // マウント前は何も表示しない
  if (!isMounted || !demoReady || (!user && !isDemoMode)) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {t("scan.title")}
            </h1>
            <p className='text-gray-600'>{t("scan.desc")}</p>
            {!isOnline && (
              <Badge variant='secondary' className='mt-2'>
                {t("scan.offline")}
              </Badge>
            )}
          </div>

          {/* モード切り替え */}
          <div className='flex gap-2 mb-6 justify-center'>
            <Button
              variant={!isContinuousMode ? "default" : "outline"}
              onClick={() => setIsContinuousMode(false)}
            >
              {t("scan.single")}
            </Button>
            <Button
              variant={isContinuousMode ? "default" : "outline"}
              onClick={() => setIsContinuousMode(true)}
            >
              {t("scan.continuous")}
            </Button>
          </div>

          {/* スキャナー */}
          {!currentProduct && !isLoading && scannedBarcodes.length === 0 && (
            <BarcodeScanner
              onScan={handleScan}
              onError={handleError}
              continuous={isContinuousMode}
              isDemoMode={isDemoMode}
            />
          )}

          {/* 単発スキャン結果 */}
          {currentProduct && !isContinuousMode && (
            <div className='w-full max-w-md mx-auto'>
              <ProductCard
                product={currentProduct}
                onAddToCart={handleAddToCart}
                isLoading={isAddingToCart}
              />
              <div className='mt-4 text-center'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setCurrentProduct(null);
                    setScannedBarcodes([]);
                  }}
                >
                  {t("scan.newScan")}
                </Button>
              </div>
            </div>
          )}

          {/* 連続スキャン結果 */}
          {isContinuousMode && scannedBarcodes.length > 0 && (
            <div className='space-y-4 mb-6'>
              <div className='flex justify-between items-center'>
                <h2 className='text-xl font-semibold'>
                  {t("scan.results")} ({scannedBarcodes.length})
                </h2>
                <Button variant='outline' onClick={clearScannedBarcodes}>
                  {t("scan.clear")}
                </Button>
              </div>

              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {scannedBarcodes.map((result, index) => (
                  <Card key={index} className='p-4'>
                    <div className='flex justify-between items-center'>
                      <div>
                        <p className='font-medium'>
                          バーコード: {result.barcode}
                        </p>
                        {result.product ? (
                          <div className='mt-2'>
                            <p className='text-sm font-medium'>
                              {result.product.title}
                            </p>
                            {result.product.brand && (
                              <p className='text-xs text-gray-600'>
                                {result.product.brand}
                              </p>
                            )}
                            {result.product.estimated_price && (
                              <p className='text-sm text-green-600'>
                                ¥
                                {result.product.estimated_price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className='text-sm text-gray-500'>
                            {t("scan.notFound")}
                          </p>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        {result.product ? (
                          <Button
                            size='sm'
                            onClick={() =>
                              handleAddToCart(result.product!.id, 1)
                            }
                          >
                            {t("scan.addToCart")}
                          </Button>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleManualInput(result.barcode)}
                          >
                            {t("scan.manualInput")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* スキャン結果がない場合 */}
          {scannedBarcodes.length > 0 &&
            !currentProduct &&
            !isLoading &&
            !isContinuousMode && (
              <Card className='w-full max-w-md mx-auto mt-6'>
                <CardHeader>
                  <CardTitle>{t("scan.results")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-gray-600 mb-4'>
                    Barcode:{" "}
                    {scannedBarcodes[scannedBarcodes.length - 1].barcode}
                  </p>
                  <p className='text-sm text-gray-600 mb-4'>
                    {t("scan.notFound")}
                  </p>
                  <Button
                    onClick={() =>
                      handleManualInput(
                        scannedBarcodes[scannedBarcodes.length - 1].barcode
                      )
                    }
                    className='w-full'
                  >
                    {t("scan.manualInput")}
                  </Button>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
