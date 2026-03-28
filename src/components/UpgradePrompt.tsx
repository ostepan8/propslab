'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Lock, ArrowRight } from 'lucide-react';

export default function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <Card className="max-w-md mx-auto border-primary/15 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {feature} requires a Pro or Elite subscription.
        </p>
        <Link href="/pricing" className={buttonVariants({ size: 'sm' }) + ' gap-1.5'}>
          View Plans
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
