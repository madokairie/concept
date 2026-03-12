import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SHEET_SYSTEM_PROMPT = `あなたはローンチコンセプト設計の専門家です。
チャット履歴とプロジェクトデータから、プロフェッショナルなコンセプトシートのHTML本文を生成してください。

## 出力ルール

1. **完全に日本語**で出力。英語のキー名は絶対に使わない
2. 以下のHTMLクラスを使って構造化する:
   - \`.kv-grid\` + \`.k\` / \`.v\` — キーバリューグリッド（目標売上、商品概要など）
   - \`.card\` + \`.card-title\` — カード（ペルソナ、媒体別戦略など）
   - \`.two-col\` — 2カラムレイアウト（OK/NG表現、実績比較など）
   - \`.tag\` — タグピル（感情キーワード、世界観キーワードなど）
   - \`<table>\` — テーブル（スケジュール、Before/After、投稿タイミングなど）
   - \`<h2>\` — Phase見出し（例: Phase 0: ゴール定義（完了））
   - \`<h3>\` — セクション見出し
   - \`<hr>\` — Phase間の区切り線
3. メインコピーは大きく目立つスタイルで:
   \`<p style="font-size:18px;font-weight:600;color:#1a1a1a;margin:12px 0;padding:16px;background:#faf8f4;border-left:4px solid #C8A96E;border-radius:0 4px 4px 0;">コピーテキスト</p>\`
4. 課題・リスクは赤ボーダーのカードで:
   \`<div class="card" style="border-left:3px solid #c47a5a;border-color:#c47a5a;">\`
5. 発信戦略は媒体ごとにカードを分け、投稿テーマを具体的に書く（タイトル案まで）
6. リール・投稿の構成案がある場合は背景色付きで:
   \`<div style="background:#f5f0e8;border-radius:4px;padding:10px;margin:6px 0;font-size:12px;">構成案: ...</div>\`

## Phase構成

各Phaseを以下の順に出力:

### Phase 0: ゴール定義
- 売上目標（kv-grid）
- 商品概要（kv-grid）
- スケジュール（table）
- 過去データ・実績（kv-grid）

### Phase 1-A: ターゲットインサイト
- ペルソナ（card）
- 深い悩み TOP3（ul + strong）
- 感情トリガーワード（tag）
- 入り口キーワード（ul）
- 買わない理由（ul）

### Phase 1-B: パーソナル情報
- プロフィール（kv-grid）
- 代表的な成果（two-col + card）
- 差別化要因（ul）

### Phase 1-C: スタイルシート
- OK表現 / NG表現（two-col）
- 世界観キーワード（tag）

### Phase 2: コンセプト設計
- メインコピー（大きく表示）
- サブコピー
- コンセプト方向性
- 認知の上書きフレーム（Before/After table）
- 課題点・リスク（赤ボーダーcard）
- 発信戦略（媒体別card - 具体的な投稿テーマ案付き）
- 発信スケジュール（table）
- 媒体別投稿タイミング（table）
- KPI設定（ul）

## 重要
- チャット履歴で議論された**具体的な内容**をすべて含める
- 抽象的なまとめではなく、具体的なコピー案、テーマ案、数字、エピソードを入れる
- 議論されていないPhaseは「未着手」として簡潔に記載
- HTMLタグのみ出力（\`<html>\`や\`<head>\`は不要、bodyの中身だけ）
- CSSクラスは上記で定義したもののみ使う（自分でstyleタグを書かない）`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY が設定されていません' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, project } = await req.json();

    // Build context from chat history and project data
    const phaseContext = Object.entries(project.phases || {}).map(([key, phase]: [string, any]) => {
      const status = phase.status === 'completed' ? '完了' : phase.status === 'in_progress' ? '進行中' : '未着手';
      const dataStr = Object.keys(phase.data || {}).length > 0
        ? JSON.stringify(phase.data, null, 2)
        : '（データなし）';
      const output = phase.output || '';
      return `### ${key} (${status})\nデータ: ${dataStr}\n出力: ${output}`;
    }).join('\n\n');

    const userPrompt = `以下のチャット履歴とプロジェクトデータから、プロフェッショナルなコンセプトシートのHTML本文を生成してください。

## プロジェクト情報
- 名前: ${project.name}
- タイプ: ${project.type === 'self' ? '自分のローンチ' : `クライアント: ${project.clientName || ''}`}

## Phase データ
${phaseContext}

## チャット履歴（壁打ちの全内容）
${messages.map((m: any) => `【${m.role === 'user' ? 'ユーザー' : 'AI'}】${m.content}`).join('\n\n')}

上記の壁打ち内容をすべて反映した、プロフェッショナルなコンセプトシートHTML本文を生成してください。`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SHEET_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return new Response(JSON.stringify({ html: content.text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate sheet error:', error);
    return new Response(JSON.stringify({ error: 'コンセプトシート生成に失敗しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
