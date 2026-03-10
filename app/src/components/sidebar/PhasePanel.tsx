'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PhaseData, PHASE_LABELS, PhaseInfo } from '@/lib/types';

interface Props {
  phases: PhaseData;
}

function PhaseItem({ phaseKey, phase }: { phaseKey: string; phase: PhaseInfo }) {
  const [expanded, setExpanded] = useState(phase.status === 'in_progress');
  const meta = PHASE_LABELS[phaseKey];
  if (!meta) return null;

  const statusIcon = phase.status === 'completed' ? '✓' : phase.status === 'in_progress' ? '●' : '○';
  const statusColor = phase.status === 'completed' ? '#7B9E87' : phase.status === 'in_progress' ? meta.color : '#4A4840';

  return (
    <div className="mb-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md hover:bg-[#1A1A1A] transition-colors text-left"
      >
        <span style={{ color: statusColor }} className="text-sm flex-shrink-0">{statusIcon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-widest" style={{ color: meta.color }}>{meta.label}</div>
          <div className="text-xs text-[#C8BFB0] truncate">{meta.title}</div>
        </div>
        {expanded ? <ChevronDown size={14} className="text-[#4A4840]" /> : <ChevronRight size={14} className="text-[#4A4840]" />}
      </button>

      {expanded && (
        <div className="ml-7 mr-2 mt-1 mb-2">
          {Object.keys(phase.data).length > 0 ? (
            <div className="space-y-1.5">
              {Object.entries(phase.data).map(([key, value]) => (
                <div key={key} className="text-[11px]">
                  <span className="text-[#6A6058]">{key}:</span>
                  <span className="text-[#A09080] ml-1">{String(value).substring(0, 80)}{String(value).length > 80 ? '...' : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#4A4840] italic">まだ情報がありません</p>
          )}
          {phase.output && (
            <div className="mt-2 p-2 bg-[#0D0D0D] border border-[#2A2520] rounded text-[11px] text-[#8A8070] max-h-32 overflow-y-auto">
              {phase.output.substring(0, 300)}{phase.output.length > 300 ? '...' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PhasePanel({ phases }: Props) {
  return (
    <div className="mb-6">
      <div className="text-[10px] text-[#6A6058] tracking-[3px] px-3 mb-3 uppercase">Phases</div>
      {Object.entries(PHASE_LABELS).map(([key]) => (
        <PhaseItem key={key} phaseKey={key} phase={phases[key as keyof PhaseData]} />
      ))}
    </div>
  );
}
