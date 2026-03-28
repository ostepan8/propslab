'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  LayoutGrid,
  CreditCard,
  LayoutDashboard,
  Target,
  TrendingUp,
  LogOut,
  Menu,
  User,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, setUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('propslab_token');
    localStorage.removeItem('propslab_user');
    setUser(null);
    window.location.href = '/login';
  }

  const navLinks = [
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/models', label: 'Models', icon: LayoutGrid },
    { href: '/pricing', label: 'Pricing', icon: CreditCard },
  ];

  const authLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/picks', label: 'Picks', icon: Target },
    { href: '/paper-trades', label: 'Paper Trades', icon: TrendingUp },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/logo-icon.png" alt="PropsLab" width={28} height={28} className="rounded" />
              <span className="text-lg font-bold tracking-tight">
                Props<span className="text-primary">Lab</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated &&
                authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[13px] font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-md hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/60">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground font-medium">
                    {user?.full_name || user?.email}
                  </span>
                  <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0">
                    {user?.tier}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground gap-1.5">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                  Login
                </Link>
                <Link href="/register" className={buttonVariants({ size: 'sm' })}>
                  Get Started
                </Link>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors">
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image src="/logo-icon.png" alt="PropsLab" width={24} height={24} className="rounded" />
                  PropsLab
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <>
                    <Separator className="my-2" />
                    {authLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                        onClick={() => setMobileOpen(false)}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
                <Separator className="my-2" />
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 px-3">
                    <Link
                      href="/login"
                      className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' w-full'}
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={buttonVariants({ size: 'sm' }) + ' w-full'}
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
