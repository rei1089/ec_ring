# Windows PowerShell用デプロイスクリプト

Write-Host "🚀 デプロイを開始します..." -ForegroundColor Green

# 1. 依存関係のインストール確認
Write-Host "📦 依存関係を確認中..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "依存関係をインストール中..." -ForegroundColor Yellow
    npm install
}

# 2. ビルドテスト
Write-Host "🔨 ビルドテストを実行中..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ビルドに失敗しました。エラーを確認してください。" -ForegroundColor Red
    exit 1
}

Write-Host "✅ ビルドが成功しました！" -ForegroundColor Green

# 3. Vercel CLIの確認
Write-Host "🔍 Vercel CLIを確認中..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "Vercel CLIが見つかりました: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "Vercel CLIがインストールされていません。" -ForegroundColor Yellow
    Write-Host "以下のコマンドでインストールしてください:" -ForegroundColor Cyan
    Write-Host "npm install -g vercel" -ForegroundColor White
    exit 1
}

# 4. デプロイ実行
Write-Host "🚀 Vercelにデプロイ中..." -ForegroundColor Yellow
Write-Host "ブラウザが開くので、指示に従ってデプロイを完了してください。" -ForegroundColor Cyan

vercel --prod

Write-Host "🎉 デプロイが完了しました！" -ForegroundColor Green
Write-Host "提供されたURLを他の人と共有できます。" -ForegroundColor Cyan
