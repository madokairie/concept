'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Project, ProjectType } from '@/lib/types';
import { saveProject } from '@/lib/store';

const emptyPhase = () => ({ status: 'pending' as const, data: {} });

export default function NewProject() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('self');
  const [clientName, setClientName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    if (type === 'client' && !clientName.trim()) return;

    const project: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      clientName: type === 'client' ? clientName.trim() : undefined,
      status: 'designing',
      styleMode: type === 'self' ? 'default' : 'custom',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phases: {
        phase0: emptyPhase(),
        phase1a: emptyPhase(),
        phase1b: emptyPhase(),
        phase1c: emptyPhase(),
        phase2: emptyPhase(),
      },
    };

    saveProject(project);
    router.push(`/projects/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-lg mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          戻る
        </button>

        <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-3 uppercase">New Project</div>
        <h1 className="text-xl font-normal mb-8">新規プロジェクト作成</h1>

        <div className="space-y-6">
          {/* Type selection */}
          <div>
            <label className="block text-[11px] text-[#6A6058] tracking-[2px] mb-3 uppercase">種別</label>
            <div className="flex gap-3">
              <button
                onClick={() => setType('self')}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-colors ${
                  type === 'self'
                    ? 'bg-[#C8A96E] border-[#C8A96E] text-[#0D0D0D]'
                    : 'bg-[#161412] border-[#2A2520] text-[#A09080] hover:border-[#3A3530]'
                }`}
              >
                自分のローンチ
              </button>
              <button
                onClick={() => setType('client')}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm transition-colors ${
                  type === 'client'
                    ? 'bg-[#C8A96E] border-[#C8A96E] text-[#0D0D0D]'
                    : 'bg-[#161412] border-[#2A2520] text-[#A09080] hover:border-[#3A3530]'
                }`}
              >
                クライアントワーク
              </button>
            </div>
          </div>

          {/* Project name */}
          <div>
            <label className="block text-[11px] text-[#6A6058] tracking-[2px] mb-3 uppercase">プロジェクト名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：UTAGE講座ローンチ 6月"
              className="w-full bg-[#161412] border border-[#2A2520] rounded-lg px-4 py-3 text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] transition-colors"
            />
          </div>

          {/* Client name */}
          {type === 'client' && (
            <div>
              <label className="block text-[11px] text-[#6A6058] tracking-[2px] mb-3 uppercase">クライアント名</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="例：田中さん"
                className="w-full bg-[#161412] border border-[#2A2520] rounded-lg px-4 py-3 text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] transition-colors"
              />
            </div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim() || (type === 'client' && !clientName.trim())}
            className="w-full px-4 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors disabled:opacity-30 disabled:hover:bg-[#C8A96E]"
          >
            壁打ちを始める
          </button>
        </div>
      </div>
    </div>
  );
}
