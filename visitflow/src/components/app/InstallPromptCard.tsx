'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { PrimaryButton, SectionCard } from '@/components/app/ui';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isIos() {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallPromptCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed] = useState(() => {
    if (typeof window === 'undefined') return false;
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    return standalone || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (installed) {
    return (
      <SectionCard tone="soft">
        <div className="flex items-center gap-3">
          <Smartphone className="h-6 w-6 text-[var(--color-teal-deep)]" />
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Installed</h2>
            <p className="mt-2 text-base leading-7 text-slate-700">
              CorVas is already running like an app on this device.
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard>
      <div className="flex items-center gap-3">
        <Download className="h-6 w-6 text-[var(--color-teal-deep)]" />
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Install on this phone</h2>
          <p className="mt-2 text-base leading-7 text-slate-700">
            Installing makes CorVas feel more like a real app and helps with offline access.
          </p>
        </div>
      </div>
      <div className="mt-5">
        {deferredPrompt ? (
          <PrimaryButton
            onClick={async () => {
              await deferredPrompt.prompt();
              await deferredPrompt.userChoice;
              setDeferredPrompt(null);
            }}
          >
            Install CorVas
          </PrimaryButton>
        ) : isIos() ? (
          <div className="rounded-[22px] bg-[var(--color-panel-soft)] px-4 py-4 text-base leading-7 text-slate-700">
            On iPhone, tap Share in Safari, then choose <strong>Add to Home Screen</strong>.
          </div>
        ) : (
          <div className="rounded-[22px] bg-[var(--color-panel-soft)] px-4 py-4 text-base leading-7 text-slate-700">
            If your browser does not show the install button yet, open the browser menu and choose <strong>Install app</strong>.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
