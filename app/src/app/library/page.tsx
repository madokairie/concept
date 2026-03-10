'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Trash2, FileText } from 'lucide-react';
import { MaterialFile } from '@/lib/types';
import { getMaterials, saveMaterial, deleteMaterial } from '@/lib/store';

const CATEGORY_LABELS: Record<string, string> = {
  line: 'LINE配信',
  lp: 'LP',
  seminar: 'セミナー',
  voice: 'お客さんの声',
  other: 'その他',
};

const CATEGORY_COLORS: Record<string, string> = {
  line: '#7B9E87',
  lp: '#5B8FA8',
  seminar: '#9B8BB4',
  voice: '#C8A96E',
  other: '#6A6058',
};

function guessCategory(filename: string): MaterialFile['category'] {
  const lower = filename.toLowerCase();
  if (lower.includes('line') || lower.includes('配信')) return 'line';
  if (lower.includes('lp') || lower.includes('ランディング')) return 'lp';
  if (lower.includes('セミナー') || lower.includes('文字起こし') || lower.includes('seminar')) return 'seminar';
  if (lower.includes('声') || lower.includes('voice') || lower.includes('お客')) return 'voice';
  return 'other';
}

export default function Library() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materials, setMaterials] = useState<MaterialFile[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setMaterials(getMaterials());
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      let content = '';
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        content = await file.text();
      } else if (file.type === 'application/pdf') {
        content = `[PDF] ${file.name} (${(file.size / 1024).toFixed(1)}KB) - PDFの内容はテキスト抽出後に更新してください`;
      } else {
        content = await file.text();
      }

      const material: MaterialFile = {
        id: crypto.randomUUID(),
        name: file.name,
        category: guessCategory(file.name),
        content,
        uploadedAt: new Date().toISOString(),
      };

      saveMaterial(material);
    }

    setMaterials(getMaterials());
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      deleteMaterial(id);
      setMaterials(getMaterials());
    }
  };

  const handleCategoryChange = (id: string, category: MaterialFile['category']) => {
    const all = getMaterials();
    const index = all.findIndex(m => m.id === id);
    if (index >= 0) {
      all[index].category = category;
      localStorage.setItem('concept_materials', JSON.stringify(all));
      setMaterials([...all]);
    }
  };

  const filtered = filter === 'all' ? materials : materials.filter(m => m.category === filter);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E8E0D5]" style={{ fontFamily: "'Georgia', 'Noto Serif JP', serif" }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[#6A6058] hover:text-[#A09080] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          戻る
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] text-[#C8A96E] tracking-[4px] mb-2 uppercase">Material Library</div>
            <h1 className="text-xl font-normal">素材ライブラリ</h1>
            <p className="text-[11px] text-[#6A6058] mt-1">{materials.length}ファイル</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.pdf,.csv"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C8A96E] text-[#0D0D0D] rounded-lg text-sm hover:bg-[#D4B87A] transition-colors"
            >
              <Upload size={16} />
              アップロード
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', ...Object.keys(CATEGORY_LABELS)].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded text-[11px] transition-colors flex-shrink-0 ${
                filter === cat
                  ? 'bg-[#2A2520] text-[#E8E0D5]'
                  : 'text-[#6A6058] hover:text-[#A09080]'
              }`}
            >
              {cat === 'all' ? '全て' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* File list */}
        <div className="space-y-2">
          {filtered.map(material => (
            <div
              key={material.id}
              className="flex items-center gap-3 px-4 py-3 bg-[#161412] border border-[#2A2520] rounded-md"
            >
              <FileText size={16} style={{ color: CATEGORY_COLORS[material.category] }} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#E0D8C8] truncate">{material.name}</div>
                <div className="text-[10px] text-[#4A4840] mt-0.5">
                  {new Date(material.uploadedAt).toLocaleDateString('ja-JP')}
                  {' · '}
                  {material.content.length > 100 ? `${(material.content.length / 1000).toFixed(1)}K文字` : `${material.content.length}文字`}
                </div>
              </div>
              <select
                value={material.category}
                onChange={(e) => handleCategoryChange(material.id, e.target.value as MaterialFile['category'])}
                className="bg-[#0D0D0D] border border-[#2A2520] rounded px-2 py-1 text-[11px] text-[#A09080] focus:outline-none"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                onClick={() => handleDelete(material.id, material.name)}
                className="p-1.5 hover:bg-[#2A2520] rounded transition-colors"
              >
                <Trash2 size={14} className="text-[#4A4840] hover:text-[#C47A5A]" />
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-[#3A3530] text-3xl mb-4">📂</div>
            <p className="text-sm text-[#6A6058] mb-2">
              {filter === 'all' ? 'まだ素材がありません' : `${CATEGORY_LABELS[filter]}の素材はありません`}
            </p>
            <p className="text-[11px] text-[#4A4840]">
              過去のLP、LINE配信文、セミナー文字起こし等をアップロードしてください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
