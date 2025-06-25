import { Metadata } from 'next';
// import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

// const prisma = new PrismaClient();

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    // TODO: Implement database functionality
    // const tanka = await prisma.tanka.findUnique({
    //   where: { id },
    // });

    // Temporary metadata for build
    return {
      title: '短歌画像 - データベース未設定',
      description: 'データベースが設定されていないため、短歌データを取得できません。',
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

  // TODO: Implement database functionality
  // For now, show a placeholder page
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">短歌画像</h1>
          <p className="text-gray-600">短歌を美しい画像で共有</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">データベース未設定</h2>
            <p className="text-gray-600 mb-8">
              データベースが設定されていないため、短歌ID: {id} のデータを表示できません。
            </p>
            
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
    </div>
  );
}