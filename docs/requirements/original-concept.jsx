import { useState } from "react";

const phases = [
  {
    id: 0,
    label: "PHASE 0",
    title: "完成型ファースト",
    subtitle: "ゴール定義",
    color: "#C8A96E",
    description: "けんさんメソッドの核心。「何が達成されていれば合格か」を先に定義する。ゴールが曖昧なまま作業すると全てがブレる。",
    inputs: [
      { label: "今回のローンチで達成したいこと", type: "textarea", placeholder: "例：UTAGEコースの受講生を30名集め、売上300万を達成する" },
      { label: "販売する商品・価格帯", type: "text", placeholder: "例：UTAGEファネル構築講座 198,000円" },
      { label: "ローンチ期間・スケジュール感", type: "text", placeholder: "例：2ヶ月後にオープン、告知期間2週間" },
      { label: "今回のローンチの特徴・新しい点", type: "textarea", placeholder: "例：初めてセミナー動線を入れる、特典を刷新する" },
    ],
    ai_role: "入力内容をもとに「合格基準チェックリスト」と「必要な変数リスト」を自動生成。足りない情報があれば質問を返す。",
    output: "ゴール定義シート・必要変数リスト"
  },
  {
    id: 1,
    label: "PHASE 1-A",
    title: "3素材収集①",
    subtitle: "ターゲットインサイト",
    color: "#7B9E87",
    description: "「状況・感情・本音の言葉」の3層で洗い出す。汎用的にならないよう、実際のお客さんの声・ヒアリング記録を優先して入力する。",
    inputs: [
      { label: "状況：ターゲットは今どんな状況にいるか", type: "textarea", placeholder: "例：副業を探している。本業は美容師。SNS発信を始めたいが何から手をつければいいか分からない" },
      { label: "感情：何に悩み、何を感じているか", type: "textarea", placeholder: "例：このまま時間を切り売りし続けていいのか不安。でも自分には特別なスキルがないと思っている" },
      { label: "本音の言葉：実際にどんな言葉を使っているか", type: "textarea", placeholder: "例：「私にはセンスがない」「もう少し自信がついたら」「ツールが難しそう」（受講生の声・DMの言葉そのまま）" },
      { label: "買わない理由・反論（実際に言われたこと）", type: "textarea", placeholder: "例：「まだ準備ができていない」「高い」「自分には早い気がする」" },
      { label: "その手段に取り組まない本当の気持ち（深層）", type: "textarea", placeholder: "例：失敗して恥をかくのが怖い。家族に反対されている。自分だけ変わることへの罪悪感" },
    ],
    ai_role: "入力内容からターゲットが「口には出さないが心で思っていること」を補完。「得たい欲求」と「避けたい欲求」を整理して出力。",
    output: "ターゲットインサイトシート（得たい欲求・避けたい欲求・本音の言葉集）"
  },
  {
    id: 2,
    label: "PHASE 1-B",
    title: "3素材収集②",
    subtitle: "パーソナル情報",
    color: "#9B8BB4",
    description: "演者の経歴・価値観・活動内容。自分が演者の場合は既存のセミナー文字起こしを貼るだけでAIが分析・整理する。",
    inputs: [
      { label: "経歴・バックグラウンド", type: "textarea", placeholder: "例：美容師歴26年、マーケティング講師として1000名以上を指導、UTAGE本を出版しAmazonランキング1位" },
      { label: "強み・得意なこと", type: "textarea", placeholder: "例：初心者にも分かりやすく説明できる、仕組み化・自動化の設計が得意" },
      { label: "価値観・こだわり（譲れないもの）", type: "textarea", placeholder: "例：受講生が自立できることを最優先、押し売りしない、本物の実力をつけてほしい" },
      { label: "実績・数字（使っていいもの）", type: "textarea", placeholder: "例：1000名以上の受講生、2ヶ月で1億円規模のローンチをサポート" },
      { label: "セミナー文字起こし・過去の発信（貼り付け可）", type: "textarea", placeholder: "文字起こしテキストをそのまま貼ってください。AIがパーソナル情報を自動抽出します。" },
    ],
    ai_role: "文字起こしを読み込んでパーソナル情報を自動抽出。「この人だから信頼できる理由」をストーリー形式で整理。",
    output: "パーソナリティシート（権威性・共感ポイント・ストーリーライン）"
  },
  {
    id: 3,
    label: "PHASE 1-C",
    title: "3素材収集③",
    subtitle: "スタイルシート",
    color: "#C47A5A",
    description: "けんさんが「最重要」と言った素材。やらないことを先に定義する。理由まで書くことでAIが類似状況でも正しく判断できる。",
    inputs: [
      { label: "使わない言葉・フレーズ（NG表現）", type: "textarea", placeholder: "例：「これが全て」「ここに気づけた人から変わる」「正直〇〇万稼ぎました」のような断言調コピーライター表現" },
      { label: "なぜNGなのか（理由を書く）", type: "textarea", placeholder: "例：ターゲット層は押しつけに警戒感を持つ。実績の繰り返しは嫌味に見える。読者が「自分には関係ない」と感じてしまう" },
      { label: "使いたい口調・言い回し", type: "textarea", placeholder: "例：〜ですよね、〜だと思ってます、〜してみてくださいね。正直に言うと、面白い話があって、という自然な入り" },
      { label: "目線設定（誰に向けて話しているか）", type: "textarea", placeholder: "例：プロモーターという言葉を知らない人。副業を探し始めたばかりの人。UTAGEに興味を持ち始めた段階の人" },
      { label: "台本なしで話している動画URL or 文字起こし", type: "textarea", placeholder: "自然体の話し方が分かる動画・音声・文字起こしをここに貼るとAIが口調を自動学習します" },
    ],
    ai_role: "入力内容からスタイルガイドを生成。「この表現はOK/NG」を判定できるルールセットを作成。以降の全フェーズでこのスタイルを適用。",
    output: "スタイルシート（NG表現一覧・OK表現一覧・口調ガイドライン）"
  },
  {
    id: 4,
    label: "PHASE 2",
    title: "コンセプト設計",
    subtitle: "誰の何を・なぜ今",
    color: "#5B8FA8",
    description: "3素材が揃ったらコンセプトを設計する。AIがターゲットインサイトとパーソナル情報を掛け合わせて候補を複数提案。人間が選んで磨く。",
    inputs: [
      { label: "この商品でなければいけない理由（競合との差別化）", type: "textarea", placeholder: "例：UTAGEの構築だけでなく、プロモーターとして稼ぐまでの設計ができる唯一の講座" },
      { label: "今このタイミングで売る理由", type: "textarea", placeholder: "例：UTAGEのシェアが急拡大している今が市場的に最もチャンス" },
      { label: "この商品を買わないことで失うもの", type: "textarea", placeholder: "例：また1年間、収入が増えない状態を続けることになる" },
    ],
    ai_role: "コンセプト候補を5案生成（人間が選ぶ）→選んだ案をもとに「認知の上書きフレーム」「メインコピー」「サブコピー」を作成。MECE分解で解決策を整理。",
    output: "コンセプトシート（メインメッセージ・認知上書きフレーム・解決策MECE）"
  },
  {
    id: 5,
    label: "PHASE 3",
    title: "ファネル・同線設計",
    subtitle: "コア設計",
    color: "#8B7355",
    description: "コアが固まれば枝葉は自動生成できる。ここでセミナーテーマ・教育の流れ・オファーの核心を決め切る。",
    inputs: [
      { label: "集客の起点（どこから来てもらうか）", type: "text", placeholder: "例：YouTubeフロント動画 → LINE登録 → セミナー → 個別相談" },
      { label: "教育フェーズで伝えたい順番（3〜5ステップ）", type: "textarea", placeholder: "例：①プロモーターという仕事を知る → ②UTAGEの仕組みを理解する → ③収益化のイメージを持つ → ④この講座でどう実現するか" },
      { label: "オファーの核心（何があれば買う決断ができるか）", type: "textarea", placeholder: "例：構築だけでなくローンチの設計まで学べること、受講後すぐに案件が取れるよう営業テンプレートがあること" },
      { label: "クロージングの方法", type: "text", placeholder: "例：個別相談、審査フォーム、先着〇名" },
    ],
    ai_role: "同線全体の設計図を生成。各タッチポイントで「ユーザーの状態変化」を明示したファネルマップを出力。",
    output: "ファネル設計図（タッチポイント別ユーザー状態変化マップ）"
  },
  {
    id: 6,
    label: "PHASE 4",
    title: "タスク・スケジュール出力",
    subtitle: "枝葉の量産準備",
    color: "#6B8E6B",
    description: "コアが固まったら枝葉を全てAIで一括生成する。LINE配信文・募集LP・告知投稿・セミナー台本のたたき台まで出力。",
    inputs: [
      { label: "ローンチ開始日（逆算の起点）", type: "text", placeholder: "例：2024年6月1日オープン" },
      { label: "チーム構成（誰が何を担当するか）", type: "textarea", placeholder: "例：まどか（最終確認・動画撮影）、スタッフA（LINE配信・投稿）" },
      { label: "過去のローンチで漏れていたタスク", type: "textarea", placeholder: "例：審査フォームの作成が遅れた、告知画像の準備が間に合わなかった" },
    ],
    ai_role: "全タスクをガントチャート形式で生成。担当者・期限・依存関係を含むスケジュール表を出力（スプレッドシート貼り付け対応形式）。コンテンツ量産の骨組みも同時生成。",
    output: "タスクリスト・ガントチャート・コンテンツ骨組み（LINE配信30通分の構成案等）"
  }
];

