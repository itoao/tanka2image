'use client';

import { useState, useRef } from 'react';
import { Download, RotateCw, Palette, Type, Share2, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';

type TankaStyle = 'VERTICAL' | 'HORIZONTAL';
type FontFamily = 'mincho' | 'gothic';

interface TankaSettings {
  style: TankaStyle;
  fontFamily: FontFamily;
  fontSize: number;
  bgColor: string;
  textColor: string;
  width: number;
  height: number;
}

export default function ExportPage() {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showDate, setShowDate] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [settings, setSettings] = useState<TankaSettings>({
    style: 'VERTICAL',
    fontFamily: 'mincho',
    fontSize: 32,
    bgColor: '#FFFFFF',
    textColor: '#000000',
    width: 1200,
    height: 1600,
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleExport = async (format: 'png' | 'jpeg') => {
    if (!content.trim()) return;

    try {
      // Create canvas directly for better control over vertical text rendering
      const canvas = document.createElement('canvas');
      canvas.width = settings.width;
      canvas.height = settings.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = settings.bgColor;
      ctx.fillRect(0, 0, settings.width, settings.height);

      // Set font properties
      const fontFamily = settings.fontFamily === 'mincho' ? 'serif' : 'sans-serif';
      ctx.font = `${settings.fontSize}px ${fontFamily}`;
      ctx.fillStyle = settings.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (settings.style === 'VERTICAL') {
        // Vertical text rendering with proper character positioning
        await renderVerticalText(ctx, content, settings);
      } else {
        // Horizontal text rendering
        await renderHorizontalText(ctx, content, settings);
      }

      // Render author name and date if specified
      if (authorName || showDate) {
        ctx.font = `${Math.floor(settings.fontSize * 0.6)}px ${fontFamily}`;
        ctx.globalAlpha = 0.7;
        
        let infoY = settings.height - 80;
        if (authorName) {
          ctx.fillText(authorName, settings.width / 2, infoY);
          infoY += 30;
        }
        if (showDate) {
          ctx.fillText(new Date().toLocaleDateString('ja-JP'), settings.width / 2, infoY);
        }
        ctx.globalAlpha = 1;
      }

      // Download the image
      const link = document.createElement('a');
      link.download = `tanka_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined);
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('画像のエクスポートに失敗しました');
    }
  };

  const renderVerticalText = async (ctx: CanvasRenderingContext2D, text: string, settings: TankaSettings) => {
    const lines = text.split('\n').filter(line => line.trim());
    const lineSpacing = settings.fontSize * 1.8;
    const charSpacing = settings.fontSize * 1.2;
    
    // Calculate starting position (centered)
    const totalWidth = lines.length * lineSpacing;
    let currentX = (settings.width + totalWidth) / 2 - lineSpacing / 2;
    
    for (const line of lines) {
      let currentY = (settings.height - line.length * charSpacing) / 2 + charSpacing / 2;
      
      for (const char of line) {
        // Special handling for punctuation and long vowel marks
        if (shouldRotateChar(char)) {
          ctx.save();
          ctx.translate(currentX, currentY);
          ctx.rotate(Math.PI / 2);
          ctx.fillText(char, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(char, currentX, currentY);
        }
        currentY += charSpacing;
      }
      currentX -= lineSpacing;
    }
  };

  const renderHorizontalText = async (ctx: CanvasRenderingContext2D, text: string, settings: TankaSettings) => {
    const lines = text.split('\n').filter(line => line.trim());
    const lineHeight = settings.fontSize * 1.6;
    
    // Calculate starting position (centered)
    const totalHeight = lines.length * lineHeight;
    let currentY = (settings.height - totalHeight) / 2 + settings.fontSize;
    
    for (const line of lines) {
      ctx.fillText(line, settings.width / 2, currentY);
      currentY += lineHeight;
    }
  };

  const shouldRotateChar = (char: string): boolean => {
    // Characters that should be rotated in vertical text
    const rotateChars = ['ー', '。', '、', '！', '？', '：', '；', '（', '）', '「', '」', '『', '』'];
    return rotateChars.includes(char);
  };

  const handleShare = async () => {
    if (!content.trim()) return;

    setIsSharing(true);
    try {
      const response = await fetch('/api/tanka', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          authorName: authorName || null,
          showDate,
          style: settings.style,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          bgColor: settings.bgColor,
          textColor: settings.textColor,
          width: settings.width,
          height: settings.height,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        alert('共有URLの生成に失敗しました');
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('共有機能でエラーが発生しました');
    } finally {
      setIsSharing(false);
    }
  };

  const handleXShare = () => {
    if (!shareUrl) return;
    const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `短歌を画像にしました\n\n"${content}"\n\n`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(xShareUrl, '_blank', 'noopener,noreferrer');
  };

  const contentLength = content.length;
  const isContentValid = contentLength > 0 && contentLength <= 40;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">短歌2画像</h1>
          <p className="text-gray-600">短歌を美しい画像に変換してエクスポート</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 入力フォーム */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">短歌入力</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  短歌内容 ({contentLength}/40文字)
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="短歌を入力してください..."
                  maxLength={40}
                />
                {contentLength > 40 && (
                  <p className="text-red-500 text-sm mt-1">短歌は40文字以内で入力してください</p>
                )}
                {contentLength === 0 && (
                  <p className="text-red-500 text-sm mt-1">短歌を入力してください</p>
                )}
              </div>

              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                  作者名（オプション）
                </label>
                <input
                  id="authorName"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="作者名"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="showDate"
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showDate" className="ml-2 block text-sm text-gray-700">
                  作成日を表示する
                </label>
              </div>
            </div>

            {/* カスタマイズ設定 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">カスタマイズ設定</h3>
              
              <div className="space-y-4">
                {/* 文字方向 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <RotateCw className="inline w-4 h-4 mr-1" />
                    文字方向
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="style"
                        value="VERTICAL"
                        checked={settings.style === 'VERTICAL'}
                        onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value as TankaStyle }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">縦書き</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="style"
                        value="HORIZONTAL"
                        checked={settings.style === 'HORIZONTAL'}
                        onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value as TankaStyle }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">横書き</span>
                    </label>
                  </div>
                </div>

                {/* フォント */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Type className="inline w-4 h-4 mr-1" />
                    フォント
                  </label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value as FontFamily }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="mincho">明朝体</option>
                    <option value="gothic">ゴシック体</option>
                  </select>
                </div>

                {/* 色設定 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Palette className="inline w-4 h-4 mr-1" />
                      背景色
                    </label>
                    <input
                      type="color"
                      value={settings.bgColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      文字色
                    </label>
                    <input
                      type="color"
                      value={settings.textColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                {/* フォントサイズ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    フォントサイズ: {settings.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="16"
                    max="64"
                    value={settings.fontSize}
                    onChange={(e) => setSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* エクスポートボタン */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">エクスポート</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleExport('png')}
                  disabled={!isContentValid}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG形式
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  disabled={!isContentValid}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JPEG形式
                </button>
              </div>
            </div>

            {/* Xシェア機能 */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Xでシェア</h3>
              {!shareUrl ? (
                <button
                  onClick={handleShare}
                  disabled={!isContentValid || isSharing}
                  className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSharing ? '共有URL生成中...' : '共有URLを生成'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleXShare}
                    className="flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Xでシェア
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      コピー
                    </button>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* プレビュー */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">プレビュー</h2>
            
            <div className="flex justify-center">
              <div 
                ref={previewRef}
                className={`
                  border border-gray-200 flex items-center justify-center relative
                  ${settings.style === 'VERTICAL' ? 'vertical-text' : ''}
                  ${settings.fontFamily === 'mincho' ? 'font-mincho' : 'font-gothic'}
                `}
                style={{
                  width: `${settings.width / 4}px`,
                  height: `${settings.height / 4}px`,
                  backgroundColor: settings.bgColor,
                  color: settings.textColor,
                  fontSize: `${settings.fontSize / 4}px`,
                  lineHeight: settings.style === 'VERTICAL' ? '1.8' : '1.6',
                  padding: '20px',
                }}
              >
                <div 
                  className="text-center"
                  style={{
                    display: 'flex',
                    flexDirection: settings.style === 'VERTICAL' ? 'row' : 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: settings.style === 'VERTICAL' ? '10px' : '5px',
                  }}
                >
                  {content && (
                    <div 
                      style={{
                        display: 'flex',
                        flexDirection: settings.style === 'VERTICAL' ? 'row' : 'column',
                        gap: settings.style === 'VERTICAL' ? '10px' : '5px',
                        marginBottom: settings.style === 'VERTICAL' ? '0' : '20px',
                        marginRight: settings.style === 'VERTICAL' ? '15px' : '0',
                      }}
                    >
                      {content.split('\n').map((line, index) => (
                        <div 
                          key={index} 
                          className={settings.style === 'VERTICAL' ? 'vertical-text' : ''}
                          style={{
                            writingMode: settings.style === 'VERTICAL' ? 'vertical-rl' : 'horizontal-tb',
                            textOrientation: settings.style === 'VERTICAL' ? 'upright' : 'mixed',
                          }}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(authorName || showDate) && (
                    <div 
                      className={settings.style === 'VERTICAL' ? 'vertical-text' : ''}
                      style={{
                        fontSize: `${settings.fontSize / 4 * 0.7}px`,
                        opacity: 0.7,
                        writingMode: settings.style === 'VERTICAL' ? 'vertical-rl' : 'horizontal-tb',
                        textOrientation: settings.style === 'VERTICAL' ? 'upright' : 'mixed',
                      }}
                    >
                      {authorName && <div>{authorName}</div>}
                      {showDate && (
                        <div>
                          {settings.style === 'VERTICAL' 
                            ? new Date().toLocaleDateString('ja-JP').replace(/\//g, '・')
                            : new Date().toLocaleDateString('ja-JP')
                          }
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              プレビューサイズ: {settings.width / 4} × {settings.height / 4}px<br />
              実際のサイズ: {settings.width} × {settings.height}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}