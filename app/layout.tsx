import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppLayout } from '@/components/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EazyBet - Pariez et Gagnez',
  description: 'Application de paris sportifs fictifs avec système de jetons',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
