'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';

interface TankaEditorProps {
  value: string;
  onChange: (value: string) => void;
  onLineBreaksChange: (breaks: number[]) => void;
}

export const TankaEditor: React.FC<TankaEditorProps> = ({
  value,
  onChange,
  onLineBreaksChange,
}) => {
  const [lines, setLines] = useState<string[]>(['']);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    if (value.includes('\n')) {
      setLines(value.split('\n'));
    } else {
      setLines([value]);
    }
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const breaks: number[] = [];
    let pos = 0;
    for (let i = 0; i < newValue.length; i++) {
      if (newValue[i] === '\n') {
        breaks.push(pos);
        pos = 0;
      } else {
        pos++;
      }
    }
    onLineBreaksChange(breaks);
  };

  const charCount = value.replace(/\n/g, '').length;
  const maxChars = 31;
  const isOverLimit = charCount > maxChars;

  return (
    <GlassCard className="w-full" lens>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-[var(--lg-text-primary)]">
            短歌を入力
          </h3>
          <span
            className={`text-sm font-medium ${
              isOverLimit
                ? 'text-red-500'
                : 'text-[var(--lg-text-secondary)]'
            }`}
          >
            {charCount} / {maxChars}
          </span>
        </div>

        <textarea
          value={value}
          onChange={handleTextChange}
          placeholder="ここに短歌を入力してください..."
          className="w-full h-32 p-4 bg-[var(--lg-bg-tertiary)] rounded-lg border border-[var(--lg-border)] 
                     focus:outline-none focus:ring-2 focus:ring-[var(--lg-accent)] focus:border-transparent
                     text-[var(--lg-text-primary)] placeholder-[var(--lg-text-secondary)]
                     resize-none font-mincho text-lg leading-relaxed"
          style={{ transition: 'var(--lg-transition)' }}
        />

        <div className="text-xs text-[var(--lg-text-secondary)]">
          <p>• 改行を入れて句切れを表現できます</p>
          <p>• 全角31文字程度が目安です</p>
        </div>
      </div>
    </GlassCard>
  );
};