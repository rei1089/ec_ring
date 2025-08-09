import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const quoteSchema = z.object({
  country: z.string(),
  totalWeightG: z.number().min(0),
});

// 国別の送料計算ルール
const shippingRules = {
  US: {
    baseCost: 2000,
    perKg: 500,
    estimatedDays: 7,
  },
  CA: {
    baseCost: 2500,
    perKg: 600,
    estimatedDays: 8,
  },
  UK: {
    baseCost: 3000,
    perKg: 700,
    estimatedDays: 6,
  },
  DE: {
    baseCost: 2800,
    perKg: 650,
    estimatedDays: 7,
  },
  FR: {
    baseCost: 2900,
    perKg: 670,
    estimatedDays: 7,
  },
  AU: {
    baseCost: 3500,
    perKg: 800,
    estimatedDays: 9,
  },
  JP: {
    baseCost: 1000,
    perKg: 200,
    estimatedDays: 2,
  },
} as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, totalWeightG } = quoteSchema.parse(body);

    // 送料計算ルールを取得
    const rule = shippingRules[country as keyof typeof shippingRules];
    if (!rule) {
      return NextResponse.json(
        { error: "Unsupported country" },
        { status: 400 }
      );
    }

    // 重量をkgに変換
    const weightKg = totalWeightG / 1000;

    // 送料計算（基本料金 + 重量料金）
    const shippingCost = Math.round(rule.baseCost + weightKg * rule.perKg);

    // 最小送料の保証
    const minShippingCost = rule.baseCost;
    const finalShippingCost = Math.max(shippingCost, minShippingCost);

    return NextResponse.json({
      total_weight_g: totalWeightG,
      shipping_cost_jpy: finalShippingCost,
      estimated_days: rule.estimatedDays,
      breakdown: {
        base_cost: rule.baseCost,
        weight_cost: Math.round(weightKg * rule.perKg),
        total_weight_kg: weightKg,
      },
    });
  } catch (error) {
    console.error("Shipping quote error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
