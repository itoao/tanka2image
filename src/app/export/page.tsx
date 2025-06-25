'use client';

import { useState, useRef } from 'react';
import { Download, RotateCw, Palette, Type } from 'lucide-react';
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
    if (!previewRef.current) return;

    try {
      // Create a temporary element with simplified styles for html2canvas
      const tempElement = previewRef.current.cloneNode(true) as HTMLElement;
      
      // Remove problematic Tailwind classes and apply inline styles
      tempElement.className = '';
      tempElement.style.cssText = `
        width: ${settings.width}px;
        height: ${settings.height}px;
        background-color: ${settings.bgColor};
        color: ${settings.textColor};
        font-size: ${settings.fontSize}px;
        font-family: ${settings.fontFamily === 'mincho' ? 'serif' : 'sans-serif'};
        line-height: ${settings.style === 'VERTICAL' ? '1.8' : '1.6'};
        padding: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        ${settings.style === 'VERTICAL' ? 'writing-mode: vertical-rl; text-orientation: upright;' : ''}
      `;
      
      // Clean up child elements
      const children = tempElement.querySelectorAll('*');
      children.forEach(child => {
        const element = child as HTMLElement;
        element.className = '';
        
        if (element.style.opacity) {
          element.style.opacity = '0.7';
        }
        
        // Apply margin for line spacing
        if (element.tagName === 'DIV') {
          const marginStyle = settings.style === 'VERTICAL' ? 'margin-bottom: 16px;' : 'margin-bottom: 8px;';
          element.style.cssText = marginStyle + element.style.cssText;
        }
      });
      
      // Temporarily add to document for rendering
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      document.body.appendChild(tempElement);

      const canvas = await html2canvas(tempElement, {
        width: settings.width,
        height: settings.height,
        scale: 2,
        backgroundColor: settings.bgColor,
        useCORS: true,
        allowTaint: true,
      });

      // Remove temporary element
      document.body.removeChild(tempElement);

      const link = document.createElement('a');
      link.download = `tanka_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined);
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('画像のエクスポートに失敗しました');
    }
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
                  padding: '40px',
                }}
              >
                <div className="text-center">
                  {content && (
                    <div className="mb-8">
                      {content.split('\n').map((line, index) => (
                        <div key={index} className={settings.style === 'VERTICAL' ? 'mb-4' : 'mb-2'}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(authorName || showDate) && (
                    <div className="text-sm opacity-70 mt-8">
                      {authorName && <div>{authorName}</div>}
                      {showDate && <div>{new Date().toLocaleDateString('ja-JP')}</div>}
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