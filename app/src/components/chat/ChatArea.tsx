'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import ChatMessage from './ChatMessage';

interface Props {
  messages: ChatMessageType[];
  streamingContent: string;
}

export default function ChatArea({ messages, streamingContent }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && !streamingContent && (
          <div className="text-center py-20">
            <div className="text-[11px] text-[#C8A96E] tracking-[6px] mb-4 uppercase">
              Launch Concept Design
            </div>
            <h2 className="text-xl text-[#E8E0D5] font-normal mb-3">
              壁打ちを始めましょう
            </h2>
            <p className="text-sm text-[#6A6058] max-w-md mx-auto leading-relaxed">
              今回のローンチについて話してください。<br />
              AIが質問しながらコンセプト設計を進めます。
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {streamingContent && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-[#161412] border border-[#2A2520] text-[#C8BFB0]">
              <div className="text-[10px] text-[#C8A96E] tracking-widest mb-2 uppercase">AI</div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{streamingContent}</div>
              <span className="inline-block w-1.5 h-4 bg-[#C8A96E] animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
