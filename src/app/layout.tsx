import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'PropsLab - NBA Player Props Analytics',
  description: 'AI-powered NBA player props predictions with backtested models, leaderboards, and paper trading.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={dmSans.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
