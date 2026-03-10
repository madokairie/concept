'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Project, ChatMessage, PhaseData } from '@/lib/types';
import { getProject, saveProject, getMessages, saveMessage, getMaterials, getDefaultStyle } from '@/lib/store';
import { buildSystemPrompt } from '@/lib/prompt';
import ChatArea from '@/components/chat/ChatArea';
import ChatInput from '@/components/chat/ChatInput';
import Sidebar from '@/components/sidebar/Sidebar';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const p = getProject(projectId);
    if (!p) {
      router.push('/');
      return;
    }
    setProject(p);
    setMessages(getMessages(projectId));
  }, [projectId, router]);

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

    // Add user message
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

      // Parse phase updates from the full response
      const { cleanContent, updates } = parsePhaseUpdates(fullContent);
      const displayContent = cleanContent || fullContent;

      // Save assistant message
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: displayContent,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      saveMessage(projectId, assistantMsg);
      setStreamingContent('');

      // Apply phase updates
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
        <div className="flex-1">
          <h1 className="text-sm text-[#E8E0D5]">{project.name}</h1>
          <div className="text-[10px] text-[#6A6058]">
            {project.type === 'self' ? '自分のローンチ' : `CL: ${project.clientName}`}
            {' · '}
            スタイル: {project.styleMode === 'default' ? 'まどか' : 'カスタム'}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatArea messages={messages} streamingContent={streamingContent} />
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
        <Sidebar project={project} />
      </div>
    </div>
  );
}
