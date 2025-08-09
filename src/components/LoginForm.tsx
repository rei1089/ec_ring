"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signInWithEmail } from "@/lib/auth";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("メールアドレスを入力してください");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signInWithEmail(email);

      if (error) {
        if (error.message.includes("Supabaseが設定されていません")) {
          toast.error(
            "環境変数が設定されていません。.env.localファイルにSupabaseの設定を追加してください。"
          );
        } else {
          toast.error("ログインに失敗しました: " + error.message);
        }
        return;
      }

      setIsSubmitted(true);
      toast.success("ログインリンクを送信しました。メールを確認してください。");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className='w-full max-w-md mx-auto'>
        <CardHeader>
          <CardTitle className='text-center'>
            メールを確認してください
          </CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <p className='text-gray-600 mb-4'>
            {email} にログインリンクを送信しました。
          </p>
          <p className='text-sm text-gray-500 mb-4'>
            メールのリンクをクリックしてログインしてください。
          </p>
          <Button
            variant='outline'
            onClick={() => {
              setIsSubmitted(false);
              setEmail("");
            }}
          >
            別のメールアドレスで試す
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-center'>ログイン</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='email'>メールアドレス</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='your@email.com'
              required
            />
          </div>

          <Button type='submit' disabled={isLoading} className='w-full'>
            {isLoading ? "送信中..." : "ログインリンクを送信"}
          </Button>
        </form>

        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-500'>
            パスワード不要のメールリンクログインです
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
