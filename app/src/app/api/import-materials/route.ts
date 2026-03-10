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
        name: basename(file),
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
