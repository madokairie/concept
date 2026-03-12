# セットアップガイド — ローンチコンセプト設計ツール

## 前提条件

- **Node.js 18以上**がインストールされていること
- **Anthropic APIキー**を持っていること（https://console.anthropic.com/ で取得）
- テキストエディタ（VS Code推奨）

---

## 1. 初期セットアップ

### 1.1 プロジェクトのコピー

このフォルダ（`app/`）を自分のPCの好きな場所にコピーしてください。

### 1.2 依存パッケージのインストール

```bash
cd app
npm install
```

### 1.3 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて自分のAPIキーを設定:

```
ANTHROPIC_API_KEY=sk-ant-api03-ここに自分のキーを貼る
```

### 1.4 起動確認

```bash
npm run dev
```

ブラウザで http://localhost:3900 を開く。
ダッシュボードが表示されればOK。

---

## 2. 自分用にカスタマイズ

### 2.1 デフォルトスタイルの変更（必須）

**ファイル: `src/lib/default-style.ts`**

ここに自分のコミュニケーションスタイルを定義します。
AIがチャットで使う口調やNGワードの基準になります。

```typescript
export const MADOKA_DEFAULT_STYLE = `## あなたのデフォルトスタイル

### 口調
- （自分の普段の話し方を書く）

### OK表現
- （使ってほしい言い回しを書く）

### NG表現（絶対に使わない）
- （使ってほしくない言い回しとその理由を書く）

### 立ち位置
- （AIにどういうスタンスで話してほしいか）

### 冒頭の入り方
- （投稿の冒頭パターン）

### 必ず入れる要素
- （コンテンツに必ず含めてほしい要素）
`;
```

**ポイント:**
- 自分が過去に書いたSNS投稿やメール文を読み返して、特徴的な言い回しを抽出する
- 「他の人がよく使うけど自分は絶対使わない表現」をNG表現に入れる
- 具体例（OK例・NG例）を入れるとAIの精度が上がる

### 2.2 システムプロンプトの名前変更（必須）

**ファイル: `src/lib/prompt.ts`**

ファイル内の「まどかさん」を自分の名前に一括置換:

```
まどかさん → ○○さん（自分の名前）
```

VS Codeの場合: `Ctrl+H`（Mac: `Cmd+H`）→「まどかさん」→「自分の名前」→ 全て置換

### 2.3 素材インポートの設定（任意）

**ファイル: `src/app/api/import-materials/route.ts`**

素材ファイルの自動読み込みを使う場合:

1. `BASE` 変数を自分の素材フォルダのパスに変更:
```typescript
const BASE = '/Users/自分のユーザー名/Documents/my-materials';
```

2. `FILES` 配列を自分のファイルに変更:
```typescript
const FILES = [
  '過去LP/LP_テキスト.md',
  'メール配信/キャンペーン1.txt',
  'セミナー/文字起こし.md',
  'お客さんの声/声まとめ.md',
];
```

**素材がない場合**: この設定は不要。ブラウザから手動でアップロードできます。

### 2.4 エクスポート変数名の変更（任意）

**ファイル: `src/lib/default-style.ts`**

変数名 `MADOKA_DEFAULT_STYLE` を変更する場合は、以下のファイルも合わせて変更:
- `src/app/page.tsx`（import文）

---

## 3. 使い方

### 3.1 基本フロー

1. **ダッシュボード**で「新規プロジェクト」をクリック
2. プロジェクト名を入力、種別を選択して「壁打ちを始める」
3. チャットでAIと壁打ち開始
   - 最初に「今回は○○講座のローンチで、目標は○○です」のように概要を伝える
   - AIが質問＋提案しながらPhaseを進める
4. サイドバーでPhaseの進捗を確認
5. 全Phaseが完了したら「コンセプトシート生成」→「PDF出力」

### 3.2 素材ライブラリ

ダッシュボードの「素材ライブラリ」から:
- 過去のLP文、LINE配信文、セミナー文字起こし等をアップロード
- AIがチャット中にこれらの素材を参照して具体的に提案してくれる
- 素材が多いほどAIの提案精度が上がる

### 3.3 コンセプトシートの品質を上げるコツ

- チャットで**具体的な数字**を出す（目標売上、CVR、リスト数等）
- **投稿テーマの具体案**まで深掘りする（「SNSで発信する」ではなく「Instagramでリール○○というテーマで週4投稿」レベル）
- **課題点・リスク**も出す（対策とセットで）
- AIに「もっと具体的に」「投稿タイトル案まで出して」と指示する

---

## 4. トラブルシューティング

| 症状 | 対処 |
|------|------|
| チャットが動かない | `.env.local` のAPIキーを確認 |
| ポート3900が使用中 | `lsof -i :3900` で確認、プロセスを停止 |
| PDF出力が動かない | ブラウザのポップアップブロックを解除 |
| 素材インポートが失敗 | `route.ts` の `BASE` パスが正しいか確認 |
| TypeScriptエラー | `npx tsc --noEmit` でエラー箇所を確認 |

---

## 5. ファイル構成

```
app/
├── .env.local              ← APIキー設定
├── package.json            ← 依存パッケージ
├── src/
│   ├── app/
│   │   ├── page.tsx              ← ダッシュボード
│   │   ├── layout.tsx            ← 共通レイアウト
│   │   ├── globals.css           ← Tailwind CSS
│   │   ├── api/
│   │   │   ├── chat/route.ts           ← AIチャットAPI
│   │   │   ├── generate-sheet/route.ts ← シート生成API
│   │   │   ├── fetch-url/route.ts      ← URL取得API
│   │   │   └── import-materials/route.ts ← 素材インポートAPI ★要カスタマイズ
│   │   ├── library/page.tsx      ← 素材ライブラリ
│   │   └── projects/
│   │       ├── new/page.tsx      ← 新規作成
│   │       └── [id]/page.tsx     ← メイン画面
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatArea.tsx      ← チャット表示
│   │   │   ├── ChatInput.tsx     ← 入力欄
│   │   │   └── ChatMessage.tsx   ← メッセージ
│   │   └── sidebar/
│   │       ├── Sidebar.tsx       ← サイドバー
│   │       ├── PhasePanel.tsx    ← Phase表示・編集
│   │       └── EvalScore.tsx     ← 評価スコア
│   └── lib/
│       ├── default-style.ts     ← デフォルトスタイル ★要カスタマイズ
│       ├── prompt.ts            ← AIプロンプト ★名前変更
│       ├── store.ts             ← データ保存
│       ├── types.ts             ← 型定義
│       └── labels.ts            ← 日本語ラベル
└── docs/
    ├── requirements.md          ← 要件定義書
    └── setup-guide.md           ← このファイル
```

★マークのファイルがカスタマイズ必須箇所です。
