'use client';

import { EvalScore as EvalScoreType } from '@/lib/types';

interface Props {
  scores: Partial<EvalScoreType> | null;
}

const EVAL_LABELS: Record<keyof EvalScoreType, string> = {
  targetMatch: '本音一致',
  styleCompliance: 'スタイル準拠',
  originality: '独自性',
  humanLike: '自然さ',
  consistency: '一貫性',
  actionDriving: '行動喚起',
};

export default function EvalScore({ scores }: Props) {
  if (!scores) return null;

  const entries = Object.entries(scores) as [keyof EvalScoreType, number][];
  if (entries.length === 0) return null;

  const avg = entries.reduce((sum, [, v]) => sum + v, 0) / entries.length;

  return (
    <div className="mb-6">
      <div className="text-[10px] text-[#6A6058] tracking-[3px] px-3 mb-3 uppercase">評価スコア</div>
      <div className="px-3 space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-[11px] text-[#8A8070] w-20 flex-shrink-0">{EVAL_LABELS[key]}</span>
            <div className="flex-1 h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${value * 10}%`,
                  backgroundColor: value >= 8 ? '#7B9E87' : value >= 6 ? '#C8A96E' : '#C47A5A',
                }}
              />
            </div>
            <span className="text-[11px] text-[#6A6058] w-6 text-right">{value}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-[#2A2520]">
          <span className="text-[11px] text-[#C8A96E] w-20 flex-shrink-0">平均</span>
          <div className="flex-1" />
          <span className="text-[11px] text-[#C8A96E] w-6 text-right">{avg.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
