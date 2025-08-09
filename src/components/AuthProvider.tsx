"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import { createUserProfile, getUserProfile } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setUserProfile, setLoading } = useAppStore();

  useEffect(() => {
    // Supabaseクライアントが設定されていない場合は早期リターン
    if (!supabase) {
      console.error("❌ Supabaseが設定されていません。認証機能は無効です。");
      console.error(
        "💡 解決方法: .env.localファイルに以下を追加してください："
      );
      console.error("   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url");
      console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key");
      setLoading(false);
      return;
    }

    // 初期セッションを取得
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // ユーザープロフィールを取得または作成
        const { data: profile, error } = await getUserProfile(session.user.id);
        if (error && error.code === "PGRST116") {
          // プロフィールが存在しない場合は作成
          await createUserProfile(session.user.id);
          setUserProfile({
            id: session.user.id,
            locale: "en",
            home_country: null,
          });
        } else if (profile) {
          setUserProfile(profile);
        }
      }
      setLoading(false);
    };

    getInitialSession();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);

        // ユーザープロフィールを取得または作成
        const { data: profile, error } = await getUserProfile(session.user.id);
        if (error && error.code === "PGRST116") {
          await createUserProfile(session.user.id);
          setUserProfile({
            id: session.user.id,
            locale: "en",
            home_country: null,
          });
        } else if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setUserProfile, setLoading]);

  return <>{children}</>;
}
