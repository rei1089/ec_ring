'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useState } from 'react'

interface CartItem {
  id: string
  quantity: number
  product_id: string
  selected_offer_id: string | null
  note: string | null
  product?: {
    id: string
    title: string
    brand: string | null
    cover_image_url: string | null
    weight_g: number | null
  }
  offer?: {
    price_jpy: number | null
    shop?: {
      name: string
    }
  }
}

interface ShopGroupProps {
  shopName: string
  items: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
}

export function ShopGroup({ shopName, items, onUpdateQuantity, onRemoveItem }: ShopGroupProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())

  const handleQuantityChange = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      onRemoveItem(itemId)
      return
    }
    
    setUpdatingItems(prev => new Set(prev).add(itemId))
    onUpdateQuantity(itemId, quantity)
    setUpdatingItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(itemId)
      return newSet
    })
  }

  const totalPrice = items.reduce((sum, item) => {
    return sum + ((item.offer?.price_jpy || 0) * item.quantity)
  }, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{shopName}</span>
          <Badge variant="secondary">
            {items.length}商品
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 relative overflow-hidden rounded bg-gray-100">
                {item.product?.cover_image_url ? (
                  <Image
                    src={item.product.cover_image_url}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    画像なし
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">
                {item.product?.title || '商品名不明'}
              </h4>
              {item.product?.brand && (
                <p className="text-xs text-gray-600">{item.product.brand}</p>
              )}
              {item.offer?.price_jpy && (
                <p className="text-sm font-medium text-green-600">
                  ¥{item.offer.price_jpy.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                disabled={updatingItems.has(item.id)}
                className="w-16 px-2 py-1 border rounded text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                disabled={updatingItems.has(item.id)}
              >
                削除
              </Button>
            </div>
          </div>
        ))}

        {totalPrice > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">小計:</span>
              <span className="font-bold text-lg">
                ¥{totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
