import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nigaefyqrqhtuxqgbsot.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// 環境変数が設定されていない場合は警告を表示
if (!supabaseAnonKey) {
  console.warn(
    "Supabase環境変数が設定されていません。.env.localファイルに以下を追加してください："
  );
  console.warn("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
  console.warn("または");
  console.warn("SUPABASE_KEY=your_supabase_key");
}

export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// 型定義
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          locale: string;
          home_country: string | null;
        };
        Insert: {
          id: string;
          locale?: string;
          home_country?: string | null;
        };
        Update: {
          id?: string;
          locale?: string;
          home_country?: string | null;
        };
      };
      shops: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          country?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          country?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          brand: string | null;
          category: string | null;
          cover_image_url: string | null;
          description: string | null;
          weight_g: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          brand?: string | null;
          category?: string | null;
          cover_image_url?: string | null;
          description?: string | null;
          weight_g?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          brand?: string | null;
          category?: string | null;
          cover_image_url?: string | null;
          description?: string | null;
          weight_g?: number | null;
          created_at?: string;
        };
      };
      barcodes: {
        Row: {
          id: string;
          product_id: string;
          code_type: string;
          code_value: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          code_type?: string;
          code_value: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          code_type?: string;
          code_value?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          shop_id: string | null;
          product_id: string;
          price_jpy: number | null;
          captured_at: string;
          captured_by_user_id: string | null;
        };
        Insert: {
          id?: string;
          shop_id?: string | null;
          product_id: string;
          price_jpy?: number | null;
          captured_at?: string;
          captured_by_user_id?: string | null;
        };
        Update: {
          id?: string;
          shop_id?: string | null;
          product_id?: string;
          price_jpy?: number | null;
          captured_at?: string;
          captured_by_user_id?: string | null;
        };
      };
      carts: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          quantity: number;
          selected_offer_id: string | null;
          note: string | null;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          quantity?: number;
          selected_offer_id?: string | null;
          note?: string | null;
        };
        Update: {
          id?: string;
          cart_id?: string;
          product_id?: string;
          quantity?: number;
          selected_offer_id?: string | null;
          note?: string | null;
        };
      };
      captures: {
        Row: {
          id: string;
          user_id: string;
          raw_barcode: string | null;
          photo_url: string | null;
          shop_name_text: string | null;
          price_jpy_text: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          raw_barcode?: string | null;
          photo_url?: string | null;
          shop_name_text?: string | null;
          price_jpy_text?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          raw_barcode?: string | null;
          photo_url?: string | null;
          shop_name_text?: string | null;
          price_jpy_text?: string | null;
          status?: string;
          created_at?: string;
        };
      };
    };
  };
};
