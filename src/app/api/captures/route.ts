import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const captureSchema = z.object({
  rawBarcode: z.string().optional(),
  photoUrl: z.string().optional(),
  shopNameText: z.string().optional(),
  priceJpyText: z.string().optional(),
  description: z.string().optional(),
  memo: z.string().optional(),
  userId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rawBarcode,
      photoUrl,
      shopNameText,
      priceJpyText,
      description,
      memo,
      userId,
    } = captureSchema.parse(body);

    const { data, error } = await supabase
      .from("captures")
      .insert({
        user_id: userId,
        raw_barcode: rawBarcode,
        photo_url: photoUrl,
        shop_name_text: shopNameText,
        price_jpy_text: priceJpyText,
        description: description,
        memo: memo,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Capture creation error:", error);
      return NextResponse.json(
        { error: "Failed to create capture" },
        { status: 500 }
      );
    }

    return NextResponse.json({ capture: data });
  } catch (error) {
    console.error("Capture API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("captures")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Captures fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch captures" },
        { status: 500 }
      );
    }

    return NextResponse.json({ captures: data });
  } catch (error) {
    console.error("Captures API error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
