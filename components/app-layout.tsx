'use client';

import { useState } from 'react';
import { HeaderCoins } from '@/components/header-coins';
import { BottomNav } from '@/components/bottom-nav';
import { FloatingButton } from '@/components/floating-button';
import { TapToEarnModal } from '@/components/tap-to-earn-modal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <HeaderCoins onCoinsClick={() => setModalOpen(true)} />
      <div className="min-h-screen pt-20 pb-24">
        {children}
      </div>
      <FloatingButton onClick={() => setModalOpen(true)} />
      <BottomNav />
      <TapToEarnModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
