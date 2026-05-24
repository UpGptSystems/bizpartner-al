import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-950 flex flex-col">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl w-fit">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-black">
            B
          </div>
          <span className="text-white">BizPartner AL</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
