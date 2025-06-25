import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/tanka-icon.png"
              alt="tanka2image"
              width={40}
              height={40}
              className="rounded-lg shadow-sm"
              priority
            />
            <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 font-serif">
              tanka2image
            </h1>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/export"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
            >
              作品を作る
            </a>
          </nav>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <Image
            src="/tanka-icon.png"
            alt="tanka2image"
            width={80}
            height={80}
            className="mx-auto mb-6 rounded-2xl shadow-lg"
            priority
          />
        </div>
        <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4 font-serif">
          短歌を美しい画像に
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          短歌を入力して、縦長の美しい画像に変換・エクスポート。<br />
          SNSでのシェアに最適な画像を簡単に作成できます。
        </p>

        <div className="flex gap-4 items-center justify-center flex-col sm:flex-row">
          <a
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            href="/export"
          >
            今すぐ短歌を作る
          </a>
          <a
            className="rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium px-8 py-3 transition-colors"
            href="#features"
          >
            機能を見る
          </a>
        </div>
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © 2025 tanka2image. 短歌を美しい画像に変換するアプリです。
          </p>
        </div>
      </footer>
    </div>
  );
}
