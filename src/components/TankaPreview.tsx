'use client';

import React, { forwardRef } from 'react';
import { GlassCard } from './ui/GlassCard';

export interface TankaSettings {
  style: 'vertical' | 'horizontal';
  fontFamily: 'mincho' | 'gothic';
  fontSize: number;
  bgColor: string;
  textColor: string;
  width: number;
  height: number;
  authorName?: string;
  showDate: boolean;
}

interface TankaPreviewProps {
  content: string;
  settings: TankaSettings;
  className?: string;
}

export const TankaPreview = forwardRef<HTMLDivElement, TankaPreviewProps>(
  ({ content, settings, className = '' }, ref) => {
    const formatDate = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    };

    const renderVerticalText = (text: string) => {
      const lines = text.split('\n');
      return (
        <div className="flex flex-row-reverse justify-center items-start h-full gap-8 p-12">
          {lines.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className="flex flex-col items-center"
              style={{ writingMode: 'vertical-rl' }}
            >
              {line.split('').map((char, charIndex) => (
                <span key={charIndex} className="inline-block">
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>
      );
    };

    const renderHorizontalText = (text: string) => {
      const lines = text.split('\n');
      return (
        <div className="flex flex-col justify-center items-center h-full gap-4 p-12">
          {lines.map((line, index) => (
            <div key={index} className="text-center">
              {line}
            </div>
          ))}
        </div>
      );
    };

    return (
      <GlassCard className={`overflow-hidden ${className}`} variant="lg">
        <div
          ref={ref}
          className="relative"
          style={{
            width: `${settings.width}px`,
            height: `${settings.height}px`,
            backgroundColor: settings.bgColor,
            color: settings.textColor,
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily === 'mincho' ? 'Noto Serif JP' : 'Noto Sans JP',
            lineHeight: 1.8,
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          <div className="absolute inset-0">
            {settings.style === 'vertical'
              ? renderVerticalText(content)
              : renderHorizontalText(content)}
          </div>

          {(settings.authorName || settings.showDate) && (
            <div
              className="absolute bottom-8 right-8 text-sm opacity-70"
              style={{
                writingMode: settings.style === 'vertical' ? 'vertical-rl' : 'horizontal-tb',
              }}
            >
              {settings.authorName && <div>{settings.authorName}</div>}
              {settings.showDate && <div>{formatDate()}</div>}
            </div>
          )}
        </div>
      </GlassCard>
    );
  }
);

TankaPreview.displayName = 'TankaPreview';