# 日本のお土産カート - バーコードスキャンでスマートに

訪日観光客向けのバーコードスキャン・カートアプリです。店頭で気になった商品のバーコードをスマホで読み取り、共通カートに保存。帰国後に Web で見返し・数量調整・概算送料を確認できます。

## 🎯 VC デモ用機能

### デモモード

- **ログイン不要**: アプリの機能をすぐに体験可能
- **サンプルバーコード**: デモ用のバーコードをクリックしてスキャン体験
- **多様な商品**: お菓子、お土産、化粧品、飲料など豊富な商品カテゴリー
- **実際の使用感**: カート管理、送料計算、商品検索などの全機能を体験

### デモ用サンプルバーコード

```
4901234567890 - 抹茶クッキー
4901234567891 - 抹茶チョコレート
4901234567892 - 抹茶ラテミックス
4901234567893 - 抹茶アイスクリーム
4901234567894 - 抹茶ケーキ
```

## 機能

- 📱 **バーコードスキャン**: JAN-13 コードに対応したカメラスキャン
- 🛒 **カート管理**: 店舗ごとにグループ化された商品管理
- 📦 **送料概算**: 国別の送料計算機能
- 🔐 **認証**: メールリンクログイン
- 📸 **未解決商品**: 手動入力フォーム
- 🎮 **デモモード**: ログイン不要で機能体験

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **バーコード**: @zxing/browser
- **状態管理**: Zustand
- **通知**: Sonner

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://nigaefyqrqhtuxqgbsot.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
# または
SUPABASE_KEY=your_supabase_key_here

# PostHog設定（オプション）
POSTHOG_KEY=your_posthog_key_here
```

**重要**: `your_supabase_anon_key_here` または `your_supabase_key_here` を実際の Supabase プロジェクトのキーに置き換えてください。

### 2. Supabase プロジェクトのセットアップ

1. [Supabase](https://supabase.com/)で新しいプロジェクトを作成
2. SQL Editor で `database/schema.sql` を実行してテーブルを作成
3. `database/seed.sql` を実行してサンプルデータを挿入
4. Authentication > Settings でメール認証を有効化

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

HTTPS が必要な場合（カメラ機能のため）：

```bash
npm run dev -- --ssl
```

または

```bash
npx vercel dev --ssl
```

### 5. ブラウザでアクセス

[http://localhost:3000](http://localhost:3000) にアクセス

## 使用方法

1. **ログイン**: メールアドレスを入力してログインリンクを送信
2. **スキャン**: `/scan` ページでバーコードをスキャン
3. **商品確認**: 商品情報が表示されたらカートに追加
4. **未解決商品**: 商品が見つからない場合は手動入力
5. **カート確認**: `/cart` ページで商品一覧と送料計算

## データベース構造

- `user_profiles`: ユーザープロフィール
- `shops`: 店舗情報
- `products`: 商品情報
- `barcodes`: バーコードと商品の紐付け
- `offers`: 商品の価格情報
- `carts`: ユーザーのカート
- `cart_items`: カート内の商品
- `captures`: 未解決スキャン情報

## デプロイ

### Vercel

1. GitHub にリポジトリをプッシュ
2. [Vercel](https://vercel.com/)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

### その他のプラットフォーム

- Netlify
- Railway
- Render

## 開発

### テスト

```bash
npm run test
```

### ビルド

```bash
npm run build
```

## 注意事項

- カメラ機能は HTTPS 環境が必要です
- iOS Safari ではユーザー操作でのみカメラが起動します
- 画像アップロードは 5MB 以下に制限されています

## ライセンス

MIT License
