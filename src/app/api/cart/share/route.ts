import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'
import { createHash } from 'crypto'

const shareCartSchema = z.object({
  userId: z.string(),
  expiresIn: z.number().optional().default(7 * 24 * 60 * 60 * 1000), // デフォルト7日
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, expiresIn } = shareCartSchema.parse(body)

    // ユーザーのアクティブなカートを取得
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (cartError || !cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // 共有トークンを生成
    const token = createHash('sha256')
      .update(`${cart.id}-${Date.now()}-${Math.random()}`)
      .digest('hex')
      .substring(0, 16)

    const expiresAt = new Date(Date.now() + expiresIn)

    // 共有リンクをデータベースに保存
    const { data: shareLink, error: shareError } = await supabase
      .from('cart_shares')
      .insert({
        cart_id: cart.id,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: userId
      })
      .select()
      .single()

    if (shareError) {
      console.error('Share link creation error:', shareError)
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      )
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/cart/shared/${token}`

    return NextResponse.json({
      shareLink: {
        id: shareLink.id,
        token,
        url: shareUrl,
        expiresAt: shareLink.expires_at
      }
    })

  } catch (error) {
    console.error('Share cart API error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 400 }
      )
    }

    // 共有リンクを検証
    const { data: shareLink, error: shareError } = await supabase
      .from('cart_shares')
      .select(`
        id,
        cart_id,
        token,
        expires_at,
        created_at,
        carts (
          id,
          user_id,
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
        )
      `)
      .eq('token', token)
      .single()

    if (shareError || !shareLink) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      )
    }

    // 有効期限チェック
    if (new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      )
    }

    // カートが存在しない場合
    if (!shareLink.carts) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // 店舗ごとにグループ化
    const shopGroups: Record<string, any[]> = {}
    
    shareLink.carts.cart_items?.forEach((item: any) => {
      const shopName = item.offers?.shops?.name || 'Unknown Shop'
      if (!shopGroups[shopName]) {
        shopGroups[shopName] = []
      }
      shopGroups[shopName].push(item)
    })

    return NextResponse.json({
      cart: {
        id: shareLink.carts.id,
        status: shareLink.carts.status,
        created_at: shareLink.carts.created_at
      },
      items: shareLink.carts.cart_items || [],
      shopGroups,
      shareInfo: {
        token: shareLink.token,
        expiresAt: shareLink.expires_at,
        createdAt: shareLink.created_at
      }
    })

  } catch (error) {
    console.error('Get shared cart API error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
