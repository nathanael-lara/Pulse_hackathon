'use client';

import { cn } from '@/lib/utils';

interface EditorialBackdropProps {
  className?: string;
  intensity?: 'subtle' | 'hero';
}

export function EditorialBackdrop({
  className,
  intensity = 'subtle',
}: EditorialBackdropProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-editorial-grid opacity-60" />
      <div className="absolute inset-0 bg-noise-overlay opacity-100" />
      <div
        className={cn(
          'absolute inset-0',
          intensity === 'hero' ? 'bg-aurora-veil opacity-100' : 'bg-aurora-veil opacity-55'
        )}
      />
      <div
        className={cn(
          'absolute inset-0',
          intensity === 'hero' ? 'bg-lens-whisper opacity-90' : 'bg-lens-whisper opacity-55'
        )}
      />
      <div className="absolute -left-[12%] top-[8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(78,171,255,0.16)_0%,rgba(78,171,255,0.02)_48%,transparent_72%)] blur-3xl" />
      <div className="absolute right-[-10%] top-[18%] h-[22rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(255,90,90,0.14)_0%,rgba(255,90,90,0.04)_42%,transparent_72%)] blur-3xl" />
      <div className="absolute bottom-[-12%] left-[18%] h-[20rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(26,214,176,0.12)_0%,rgba(26,214,176,0.03)_45%,transparent_72%)] blur-3xl" />
    </div>
  );
}
