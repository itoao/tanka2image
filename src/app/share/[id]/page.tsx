import { Metadata } from 'next';
import { PrismaClient } from '../../../generated/prisma';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const tanka = await prisma.tanka.findUnique({
      where: { id },
    });

    if (!tanka) {
      return {
        title: '短歌が見つかりません',
        description: '指定された短歌は存在しないか、削除された可能性があります。',
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const ogpImageUrl = `${baseUrl}/api/ogp/${id}`;
    const shareUrl = `${baseUrl}/share/${id}`;

    // Truncate content for description (max 160 chars)
    const description = tanka.content.length > 157 
      ? `${tanka.content.substring(0, 157)}...` 
      : tanka.content;

    return {
      title: `短歌画像 | ${tanka.content.substring(0, 20)}${tanka.content.length > 20 ? '...' : ''}`,
      description: `${description}${tanka.authorName ? ` - ${tanka.authorName}` : ''}`,
      openGraph: {
        title: `短歌画像 | ${tanka.content.substring(0, 30)}${tanka.content.length > 30 ? '...' : ''}`,
        description,
        url: shareUrl,
        siteName: '短歌2画像',
        images: [
          {
            url: ogpImageUrl,
            width: tanka.width,
            height: tanka.height,
            alt: `短歌: ${tanka.content}`,
            type: 'image/png',
          },
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `短歌画像 | ${tanka.content.substring(0, 30)}${tanka.content.length > 30 ? '...' : ''}`,
        description,
        images: [ogpImageUrl],
        creator: '@tanka2image',
        site: '@tanka2image',
      },
      alternates: {
        canonical: shareUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'エラーが発生しました',
      description: 'メタデータの生成中にエラーが発生しました。',
    };
  }
}

export default async function SharePage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const tanka = await prisma.tanka.findUnique({
      where: { id },
    });

    if (!tanka) {
      notFound();
    }

    // Update view count
    await prisma.share.updateMany({
      where: { tankaId: id },
      data: { viewCount: { increment: 1 } },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${id}`;
    const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `短歌を画像にしました\n\n"${tanka.content}"\n\n`
    )}&url=${encodeURIComponent(shareUrl)}`;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">短歌画像</h1>
            <p className="text-gray-600">短歌を美しい画像で共有</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Preview */}
            <div className="flex justify-center mb-8">
              <div
                className={`
                  border border-gray-200 flex items-center justify-center relative
                  ${tanka.style === 'VERTICAL' ? 'vertical-text' : ''}
                  ${tanka.fontFamily === 'mincho' ? 'font-mincho' : 'font-gothic'}
                `}
                style={{
                  width: `${tanka.width / 4}px`,
                  height: `${tanka.height / 4}px`,
                  backgroundColor: tanka.bgColor,
                  color: tanka.textColor,
                  fontSize: `${(tanka.fontSize || 32) / 4}px`,
                  lineHeight: tanka.style === 'VERTICAL' ? '1.8' : '1.6',
                  padding: '40px',
                }}
              >
                <div className="text-center">
                  {tanka.content && (
                    <div className="mb-8">
                      {tanka.content.split('\n').map((line, index) => (
                        <div key={index} className={tanka.style === 'VERTICAL' ? 'mb-4' : 'mb-2'}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {(tanka.authorName || tanka.showDate) && (
                    <div className="text-sm opacity-70 mt-8">
                      {tanka.authorName && <div>{tanka.authorName}</div>}
                      {tanka.showDate && <div>{tanka.createdAt.toLocaleDateString('ja-JP')}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex justify-center space-x-4">
              <a
                href={xShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Xでシェア
              </a>
              
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                URLをコピー
              </button>
            </div>

            {/* Tanka Details */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-900">文字方向</dt>
                  <dd className="text-gray-600">{tanka.style === 'VERTICAL' ? '縦書き' : '横書き'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">フォント</dt>
                  <dd className="text-gray-600">{(tanka.fontFamily || 'mincho') === 'mincho' ? '明朝体' : 'ゴシック体'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">画像サイズ</dt>
                  <dd className="text-gray-600">{tanka.width} × {tanka.height}px</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">作成日</dt>
                  <dd className="text-gray-600">{tanka.createdAt.toLocaleDateString('ja-JP')}</dd>
                </div>
              </dl>
            </div>

            {/* Back to Editor */}
            <div className="mt-8 text-center">
              <a
                href="/export"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← 新しい短歌を作成する
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading share page:', error);
    notFound();
  }
}