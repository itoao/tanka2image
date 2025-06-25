# tanka2image
🌟 アプリの概要
短歌を入力し、縦長の画像に自動変換・エクスポートできるアプリ。SNS（特にX）でOGP付きでシェア可能。

📝 主要機能要件
1️⃣ 短歌入力
テキストボックスで短歌（31文字程度）を入力できる。

入力中に文字数カウントを表示。

改行位置をユーザーが調整可能（句切れの位置で改行できるなど）。

2️⃣ 縦長画像生成
短歌を縦書き・横書き選択可能（デフォルトは縦書き）。

縦長の画像サイズは標準で Xシェアに最適な比率（例: 1200x1600）。

フォント選択（明朝体／ゴシック体など）。

背景色・文字色のカスタマイズ（プリセットとカスタムカラー）。

簡易プレビュー表示。

3️⃣ 画像エクスポート
PNG または JPEG で画像を生成・ダウンロード。

画像に日付・作者名の署名（オプションでオン/オフ可能）。

4️⃣ OGP付きシェア機能
シェア用URLを生成（短歌画像のOGPメタタグ含むページを出力）。

Xシェアボタンで直接シェア可能。

OGP画像には生成した短歌画像を使う。

⚙️ 非機能要件
モバイルファーストデザイン。

軽量で高速に動作。

ブラウザのみで完結（可能ならPWA対応）。

日本語フォントのライセンスに注意。

📂 技術スタック候補
- pnpm
フロントエンド: Next.js / Nuxt.js / React / Vue など

画像生成: HTML to Canvas (html2canvas) / SVG / canvas API

OGP対応: 動的ページ生成（Vercel の Edge Functions、Supabase Edge Functions 等）

ホスティング: Vercel / Netlify / Firebase Hosting / Supabase

orm:prisma
💡 追加検討項目
ログインなしの簡易利用／アカウント登録で作品管理。

短歌の保存・履歴表示。

人気短歌ランキング／ギャラリー機能。

# プロジェクト設定

## カスタムコマンド利用時の注意

The first statement you make is “I'll wait for your input. what task
would you like me to help you with?”

## 自動コミット

あなたがファイルを変更するたびにgit commitを行ってください

- コミットメッセージフォーマット:
  ```
  feat: <あなたが生成するタイトル>

  Session-ID: abc123
  Prompt: "ユーザープロンプト …"
  Time: 2025-06-20T17:12:52+09:00
  ```

## 通知

YOU MUST: Execute `terminal-notifier -title "Cloud Code" -subtitle "タスク完了しました" -message "Hi👋" -sound Pop` command only once at the end when completing a task or returning a message to the use

## 基本方針

- ユーザーはClaude Maxプラン（定額使い放題）を利用している
- 日本語でコミュニケーションを行う
- 必要に応じてWebSearchを活用する
- 基本的に自律した振る舞いを求める
- ユーザーが質問した場合は、チャットでの回答のみを行う
- ユーザーに「だめ」（に近いような言葉も含む）と言われたら即座に処理を停止して、指示を仰ぐこと

## 実装注意事項

### 必須チェック

実装完了前に必ずTypeScriptコンパイルチェックを実行すること：

```bash
deno check
```

### よくあるミス

- 型エラーを見逃したまま「実装完了」と報告してしまう

### 実装完了の判定基準

1. TypeScriptコンパイルエラーゼロ
2. 期待する機能が動作する
3. 上記の両方を確認してから初めて「完了」と報告する
