'use client';

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { TankaEditor } from '../../components/TankaEditor';
import { TankaPreview, TankaSettings } from '../../components/TankaPreview';
import { ExportControls } from '../../components/ExportControls';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { ArrowLeft, Share2 } from 'lucide-react';

export default function ExportPage() {
  const [tankaContent, setTankaContent] = useState('');
  const [lineBreaks, setLineBreaks] = useState<number[]>([]);
  const [settings, setSettings] = useState<TankaSettings>({
    style: 'vertical',
    fontFamily: 'mincho',
    fontSize: 32,
    bgColor: '#FFFFFF',
    textColor: '#000000',
    width: 1200,
    height: 1600,
    showDate: true,
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!previewRef.current || !tankaContent.trim()) {
      alert('短歌を入力してください');
      return;
    }

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: settings.bgColor,
        width: settings.width,
        height: settings.height,
      });

      const link = document.createElement('a');
      link.download = `tanka_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : 1);
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('エクスポートに失敗しました');
    }
  };

  const handleShare = async () => {
    if (navigator.share && tankaContent.trim()) {
      try {
        await navigator.share({
          title: '短歌を作成しました',
          text: tankaContent,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // フォールバック: クリップボードにコピー
      if (tankaContent.trim()) {
        await navigator.clipboard.writeText(tankaContent);
        alert('短歌をクリップボードにコピーしました');
      }
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <GlassCard className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassButton
                variant="ghost"
                size="sm"
                icon={<ArrowLeft size={18} />}
                onClick={() => window.history.back()}
              >
                戻る
              </GlassButton>
              <h1 className="text-2xl font-bold text-[var(--lg-text-primary)]">
                短歌画像エクスポート
              </h1>
            </div>
            
            {tankaContent.trim() && (
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<Share2 size={18} />}
                onClick={handleShare}
              >
                シェア
              </GlassButton>
            )}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: エディターと設定 */}
          <div className="lg:col-span-1 space-y-6">
            <TankaEditor
              value={tankaContent}
              onChange={setTankaContent}
              onLineBreaksChange={setLineBreaks}
            />
            
            <ExportControls
              settings={settings}
              onSettingsChange={setSettings}
              onExport={handleExport}
            />
          </div>

          {/* 右側: プレビュー */}
          <div className="lg:col-span-2">
            <GlassCard className="sticky top-8">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-[var(--lg-text-primary)]">
                  プレビュー
                </h3>
                <p className="text-sm text-[var(--lg-text-secondary)]">
                  実際の画像サイズ: {settings.width} × {settings.height}px
                </p>
              </div>
              
              <div className="flex justify-center">
                <div 
                  className="border border-[var(--lg-border)] rounded-lg overflow-hidden"
                  style={{
                    maxWidth: '100%',
                    aspectRatio: `${settings.width} / ${settings.height}`,
                  }}
                >
                  <div
                    style={{
                      transform: 'scale(0.5)',
                      transformOrigin: 'top left',
                      width: `${settings.width}px`,
                      height: `${settings.height}px`,
                    }}
                  >
                    {tankaContent.trim() ? (
                      <TankaPreview
                        ref={previewRef}
                        content={tankaContent}
                        settings={settings}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center text-[var(--lg-text-secondary)]"
                        style={{
                          width: `${settings.width}px`,
                          height: `${settings.height}px`,
                          backgroundColor: settings.bgColor,
                        }}
                      >
                        短歌を入力してください
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}