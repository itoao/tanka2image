'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, RotateCw, Palette, Type, Share2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import html2canvas from 'html2canvas';

type TankaStyle = 'VERTICAL' | 'HORIZONTAL';
type FontFamily = 'mincho' | 'gothic';
type ImageSize = 'X_CARD' | 'INSTAGRAM_STORY';

interface TankaSettings {
  style: TankaStyle;
  fontFamily: FontFamily;
  fontSize: number;
  bgColor: string;
  textColor: string;
  width: number;
  height: number;
  imageSize: ImageSize;
}

const IMAGE_SIZE_PRESETS = {
  X_CARD: { width: 1200, height: 1600, name: 'X投稿用' },
  INSTAGRAM_STORY: { width: 1080, height: 1920, name: 'Instagram Stories' },
} as const;

type Step = 'content' | 'author' | 'style' | 'customize' | 'export';

const STEPS: { key: Step; title: string; description: string }[] = [
  { key: 'content', title: '短歌入力', description: '短歌を入力してください' },
  { key: 'author', title: '作者情報', description: '作者名と日付設定' },
  { key: 'style', title: 'スタイル', description: '文字方向とサイズを選択' },
  { key: 'customize', title: 'カスタマイズ', description: 'フォントと色を調整' },
  { key: 'export', title: 'エクスポート', description: '画像を保存・共有' },
];

