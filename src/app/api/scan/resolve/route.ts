import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const resolveSchema = z.object({
  rawBarcode: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawBarcode } = resolveSchema.parse(body);

    // バーコードから商品を検索
    const { data: barcodeData, error: barcodeError } = await supabase
      .from("barcodes")
      .select(
        `
        code_value,
        products (
          id,
          title,
          brand,
          category,
          cover_image_url,
          description,
          weight_g
        )
      `
      )
      .eq("code_value", rawBarcode)
      .single();

    if (barcodeError || !barcodeData) {
      return NextResponse.json({ product: null }, { status: 200 });
    }

    // 商品の価格情報を取得
    const { data: offerData, error: offerError } = await supabase
      .from("offers")
      .select(
        `
        price_jpy,
        shops (
          name
        )
      `
      )
      .eq("product_id", barcodeData.products.id)
      .order("price_jpy", { ascending: true })
      .limit(1)
      .single();

    const product = {
      ...barcodeData.products,
      estimated_price: offerData?.price_jpy || null,
    };

    return NextResponse.json({
      product,
    });
  } catch (error) {
    console.error("Barcode resolve error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
