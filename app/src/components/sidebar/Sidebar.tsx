'use client';

import { Project, EvalScore as EvalScoreType } from '@/lib/types';
import PhasePanel from './PhasePanel';
import EvalScore from './EvalScore';
import { FileText, Download } from 'lucide-react';

interface Props {
  project: Project;
}

export default function Sidebar({ project }: Props) {
  // Collect the latest eval score from any phase
  const latestScore: Partial<EvalScoreType> | null = (() => {
    const phases = Object.values(project.phases);
    for (let i = phases.length - 1; i >= 0; i--) {
      if (phases[i].evalScore) return phases[i].evalScore!;
    }
    return null;
  })();

  // Collect referenced materials (placeholder for now)
  const hasOutput = Object.values(project.phases).some(p => p.output);

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
        <PhasePanel phases={project.phases} />
        <EvalScore scores={latestScore} />
      </div>

      {hasOutput && (
        <div className="p-4 border-t border-[#2A2520]">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#1A1A1A] border border-[#3A3530] rounded-md text-xs text-[#A09080] hover:border-[#C8A96E] hover:text-[#C8A96E] transition-colors">
            <Download size={14} />
            コンセプトシート出力
          </button>
        </div>
      )}
    </div>
  );
}
