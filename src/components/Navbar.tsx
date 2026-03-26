'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('propslab_token');
    localStorage.removeItem('propslab_user');
    setUser(null);
    window.location.href = '/login';
  }

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-green-400 tracking-tight">
              PropsLab
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/leaderboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                Leaderboard
              </Link>
              <Link href="/models" className="text-sm text-gray-400 hover:text-white transition-colors">
                Models
              </Link>
              <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/picks" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Picks
                  </Link>
                  <Link href="/paper-trades" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Paper Trades
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-400">
                  {user?.full_name || user?.email}
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-900/50 text-green-400 border border-green-800">
                    {user?.tier}
                  </span>
                </span>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4 space-y-3">
          <Link href="/leaderboard" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            Leaderboard
          </Link>
          <Link href="/models" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            Models
          </Link>
          <Link href="/pricing" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link href="/picks" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                Picks
              </Link>
              <Link href="/paper-trades" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                Paper Trades
              </Link>
              <button onClick={handleLogout} className="block text-sm text-gray-400 hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
              <Link href="/register" className="block text-sm text-green-400 hover:text-green-300" onClick={() => setMobileOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
