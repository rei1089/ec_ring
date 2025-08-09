"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Share, Copy, ExternalLink } from "lucide-react";

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

interface SharedCartData {
  cart: {
    id: string;
    status: string;
    created_at: string;
  };
  items: CartItem[];
  shopGroups: Record<string, CartItem[]>;
  shareInfo: {
    token: string;
    expiresAt: string;
    createdAt: string;
  };
}

export default function SharedCartPage() {
  const params = useParams();
  const token = params.token as string;
  const [cartData, setCartData] = useState<SharedCartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      loadSharedCart();
    }
  }, [token, isMounted]);

  const loadSharedCart = async () => {
    try {
      const response = await fetch(`/api/cart/share?token=${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load shared cart");
      }

      setCartData(data);
    } catch (error) {
      console.error("Load shared cart error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load shared cart"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareUrl = async () => {
    if (typeof window === "undefined") return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("共有リンクをコピーしました");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("リンクのコピーに失敗しました");
    }
  };

  const calculateTotal = () => {
    if (!cartData) return 0;
    let total = 0;
    cartData.items.forEach((item) => {
      const price = item.offer?.price_jpy || 0;
      total += price * item.quantity;
    });
    return total;
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
          <p>共有カートを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !cartData) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-500 mb-4'>
            <p className='text-lg font-semibold'>エラーが発生しました</p>
            <p className='text-sm'>{error || "共有カートが見つかりません"}</p>
          </div>
          <Button onClick={() => window.history.back()}>戻る</Button>
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
              共有カート
            </h1>
            <p className='text-gray-600'>旅行仲間と共有されたカートです</p>
            <div className='flex justify-center gap-2 mt-4'>
              <Button
                variant='outline'
                onClick={copyShareUrl}
                className='flex items-center gap-2'
              >
                <Copy className='w-4 h-4' />
                リンクをコピー
              </Button>
            </div>
          </div>

          {/* 共有情報 */}
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Share className='w-5 h-5' />
                共有情報
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div>
                  <p className='font-medium text-gray-600'>作成日</p>
                  <p>
                    {new Date(cartData.shareInfo.createdAt).toLocaleDateString(
                      "ja-JP"
                    )}
                  </p>
                </div>
                <div>
                  <p className='font-medium text-gray-600'>有効期限</p>
                  <p>
                    {new Date(cartData.shareInfo.expiresAt).toLocaleDateString(
                      "ja-JP"
                    )}
                  </p>
                </div>
                <div>
                  <p className='font-medium text-gray-600'>商品数</p>
                  <p>{cartData.items.length}個</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 店舗ごとのセクション */}
          {Object.entries(cartData.shopGroups).map(([shopName, items]) => (
            <Card key={shopName} className='mb-6'>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>{shopName}</span>
                  <Badge variant='secondary'>{items.length}商品</Badge>
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
                              画像なし
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

                      {/* 数量 */}
                      <div className='flex-shrink-0'>
                        <span className='text-sm font-medium'>
                          数量: {item.quantity}
                        </span>
                      </div>

                      {/* メモ */}
                      {item.note && (
                        <div className='flex-shrink-0'>
                          <p className='text-xs text-gray-500 max-w-32 truncate'>
                            メモ: {item.note}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 合計 */}
          <Card>
            <CardHeader>
              <CardTitle>合計</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between items-center'>
                <span className='text-lg font-semibold'>商品合計:</span>
                <span className='text-lg font-bold'>
                  ¥{calculateTotal().toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
