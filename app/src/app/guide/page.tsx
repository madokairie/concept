'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function GuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          戻る
        </button>

        <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-2 uppercase">User Guide</div>
        <h1 className="text-xl font-normal mb-8">使い方ガイド</h1>

        {/* 全体の流れ */}
        <Section title="全体の流れ">
          <StepList steps={[
            { num: '1', title: 'プロジェクト作成', desc: 'ダッシュボードの「新規プロジェクト」からプロジェクトを作成します。自分のローンチかクライアントワークかを選択。' },
            { num: '2', title: 'AIと壁打ち', desc: 'チャットでAIと対話しながらコンセプトを設計します。AIが質問＋提案しながら進めるので、まず「今回のローンチの概要」を伝えてください。' },
            { num: '3', title: 'コンセプトシート出力', desc: '壁打ちが完了したら、サイドバーの「コンセプトシート生成」→「PDF出力」で提案書レベルのPDFが出力されます。' },
            { num: '4', title: '結果記録', desc: 'ローンチ後にリスト数・申込数・売上を記録。CVRは自動計算。次回のローンチ設計に活かせます。' },
          ]} />
        </Section>

        {/* Phase構造 */}
        <Section title="Phase構造（コンセプト設計フロー）">
          <p className="text-sm text-[#A09080] mb-4">
            5つのPhaseでコンセプトを完成させます。AIが会話をリードするので、順番を意識する必要はありません。
          </p>
          <PhaseCard
            label="PHASE 0"
            title="ゴール定義"
            color="#C8A96E"
            items={['売上目標・申込数の具体的数値', '商品名・提供形態・価格', 'ローンチスケジュール（セミナー日・販売期間・締切）', '申込導線・稼働限界', '過去のローンチデータ']}
          />
          <PhaseCard
            label="PHASE 1-A"
            title="ターゲットインサイト"
            color="#7B9E87"
            items={['理想顧客像（ペルソナ）', '深い悩みTOP3', '感情トリガーワード', '入り口キーワード（SNSで刺さる言葉）', '買わない理由・反論']}
          />
          <PhaseCard
            label="PHASE 1-B"
            title="パーソナル情報"
            color="#9B8BB4"
            items={['講師プロフィール・経歴', 'SNSフォロワー数', '成功事例・実績', '差別化要因', '※自分のローンチの場合は素材から自動生成']}
          />
          <PhaseCard
            label="PHASE 1-C"
            title="スタイルシート"
            color="#C47A5A"
            items={['出したい雰囲気・トーン', 'OK表現 / NG表現', '世界観キーワード', '※自分のローンチの場合はデフォルトスタイル自動適用']}
          />
          <PhaseCard
            label="PHASE 2"
            title="コンセプト設計"
            color="#5B8FA8"
            items={['コンセプト候補5案 → 選択', 'メインコピー・サブコピー', '認知の上書きフレーム（Before/After）', '課題点・リスクと対策', '発信戦略（媒体別・投稿テーマ案付き）']}
          />
        </Section>

        {/* AIとの壁打ちのコツ */}
        <Section title="AIとの壁打ちのコツ">
          <TipCard emoji="💡" title="具体的な数字を出す">
            「売上目標500万円」「セミナー参加150名」「CVR33%」のように具体的な数字を出すと、AIの提案精度が格段に上がります。
          </TipCard>
          <TipCard emoji="📝" title="たたき台を叩く">
            AIが出したたたき台（コピー案、ペルソナ案等）に対して「ここは違う」「もっとこういう感じ」とフィードバックするのが最も効率的です。
          </TipCard>
          <TipCard emoji="🎯" title="投稿テーマまで深掘りする">
            「SNSで発信する」で終わらず「Instagramリールで『月200万プロモーターの1日』というテーマで週4投稿」のレベルまで詰めると、コンセプトシートの価値が上がります。
          </TipCard>
          <TipCard emoji="⚠️" title="課題も出す">
            良い面だけでなく「ターゲットにプロモーターという概念が伝わりにくい」等の課題点もAIに伝えると、対策付きでシートに反映されます。
          </TipCard>
          <TipCard emoji="📂" title="素材を活用する">
            過去のLP文やメール配信文を素材ライブラリにアップロードしておくと、AIがそれを引用して「前回はこう書いてましたよね」と具体的に提案してくれます。
          </TipCard>
        </Section>

        {/* 機能説明 */}
        <Section title="各機能の使い方">

          <SubSection title="素材ライブラリ">
            <p className="text-sm text-[#A09080] mb-3">
              ダッシュボードの「素材ライブラリ」から過去のコンテンツをアップロードできます。
            </p>
            <KVList items={[
              ['対応ファイル', '.txt / .md / .pdf / .csv'],
              ['カテゴリ', 'LINE配信 / LP / セミナー / お客さんの声 / その他'],
              ['自動分類', 'ファイル名から自動判定（手動変更も可）'],
              ['一括インポート', '「m-createから一括取込」ボタンで素材フォルダから自動読み込み'],
            ]} />
          </SubSection>

          <SubSection title="チャット検索">
            <p className="text-sm text-[#A09080]">
              プロジェクト画面のヘッダーにある🔍アイコンをクリックすると検索バーが表示されます。
              キーワードを入力するとマッチしたメッセージのみ表示され、該当箇所がハイライトされます。
            </p>
          </SubSection>

          <SubSection title="Phase編集">
            <p className="text-sm text-[#A09080]">
              サイドバーのPhaseパネルを展開すると、各データ項目が表示されます。
              項目にカーソルを合わせると✏️ボタンが現れ、クリックで直接編集できます。
              AIが抽出した情報を手動で修正したい場合に使用します。
            </p>
          </SubSection>

          <SubSection title="ステータス管理">
            <p className="text-sm text-[#A09080] mb-3">
              プロジェクト画面のヘッダーでステータスをワンクリック切替できます。
            </p>
            <KVList items={[
              ['設計中', 'コンセプト設計の壁打ち中'],
              ['コンセプト確定', '壁打ち完了、コンセプトシート確定'],
              ['ローンチ済み', 'ローンチ実施完了（結果記録が可能に）'],
            ]} />
          </SubSection>

          <SubSection title="コンセプトシート出力">
            <p className="text-sm text-[#A09080] mb-3">
              サイドバー下部のボタンで操作します。
            </p>
            <StepList steps={[
              { num: '1', title: 'コンセプトシート生成', desc: 'チャット履歴全体をAIが分析し、プロフェッショナルな構造化コンテンツを生成します。数秒〜十数秒かかります。' },
              { num: '2', title: 'PDF出力', desc: '「PDF出力」ボタンで印刷用レイアウトを新しいタブに表示。ブラウザの印刷機能でPDF保存してください。' },
              { num: '📋', title: '投稿作成ツール用コピー', desc: 'PDF出力ボタンの横にある📋ボタンをクリックすると、生成されたコンセプトシートのHTMLがクリップボードにコピーされます。投稿作成ツールに貼り付けて使います。' },
            ]} />
            <p className="text-[11px] text-[#6A6058] mt-2">
              ※ ポップアップがブロックされている場合は、ブラウザ設定でこのサイトのポップアップを許可してください。
            </p>
          </SubSection>

          <SubSection title="URL読み取り">
            <p className="text-sm text-[#A09080]">
              チャット入力欄にURLを貼り付けると📎ボタンが表示されます。
              クリックするとそのページの内容をテキスト化して入力欄に追加します。
              競合のLPを分析したり、参考記事の内容をAIに渡したりする時に使います。
            </p>
          </SubSection>

          <SubSection title="結果記録">
            <p className="text-sm text-[#A09080]">
              ステータスを「ローンチ済み」にすると、ヘッダーに「結果記録」ボタンが表示されます。
              リスト数（セミナー参加者数）・申込数・売上を入力するとCVRが自動計算されます。
              ダッシュボードのプロジェクト一覧にも結果が表示されます。
            </p>
          </SubSection>

          <SubSection title="プロジェクト複製">
            <p className="text-sm text-[#A09080]">
              ダッシュボードのプロジェクト一覧で📋ボタンをクリックすると、Phase設定を引き継いだ複製を作成できます。
              過去のローンチ設計をテンプレートにして新しいプロジェクトを始める時に便利です。
            </p>
          </SubSection>

        </Section>

        {/* 評価スコア */}
        <Section title="評価スコアの見方">
          <p className="text-sm text-[#A09080] mb-4">
            AIが各Phaseの出力を6つの軸で自動評価します。サイドバーにバーグラフで表示されます。
          </p>
          <KVList items={[
            ['本音一致', 'ターゲットの本音の言葉と一致しているか'],
            ['スタイル準拠', 'NG表現が使われていないか・トーンが合っているか'],
            ['独自性', '一般論になっていないか・上位10%の視点があるか'],
            ['自然さ', 'AI臭さが残っていないか（場面・行動・セリフ・感情の4要素）'],
            ['一貫性', 'コンセプト全体との一貫性が保たれているか'],
            ['行動喚起', '読んだ人が次のステップに進みたくなるか'],
          ]} />
          <p className="text-[11px] text-[#6A6058] mt-3">
            各軸1〜10のスコア。8以上ならかなり良い状態です。低い項目があればAIに「○○のスコアが低いので改善して」と伝えてください。
          </p>
        </Section>

        <div className="border-t border-[#2A2520] mt-12 pt-8 text-center">
          <p className="text-[11px] text-[#4A4840]">
            ローンチコンセプト設計ツール — by m-create
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-sm text-[#C8A96E] font-medium mb-4 pb-2 border-b border-[#2A2520]">{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pl-3 border-l-2 border-[#2A2520]">
      <h3 className="text-sm text-[#E0D8C8] mb-2">{title}</h3>
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: { num: string; title: string; desc: string }[] }) {
  return (
    <div className="space-y-3">
      {steps.map(step => (
        <div key={step.num} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-[#C8A96E] text-[#0D0D0D] flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
            {step.num}
          </div>
          <div>
            <div className="text-sm text-[#E0D8C8] font-medium">{step.title}</div>
            <div className="text-[12px] text-[#8A8070] mt-0.5">{step.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhaseCard({ label, title, color, items }: { label: string; title: string; color: string; items: string[] }) {
  return (
    <div className="mb-3 bg-[#161412] border border-[#2A2520] rounded-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderLeft: `3px solid ${color}` }}>
        <span className="text-[10px] tracking-widest" style={{ color }}>{label}</span>
        <span className="text-xs text-[#C8BFB0]">{title}</span>
      </div>
      <div className="px-4 pb-3">
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-[12px] text-[#8A8070] flex items-start gap-1.5">
              <span className="text-[#4A4840] mt-1">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TipCard({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex gap-3 bg-[#161412] border border-[#2A2520] rounded-md px-4 py-3">
      <span className="text-lg flex-shrink-0">{emoji}</span>
      <div>
        <div className="text-sm text-[#E0D8C8] font-medium mb-1">{title}</div>
        <div className="text-[12px] text-[#8A8070]">{children}</div>
      </div>
    </div>
  );
}

function KVList({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-1.5">
      {items.map(([k, v], i) => (
        <div key={i} className="flex gap-3 text-[12px]">
          <span className="text-[#6A6058] w-28 flex-shrink-0">{k}</span>
          <span className="text-[#A09080]">{v}</span>
        </div>
      ))}
    </div>
  );
}
