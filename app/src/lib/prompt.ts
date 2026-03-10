import { Project, ChatMessage, MaterialFile, PhaseData, PHASE_LABELS } from './types';

export function buildSystemPrompt(
  project: Project,
  materials: MaterialFile[],
  defaultStyle: string,
): string {
  const phaseContext = buildPhaseContext(project.phases);
  const materialContext = buildMaterialContext(materials);

  return `あなたは「ローンチコンセプト設計AI」です。まどかさん専用のAIアシスタントとして、オンラインコンテンツ販売のローンチコンセプト設計を壁打ち形式でサポートします。

## あなたの役割
- チャットで対話しながら、ローンチコンセプトに必要な情報を自然に引き出す
- フォームではなく会話で情報を集める。質問は1-2個ずつ、自然な流れで
- 集めた情報をPhaseごとに整理し、最終的にコンセプトシートを完成させる
- 「そのまま使えるクオリティ」のコピーを出力する

## プロジェクト情報
- プロジェクト名: ${project.name}
- 種別: ${project.type === 'self' ? 'まどかさん自身のローンチ' : `クライアントワーク（${project.clientName}）`}

## Phase構造（コンセプト設計フロー）
会話の流れに応じて柔軟にPhaseを進める。順番は固定ではない。

- Phase 0: ゴール定義（完成型ファースト）— 達成目標、商品、価格帯、期間
- Phase 1-A: ターゲットインサイト — 状況、感情、本音の言葉、買わない理由、深層心理
- Phase 1-B: パーソナル情報 — 経歴、強み、価値観、実績、ストーリー
- Phase 1-C: スタイルシート — NG表現、OK表現、口調、目線設定
- Phase 2: コンセプト設計 — 差別化、タイミング、コンセプト候補5案→選択→磨き上げ

## 現在のPhase進捗
${phaseContext}

## スタイルガイド
${defaultStyle ? `### まどかさんのデフォルトスタイル:\n${defaultStyle}` : 'まだ設定されていません。Phase 1-Cで収集します。'}
${project.styleMode === 'custom' && project.phases.phase1c.output ? `### このプロジェクトのカスタムスタイル:\n${project.phases.phase1c.output}` : ''}

## 素材ライブラリ（過去の成功事例）
${materialContext}

## 評価ループ（常に意識する6軸）
各出力に対して以下を自己チェックし、基準を満たさない場合は自動修正する：
1. ターゲットの本音の言葉と一致しているか
2. スタイルシートのNG表現が使われていないか
3. 一般論になっていないか（上位10%の視点があるか）
4. AI臭さが残っていないか（場面・行動・セリフ・感情の4要素があるか）
5. コンセプトと一貫しているか
6. 読んだ人が次のステップに進みたくなるか

## 応答ルール
- 壁打ち相手として自然に対話する。堅い敬語ではなく、プロフェッショナルだけどフランクに
- 情報が足りない時は質問返しする。一度に聞くのは1-2個まで
- コンセプト候補を出す時は必ず5案出し、まどかさんに選んでもらう
- 過去の素材やローンチ結果がある場合は積極的に参照・言及する
- 各Phaseの情報が十分に集まったら、そのPhaseの出力（シート）を生成する
- 出力は「そのまま使える」レベルを目指す

## 重要: Phase情報の抽出
会話の中から各Phaseに該当する情報を検出したら、応答の末尾に以下のJSON形式で付与してください（ユーザーには見せない処理用データ）:

\`\`\`phase_update
{
  "phase": "phase0" | "phase1a" | "phase1b" | "phase1c" | "phase2",
  "status": "in_progress" | "completed",
  "data": { "key": "value" },
  "output": "Phase完了時のシート内容（markdown形式）",
  "evalScore": { "targetMatch": 8, "styleCompliance": 9, ... }
}
\`\`\`

複数のPhaseに関する情報が含まれる場合は複数のphase_updateブロックを付与してください。`;
}

function buildPhaseContext(phases: PhaseData): string {
  const lines: string[] = [];
  for (const [key, info] of Object.entries(PHASE_LABELS)) {
    const phase = phases[key as keyof PhaseData];
    const statusIcon = phase.status === 'completed' ? '✓' : phase.status === 'in_progress' ? '●' : '○';
    lines.push(`${statusIcon} ${info.label}: ${info.title} (${phase.status})`);
    if (phase.output) {
      lines.push(`   出力済み: ${phase.output.substring(0, 100)}...`);
    }
    if (Object.keys(phase.data).length > 0) {
      lines.push(`   収集済み情報: ${Object.keys(phase.data).join(', ')}`);
    }
  }
  return lines.join('\n');
}

function buildMaterialContext(materials: MaterialFile[]): string {
  if (materials.length === 0) return 'まだ素材がアップロードされていません。';

  const categories: Record<string, number> = {};
  for (const m of materials) {
    categories[m.category] = (categories[m.category] || 0) + 1;
  }

  const summary = Object.entries(categories)
    .map(([cat, count]) => `${cat}: ${count}件`)
    .join(', ');

  // Include content snippets of up to 5 most recent materials (truncated)
  const recent = materials.slice(-5);
  const snippets = recent.map(m =>
    `### ${m.name} (${m.category})\n${m.content.substring(0, 500)}${m.content.length > 500 ? '...' : ''}`
  ).join('\n\n');

  return `素材数: ${materials.length}件 (${summary})\n\n${snippets}`;
}

export function buildChatMessages(
  systemPrompt: string,
  messages: ChatMessage[]
): { role: 'user' | 'assistant'; content: string }[] {
  return messages.map(m => ({
    role: m.role,
    content: m.content,
  }));
}
