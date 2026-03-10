#!/usr/bin/env node
/**
 * 素材ライブラリ一括インポートスクリプト
 *
 * m-createフォルダからコンセプト設計に使える素材を読み込み、
 * localStorageに投入するためのJSONファイルを生成する。
 *
 * Usage: node scripts/import-materials.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { randomUUID } from 'crypto';

const BASE = '/Users/iriemadoka/Library/Mobile Documents/com~apple~CloudDocs/Desktop/m-create';

// カテゴリ自動判定
function guessCategory(filepath) {
  const lower = filepath.toLowerCase();
  if (lower.includes('testimonial') || lower.includes('受講生') || lower.includes('声')) return 'voice';
  if (lower.includes('phase') || lower.includes('ローンチ') || lower.includes('launch') || lower.includes('人気コンテンツ')) return 'lp';
  if (lower.includes('thread') || lower.includes('sns') || lower.includes('x投稿') || lower.includes('キーメッセージ')) return 'line';
  if (lower.includes('email') || lower.includes('配信')) return 'line';
  if (lower.includes('セミナー') || lower.includes('文字起こし') || lower.includes('講座') || lower.includes('knowledge') || lower.includes('strategy')) return 'seminar';
  return 'other';
}

// 読み込むファイル一覧
const files = [
  // お客さんの声
  'プロモーター養成講座/受講生の声.md',
  'assets/testimonials.md',
  'UTAGE受講生実績ナレッジ.md',

  // ローンチコピー（成功事例）
  '人気コンテンツ_Phase0_プリプリローンチ_Day14-8.md',
  '人気コンテンツ_Phase1-2_プリローンチ_Day7-2.md',
  '人気コンテンツ_Phase3_販売期間_Day1-3.md',
  '人気コンテンツ_Phase4_ポストローンチ.md',
  '人気コンテンツ_プリプリローンチ_3月配信.md',

  // スタイル・メッセージ
  'threads/THREADS_RULES.md',
  'プロモーター養成講座/キーメッセージ集.md',
  'X投稿_まだ早い反論シリーズ.md',

  // データ
  'launch-data/email-analysis.md',
  'launch-data/email-lists.md',

  // ナレッジ
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

  // SNS投稿サンプル
  'threads/threads_motivation.txt',
  'threads/threads_nihonichi.txt',
  'threads/threads_perfectionism.txt',
  'threads/threads_sokuresu.txt',
  'threads/threads_utage_kaiyaku.txt',
  'threads/threads_yakusoku.txt',

  // UTAGE関連テキスト
  'sns-posts/UTAGEまどか投稿.txt',
  'sns-posts/UTAGEポスト参考.txt',

  // 戦略
  'strategy/2026-annual-plan.md',

  // ブログ
  'blog/BLOG-KNOWLEDGE.md',

  // KPI
  'kpi/m-create-kpi-analysis.md',

  // UTAGE関連コンテンツ
  'UTAGE_ウェビナー後フォローシナリオ.md',
];

const materials = [];
let successCount = 0;
let failCount = 0;

for (const file of files) {
  const fullPath = join(BASE, file);
  try {
    const stat = statSync(fullPath);
    if (!stat.isFile()) continue;

    const ext = extname(fullPath).toLowerCase();
    // テキスト系のみ読み込み
    if (!['.md', '.txt', '.csv', '.rtf'].includes(ext)) {
      console.log(`SKIP (non-text): ${file}`);
      continue;
    }

    const content = readFileSync(fullPath, 'utf-8');
    if (content.length < 10) {
      console.log(`SKIP (too short): ${file}`);
      continue;
    }

    materials.push({
      id: randomUUID(),
      name: basename(file),
      category: guessCategory(file),
      content: content,
      uploadedAt: new Date().toISOString(),
    });

    successCount++;
    console.log(`OK: ${file} (${(content.length / 1000).toFixed(1)}K chars) [${guessCategory(file)}]`);
  } catch (e) {
    failCount++;
    console.log(`FAIL: ${file} - ${e.message}`);
  }
}

// JSONファイルとして出力
const outputPath = join(import.meta.dirname, '..', 'data', 'materials-import.json');
import { mkdirSync } from 'fs';
try { mkdirSync(join(import.meta.dirname, '..', 'data'), { recursive: true }); } catch {}
writeFileSync(outputPath, JSON.stringify(materials, null, 2));

console.log(`\n=== Import Summary ===`);
console.log(`Success: ${successCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total characters: ${(materials.reduce((sum, m) => sum + m.content.length, 0) / 1000).toFixed(1)}K`);
console.log(`Output: ${outputPath}`);

// ブラウザ用のインポートスクリプトも生成
const browserScript = `
// ブラウザのコンソールで実行してください
// （http://localhost:3900 を開いた状態で）

const materials = ${JSON.stringify(materials)};

// 既存の素材を取得
const existing = JSON.parse(localStorage.getItem('concept_materials') || '[]');

// 重複チェック（名前ベース）
const existingNames = new Set(existing.map(m => m.name));
const newMaterials = materials.filter(m => !existingNames.has(m.name));

// マージして保存
const merged = [...existing, ...newMaterials];
localStorage.setItem('concept_materials', JSON.stringify(merged));

console.log(\`✅ \${newMaterials.length}件の素材をインポートしました（スキップ: \${materials.length - newMaterials.length}件）\`);
console.log(\`合計: \${merged.length}件\`);

// ページをリロードして反映
location.reload();
`;

const browserScriptPath = join(import.meta.dirname, '..', 'data', 'import-to-browser.js');
writeFileSync(browserScriptPath, browserScript);
console.log(`Browser script: ${browserScriptPath}`);
console.log(`\n📋 使い方: http://localhost:3900 を開いてブラウザのコンソールにimport-to-browser.jsの内容を貼り付けてください`);
