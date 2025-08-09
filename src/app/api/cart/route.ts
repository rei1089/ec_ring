import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // ユーザーのアクティブなカートとアイテムを取得
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        id,
        status,
        created_at,
        cart_items (
          id,
          quantity,
          product_id,
          selected_offer_id,
          note,
          products (
            id,
            title,
            brand,
            category,
            cover_image_url,
            description,
            weight_g
          ),
          offers (
            id,
            price_jpy,
            shops (
              id,
              name,
              address
            )
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (cartError && cartError.code !== 'PGRST116') {
      console.error('Cart fetch error:', cartError)
      return NextResponse.json(
        { error: 'Failed to fetch cart' },
        { status: 500 }
      )
    }

    if (!cart) {
      return NextResponse.json({ cart: null, items: [] })
    }

    // 店舗ごとにグループ化
    const shopGroups: Record<string, any[]> = {}
    
    cart.cart_items?.forEach((item: any) => {
      const shopName = item.offers?.shops?.name || 'Unknown Shop'
      if (!shopGroups[shopName]) {
        shopGroups[shopName] = []
      }
      shopGroups[shopName].push(item)
    })

    return NextResponse.json({
      cart: {
        id: cart.id,
        status: cart.status,
        created_at: cart.created_at
      },
      items: cart.cart_items || [],
      shopGroups
    })

  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
