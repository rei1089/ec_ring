import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

const updateItemSchema = z.object({
  quantity: z.number().min(1).optional(),
  note: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { quantity, note } = updateItemSchema.parse(body)
    const itemId = params.id

    const updates: any = {}
    if (quantity !== undefined) updates.quantity = quantity
    if (note !== undefined) updates.note = note

    const { data, error } = await supabase
      .from('cart_items')
      .update(updates)
      .eq('id', itemId)
      .select(`
        id,
        quantity,
        product_id,
        selected_offer_id,
        note,
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

    if (error) {
      console.error('Cart item update error:', error)
      return NextResponse.json(
        { error: 'Failed to update cart item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ cartItem: data })

  } catch (error) {
    console.error('Cart item update API error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)

    if (error) {
      console.error('Cart item deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete cart item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Cart item deletion API error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