const evalLoop = {
  title: "評価ループ（全フェーズ共通）",
  description: "けんさんが「プロンプトを複雑化するより圧倒的に効果的」と言った仕組み。各フェーズの出力に対してAIが自分で批判的評価を行い、修正する。",
  axes: [
    "ターゲットの本音の言葉と一致しているか",
    "スタイルシートのNG表現が使われていないか",
    "一般論になっていないか（上位10%の視点があるか）",
    "AI臭さが残っていないか（場面・行動・セリフ・感情の4要素があるか）",
    "コンセプトと一貫しているか",
    "読んだ人が次のステップに進みたくなるか"
  ]
};

const outputs = [
  { icon: "📋", title: "ゴール定義シート", desc: "合格基準・必要変数リスト" },
  { icon: "🎯", title: "ターゲットインサイトシート", desc: "得たい欲求・避けたい欲求・本音の言葉" },
  { icon: "👤", title: "パーソナリティシート", desc: "権威性・ストーリーライン" },
  { icon: "📝", title: "スタイルシート", desc: "NG表現一覧・口調ガイドライン" },
  { icon: "💡", title: "コンセプトシート", desc: "メインメッセージ・認知上書きフレーム" },
  { icon: "🗺️", title: "ファネル設計図", desc: "タッチポイント別ユーザー状態変化" },
  { icon: "📅", title: "タスク・スケジュール表", desc: "ガントチャート・コンテンツ骨組み" },
];

