# デプロイ手順 - 他の人のスマホでも見れるようにする

## 方法 1: Vercel（推奨・無料）

### 1. GitHub にコードをアップロード

1. [GitHub](https://github.com)でアカウントを作成（まだの場合）
2. 新しいリポジトリを作成
3. 以下のコマンドでコードをアップロード：

```bash
# Gitリポジトリを初期化
git init

# ファイルを追加
git add .

# 最初のコミット
git commit -m "Initial commit"

# GitHubリポジトリを追加（YOUR_USERNAMEとYOUR_REPO_NAMEを実際の値に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# コードをプッシュ
git push -u origin main
```

### 2. Vercel でデプロイ

1. [Vercel](https://vercel.com)にアクセス
2. GitHub アカウントでログイン
3. "New Project"をクリック
4. GitHub リポジトリを選択
5. 環境変数を設定：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. "Deploy"をクリック

### 3. カスタムドメイン（オプション）

1. Vercel ダッシュボードでプロジェクトを選択
2. "Settings" → "Domains"
3. カスタムドメインを追加

## 方法 2: Netlify（無料）

### 1. ビルド設定

```bash
# プロジェクトをビルド
npm run build
```

### 2. Netlify でデプロイ

1. [Netlify](https://netlify.com)にアクセス
2. GitHub アカウントでログイン
3. "New site from Git"をクリック
4. GitHub リポジトリを選択
5. ビルド設定：
   - Build command: `npm run build`
   - Publish directory: `out`
6. 環境変数を設定
7. "Deploy site"をクリック

## 方法 3: Railway（無料枠あり）

1. [Railway](https://railway.app)にアクセス
2. GitHub アカウントでログイン
3. "New Project" → "Deploy from GitHub repo"
4. リポジトリを選択
5. 環境変数を設定
6. 自動デプロイが開始

## 環境変数の設定

デプロイ時に以下の環境変数を設定してください：

```bash
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# PostHog設定（オプション）
POSTHOG_KEY=your_posthog_key_here
```

## 注意事項

1. **HTTPS 必須**: カメラ機能を使用するため、HTTPS 環境が必要です
2. **環境変数**: Supabase の設定は必ず環境変数として設定してください
3. **ドメイン**: デプロイ後、提供される URL を他の人に共有できます
4. **モバイル対応**: レスポンシブデザインなので、スマホでも見やすくなっています

## トラブルシューティング

### ビルドエラーが発生する場合

1. `npm run build`をローカルで実行してエラーを確認
2. TypeScript エラーがないか確認
3. 依存関係が正しくインストールされているか確認

### カメラが動作しない場合

1. HTTPS 環境でアクセスしているか確認
2. ブラウザのカメラ権限を許可しているか確認
3. モバイルブラウザの場合は、ユーザー操作でのみカメラが起動することを確認

## 共有方法

デプロイが完了したら、以下の方法で他の人と共有できます：

1. **URL 共有**: デプロイ後に提供される URL を直接共有
2. **QR コード**: URL を QR コードに変換して共有
3. **SNS**: ソーシャルメディアで URL を投稿

例：`https://your-app-name.vercel.app`
