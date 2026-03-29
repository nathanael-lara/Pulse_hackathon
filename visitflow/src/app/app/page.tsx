'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useAppStore } from '@/lib/store';
import { OverviewView } from '@/components/views/OverviewView';
import { LiveVisitView } from '@/components/views/LiveVisitView';
import { RehabView } from '@/components/views/RehabView';
import { PreVisitView } from '@/components/views/PreVisitView';
import { PostVisitView } from '@/components/views/PostVisitView';
import { MessagesView } from '@/components/views/MessagesView';
import { MedicationsView } from '@/components/views/MedicationsView';
import { DocumentsView } from '@/components/views/DocumentsView';
import { PeersView } from '@/components/views/PeersView';
import { Heart } from 'lucide-react';

const VIEW_MAP: Record<string, React.ComponentType> = {
  overview: OverviewView,
  'live-visit': LiveVisitView,
  rehab: RehabView,
  'pre-visit': PreVisitView,
  'post-visit': PostVisitView,
  messages: MessagesView,
  medications: MedicationsView,
  documents: DocumentsView,
  peers: PeersView,
};

function AppContent() {
  const { activeView, setActiveView } = useAppStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam && VIEW_MAP[viewParam]) {
      setActiveView(viewParam);
    }
  }, [searchParams, setActiveView]);

  const ViewComponent = VIEW_MAP[activeView] ?? OverviewView;

  return (
    <AppShell>
      <ViewComponent />
    </AppShell>
  );
}

function LoadingShell() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Heart className="w-5 h-5 text-primary heartbeat" />
        <span className="text-sm">Loading VisitFlow...</span>
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <AppContent />
    </Suspense>
  );
}
