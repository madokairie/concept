'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, BarChart3, FolderOpen, Copy, ArrowUpDown, Filter, HelpCircle } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjects, deleteProject, duplicateProject, getDefaultStyle, saveDefaultStyle, getMaterials, saveMaterial } from '@/lib/store';
import { MADOKA_DEFAULT_STYLE } from '@/lib/default-style';
import { MaterialFile } from '@/lib/types';

const SEED_KEY = 'concept_materials_seeded';

const STATUS_LABELS: Record<string, string> = {
  designing: '設計中',
  concept_fixed: 'コンセプト確定',
  launched: 'ローンチ済み',
  result_recorded: '結果記録済み',
};

const STATUS_COLORS: Record<string, string> = {
  designing: '#C8A96E',
  concept_fixed: '#5B8FA8',
  launched: '#7B9E87',
  result_recorded: '#9B8BB4',
};

type SortKey = 'updatedAt' | 'createdAt' | 'name';
type FilterStatus = 'all' | 'designing' | 'concept_fixed' | 'launched' | 'result_recorded';

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setProjects(getProjects());

    if (!getDefaultStyle()) {
      saveDefaultStyle(MADOKA_DEFAULT_STYLE);
    }

    if (!localStorage.getItem(SEED_KEY)) {
      setSeeding(true);
      fetch('/api/import-materials')
        .then(res => res.json())
        .then(({ materials: imported }) => {
          const existing = getMaterials();
          const existingNames = new Set(existing.map((m: MaterialFile) => m.name));
          for (const m of imported) {
            if (!existingNames.has(m.name)) {
              saveMaterial(m);
            }
          }
          localStorage.setItem(SEED_KEY, new Date().toISOString());
          setSeeding(false);
        })
        .catch(() => setSeeding(false));
    }
  }, []);

  const sortedFiltered = useMemo(() => {
    let list = filterStatus === 'all'
      ? projects
      : projects.filter(p => p.status === filterStatus);

    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return new Date(b[sortKey]).getTime() - new Date(a[sortKey]).getTime();
    });

    return list;
  }, [projects, sortKey, filterStatus]);

  const grouped = {
    active: sortedFiltered.filter(p => ['designing', 'concept_fixed'].includes(p.status)),
    completed: sortedFiltered.filter(p => ['launched', 'result_recorded'].includes(p.status)),
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteProject(id);
      setProjects(getProjects());
    }
  };

  const handleDuplicate = (id: string, name: string) => {
    const newName = prompt('複製後のプロジェクト名:', `${name}（コピー）`);
    if (!newName) return;
    const newProject = duplicateProject(id, newName);
    if (newProject) {
      setProjects(getProjects());
    }
  };

  const renderProject = (project: Project, borderColor: string) => (
    <div
      key={project.id}
      className="flex items-center gap-4 px-5 py-4 bg-[#161412] border border-[#2A2520] border-l-[3px] rounded-md cursor-pointer hover:bg-[#1E1C18] transition-colors"
      style={{ borderLeftColor: borderColor }}
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className="flex-1">
        <div className="text-sm text-[#E0D8C8] mb-1">{project.name}</div>
        <div className="text-[11px] text-[#6A6058]">
          {project.type === 'self' ? '自分' : `CL: ${project.clientName}`}
          {' · '}
          <span style={{ color: STATUS_COLORS[project.status] }}>{STATUS_LABELS[project.status]}</span>
          {project.results && ` · CVR ${project.results.cvr.toFixed(1)}% · ¥${project.results.revenue.toLocaleString()}`}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {project.status === 'launched' && (
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/projects/${project.id}?tab=results`); }}
            className="flex items-center gap-1 px-2 py-1 bg-[#1A1A1A] border border-[#3A3530] rounded text-[10px] text-[#C8A96E] hover:border-[#C8A96E] transition-colors"
          >
            <BarChart3 size={12} />
            結果記録
          </button>
        )}
        <div className="text-[11px] text-[#4A4840] mr-1">
          {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleDuplicate(project.id, project.name); }}
          className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
          title="複製"
        >
          <Copy size={14} className="text-[#4A4840] hover:text-[#C8A96E]" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(project.id, project.name); }}
          className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
          title="削除"
        >
          <Trash2 size={14} className="text-[#4A4840] hover:text-[#C47A5A]" />
        </button>
      </div>
    </div>
  );

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
          {seeding && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#2A2520] rounded-lg text-[11px] text-[#C8A96E]">
              <span className="inline-block w-2 h-2 bg-[#C8A96E] rounded-full animate-pulse" />
              ナレッジを読み込み中...
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
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
          <button
            onClick={() => router.push('/guide')}
            className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] border border-[#2A2520] rounded-lg text-sm text-[#A09080] hover:border-[#3A3530] transition-colors"
          >
            <HelpCircle size={16} />
            使い方
          </button>
        </div>

        {/* Sort & Filter controls */}
        {projects.length > 1 && (
          <div className="mb-6">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1.5 text-[11px] text-[#6A6058] hover:text-[#A09080] transition-colors"
            >
              <Filter size={12} />
              並び替え・フィルター
            </button>
            {showControls && (
              <div className="flex flex-wrap gap-3 mt-3 p-3 bg-[#161412] border border-[#2A2520] rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowUpDown size={12} className="text-[#6A6058]" />
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1 text-[11px] text-[#A09080] focus:outline-none"
                  >
                    <option value="updatedAt">更新日順</option>
                    <option value="createdAt">作成日順</option>
                    <option value="name">名前順</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={12} className="text-[#6A6058]" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1 text-[11px] text-[#A09080] focus:outline-none"
                  >
                    <option value="all">すべて</option>
                    <option value="designing">設計中</option>
                    <option value="concept_fixed">コンセプト確定</option>
                    <option value="launched">ローンチ済み</option>
                    <option value="result_recorded">結果記録済み</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active projects */}
        {grouped.active.length > 0 && (
          <div className="mb-10">
            <div className="text-[10px] text-[#6A6058] tracking-[3px] mb-4 uppercase">設計中</div>
            <div className="space-y-2">
              {grouped.active.map(project => renderProject(project, STATUS_COLORS[project.status]))}
            </div>
          </div>
        )}

        {/* Completed projects */}
        {grouped.completed.length > 0 && (
          <div className="mb-10">
            <div className="text-[10px] text-[#6A6058] tracking-[3px] mb-4 uppercase">ローンチ済み</div>
            <div className="space-y-2">
              {grouped.completed.map(project => renderProject(project, STATUS_COLORS[project.status]))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {sortedFiltered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[#3A3530] text-4xl mb-4">◇</div>
            <p className="text-sm text-[#6A6058] mb-6">
              {filterStatus !== 'all' ? `${STATUS_LABELS[filterStatus]}のプロジェクトはありません` : 'まだプロジェクトがありません'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => router.push('/projects/new')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm hover:bg-[#D4B87A] transition-colors"
              >
                <Plus size={16} />
                最初のプロジェクトを作成
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
