'use client';

import { useState } from 'react';
import { Project, ChatMessage, EvalScore as EvalScoreType, PHASE_LABELS } from '@/lib/types';
import PhasePanel from './PhasePanel';
import EvalScore from './EvalScore';
import { Download, Sparkles, Loader2 } from 'lucide-react';

// ── CSS for PDF ──
const PDF_CSS = `
@page { margin: 18mm 20mm; }
* { box-sizing: border-box; }
body {
  font-family: 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;
  color: #2a2a2a; line-height: 1.9; max-width: 720px; margin: 0 auto;
  padding: 0 20px 40px; font-size: 13px;
}
.cover {
  text-align: center; padding: 60px 0 40px;
  border-bottom: 3px solid #C8A96E; margin-bottom: 32px;
}
.cover .label { font-size: 10px; letter-spacing: 4px; color: #C8A96E; text-transform: uppercase; margin-bottom: 12px; }
.cover h1 { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px; }
.cover .meta { font-size: 11px; color: #888; }
h2 {
  font-size: 15px; color: #fff; background: #C8A96E;
  padding: 8px 16px; border-radius: 4px;
  margin: 36px 0 16px; page-break-after: avoid;
}
h3 {
  font-size: 13px; color: #C8A96E; font-weight: 600;
  margin: 20px 0 8px; padding-bottom: 4px;
  border-bottom: 1px solid #e8e0d5;
}
hr { border: none; border-top: 1px solid #e0d8cc; margin: 28px 0; }
p { margin: 6px 0; }
ul { margin: 6px 0; padding-left: 20px; }
li { margin: 3px 0; }
strong { color: #1a1a1a; }
table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 12px; }
th, td { border: 1px solid #d4ccbc; padding: 8px 12px; text-align: left; }
th { background: #f5f0e8; color: #6a5d4d; font-weight: 600; font-size: 11px; }
td { background: #fdfcfa; }
em { color: #aaa; font-style: normal; }
.kv-grid { display: grid; grid-template-columns: 140px 1fr; gap: 4px 12px; margin: 8px 0; }
.kv-grid .k { font-size: 11px; color: #8a7d6d; font-weight: 600; padding: 4px 0; }
.kv-grid .v { font-size: 13px; padding: 4px 0; }
.card { background: #fdfcfa; border: 1px solid #e8e0d5; border-radius: 6px; padding: 16px; margin: 12px 0; }
.card-title { font-size: 12px; font-weight: 600; color: #C8A96E; margin-bottom: 6px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.tag { display: inline-block; background: #f5f0e8; color: #6a5d4d; font-size: 11px; padding: 2px 10px; border-radius: 12px; margin: 2px 4px 2px 0; }
.score-section { background: #faf8f4; border: 1px solid #e8e0d5; border-radius: 8px; padding: 20px; margin-top: 32px; }
.score-section h2 { background: none; color: #C8A96E; padding: 0; margin: 0 0 16px; font-size: 14px; }
.score-bar { display: flex; align-items: center; margin: 8px 0; }
.score-label { width: 120px; font-size: 12px; color: #6a5d4d; }
.score-track { flex: 1; height: 8px; background: #e8e0d5; border-radius: 4px; overflow: hidden; }
.score-fill { height: 100%; background: #C8A96E; border-radius: 4px; }
.score-num { width: 40px; text-align: right; font-size: 12px; font-weight: 600; color: #C8A96E; }
@media print {
  body { padding: 0; }
  .cover { padding: 40px 0 30px; }
  h2 { break-after: avoid; }
}`;

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function scoreBarHTML(label: string, value: number | undefined): string {
  if (value == null) return '';
  const pct = Math.min(value * 10, 100);
  return `<div class="score-bar">
    <div class="score-label">${label}</div>
    <div class="score-track"><div class="score-fill" style="width:${pct}%"></div></div>
    <div class="score-num">${value}</div>
  </div>`;
}

function buildScoreHTML(project: Project): string {
  const phases = Object.values(project.phases);
  for (let i = phases.length - 1; i >= 0; i--) {
    if (phases[i].evalScore) {
      const s = phases[i].evalScore!;
      const scores = [
        scoreBarHTML('本音一致', s.targetMatch),
        scoreBarHTML('スタイル準拠', s.styleCompliance),
        scoreBarHTML('独自性', s.originality),
        scoreBarHTML('人間味', s.humanLike),
        scoreBarHTML('一貫性', s.consistency),
        scoreBarHTML('行動喚起力', s.actionDriving),
      ].filter(Boolean).join('\n');
      const vals = [s.targetMatch, s.styleCompliance, s.originality, s.humanLike, s.consistency, s.actionDriving].filter((v): v is number => v != null);
      const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '-';
      return `<div class="score-section">
        <h2>評価スコア</h2>
        ${scores}
        <div style="text-align:right;margin-top:12px;font-size:13px;">
          <span style="color:#8a7d6d;">平均</span>
          <span style="color:#C8A96E;font-weight:700;font-size:16px;margin-left:8px;">${avg}</span>
        </div>
      </div>`;
    }
  }
  return '';
}

