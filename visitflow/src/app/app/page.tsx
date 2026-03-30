'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CorvasApp } from '@/components/app/CorvasApp';

function AppContent() {
  const searchParams = useSearchParams();
  return <CorvasApp initialView={searchParams.get('view')} />;
}

export default function AppPage() {
  return (
    <Suspense fallback={null}>
      <AppContent />
    </Suspense>
  );
}

