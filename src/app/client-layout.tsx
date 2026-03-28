'use client';

import { AuthProvider } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <footer className="border-t bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FlaskConical className="w-4 h-4" />
              <span className="text-sm font-medium">PropsLab</span>
              <span className="text-sm">&copy; {new Date().getFullYear()}</span>
            </div>
            <p className="text-xs text-muted-foreground">AI-powered NBA player props analytics. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </AuthProvider>
  );
}
