import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { randomUUID } from 'crypto';

const BASE = '/Users/iriemadoka/Library/Mobile Documents/com~apple~CloudDocs/Desktop/m-create';

function guessCategory(filepath: string): string {
  const lower = filepath.toLowerCase();
  if (lower.includes('testimonial') || lower.includes('受講生') || lower.includes('声')) return 'voice';
  if (lower.includes('phase') || lower.includes('ローンチ') || lower.includes('launch') || lower.includes('人気コンテンツ')) return 'lp';
  if (lower.includes('thread') || lower.includes('sns') || lower.includes('x投稿') || lower.includes('キーメッセージ')) return 'line';
  if (lower.includes('email') || lower.includes('配信')) return 'line';
  if (lower.includes('セミナー') || lower.includes('文字起こし') || lower.includes('講座') || lower.includes('knowledge') || lower.includes('strategy')) return 'seminar';
  return 'other';
}

const FILES = [
  'プロモーター養成講座/受講生の声.md',
  'assets/testimonials.md',
  'UTAGE受講生実績ナレッジ.md',
  '人気コンテンツ_Phase0_プリプリローンチ_Day14-8.md',
  '人気コンテンツ_Phase1-2_プリローンチ_Day7-2.md',
  '人気コンテンツ_Phase3_販売期間_Day1-3.md',
  '人気コンテンツ_Phase4_ポストローンチ.md',
  '人気コンテンツ_プリプリローンチ_3月配信.md',
  'threads/THREADS_RULES.md',
  'プロモーター養成講座/キーメッセージ集.md',
  'X投稿_まだ早い反論シリーズ.md',
  'launch-data/email-analysis.md',
  'launch-data/email-lists.md',
  'launch-data/プロモーター養成講座_メールキャンペーン5日間.md',
  'プロモーター養成講座/講座概要.md',
  'marketing-knowledge/consultation-strategy.md',
  'marketing-knowledge/challenge-launch.md',
  'marketing-knowledge/low-ticket-launch-playbook.md',
  'marketing-knowledge/low-ticket-funnel.md',
  'marketing-knowledge/roas-funnel-design.md',
  'marketing-knowledge/threads-strategy.md',
  'marketing-knowledge/instagram-reels-list-building.md',
  'marketing-knowledge/ad-strategy.md',
  'marketing-knowledge/innovator_theory_knowledge.md',
  'threads/threads_motivation.txt',
  'threads/threads_nihonichi.txt',
  'threads/threads_perfectionism.txt',
  'threads/threads_sokuresu.txt',
  'threads/threads_utage_kaiyaku.txt',
  'threads/threads_yakusoku.txt',
  'sns-posts/UTAGEまどか投稿.txt',
  'sns-posts/UTAGEポスト参考.txt',
  'strategy/2026-annual-plan.md',
  'blog/BLOG-KNOWLEDGE.md',
  'kpi/m-create-kpi-analysis.md',
  'UTAGE_ウェビナー後フォローシナリオ.md',

  // promoterフォルダ
  'promoter/README.md',
  'promoter/X_スレッズ投稿ルール.md',
  'promoter/キーメッセージ集.md',
  'promoter/ブログ記事一覧_プロモーター関連.md',
  'promoter/講座概要.md',
  'promoter/受講生の声.md',
  'promoter/由紀子さんプロフィール.md',
  'promoter/innovator_theory_knowledge.md',

  // ベンチマーク
  'benchmark/depure-cursor-seminar-lp.md',

  // ブログ（まどかの文体学習用）
  'blog/INVENTORY.md',
  'blog/NEW-ARTICLES-202603.md',
  'blog/REWRITE-7.md',
  'blog/SEO-ANALYSIS-202603.md',
  'blog/plan/2026-02-remaining.md',
  'blog/posts/content-sales-30-to-100.txt',
  'blog/posts/content-sales-automation.txt',
  'blog/posts/evergreen-vs-live-launch.txt',
  'blog/posts/online-course-student-results.txt',
  'blog/posts/utage-auto-webinar-tips.txt',
  'blog/posts/utage-email-and-line-both.txt',
  'blog/posts/utage-subscription-course.txt',
  'blog/posts/utage-vs-elme-comparison.txt',
  'blog/posts/utage-vs-lstep-comparison.txt',
  'blog/posts/published-articles.md',
  'blog/posts/README.md',
  'blog/posts/files/blog_article_inventory.md',
  'blog/posts/files/x_article_inventory.md',

  // KPIデータ
  'kpi/funnel-conversion.csv',
  'kpi/optin-sources.csv',

  // ローンチデータ
  'launch-data/email-performance.csv',

  // マーケティングナレッジ（UTAGE操作系 + 追加分析）
  'marketing-knowledge/10分で解説！UTAGEでできること8選.txt',
  'marketing-knowledge/threads-action-plan.md',
  'marketing-knowledge/x-analysis-2025-02.md',
  'marketing-knowledge/LP制作・メールLINE配信・会員サイトが全て1つで完了！UTAGE完全攻略.txt',
  'marketing-knowledge/【UTAGE】5分でできる！メール配信設定.txt',
  'marketing-knowledge/【UTAGE】LINEメッセージの配信方法.txt',
  'marketing-knowledge/【UTAGE】LINEリッチメニュー作成・設置方法.txt',
  'marketing-knowledge/【UTAGE】LINE公式アカウント 自動応答メッセージ活用法.txt',
  'marketing-knowledge/【UTAGE】たった10分で！ランディングページを作る方法.txt',
  'marketing-knowledge/UTAGEでLINE配信設定 基本操作解説.txt',
  'marketing-knowledge/UTAGEでたった10分でできる！商品登録をする方法.txt',
  'marketing-knowledge/UTAGEで会員サイトを簡単に作る方法.txt',
  'marketing-knowledge/UTAGE自動化で売れる！オートウェビナー攻略.txt',
  'marketing-knowledge/【UTAGE】申し込みが10倍増える！ランディングページを作る方法.txt',
  'marketing-knowledge/【超便利】個別相談・セミナー予約が完璧に！設定方法.txt',
  'marketing-knowledge/年商10億マーケターが絶賛！UTAGEの魅力＆開発の裏側秘話.txt',

  // SNS分析
  'sns-posts/x/analysis/report-20260213.md',
  'sns-posts/x/raw-data/account_analytics_20260131-0213.csv',
  'sns-posts/x/raw-data/account_analytics_content_2026-01-31_2026-02-13.csv',

  // その他
  'task-log.md',
];

export async function GET() {
  const materials = [];

  for (const file of FILES) {
    const fullPath = join(BASE, file);
    try {
      const stat = statSync(fullPath);
      if (!stat.isFile()) continue;

      const ext = extname(fullPath).toLowerCase();
      if (!['.md', '.txt', '.csv', '.rtf'].includes(ext)) continue;

      const content = readFileSync(fullPath, 'utf-8');
      if (content.length < 10) continue;

      materials.push({
        id: randomUUID(),
        name: file.includes('/') ? `[${file.split('/')[0]}] ${basename(file)}` : basename(file),
        category: guessCategory(file),
        content,
        uploadedAt: new Date().toISOString(),
      });
    } catch {
      // skip files that can't be read
    }
  }

  return NextResponse.json({ materials, count: materials.length });
}