export default function ExportPage() {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showDate, setShowDate] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('content');
  const [isMobile, setIsMobile] = useState(false);
  const [showCustomization, setShowCustomization] = useState(true);
  const [settings, setSettings] = useState<TankaSettings>({
    style: 'VERTICAL',
    fontFamily: 'mincho',
    fontSize: 32,
    bgColor: '#FFFFFF',
    textColor: '#000000',
    width: 1200,
    height: 1600,
    imageSize: 'X_CARD',
  });

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getCurrentStepIndex = () => STEPS.findIndex(step => step.key === currentStep);
  
  const canGoNext = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex >= STEPS.length - 1) return false;
    
    // Validation logic for each step
    switch (currentStep) {
      case 'content':
        return content.trim().length > 0 && content.length <= 40;
      case 'author':
      case 'style':
      case 'customize':
        return true;
      default:
        return false;
    }
  };

  const canGoPrev = () => getCurrentStepIndex() > 0;

  const goNext = () => {
    if (canGoNext()) {
      const currentIndex = getCurrentStepIndex();
      setCurrentStep(STEPS[currentIndex + 1].key);
    }
  };

  const goPrev = () => {
    if (canGoPrev()) {
      const currentIndex = getCurrentStepIndex();
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

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

  const handleInstagramExport = async () => {
    if (!content.trim()) return;

    try {
      // Generate Instagram Stories optimized image
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      // Fill background
      ctx.fillStyle = settings.bgColor;
      ctx.fillRect(0, 0, 1080, 1920);

      // Set font properties for Instagram Stories
      const fontFamily = settings.fontFamily === 'mincho' ? 'serif' : 'sans-serif';
      const storyFontSize = Math.max(48, settings.fontSize * 1.5); // Larger font for stories
      ctx.font = `${storyFontSize}px ${fontFamily}`;
      ctx.fillStyle = settings.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (settings.style === 'VERTICAL') {
        await renderVerticalTextForStories(ctx, content, storyFontSize, settings);
      } else {
        await renderHorizontalTextForStories(ctx, content, storyFontSize, settings);
      }

      // Render author name and date if specified
      if (authorName || showDate) {
        ctx.font = `${Math.floor(storyFontSize * 0.6)}px ${fontFamily}`;
        ctx.globalAlpha = 0.7;
        
        let infoY = 1920 - 120;
        if (authorName) {
          ctx.fillText(authorName, 540, infoY);
          infoY += 40;
        }
        if (showDate) {
          ctx.fillText(new Date().toLocaleDateString('ja-JP'), 540, infoY);
        }
        ctx.globalAlpha = 1;
      }

      // Convert to blob and create download
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `tanka_instagram_story_${Date.now()}.png`;
        link.href = url;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        
        // Try to open Instagram on mobile
        if (navigator.userAgent.match(/iPhone|iPad|Android/i)) {
          setTimeout(() => {
            window.open('instagram://story-camera', '_self');
          }, 1000);
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Instagram export failed:', error);
      alert('Instagram用画像のエクスポートに失敗しました');
    }
  };

  const renderVerticalTextForStories = async (ctx: CanvasRenderingContext2D, text: string, fontSize: number, settings: TankaSettings) => {
    const lines = text.split('\n').filter(line => line.trim());
    const lineSpacing = fontSize * 1.8;
    const charSpacing = fontSize * 1.2;
    
    // Calculate starting position (centered for Stories)
    const totalWidth = lines.length * lineSpacing;
    let currentX = (1080 + totalWidth) / 2 - lineSpacing / 2;
    
    for (const line of lines) {
      let currentY = (1920 - line.length * charSpacing) / 2 + charSpacing / 2;
      
      for (const char of line) {
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

  const renderHorizontalTextForStories = async (ctx: CanvasRenderingContext2D, text: string, fontSize: number, settings: TankaSettings) => {
    const lines = text.split('\n').filter(line => line.trim());
    const lineHeight = fontSize * 1.6;
    
    // Calculate starting position (centered for Stories)
    const totalHeight = lines.length * lineHeight;
    let currentY = (1920 - totalHeight) / 2 + fontSize;
    
    for (const line of lines) {
      ctx.fillText(line, 540, currentY); // 540 is center of 1080
      currentY += lineHeight;
    }
  };

  const handleImageSizeChange = (newSize: ImageSize) => {
    const preset = IMAGE_SIZE_PRESETS[newSize];
    setSettings(prev => ({
      ...prev,
      imageSize: newSize,
      width: preset.width,
      height: preset.height,
    }));
  };

  const contentLength = content.length;
  const isContentValid = contentLength > 0 && contentLength <= 40;

  const renderStepContent = (step: Step) => {
    switch (step) {
      case 'content':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                短歌内容 ({contentLength}/40文字)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
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
          </div>
        );

      case 'author':
        return (
          <div className="space-y-4">
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
        );

      case 'style':
        return (
          <div className="space-y-6">
            {/* 文字方向 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <RotateCw className="inline w-4 h-4 mr-1" />
                文字方向
              </label>
              <div className="space-y-3">
                {(['VERTICAL', 'HORIZONTAL'] as const).map((style) => (
                  <label key={style} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="style"
                      value={style}
                      checked={settings.style === style}
                      onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value as TankaStyle }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">
                      {style === 'VERTICAL' ? '縦書き' : '横書き'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 画像サイズ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                画像サイズ
              </label>
              <div className="space-y-3">
                {Object.entries(IMAGE_SIZE_PRESETS).map(([key, preset]) => (
                  <label key={key} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="imageSize"
                      value={key}
                      checked={settings.imageSize === key}
                      onChange={(e) => handleImageSizeChange(e.target.value as ImageSize)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <div className="text-gray-700">{preset.name}</div>
                      <div className="text-xs text-gray-500">{preset.width}×{preset.height}px</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'customize':
        return (
          <div className="space-y-6">
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="inline w-4 h-4 mr-1" />
                  背景色
                </label>
                <input
                  type="color"
                  value={settings.bgColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, bgColor: e.target.value }))}
                  className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
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
                  className="w-full h-12 border border-gray-300 rounded-md cursor-pointer"
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
        );

      case 'export':
        return (
          <div className="space-y-6">
            {/* エクスポートボタン */}
            <div>
              <h3 className="text-lg font-medium mb-4">画像をダウンロード</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('png')}
                  disabled={!isContentValid}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG形式でダウンロード
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  disabled={!isContentValid}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  JPEG形式でダウンロード
                </button>
                
                <button
                  onClick={handleInstagramExport}
                  disabled={!isContentValid}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram Storiesで投稿
                </button>
              </div>
            </div>

            {/* Xシェア機能 */}
            <div>
              <h3 className="text-lg font-medium mb-4">SNSでシェア</h3>
              {!shareUrl ? (
                <button
                  onClick={handleShare}
                  disabled={!isContentValid || isSharing}
                  className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {isSharing ? '共有URL生成中...' : '共有URLを生成'}
                </button>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleXShare}
                    className="w-full flex items-center justify-center px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800"
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
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render different layouts for mobile and desktop
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-3 sticky top-0 z-10">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">短歌2画像</h1>
            <p className="text-sm text-gray-600">{STEPS.find(s => s.key === currentStep)?.description}</p>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>ステップ {getCurrentStepIndex() + 1}</span>
              <span>{STEPS.length}中</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((getCurrentStepIndex() + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Preview Area - Fixed Top */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex justify-center">
            <div 
              ref={previewRef}
              className={`
                border border-gray-200 flex items-center justify-center relative rounded-lg
                ${settings.style === 'VERTICAL' ? 'vertical-text' : ''}
                ${settings.fontFamily === 'mincho' ? 'font-mincho' : 'font-gothic'}
              `}
              style={{
                width: `${Math.min(280, settings.width / 4)}px`,
                height: `${Math.min(280 * (settings.height / settings.width), settings.height / 4)}px`,
                backgroundColor: settings.bgColor,
                color: settings.textColor,
                fontSize: `${settings.fontSize / 6}px`,
                lineHeight: settings.style === 'VERTICAL' ? '1.8' : '1.6',
                padding: '12px',
              }}
            >
              <div className="text-center">
                {content && (
                  <div className="mb-4">
                    {content.split('\n').map((line, index) => (
                      <div key={index} className={settings.style === 'VERTICAL' ? 'mb-2' : 'mb-1'}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
                
                {(authorName || showDate) && (
                  <div className="text-xs opacity-70 mt-4">
                    {authorName && <div>{authorName}</div>}
                    {showDate && <div>{new Date().toLocaleDateString('ja-JP')}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step Content Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex transition-transform duration-300 ease-in-out"
               style={{ transform: `translateX(-${getCurrentStepIndex() * 100}%)` }}>
            {STEPS.map((step, index) => (
              <div key={step.key} className="w-full flex-shrink-0 h-full overflow-y-auto">
                <div className="p-4 pb-24">
                  {renderStepContent(step.key)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Footer - Fixed Bottom */}
        <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
          <div className="flex justify-between items-center">
            <button
              onClick={goPrev}
              disabled={!canGoPrev()}
              className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              戻る
            </button>
            
            <div className="text-sm text-gray-500">
              {STEPS.find(s => s.key === currentStep)?.title}
            </div>
            
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              次へ
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout (existing code)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">短歌2画像</h1>
          <p className="text-gray-600">短歌を美しい画像に変換してエクスポート</p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* 入力フォーム */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 order-1">
            <h2 className="text-xl font-semibold mb-4 sm:mb-6">短歌入力</h2>
            
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
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCustomization(!showCustomization)}
                className="flex items-center justify-between w-full text-left text-lg font-medium text-gray-900 hover:text-gray-700 focus:outline-none"
              >
                <span>カスタマイズ設定</span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${showCustomization ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCustomization && (
                <div className="mt-4 space-y-4 animate-fadeIn">
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

                {/* 画像サイズ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    画像サイズ
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(IMAGE_SIZE_PRESETS).map(([key, preset]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="radio"
                          name="imageSize"
                          value={key}
                          checked={settings.imageSize === key}
                          onChange={(e) => handleImageSizeChange(e.target.value as ImageSize)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {preset.name}<br />
                          <span className="text-xs text-gray-500">{preset.width}×{preset.height}</span>
                        </span>
                      </label>
                    ))}
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
              )}
            </div>

            {/* エクスポートボタン */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">エクスポート</h3>
              <div className="space-y-4">
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
                
                {/* Instagram Stories エクスポート */}
                <button
                  onClick={handleInstagramExport}
                  disabled={!isContentValid}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram Storiesで投稿
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
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 order-2 lg:order-2">
            <h2 className="text-xl font-semibold mb-4 sm:mb-6">プレビュー</h2>
            
            <div className="flex justify-center">
              <div 
                ref={previewRef}
                className={`
                  border border-gray-200 flex items-center justify-center relative
                  ${settings.style === 'VERTICAL' ? 'vertical-text' : ''}
                  ${settings.fontFamily === 'mincho' ? 'font-mincho' : 'font-gothic'}
                  max-w-full
                `}
                style={{
                  width: `min(${settings.width / 4}px, calc(100vw - 80px), 280px)`,
                  height: `min(${settings.height / 4}px, ${settings.imageSize === 'INSTAGRAM_STORY' ? '480px' : '400px'})`,
                  backgroundColor: settings.bgColor,
                  color: settings.textColor,
                  fontSize: `${Math.max(settings.fontSize / 4, 10)}px`,
                  lineHeight: settings.style === 'VERTICAL' ? '1.8' : '1.6',
                  padding: '15px',
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

            <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
              出力サイズ: {settings.width} × {settings.height}px
              <span className="hidden sm:inline">
                <br />プレビュー: {Math.round(settings.width / 4)} × {Math.round(settings.height / 4)}px
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}