export default function App() {
  const [activePhase, setActivePhase] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0D0D0D",
      color: "#E8E0D5",
      fontFamily: "'Georgia', 'Noto Serif JP', serif",
      padding: "40px 20px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            fontSize: 11,
            letterSpacing: 6,
            color: "#C8A96E",
            marginBottom: 16,
            textTransform: "uppercase"
          }}>
            Launch Concept Design Tool
          </div>
          <h1 style={{
            fontSize: 32,
            fontWeight: "normal",
            margin: "0 0 12px",
            lineHeight: 1.4,
            color: "#F0EAE0"
          }}>
            ローンチコンセプト設計ツール
          </h1>
          <p style={{ color: "#8A8070", fontSize: 14, margin: "0 0 8px" }}>
            けんさんメソッド準拠｜完成型ファースト × 3素材収集 × 評価ループ
          </p>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #1A1A1A, #2A2520, #1A1A1A)",
            border: "1px solid #3A3530",
            borderRadius: 4,
            padding: "8px 20px",
            fontSize: 12,
            color: "#A09080",
            marginTop: 8
          }}>
            要件定義 v1.0 ｜ 2025年3月
          </div>
        </div>

        {/* Philosophy */}
        <div style={{
          background: "linear-gradient(135deg, #1C1A18, #201E1A)",
          border: "1px solid #3A3020",
          borderLeft: "3px solid #C8A96E",
          borderRadius: 8,
          padding: "24px 28px",
          marginBottom: 48
        }}>
          <div style={{ fontSize: 11, color: "#C8A96E", letterSpacing: 4, marginBottom: 12 }}>CORE PHILOSOPHY</div>
          <p style={{ margin: 0, lineHeight: 1.9, color: "#C8BFB0", fontSize: 15 }}>
            「何が達成されていれば合格なのか」を先に定義してから投げる。<br />
            合格ラインを定義 → 必要な変数をAI自身に洗い出させる → 全部埋めてから投げる → 出力精度が大幅向上。<br />
            <span style={{ color: "#8A8070", fontSize: 13 }}>— けんさん（第7回おさるマーケ合宿）</span>
          </p>
        </div>

        {/* Flow Overview */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#8A8070", letterSpacing: 4, marginBottom: 20 }}>FLOW OVERVIEW</div>
          <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
            {phases.map((phase, i) => (
              <div key={phase.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <button
                  onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                  style={{
                    background: activePhase === phase.id ? phase.color : "#1A1A1A",
                    border: `1px solid ${phase.color}`,
                    borderRadius: 6,
                    padding: "10px 14px",
                    cursor: "pointer",
                    color: activePhase === phase.id ? "#0D0D0D" : phase.color,
                    fontSize: 11,
                    fontFamily: "inherit",
                    textAlign: "center",
                    minWidth: 90,
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: 4 }}>{phase.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{phase.subtitle}</div>
                </button>
                {i < phases.length - 1 && (
                  <div style={{ color: "#3A3530", padding: "0 4px", fontSize: 18 }}>→</div>
                )}
              </div>
            ))}
          </div>
          <p style={{ color: "#6A6058", fontSize: 12, marginTop: 12 }}>
            ※ 各フェーズをクリックすると詳細が展開されます
          </p>
        </div>

        {/* Phase Details */}
        {phases.map((phase) => (
          <div key={phase.id} style={{
            marginBottom: 24,
            overflow: "hidden",
            transition: "all 0.3s",
            display: activePhase === phase.id ? "block" : "none"
          }}>
            <div style={{
              background: "#161412",
              border: `1px solid ${phase.color}40`,
              borderTop: `3px solid ${phase.color}`,
              borderRadius: 8,
              padding: 28
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: phase.color, letterSpacing: 3 }}>{phase.label}</span>
                  <h2 style={{ margin: "6px 0 4px", fontSize: 22, fontWeight: "normal", color: "#F0EAE0" }}>
                    {phase.title}
                  </h2>
                  <p style={{ margin: 0, color: "#8A8070", fontSize: 13 }}>{phase.subtitle}</p>
                </div>
                <div style={{
                  background: `${phase.color}15`,
                  border: `1px solid ${phase.color}40`,
                  borderRadius: 4,
                  padding: "6px 14px",
                  fontSize: 11,
                  color: phase.color
                }}>
                  出力：{phase.output}
                </div>
              </div>

              <p style={{ color: "#A09080", fontSize: 14, lineHeight: 1.8, marginBottom: 28 }}>
                {phase.description}
              </p>

              {/* Input Fields */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, color: "#6A6058", letterSpacing: 3, marginBottom: 16 }}>INPUT ITEMS（収集する情報）</div>
                {phase.inputs.map((input, i) => (
                  <div key={i} style={{
                    marginBottom: 20,
                    borderLeft: `2px solid ${phase.color}30`,
                    paddingLeft: 16
                  }}>
                    <div style={{ fontSize: 13, color: "#C8BFB0", marginBottom: 8 }}>
                      <span style={{ color: phase.color, marginRight: 8 }}>▸</span>
                      {input.label}
                    </div>
                    <div style={{
                      background: "#0D0D0D",
                      border: "1px solid #2A2520",
                      borderRadius: 4,
                      padding: "10px 14px",
                      fontSize: 12,
                      color: "#5A5248",
                      lineHeight: 1.7,
                      fontStyle: "italic"
                    }}>
                      {input.placeholder}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Role */}
              <div style={{
                background: "#0D0F0D",
                border: "1px solid #1E3020",
                borderRadius: 6,
                padding: "16px 20px"
              }}>
                <div style={{ fontSize: 11, color: "#7B9E87", letterSpacing: 3, marginBottom: 10 }}>AI ROLE（このフェーズでAIが行う処理）</div>
                <p style={{ margin: 0, color: "#8AAA90", fontSize: 13, lineHeight: 1.8 }}>
                  {phase.ai_role}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* All Phases List */}
        {activePhase === null && (
          <div style={{ marginBottom: 48 }}>
            {phases.map((phase) => (
              <div
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 20px",
                  marginBottom: 8,
                  background: "#161412",
                  border: "1px solid #2A2520",
                  borderLeft: `3px solid ${phase.color}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#1E1C18"}
                onMouseLeave={e => e.currentTarget.style.background = "#161412"}
              >
                <div style={{ minWidth: 80 }}>
                  <div style={{ fontSize: 10, color: phase.color, letterSpacing: 2 }}>{phase.label}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#E0D8C8", marginBottom: 2 }}>{phase.title}</div>
                  <div style={{ fontSize: 12, color: "#6A6058" }}>{phase.subtitle}</div>
                </div>
                <div style={{ fontSize: 11, color: "#4A4840", fontStyle: "italic" }}>
                  {phase.inputs.length}項目
                </div>
                <div style={{ color: "#4A4840", fontSize: 16 }}>›</div>
              </div>
            ))}
          </div>
        )}

        {/* Evaluation Loop */}
        <div style={{
          background: "#0F0F14",
          border: "1px solid #252535",
          borderTop: "3px solid #7B7BA8",
          borderRadius: 8,
          padding: 28,
          marginBottom: 48
        }}>
          <div style={{ fontSize: 11, color: "#7B7BA8", letterSpacing: 4, marginBottom: 12 }}>EVALUATION LOOP</div>
          <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: "normal", color: "#E0E0F0" }}>
            {evalLoop.title}
          </h3>
          <p style={{ color: "#8A8090", fontSize: 13, lineHeight: 1.8, marginBottom: 20 }}>
            {evalLoop.description}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {evalLoop.axes.map((axis, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 10,
                padding: "10px 14px",
                background: "#161618",
                border: "1px solid #252535",
                borderRadius: 4,
                fontSize: 12,
                color: "#A0A0C0",
                lineHeight: 1.6
              }}>
                <span style={{ color: "#7B7BA8", flexShrink: 0 }}>0{i+1}</span>
                {axis}
              </div>
            ))}
          </div>
        </div>

        {/* Final Outputs */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "#8A8070", letterSpacing: 4, marginBottom: 20 }}>FINAL OUTPUTS（最終的に揃う資料）</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {outputs.map((out, i) => (
              <div key={i} style={{
                padding: "16px 20px",
                background: "#161412",
                border: "1px solid #2A2520",
                borderRadius: 6,
                display: "flex",
                gap: 14,
                alignItems: "flex-start"
              }}>
                <span style={{ fontSize: 22 }}>{out.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: "#E0D8C8", marginBottom: 4 }}>{out.title}</div>
                  <div style={{ fontSize: 11, color: "#6A6058" }}>{out.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{
          background: "#161412",
          border: "1px solid #2A2520",
          borderRadius: 8,
          padding: 28,
          marginBottom: 40
        }}>
          <div style={{ fontSize: 11, color: "#8A8070", letterSpacing: 4, marginBottom: 20 }}>TECH STACK（実装案）</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "フロントエンド", value: "Next.js + Tailwind", note: "既存スタックに合わせる" },
              { label: "AIエンジン", value: "Claude API (Sonnet)", note: "anthropic_api_in_artifactsで実装可" },
              { label: "セッション管理", value: "Supabase", note: "既存スタック活用" },
              { label: "出力形式", value: "PDF + スプレッドシート", note: "ダウンロード対応" },
              { label: "スタイル学習", value: "システムプロンプト注入", note: "スタイルシートをPhase1-Cで収集し以降全フェーズに適用" },
              { label: "ゴールシーク", value: "質問ループ実装", note: "足りない情報を自動検出して質問返し" },
            ].map((item, i) => (
              <div key={i} style={{ borderLeft: "1px solid #3A3020", paddingLeft: 14 }}>
                <div style={{ fontSize: 11, color: "#6A6058", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: "#C8BFB0", marginBottom: 2 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: "#4A4840", fontStyle: "italic" }}>{item.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div style={{
          background: "linear-gradient(135deg, #1A1510, #201810)",
          border: "1px solid #C8A96E40",
          borderRadius: 8,
          padding: 28,
          textAlign: "center"
        }}>
          <div style={{ fontSize: 11, color: "#C8A96E", letterSpacing: 4, marginBottom: 12 }}>NEXT STEPS</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              "① この要件定義のレビュー・修正",
              "② まどかのナレッジ素材の収集",
              "③ プロトタイプ（Artifact）の作成",
              "④ 実際のローンチで試運転"
            ].map((step, i) => (
              <div key={i} style={{
                background: "#1A1510",
                border: "1px solid #3A3020",
                borderRadius: 4,
                padding: "8px 16px",
                fontSize: 12,
                color: "#A09070"
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 40, color: "#3A3530", fontSize: 12 }}>
          要件定義 v1.0 ｜ けんさんメソッド準拠 ｜ まどか専用ローンチコンセプト設計ツール
        </div>
      </div>
    </div>
  );
}
