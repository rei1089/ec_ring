"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShopGroup } from "@/components/ShopGroup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { availableCountries } from "@/lib/shipping";
import { offlineStorage } from "@/lib/offline";
import { Share, Copy, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CartItem {
  id: string;
  quantity: number;
  product_id: string;
  selected_offer_id: string | null;
  note: string | null;
  product?: {
    id: string;
    title: string;
    brand: string | null;
    cover_image_url: string | null;
    weight_g: number | null;
  };
  offer?: {
    price_jpy: number | null;
    shop?: {
      name: string;
    };
  };
}

interface ShippingQuote {
  total_weight_g: number;
  shipping_cost_jpy: number;
  estimated_days: number;
}

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAppStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shopGroups, setShopGroups] = useState<Record<string, CartItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [shippingQuote, setShippingQuote] = useState<ShippingQuote | null>(
    null
  );
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [editingNotes, setEditingNotes] = useState<Record<string, boolean>>({});
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
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
    loadCart();
  }, [user, router, isDemoMode, demoReady]);

  const loadCart = async () => {
    if (isDemoMode) {
      // デモモードの場合はローカルストレージから読み込み
      const demoCart = JSON.parse(localStorage.getItem("demoCart") || "[]");

      // デモ初期化: 空ならデモ商品を1件追加
      if (!demoCart.length) {
        const seedBarcode = "4901234567890"; // 抹茶クッキー
        // サーバAPIから商品情報取得（同APIを利用）
        try {
          const res = await fetch("/api/scan/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rawBarcode: seedBarcode }),
          });
          const data = await res.json();
          const product = data.product || {
            id: "demo-4901234567890",
            title: "抹茶クッキー",
            brand: "お菓子の森",
            category: "お菓子",
            cover_image_url: null,
            description: "京都産抹茶を使用した上品なクッキー",
            weight_g: 150,
            estimated_price: 580,
          };
          demoCart.push({
            productId: product.id,
            quantity: 1,
            product,
            addedAt: new Date().toISOString(),
          });
          localStorage.setItem("demoCart", JSON.stringify(demoCart));
        } catch {}
      }

      const demoItems: CartItem[] = demoCart.map(
        (item: any, index: number) => ({
          id: `demo-${index}`,
          quantity: item.quantity,
          product_id: item.productId,
          selected_offer_id: null,
          note: null,
          product: item.product,
          offer: {
            price_jpy: item.product?.estimated_price || null,
            shop: { name: "デモショップ" },
          },
        })
      );

      setCartItems(demoItems);
      setShopGroups({ DemoShop: demoItems });
      setIsLoading(false);
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/cart?userId=${user.id}`);
      const data = await response.json();

      if (data.items) {
        setCartItems(data.items);
        setShopGroups(data.shopGroups || {});
      }
    } catch (error) {
      console.error("Load cart error:", error);
      toast.error("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (isDemoMode) {
        // デモモードの場合はローカルストレージを更新
        const demoCart = JSON.parse(localStorage.getItem("demoCart") || "[]");
        const itemIndex = parseInt(itemId.replace("demo-", ""));

        if (demoCart[itemIndex]) {
          demoCart[itemIndex].quantity = quantity;
          localStorage.setItem("demoCart", JSON.stringify(demoCart));
          loadCart(); // カートを再読み込み
          toast.success("数量を更新しました");
        }
        return;
      }

      if (!user) return;

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      toast.success("Quantity updated");
      loadCart();
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleUpdateNote = async (itemId: string, note: string) => {
    try {
      if (isDemoMode) {
        // デモモードの場合はローカルストレージを更新
        const demoCart = JSON.parse(localStorage.getItem("demoCart") || "[]");
        const itemIndex = parseInt(itemId.replace("demo-", ""));

        if (demoCart[itemIndex]) {
          demoCart[itemIndex].note = note;
          localStorage.setItem("demoCart", JSON.stringify(demoCart));
          loadCart(); // カートを再読み込み
          toast.success("メモを更新しました");
        }
        return;
      }

      if (!user) return;

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      toast.success("Memo updated");
      loadCart();
    } catch (error) {
      console.error("Update note error:", error);
      toast.error("Failed to update memo");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      if (isDemoMode) {
        // デモモードの場合はローカルストレージから削除
        const demoCart = JSON.parse(localStorage.getItem("demoCart") || "[]");
        const itemIndex = parseInt(itemId.replace("demo-", ""));

        if (demoCart[itemIndex]) {
          demoCart.splice(itemIndex, 1);
          localStorage.setItem("demoCart", JSON.stringify(demoCart));
          loadCart(); // カートを再読み込み
          toast.success("商品を削除しました");
        }
        return;
      }

      if (!user) return;

      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      toast.success("Item removed");
      loadCart();
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error("Failed to remove item");
    }
  };

  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      const price = item.offer?.price_jpy || 0;
      total += price * item.quantity;
    });
    return total;
  };

  const calculateShipping = async () => {
    if (cartItems.length === 0) {
      toast.error(t("cart.empty"));
      return;
    }

    setIsCalculatingShipping(true);
    try {
      const totalWeight = cartItems.reduce((sum, item) => {
        return sum + (item.product?.weight_g || 0) * item.quantity;
      }, 0);

      const response = await fetch("/api/ship/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
          totalWeightG: totalWeight,
        }),
      });

      if (response.ok) {
        const quote = await response.json();
        setShippingQuote(quote);
      } else {
        throw new Error("Failed to calculate shipping");
      }
    } catch (error) {
      console.error("Calculate shipping error:", error);
      toast.error("Failed to calculate shipping");
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const createShareLink = async () => {
    if (!user) return;

    setIsCreatingShare(true);
    try {
      const response = await fetch("/api/cart/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          expiresIn: 7 * 24 * 60 * 60 * 1000, // 7日
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrl(data.shareLink.url);
        toast.success(t("cart.createShareDone"));
      } else {
        throw new Error("Failed to create share link");
      }
    } catch (error) {
      console.error("Create share link error:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsCreatingShare(false);
    }
  };

  const copyShareUrl = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("cart.copied"));
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("リンクのコピーに失敗しました");
    }
  };

  // マウント前は何も表示しない
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {t("cart.title")}
            </h1>
            <p className='text-gray-600'>{t("cart.desc")}</p>
            {isDemoMode && (
              <Badge variant='secondary' className='mt-2'>
                {t("common.demoMode")}
              </Badge>
            )}
          </div>

          {cartItems.length === 0 ? (
            <Card className='w-full max-w-md mx-auto'>
              <CardContent className='p-8 text-center'>
                <p className='text-gray-500 mb-4'>{t("cart.empty")}</p>
                <Button
                  onClick={() =>
                    router.push(isDemoMode ? "/scan?demo=true" : "/scan")
                  }
                >
                  {t("cart.goScan")}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-6'>
              {/* 共有機能 */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Share className='w-5 h-5' />
                    {t("cart.share")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!shareUrl ? (
                    <Button
                      onClick={createShareLink}
                      disabled={isCreatingShare}
                      className='flex items-center gap-2'
                    >
                      {isCreatingShare
                        ? t("cart.creating")
                        : t("cart.createShare")}
                    </Button>
                  ) : (
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg'>
                        <Input value={shareUrl} readOnly className='flex-1' />
                        <Button
                          variant='outline'
                          onClick={copyShareUrl}
                          className='flex items-center gap-2'
                        >
                          <Copy className='w-4 h-4' />
                          {t("cart.copy")}
                        </Button>
                      </div>
                      <p className='text-xs text-gray-500'>
                        Share this link with your travel mates so they can check
                        your cart
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 店舗ごとのセクション */}
              {Object.entries(shopGroups).map(([shopName, items]) => (
                <Card key={shopName}>
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span>{shopName}</span>
                      <Badge variant='secondary'>
                        {items.length}
                        {t("cart.items")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className='flex items-center gap-4 p-4 border rounded-lg'
                        >
                          {/* 商品画像 */}
                          <div className='w-16 h-16 relative flex-shrink-0'>
                            {item.product?.cover_image_url ? (
                              <img
                                src={item.product.cover_image_url}
                                alt={item.product.title}
                                className='w-full h-full object-cover rounded'
                              />
                            ) : (
                              <div className='w-full h-full bg-gray-200 rounded flex items-center justify-center'>
                                <span className='text-gray-400 text-xs'>
                                  {t("cart.imageNone")}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 商品情報 */}
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-medium text-sm line-clamp-2'>
                              {item.product?.title}
                            </h3>
                            {item.product?.brand && (
                              <p className='text-xs text-gray-600'>
                                {item.product.brand}
                              </p>
                            )}
                            {item.offer?.price_jpy && (
                              <p className='text-sm font-bold text-green-600'>
                                ¥{item.offer.price_jpy.toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* 数量編集 */}
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              -
                            </Button>
                            <span className='w-8 text-center text-sm'>
                              {item.quantity}
                            </span>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                            >
                              +
                            </Button>
                          </div>

                          {/* メモ */}
                          <div className='flex-shrink-0'>
                            {editingNotes[item.id] ? (
                              <div className='space-y-2'>
                                <Textarea
                                  value={item.note || ""}
                                  onChange={(e) => {
                                    setCartItems((prev) =>
                                      prev.map((cartItem) =>
                                        cartItem.id === item.id
                                          ? {
                                              ...cartItem,
                                              note: e.target.value,
                                            }
                                          : cartItem
                                      )
                                    );
                                  }}
                                  placeholder='メモを入力...'
                                  className='w-32 h-20 text-xs'
                                />
                                <div className='flex gap-1'>
                                  <Button
                                    size='sm'
                                    onClick={() =>
                                      handleUpdateNote(item.id, item.note || "")
                                    }
                                  >
                                    保存
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      setEditingNotes((prev) => ({
                                        ...prev,
                                        [item.id]: false,
                                      }))
                                    }
                                  >
                                    キャンセル
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() =>
                                  setEditingNotes((prev) => ({
                                    ...prev,
                                    [item.id]: true,
                                  }))
                                }
                              >
                                {item.note
                                  ? t("cart.memoEdit")
                                  : t("cart.memoAdd")}
                              </Button>
                            )}
                          </div>

                          {/* 削除 */}
                          <Button
                            size='sm'
                            variant='destructive'
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            {t("cart.remove")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* 合計と送料計算 */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("cart.total")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                      <span>{t("cart.itemsTotal")}</span>
                      <span className='font-bold'>
                        ¥{calculateTotal().toLocaleString()}
                      </span>
                    </div>

                    {/* 送料計算 */}
                    <div className='border-t pt-4'>
                      <div className='flex gap-4 items-center mb-4'>
                        <label className='text-sm font-medium'>
                          {t("cart.shipTo")}
                        </label>
                        <Select
                          value={selectedCountry}
                          onValueChange={setSelectedCountry}
                        >
                          <SelectTrigger className='w-48'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCountries.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={calculateShipping}
                          disabled={isCalculatingShipping}
                          size='sm'
                        >
                          {isCalculatingShipping
                            ? t("cart.calculating")
                            : t("cart.calcShipping")}
                        </Button>
                      </div>

                      {shippingQuote && (
                        <div className='bg-gray-50 p-4 rounded-lg'>
                          <div className='flex justify-between items-center mb-2'>
                            <span>{t("cart.shipping")}</span>
                            <span className='font-bold'>
                              ¥
                              {shippingQuote.shipping_cost_jpy.toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between items-center mb-2'>
                            <span>{t("cart.eta")}</span>
                            <span>{shippingQuote.estimated_days}d</span>
                          </div>
                          <div className='flex justify-between items-center border-t pt-2'>
                            <span className='font-bold'>
                              {t("cart.grandTotal")}
                            </span>
                            <span className='font-bold text-lg'>
                              ¥
                              {(
                                calculateTotal() +
                                shippingQuote.shipping_cost_jpy
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
