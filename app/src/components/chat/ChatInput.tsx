'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Link, Loader2 } from 'lucide-react';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const URL_REGEX = /https?:\/\/[^\s]+/;

export default function ChatInput({ onSend, disabled }: Props) {
  const [input, setInput] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleFetchUrl = async () => {
    const match = input.match(URL_REGEX);
    if (!match) return;

    setFetchingUrl(true);
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: match[0] }),
      });
      if (!res.ok) throw new Error('Fetch failed');
      const { title, text } = await res.json();

      const urlContent = `\n\n---\n📎 URL読み取り結果: ${title || match[0]}\n${text}\n---`;
      setInput(prev => prev + urlContent);
    } catch {
      alert('URLの読み取りに失敗しました');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasUrl = URL_REGEX.test(input);

  return (
    <div className="border-t border-[#2A2520] bg-[#0D0D0D] p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力...（URLを貼って📎で読み取り可）"
          disabled={disabled || fetchingUrl}
          rows={1}
          className="flex-1 bg-[#161412] border border-[#2A2520] rounded-lg px-4 py-3 text-sm text-[#E8E0D5] placeholder-[#4A4840] focus:outline-none focus:border-[#C8A96E] resize-none transition-colors disabled:opacity-50"
        />
        {hasUrl && (
          <button
            onClick={handleFetchUrl}
            disabled={disabled || fetchingUrl}
            className="p-3 bg-[#1A1A1A] border border-[#3A3530] text-[#C8A96E] rounded-lg hover:border-[#C8A96E] transition-colors disabled:opacity-30 flex-shrink-0"
            title="URLの内容を読み取る"
          >
            {fetchingUrl ? <Loader2 size={18} className="animate-spin" /> : <Link size={18} />}
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim() || fetchingUrl}
          className="p-3 bg-[#C8A96E] text-[#0D0D0D] rounded-lg hover:bg-[#D4B87A] transition-colors disabled:opacity-30 disabled:hover:bg-[#C8A96E] flex-shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
