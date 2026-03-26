'use client';

import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        PropsLab &copy; {new Date().getFullYear()} &mdash; AI-powered NBA player props analytics
      </footer>
    </AuthProvider>
  );
}