function wrapInFullHTML(project: Project, bodyContent: string): string {
  const date = new Date().toLocaleDateString('ja-JP');
  const scoreHTML = buildScoreHTML(project);

  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="utf-8">
<title>${escHtml(project.name)} - コンセプトシート</title>
<style>${PDF_CSS}</style></head><body>
<div class="cover">
  <div class="label">Launch Concept Sheet</div>
  <h1>${escHtml(project.name)}</h1>
  <div class="meta">${project.type === 'self' ? '自分のローンチ' : `クライアント: ${escHtml(project.clientName || '')}`} ｜ ${date}</div>
</div>
${bodyContent}
${scoreHTML}
</body></html>`;
}

function openPrintWindow(html: string) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('ポップアップがブロックされています。ブラウザの設定でポップアップを許可してください。');
    return;
  }
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 300);
}

// ── Sidebar Component ──
interface Props {
  project: Project;
  messages: ChatMessage[];
  isLoading?: boolean;
  onEditPhaseData?: (phaseKey: string, dataKey: string, value: string) => void;
}

export default function Sidebar({ project, messages, isLoading, onEditPhaseData }: Props) {
  const [generating, setGenerating] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);

  const latestScore: Partial<EvalScoreType> | null = (() => {
    const phases = Object.values(project.phases);
    for (let i = phases.length - 1; i >= 0; i--) {
      if (phases[i].evalScore) return phases[i].evalScore!;
    }
    return null;
  })();

  const hasOutput = Object.values(project.phases).some(p => p.output || Object.keys(p.data).length > 0);

  const handleGenerateSheet = async () => {
    if (generating) return;
    setGenerating(true);
    setGeneratedHTML(null);

    try {
      const res = await fetch('/api/generate-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          project,
        }),
      });

      if (!res.ok) throw new Error('API error');
      const { html } = await res.json();
      setGeneratedHTML(html);
    } catch (error) {
      console.error('Sheet generation error:', error);
      alert('コンセプトシート生成に失敗しました。もう一度お試しください。');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPDF = () => {
    if (!generatedHTML) return;
    const fullHTML = wrapInFullHTML(project, generatedHTML);
    openPrintWindow(fullHTML);
  };

  return (
    <div className="w-72 border-l border-[#2A2520] bg-[#111110] flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-[#2A2520]">
        <div className="text-[10px] text-[#6A6058] tracking-[3px] uppercase mb-1">Project</div>
        <h3 className="text-sm text-[#E8E0D5] truncate">{project.name}</h3>
        <div className="text-[11px] text-[#6A6058] mt-0.5">
          {project.type === 'self' ? '自分のローンチ' : `CL: ${project.clientName}`}
        </div>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        <PhasePanel phases={project.phases} onEditPhaseData={onEditPhaseData} />
        <EvalScore scores={latestScore} />
      </div>

      {hasOutput && (
        <div className="p-4 border-t border-[#2A2520] space-y-2">
          {/* Step 1: Generate sheet from chat history */}
          <button
            onClick={handleGenerateSheet}
            disabled={isLoading || generating || messages.length < 2}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#1A1A18] border border-[#3A3530] rounded-md text-xs text-[#C8A96E] font-medium hover:border-[#C8A96E] transition-colors disabled:opacity-30"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {generatedHTML ? 'シートを再生成' : 'コンセプトシート生成'}
              </>
            )}
          </button>

          {/* Step 2: Export as PDF (only after generation) */}
          {generatedHTML && (
            <button
              onClick={handleExportPDF}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#C8A96E] rounded-md text-xs text-[#0D0D0D] font-medium hover:bg-[#D4B87A] transition-colors"
            >
              <Download size={14} />
              PDF出力
            </button>
          )}

          {generatedHTML && (
            <p className="text-[10px] text-[#4A4840] text-center">
              生成完了 — PDF出力で印刷できます
            </p>
          )}
        </div>
      )}
    </div>
  );
}
