import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import ClientLayout from './client-layout';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
