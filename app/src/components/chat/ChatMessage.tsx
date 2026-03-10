'use client';

import { ChatMessage as ChatMessageType } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  // Strip phase_update blocks from display
  const displayContent = message.content.replace(/```phase_update[\s\S]*?```/g, '').trim();

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-[#2A2520] border border-[#3A3530] text-[#E8E0D5]'
            : 'bg-[#161412] border border-[#2A2520] text-[#C8BFB0]'
        }`}
      >
        {!isUser && (
          <div className="text-[10px] text-[#C8A96E] tracking-widest mb-2 uppercase">AI</div>
        )}
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
