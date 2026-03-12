'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { PhaseData, PHASE_LABELS, PhaseInfo } from '@/lib/types';
import { labelOf } from '@/lib/labels';

interface Props {
  phases: PhaseData;
  onEditPhaseData?: (phaseKey: string, dataKey: string, value: string) => void;
}

function PhaseItem({ phaseKey, phase, onEdit }: {
  phaseKey: string;
  phase: PhaseInfo;
  onEdit?: (dataKey: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(phase.status === 'in_progress');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const meta = PHASE_LABELS[phaseKey];
  if (!meta) return null;

  const statusIcon = phase.status === 'completed' ? '✓' : phase.status === 'in_progress' ? '●' : '○';
  const statusColor = phase.status === 'completed' ? '#7B9E87' : phase.status === 'in_progress' ? meta.color : '#4A4840';
  const dataEntries = Object.entries(phase.data);
  const dataCount = dataEntries.length;

  const startEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (editingKey && onEdit) {
      onEdit(editingKey, editValue);
    }
    setEditingKey(null);
  };

  const cancelEdit = () => {
    setEditingKey(null);
  };

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
        {dataCount > 0 && (
          <span className="text-[10px] text-[#4A4840] flex-shrink-0">{dataCount}項目</span>
        )}
        {expanded ? <ChevronDown size={14} className="text-[#4A4840]" /> : <ChevronRight size={14} className="text-[#4A4840]" />}
      </button>

      {expanded && (
        <div className="ml-7 mr-2 mt-1 mb-2">
          {dataCount > 0 ? (
            <div className="space-y-1.5">
              {dataEntries.map(([key, value]) => (
                <div key={key} className="text-[11px] group">
                  {editingKey === key ? (
                    <div className="flex items-start gap-1">
                      <div className="flex-1">
                        <div className="text-[#6A6058] mb-0.5">{labelOf(key)}</div>
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full bg-[#0D0D0D] border border-[#C8A96E] rounded px-2 py-1 text-[11px] text-[#E8E0D5] focus:outline-none resize-none"
                          rows={Math.min(String(value).split('\n').length + 1, 4)}
                          autoFocus
                        />
                      </div>
                      <button onClick={saveEdit} className="p-0.5 mt-4 text-[#7B9E87] hover:text-[#9BBEA7]">
                        <Check size={12} />
                      </button>
                      <button onClick={cancelEdit} className="p-0.5 mt-4 text-[#C47A5A] hover:text-[#E09A7A]">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-1">
                      <div className="flex-1 min-w-0">
                        <span className="text-[#6A6058]">{labelOf(key)}:</span>
                        <span className="text-[#A09080] ml-1">
                          {String(value).substring(0, 100)}{String(value).length > 100 ? '...' : ''}
                        </span>
                      </div>
                      {onEdit && (
                        <button
                          onClick={() => startEdit(key, String(value))}
                          className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#4A4840] hover:text-[#C8A96E] flex-shrink-0"
                        >
                          <Pencil size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#4A4840] italic">まだ情報がありません</p>
          )}
          {phase.output && (
            <div className="mt-2 p-2 bg-[#0D0D0D] border border-[#2A2520] rounded text-[11px] text-[#8A8070] max-h-32 overflow-y-auto whitespace-pre-wrap">
              {phase.output.substring(0, 500)}{phase.output.length > 500 ? '...' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PhasePanel({ phases, onEditPhaseData }: Props) {
  return (
    <div className="mb-6">
      <div className="text-[10px] text-[#6A6058] tracking-[3px] px-3 mb-3 uppercase">Phases</div>
      {Object.entries(PHASE_LABELS).map(([key]) => (
        <PhaseItem
          key={key}
          phaseKey={key}
          phase={phases[key as keyof PhaseData]}
          onEdit={onEditPhaseData ? (dataKey, value) => onEditPhaseData(key, dataKey, value) : undefined}
        />
      ))}
    </div>
  );
}
