'use client';

import Link from 'next/link';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassButton } from '../components/ui/GlassButton';
import { Edit, Image, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘロー */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[var(--lg-text-primary)] mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              短歌
            </span>
            <span className="text-[var(--lg-text-primary)]">
              を美しい画像に
            </span>
          </h1>
          <p className="text-xl text-[var(--lg-text-secondary)] mb-8">
            あなたの短歌を縦長の美しい画像に変換し、SNSでシェアしましょう
          </p>
        </div>

        {/* メイン機能カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <GlassCard hoverable lens className="text-center">
            <Edit size={48} className="mx-auto mb-4 text-[var(--lg-accent)]" />
            <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-2">
              簡単入力
            </h3>
            <p className="text-sm text-[var(--lg-text-secondary)]">
              短歌を入力するだけで自動的に文字数カウント。改行位置も自由に調整できます。
            </p>
          </GlassCard>

          <GlassCard hoverable lens className="text-center">
            <Sparkles size={48} className="mx-auto mb-4 text-[var(--lg-accent)]" />
            <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-2">
              豊富なカスタマイズ
            </h3>
            <p className="text-sm text-[var(--lg-text-secondary)]">
              縦書き・横書き、フォント、色設定など、お好みに合わせて画像をカスタマイズ。
            </p>
          </GlassCard>

          <GlassCard hoverable lens className="text-center">
            <Image size={48} className="mx-auto mb-4 text-[var(--lg-accent)]" />
            <h3 className="text-lg font-semibold text-[var(--lg-text-primary)] mb-2">
              高品質エクスポート
            </h3>
            <p className="text-sm text-[var(--lg-text-secondary)]">
              PNG・JPEG形式で高品質な画像を生成。X（旧Twitter）での投稿に最適化。
            </p>
          </GlassCard>
        </div>

        {/* CTA */}
        <div className="text-center">
          <GlassCard className="inline-block">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[var(--lg-text-primary)] mb-4">
                今すぐ始めよう
              </h2>
              <p className="text-[var(--lg-text-secondary)] mb-6">
                美しい短歌画像を作成して、あなたの想いを世界に発信しましょう
              </p>
              <Link href="/export">
                <GlassButton size="lg" className="px-12">
                  短歌画像を作成する
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* 使い方 */}
        <div className="mt-16">
          <GlassCard>
            <h2 className="text-2xl font-bold text-[var(--lg-text-primary)] mb-6 text-center">
              使い方
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--lg-accent)] text-white flex items-center justify-center mx-auto mb-3 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-[var(--lg-text-primary)] mb-2">
                  短歌を入力
                </h3>
                <p className="text-sm text-[var(--lg-text-secondary)]">
                  31文字程度の短歌を入力します
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--lg-accent)] text-white flex items-center justify-center mx-auto mb-3 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-[var(--lg-text-primary)] mb-2">
                  スタイル設定
                </h3>
                <p className="text-sm text-[var(--lg-text-secondary)]">
                  フォント・色・レイアウトを選択
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--lg-accent)] text-white flex items-center justify-center mx-auto mb-3 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-[var(--lg-text-primary)] mb-2">
                  プレビュー
                </h3>
                <p className="text-sm text-[var(--lg-text-secondary)]">
                  リアルタイムで仕上がりを確認
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--lg-accent)] text-white flex items-center justify-center mx-auto mb-3 font-bold">
                  4
                </div>
                <h3 className="font-semibold text-[var(--lg-text-primary)] mb-2">
                  エクスポート
                </h3>
                <p className="text-sm text-[var(--lg-text-secondary)]">
                  画像をダウンロード・シェア
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
