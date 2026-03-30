import Link from 'next/link';
import { Heart, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f6fbfb,#edf4f3)] px-4">
      <div className="max-w-lg rounded-[32px] border border-white/75 bg-white/92 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[var(--color-panel-soft)] text-[var(--color-teal-deep)]">
          <WifiOff className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
          You are offline.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">
          CorVas can still open your saved recovery information on this device. If a page does not load, head back to the app shell.
        </p>
        <Link
          href="/app"
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-teal-deep)] px-5 py-3 text-base font-semibold text-white"
        >
          <Heart className="h-5 w-5" />
          Return to CorVas
        </Link>
      </div>
    </main>
  );
}

