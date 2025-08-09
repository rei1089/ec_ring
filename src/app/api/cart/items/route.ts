import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  selectedOfferId: z.string().optional(),
  userId: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, selectedOfferId, userId } = addItemSchema.parse(body)

    // ユーザーのアクティブなカートを取得または作成
    let { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
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

    // カートが存在しない場合は作成
    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          user_id: userId,
          status: 'active'
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Cart creation error:', createError)
        return NextResponse.json(
          { error: 'Failed to create cart' },
          { status: 500 }
        )
      }
      cart = newCart
    }

    // カートアイテムを追加
    const { data: cartItem, error: itemError } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cart.id,
        product_id: productId,
        quantity,
        selected_offer_id: selectedOfferId
      })
      .select(`
        id,
        quantity,
        product_id,
        selected_offer_id,
        products (
          id,
          title,
          brand,
          cover_image_url,
          weight_g
        ),
        offers (
          price_jpy,
          shops (
            name
          )
        )
      `)
      .single()

    if (itemError) {
      console.error('Cart item creation error:', itemError)
      return NextResponse.json(
        { error: 'Failed to add item to cart' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cartItem })

  } catch (error) {
    console.error('Cart item API error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
