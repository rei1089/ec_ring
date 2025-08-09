# 🚀 簡単デプロイ手順 - 他の人のスマホでも見れるようにする

## 最も簡単な方法：Vercel（無料・5 分で完了）

### ステップ 1: GitHub にコードをアップロード

1. **GitHub アカウント作成**

   - [GitHub](https://github.com)にアクセス
   - 「Sign up」でアカウント作成

2. **新しいリポジトリ作成**

   - GitHub にログイン後、「New repository」をクリック
   - リポジトリ名を入力（例：`omiyage-cart`）
   - 「Create repository」をクリック

3. **コードをアップロード**
   - PowerShell を開いて、プロジェクトフォルダに移動
   - 以下のコマンドを順番に実行：

```powershell
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

### ステップ 2: Vercel でデプロイ

1. **Vercel にアクセス**

   - [Vercel](https://vercel.com)にアクセス
   - 「Continue with GitHub」で GitHub アカウントでログイン

2. **プロジェクト作成**

   - 「New Project」をクリック
   - GitHub リポジトリを選択
   - 「Import」をクリック

3. **環境変数を設定**

   - 以下の環境変数を追加：
     - `NEXT_PUBLIC_SUPABASE_URL` = あなたの Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = あなたの Supabase Anon Key

4. **デプロイ実行**
   - 「Deploy」をクリック
   - 数分待つとデプロイ完了！

### ステップ 3: 共有

デプロイが完了すると、以下のような URL が表示されます：

```
https://your-app-name.vercel.app
```

この URL を他の人に送れば、スマホでも見ることができます！

## トラブルシューティング

### よくある問題

**Q: ビルドエラーが発生する**
A: ローカルで `npm run build` を実行してエラーを確認してください

**Q: カメラが動作しない**
A: HTTPS 環境（Vercel は自動で HTTPS）でアクセスしているか確認してください

**Q: 環境変数が設定できない**
A: Supabase の設定を確認し、正しい URL とキーを入力してください

## 追加のヒント

1. **QR コードで共有**

   - URL を QR コードに変換して印刷・共有
   - スマホのカメラで QR コードを読み取れば簡単アクセス

2. **カスタムドメイン**

   - Vercel でカスタムドメインを設定可能
   - 例：`https://omiyage-cart.com`

3. **モバイルアプリ化**
   - スマホのブラウザで「ホーム画面に追加」を選択
   - ネイティブアプリのように使用可能

## サポート

問題が発生した場合は：

1. エラーメッセージを確認
2. ローカルで `npm run build` を実行
3. 環境変数が正しく設定されているか確認
4. GitHub のリポジトリにコードが正しくアップロードされているか確認
