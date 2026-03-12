'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, X, CheckCircle2, Rocket, BarChart3 } from 'lucide-react';
import { Project, ChatMessage, PhaseData } from '@/lib/types';
import { getProject, saveProject, getMessages, saveMessage, getMaterials, getDefaultStyle, updatePhaseData, updateProjectStatus, saveResults } from '@/lib/store';
import { buildSystemPrompt } from '@/lib/prompt';
import ChatArea from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';
import Sidebar from '@/components/sidebar/Sidebar';

const STATUS_FLOW: { key: Project['status']; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'designing', label: '設計中', icon: null, color: '#C8A96E' },
  { key: 'concept_fixed', label: 'コンセプト確定', icon: <CheckCircle2 size={12} />, color: '#5B8FA8' },
  { key: 'launched', label: 'ローンチ済み', icon: <Rocket size={12} />, color: '#7B9E87' },
];

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultForm, setResultForm] = useState({ listCount: '', applicationCount: '', revenue: '' });

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push('/');
      return;
    }
    setProject(p);
    setMessages(getMessages(projectId));

    if (searchParams.get('tab') === 'results') {
      setShowResults(true);
    }
  }, [projectId, router, searchParams]);

  const parsePhaseUpdates = useCallback((content: string): { cleanContent: string; updates: any[] } => {
    const updates: any[] = [];
    const cleanContent = content.replace(/```phase_update\s*([\s\S]*?)```/g, (_, json) => {
      try {
        updates.push(JSON.parse(json.trim()));
      } catch (e) {
        // ignore parse errors
      }
      return '';
    }).trim();
    return { cleanContent, updates };
  }, []);

  const applyPhaseUpdates = useCallback((proj: Project, updates: any[]): Project => {
    const updated = { ...proj, phases: { ...proj.phases } };
    for (const update of updates) {
      const phaseKey = update.phase as keyof PhaseData;
      if (updated.phases[phaseKey]) {
        updated.phases[phaseKey] = {
          ...updated.phases[phaseKey],
          status: update.status || updated.phases[phaseKey].status,
          data: { ...updated.phases[phaseKey].data, ...update.data },
          ...(update.output && { output: update.output }),
          ...(update.evalScore && { evalScore: update.evalScore }),
        };
      }
    }
    return updated;
  }, []);

  const handleSend = async (content: string) => {
    if (!project || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveMessage(projectId, userMsg);
    setIsLoading(true);
    setStreamingContent('');

    try {
      const materials = getMaterials();
      const defaultStyle = getDefaultStyle();
      const systemPrompt = buildSystemPrompt(project, materials, defaultStyle);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullContent += parsed.text;
                setStreamingContent(fullContent);
              }
            } catch {
              // ignore
            }
          }
        }
      }

      const { cleanContent, updates } = parsePhaseUpdates(fullContent);
      const displayContent = cleanContent || fullContent;

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: displayContent,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      saveMessage(projectId, assistantMsg);
      setStreamingContent('');

      if (updates.length > 0) {
        const updatedProject = applyPhaseUpdates(project, updates);
        setProject(updatedProject);
        saveProject(updatedProject);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。\n\n※ ANTHROPIC_API_KEY が .env.local に設定されているか確認してください。',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setStreamingContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPhaseData = (phaseKey: string, dataKey: string, value: string) => {
    if (!project) return;
    updatePhaseData(projectId, phaseKey, dataKey, value);
    const updated = getProject(projectId);
    if (updated) setProject(updated);
  };

  const handleStatusChange = (newStatus: Project['status']) => {
    if (!project) return;
    updateProjectStatus(projectId, newStatus);
    const updated = getProject(projectId);
    if (updated) setProject(updated);
  };

  const handleSaveResults = () => {
    if (!project) return;
    const list = parseInt(resultForm.listCount);
    const apps = parseInt(resultForm.applicationCount);
    const rev = parseInt(resultForm.revenue);
    if (isNaN(list) || isNaN(apps) || isNaN(rev)) {
      alert('数値を入力してください');
      return;
    }
    saveResults(projectId, { listCount: list, applicationCount: apps, revenue: rev });
    const updated = getProject(projectId);
    if (updated) setProject(updated);
    setShowResults(false);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-[#4A4840] text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A2520]">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 hover:bg-[#1A1A1A] rounded transition-colors"
        >
          <ArrowLeft size={16} className="text-[#6A6058]" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm text-[#E8E0D5] truncate">{project.name}</h1>
          <div className="text-[10px] text-[#6A6058]">
            {project.type === 'self' ? '自分のローンチ' : `CL: ${project.clientName}`}
            {' · '}
            スタイル: {project.styleMode === 'default' ? 'まどか' : 'カスタム'}
          </div>
        </div>

        {/* Status buttons */}
        <div className="flex items-center gap-1">
          {STATUS_FLOW.map(s => (
            <button
              key={s.key}
              onClick={() => handleStatusChange(s.key)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                project.status === s.key
                  ? 'border text-white'
                  : 'text-[#4A4840] hover:text-[#6A6058]'
              }`}
              style={project.status === s.key ? { borderColor: s.color, color: s.color } : undefined}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
          {project.status === 'launched' && (
            <button
              onClick={() => setShowResults(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[#9B8BB4] hover:text-[#B9ABD4] transition-colors"
            >
              <BarChart3 size={12} />
              結果記録
            </button>
          )}
        </div>

        {/* Search toggle */}
        <button
          onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(''); }}
          className="p-1.5 hover:bg-[#1A1A1A] rounded transition-colors"
        >
          {showSearch ? <X size={16} className="text-[#C8A96E]" /> : <Search size={16} className="text-[#6A6058]" />}
        </button>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-[#2A2520] bg-[#111110]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="チャット内を検索..."
            autoFocus
            className="w-full bg-[#0D0D0D] border border-[#2A2520] rounded px-3 py-2 text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] transition-colors"
          />
        </div>
      )}

      {/* Results recording modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowResults(false)}>
          <div className="bg-[#161412] border border-[#2A2520] rounded-lg p-6 w-96 max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm text-[#E8E0D5] mb-4">ローンチ結果を記録</h3>
            {project.results ? (
              <div className="space-y-3 mb-4">
                <div className="text-[11px] text-[#6A6058]">記録済みの結果:</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0D0D0D] rounded p-3">
                    <div className="text-[10px] text-[#6A6058]">リスト数</div>
                    <div className="text-sm text-[#E8E0D5]">{project.results.listCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#0D0D0D] rounded p-3">
                    <div className="text-[10px] text-[#6A6058]">申込数</div>
                    <div className="text-sm text-[#E8E0D5]">{project.results.applicationCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-[#0D0D0D] rounded p-3">
                    <div className="text-[10px] text-[#6A6058]">CVR</div>
                    <div className="text-sm text-[#C8A96E]">{project.results.cvr.toFixed(1)}%</div>
                  </div>
                  <div className="bg-[#0D0D0D] rounded p-3">
                    <div className="text-[10px] text-[#6A6058]">売上</div>
                    <div className="text-sm text-[#7B9E87]">¥{project.results.revenue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#4A4840]">
                  記録日: {new Date(project.results.recordedAt).toLocaleDateString('ja-JP')}
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-[11px] text-[#6A6058] mb-1">リスト数（セミナー参加者数）</label>
                  <input
                    type="number"
                    value={resultForm.listCount}
                    onChange={e => setResultForm(prev => ({ ...prev, listCount: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#2A2520] rounded px-3 py-2 text-sm text-[#E8E0D5] focus:outline-none focus:border-[#C8A96E]"
                    placeholder="例: 150"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6A6058] mb-1">申込数</label>
                  <input
                    type="number"
                    value={resultForm.applicationCount}
                    onChange={e => setResultForm(prev => ({ ...prev, applicationCount: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#2A2520] rounded px-3 py-2 text-sm text-[#E8E0D5] focus:outline-none focus:border-[#C8A96E]"
                    placeholder="例: 50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#6A6058] mb-1">売上（円）</label>
                  <input
                    type="number"
                    value={resultForm.revenue}
                    onChange={e => setResultForm(prev => ({ ...prev, revenue: e.target.value }))}
                    className="w-full bg-[#0D0D0D] border border-[#2A2520] rounded px-3 py-2 text-sm text-[#E8E0D5] focus:outline-none focus:border-[#C8A96E]"
                    placeholder="例: 5000000"
                  />
                </div>
                {resultForm.listCount && resultForm.applicationCount && (
                  <div className="text-[11px] text-[#C8A96E]">
                    CVR: {((parseInt(resultForm.applicationCount) / parseInt(resultForm.listCount)) * 100).toFixed(1)}%（自動計算）
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowResults(false)}
                className="flex-1 px-3 py-2 bg-[#0D0D0D] border border-[#2A2520] rounded text-xs text-[#A09080] hover:border-[#3A3530]"
              >
                閉じる
              </button>
              {!project.results && (
                <button
                  onClick={handleSaveResults}
                  disabled={!resultForm.listCount || !resultForm.applicationCount || !resultForm.revenue}
                  className="flex-1 px-3 py-2 bg-[#C8A96E] rounded text-xs text-[#0D0D0D] font-medium hover:bg-[#D4B87A] disabled:opacity-30"
                >
                  記録する
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatArea messages={messages} streamingContent={streamingContent} searchQuery={searchQuery} />
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
        <Sidebar
          project={project}
          messages={messages}
          isLoading={isLoading}
          onEditPhaseData={handleEditPhaseData}
        />
      </div>
    </div>
  );
}
