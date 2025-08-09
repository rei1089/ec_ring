"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
  isLoading?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  isLoading = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (quantity < 1) {
      toast.error("数量は1以上で入力してください");
      return;
    }
    onAddToCart(product.id, quantity);
  };

  return (
    <Card className='w-full max-w-sm mx-auto'>
      <CardHeader>
        <div className='aspect-square relative overflow-hidden rounded-lg bg-gray-100'>
          {product.cover_image_url ? (
            <Image
              src={product.cover_image_url}
              alt={product.title}
              fill
              className='object-cover'
            />
          ) : (
            <div className='flex items-center justify-center h-full text-gray-400'>
              <span>画像なし</span>
            </div>
          )}
        </div>
        <CardTitle className='text-lg line-clamp-2'>{product.title}</CardTitle>
        {product.brand && (
          <p className='text-sm text-gray-600'>{product.brand}</p>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        {product.description && (
          <p className='text-sm text-gray-700 line-clamp-3'>
            {product.description}
          </p>
        )}

        <div className='flex flex-wrap gap-2'>
          {product.category && (
            <Badge variant='secondary'>{product.category}</Badge>
          )}
          {product.weight_g && (
            <Badge variant='outline'>{product.weight_g}g</Badge>
          )}
        </div>

        {/* 価格表示 */}
        {product.estimated_price && (
          <div className='text-center'>
            <p className='text-2xl font-bold text-green-600'>
              ¥{product.estimated_price.toLocaleString()}
            </p>
            <p className='text-xs text-gray-500'>推定価格</p>
          </div>
        )}

        <div className='flex items-center justify-center gap-4'>
          <label
            htmlFor={`quantity-${product.id}`}
            className='text-sm font-medium'
          >
            数量:
          </label>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <input
              id={`quantity-${product.id}`}
              type='number'
              min='1'
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className='w-16 px-2 py-1 border rounded text-center text-sm'
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className='w-full'
        >
          {isLoading ? "追加中..." : "カートに追加"}
        </Button>
      </CardContent>
    </Card>
  );
}
