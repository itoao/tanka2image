'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, RotateCw, Palette, Type } from 'lucide-react';
import html2canvas from 'html2canvas';

const tankaSchema = z.object({
  content: z.string()
    .min(1, '短歌を入力してください')
    .max(40, '短歌は40文字以内で入力してください'),
  authorName: z.string().optional(),
  showDate: z.boolean(),
});

type TankaForm = z.infer<typeof tankaSchema>;

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
  const [settings, setSettings] = useState<TankaSettings>({
    style: 'VERTICAL',
    fontFamily: 'mincho',
    fontSize: 32,
    bgColor: '#FFFFFF',
    textColor: '#000000',
    width: 1200,
    height: 1600,
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<TankaForm>({
    resolver: zodResolver(tankaSchema),
    defaultValues: {
      content: '',
      authorName: '',
      showDate: true,
    },
  });

  const watchedContent = watch('content');
  const watchedAuthorName = watch('authorName');
  const watchedShowDate = watch('showDate');

  const handleExport = async (format: 'png' | 'jpeg') => {
    const element = document.getElementById('tanka-preview');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        width: settings.width,
        height: settings.height,
        scale: 2,
        backgroundColor: settings.bgColor,
      });

      const link = document.createElement('a');
      link.download = `tanka_${Date.now()}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined);
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('画像のエクスポートに失敗しました');
    }
  };

  const onSubmit = (data: TankaForm) => {
    console.log('Form submitted:', data);
  };

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
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  短歌内容 ({watchedContent.length}/40文字)
                </label>
                <textarea
                  {...register('content')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="短歌を入力してください..."
                />
                {errors.content && (
                  <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                  作者名（オプション）
                </label>
                <input
                  {...register('authorName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="作者名"
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register('showDate')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  作成日を表示する
                </label>
              </div>
            </form>

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
                    {(['VERTICAL', 'HORIZONTAL'] as const).map((style) => (
                      <label key={style} className="flex items-center">
                        <input
                          type="radio"
                          name="style"
                          value={style}
                          checked={settings.style === style}
                          onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value as TankaStyle }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {style === 'VERTICAL' ? '縦書き' : '横書き'}
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
            </div>

            {/* エクスポートボタン */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">エクスポート</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleExport('png')}
                  disabled={!watchedContent.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PNG形式
                </button>
                <button
                  onClick={() => handleExport('jpeg')}
                  disabled={!watchedContent.trim()}
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
                id="tanka-preview"
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
                  {watchedContent && (
                    <div className="mb-8">
                      {watchedContent.split('\n').map((line, index) => (
                        <div key={index} className={settings.style === 'VERTICAL' ? 'mb-4' : 'mb-2'}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(watchedAuthorName || watchedShowDate) && (
                    <div className="text-sm opacity-70 mt-8">
                      {watchedAuthorName && <div>{watchedAuthorName}</div>}
                      {watchedShowDate && <div>{new Date().toLocaleDateString('ja-JP')}</div>}
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