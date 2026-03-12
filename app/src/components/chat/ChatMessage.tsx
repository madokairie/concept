'use client';

import { ChatMessage as ChatMessageType, PHASE_LABELS } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  message: ChatMessageType;
  highlight?: string;
}

export default function ChatMessage({ message, highlight }: Props) {
  const isUser = message.role === 'user';

  // Strip phase_update blocks from display
  let displayContent = message.content.replace(/```phase_update[\s\S]*?```/g, '').trim();

  // Detect phase tag from content (📍 marker)
  const phaseTag = message.phaseTag || detectPhaseTag(displayContent);
  const phaseMeta = phaseTag ? PHASE_LABELS[phaseTag] : null;

  // Highlight search matches
  if (highlight && highlight.length > 1) {
    const regex = new RegExp(`(${escapeRegex(highlight)})`, 'gi');
    displayContent = displayContent.replace(regex, '**$1**');
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-[#2A2520] border border-[#3A3530] text-[#E8E0D5]'
            : 'bg-[#161412] border border-[#2A2520] text-[#C8BFB0]'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          {!isUser && (
            <div className="text-[10px] text-[#C8A96E] tracking-widest uppercase">AI</div>
          )}
          {phaseMeta && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: phaseMeta.color + '20', color: phaseMeta.color }}
            >
              {phaseMeta.label}
            </span>
          )}
        </div>
        <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none
          prose-p:text-[#C8BFB0] prose-strong:text-[#E8E0D5] prose-li:text-[#C8BFB0]
          prose-headings:text-[#E8E0D5] prose-h3:text-base prose-h4:text-sm">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
        </div>
        <div className="text-[10px] text-[#4A4840] mt-2">
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function detectPhaseTag(content: string): string | undefined {
  // Detect from 📍 marker at end of AI messages
  const markerMatch = content.match(/📍\s*(Phase\s*\d[A-Za-z]?)/i);
  if (markerMatch) {
    const phase = markerMatch[1].toLowerCase().replace(/\s+/g, '').replace('phase', 'phase');
    // Map to phase key
    if (phase.includes('0')) return 'phase0';
    if (phase.includes('1a') || phase.includes('1-a')) return 'phase1a';
    if (phase.includes('1b') || phase.includes('1-b')) return 'phase1b';
    if (phase.includes('1c') || phase.includes('1-c')) return 'phase1c';
    if (phase.includes('2')) return 'phase2';
  }
  return undefined;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
