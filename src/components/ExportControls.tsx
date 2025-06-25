'use client';

import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { 
  Type, 
  AlignJustify, 
  Palette, 
  Download,
  RotateCcw,
  User,
  Calendar
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { TankaSettings } from './TankaPreview';

interface ExportControlsProps {
  settings: TankaSettings;
  onSettingsChange: (settings: TankaSettings) => void;
  onExport: (format: 'png' | 'jpeg') => void;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  settings,
  onSettingsChange,
  onExport,
}) => {
  const [showBgColorPicker, setShowBgColorPicker] = React.useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = React.useState(false);

  const updateSetting = <K extends keyof TankaSettings>(
    key: K,
    value: TankaSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const presetColors = [
    { bg: '#FFFFFF', text: '#000000', name: '白地に黒' },
    { bg: '#000000', text: '#FFFFFF', name: '黒地に白' },
    { bg: '#F5F5DC', text: '#333333', name: 'ベージュ' },
    { bg: '#1A1A2E', text: '#EEE', name: '深夜' },
    { bg: '#FFE4E1', text: '#8B4513', name: '桜色' },
    { bg: '#E6F3FF', text: '#1A5490', name: '青空' },
  ];

  return (
    <div className="space-y-6">
      {/* スタイル設定 */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-4 flex items-center gap-2">
          <Type size={20} />
          スタイル設定
        </h3>
        
        <div className="space-y-4">
          {/* 書字方向 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[var(--lg-text-secondary)] w-24">
              書字方向
            </label>
            <div className="flex gap-2">
              <GlassButton
                size="sm"
                variant={settings.style === 'vertical' ? 'primary' : 'ghost'}
                onClick={() => updateSetting('style', 'vertical')}
              >
                縦書き
              </GlassButton>
              <GlassButton
                size="sm"
                variant={settings.style === 'horizontal' ? 'primary' : 'ghost'}
                onClick={() => updateSetting('style', 'horizontal')}
              >
                横書き
              </GlassButton>
            </div>
          </div>

          {/* フォント */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[var(--lg-text-secondary)] w-24">
              フォント
            </label>
            <div className="flex gap-2">
              <GlassButton
                size="sm"
                variant={settings.fontFamily === 'mincho' ? 'primary' : 'ghost'}
                onClick={() => updateSetting('fontFamily', 'mincho')}
              >
                明朝体
              </GlassButton>
              <GlassButton
                size="sm"
                variant={settings.fontFamily === 'gothic' ? 'primary' : 'ghost'}
                onClick={() => updateSetting('fontFamily', 'gothic')}
              >
                ゴシック体
              </GlassButton>
            </div>
          </div>

          {/* フォントサイズ */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[var(--lg-text-secondary)] w-24">
              文字サイズ
            </label>
            <input
              type="range"
              min="24"
              max="48"
              value={settings.fontSize}
              onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-[var(--lg-text-secondary)] w-12">
              {settings.fontSize}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* 色設定 */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-4 flex items-center gap-2">
          <Palette size={20} />
          色設定
        </h3>

        {/* プリセット */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presetColors.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                updateSetting('bgColor', preset.bg);
                updateSetting('textColor', preset.text);
              }}
              className="glass glass-hover p-3 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: preset.bg,
                color: preset.text,
                border: `2px solid ${
                  settings.bgColor === preset.bg && settings.textColor === preset.text
                    ? 'var(--lg-accent)'
                    : 'transparent'
                }`,
              }}
            >
              <span className="text-xs font-medium">{preset.name}</span>
            </button>
          ))}
        </div>

        {/* カスタムカラー */}
        <div className="flex gap-4">
          <div className="flex-1">
            <button
              onClick={() => setShowBgColorPicker(!showBgColorPicker)}
              className="glass glass-hover p-2 rounded-lg flex items-center gap-2 w-full"
            >
              <div
                className="w-6 h-6 rounded border border-[var(--lg-border)]"
                style={{ backgroundColor: settings.bgColor }}
              />
              <span className="text-sm">背景色</span>
            </button>
            {showBgColorPicker && (
              <div className="absolute mt-2 z-10">
                <HexColorPicker
                  color={settings.bgColor}
                  onChange={(color) => updateSetting('bgColor', color)}
                />
              </div>
            )}
          </div>

          <div className="flex-1">
            <button
              onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              className="glass glass-hover p-2 rounded-lg flex items-center gap-2 w-full"
            >
              <div
                className="w-6 h-6 rounded border border-[var(--lg-border)]"
                style={{ backgroundColor: settings.textColor }}
              />
              <span className="text-sm">文字色</span>
            </button>
            {showTextColorPicker && (
              <div className="absolute mt-2 z-10">
                <HexColorPicker
                  color={settings.textColor}
                  onChange={(color) => updateSetting('textColor', color)}
                />
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 署名設定 */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-4 flex items-center gap-2">
          <User size={20} />
          署名設定
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--lg-text-secondary)]">
              作者名
            </label>
            <input
              type="text"
              value={settings.authorName || ''}
              onChange={(e) => updateSetting('authorName', e.target.value)}
              placeholder="作者名を入力（オプション）"
              className="w-full mt-1 p-2 bg-[var(--lg-bg-tertiary)] rounded-lg border border-[var(--lg-border)] 
                       focus:outline-none focus:ring-2 focus:ring-[var(--lg-accent)] focus:border-transparent
                       text-[var(--lg-text-primary)] placeholder-[var(--lg-text-secondary)]"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showDate}
              onChange={(e) => updateSetting('showDate', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--lg-border)] text-[var(--lg-accent)]"
            />
            <span className="text-sm text-[var(--lg-text-primary)]">
              日付を表示
            </span>
          </label>
        </div>
      </GlassCard>

      {/* エクスポート */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-4 flex items-center gap-2">
          <Download size={20} />
          画像をエクスポート
        </h3>

        <div className="flex gap-3">
          <GlassButton
            onClick={() => onExport('png')}
            icon={<Download size={18} />}
            className="flex-1"
          >
            PNG形式
          </GlassButton>
          <GlassButton
            onClick={() => onExport('jpeg')}
            icon={<Download size={18} />}
            variant="secondary"
            className="flex-1"
          >
            JPEG形式
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};