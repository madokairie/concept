'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BarChart3, FolderOpen } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjects, deleteProject, getDefaultStyle, saveDefaultStyle } from '@/lib/store';
import { MADOKA_DEFAULT_STYLE } from '@/lib/default-style';

const STATUS_LABELS: Record<string, string> = {
  designing: '設計中',
  concept_fixed: 'コンセプト確定',
  launched: 'ローンチ済み',
  result_recorded: '結果記録済み',
};

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(getProjects());
    // 初回アクセス時にデフォルトスタイルを自動設定
    if (!getDefaultStyle()) {
      saveDefaultStyle(MADOKA_DEFAULT_STYLE);
    }
  }, []);

  const grouped = {
    active: projects.filter(p => ['designing', 'concept_fixed'].includes(p.status)),
    completed: projects.filter(p => ['launched', 'result_recorded'].includes(p.status)),
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteProject(id);
      setProjects(getProjects());
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-[11px] tracking-[6px] text-[#C8A96E] mb-4 uppercase">
            Launch Concept Design Tool
          </div>
          <h1 className="text-2xl font-normal mb-2">ローンチコンセプト設計ツール</h1>
          <p className="text-sm text-[#6A6058]">
            完成型ファースト × 3素材収集 × 評価ループ
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-10">
          <button
            onClick={() => router.push('/projects/new')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm font-medium hover:bg-[#D4B87A] transition-colors"
          >
            <Plus size={16} />
            新規プロジェクト
          </button>
          <button
            onClick={() => router.push('/library')}
            className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border border-[#2A2520] rounded-lg text-sm text-[#A09080] hover:border-[#3A3530] transition-colors"
          >
            <FolderOpen size={16} />
            素材ライブラリ
          </button>
        </div>

        {/* Active projects */}
        {grouped.active.length > 0 && (
          <div className="mb-10">
            <div className="text-[10px] text-[#6A6058] tracking-[3px] mb-4 uppercase">設計中</div>
            <div className="space-y-2">
              {grouped.active.map(project => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 px-5 py-4 bg-[#161412] border border-[#2A2520] border-l-[3px] rounded-md cursor-pointer hover:bg-[#1E1C18] transition-colors"
                  style={{ borderLeftColor: '#C8A96E' }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="text-sm text-[#E0D8C8] mb-1">{project.name}</div>
                    <div className="text-[11px] text-[#6A6058]">
                      {project.type === 'self' ? '自分' : `CL: ${project.clientName}`}
                      {' · '}
                      {STATUS_LABELS[project.status]}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#4A4840]">
                    {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }}
                    className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
                  >
                    <Trash2 size={14} className="text-[#4A4840] hover:text-[#C47A5A]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed projects */}
        {grouped.completed.length > 0 && (
          <div className="mb-10">
            <div className="text-[10px] text-[#6A6058] tracking-[3px] mb-4 uppercase">ローンチ済み</div>
            <div className="space-y-2">
              {grouped.completed.map(project => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 px-5 py-4 bg-[#161412] border border-[#2A2520] border-l-[3px] rounded-md cursor-pointer hover:bg-[#1E1C18] transition-colors"
                  style={{ borderLeftColor: '#7B9E87' }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="text-sm text-[#E0D8C8] mb-1">{project.name}</div>
                    <div className="text-[11px] text-[#6A6058]">
                      {project.type === 'self' ? '自分' : `CL: ${project.clientName}`}
                      {project.results && ` · CVR ${project.results.cvr.toFixed(1)}% · ¥${project.results.revenue.toLocaleString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.status === 'launched' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/projects/${project.id}?tab=results`); }}
                        className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] border border-[#3A3530] rounded text-[10px] text-[#C8A96E] hover:border-[#C8A96E] transition-colors"
                      >
                        <BarChart3 size={12} />
                        結果記録
                      </button>
                    )}
                    <div className="text-[11px] text-[#4A4840]">
                      {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[#3A3530] text-4xl mb-4">◇</div>
            <p className="text-sm text-[#6A6058] mb-6">まだプロジェクトがありません</p>
            <button
              onClick={() => router.push('/projects/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm hover:bg-[#D4B87A] transition-colors"
            >
              <Plus size={16} />
              最初のプロジェクトを作成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
