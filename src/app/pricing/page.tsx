'use client';

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star, ArrowRight } from 'lucide-react';

interface TierConfig {
  readonly name: string;
  readonly price: string;
  readonly period: string;
  readonly icon: typeof Star;
  readonly iconBg: string;
  readonly iconFg: string;
  readonly features: readonly string[];
  readonly highlighted: boolean;
  readonly tierKey?: string;
  readonly buttonVariant: 'outline' | 'default' | 'secondary';
}

const TIERS: readonly TierConfig[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Star,
    iconBg: 'bg-muted',
    iconFg: 'text-muted-foreground',
    features: [
      'Model leaderboard access',
      'Model backtest data',
      'Paper trading (limited)',
      'Community access',
    ],
    highlighted: false,
    buttonVariant: 'outline',
  },
  {
    name: 'Pro',
    price: '$30',
    period: '/month',
    icon: Zap,
    iconBg: 'bg-primary/10',
    iconFg: 'text-primary',
    features: [
      'Everything in Free',
      'Daily picks (all models)',
      'Full pick history',
      'Unlimited paper trading',
      'Advanced filters & stats',
    ],
    highlighted: true,
    tierKey: 'pro',
    buttonVariant: 'default',
  },
  {
    name: 'Elite',
    price: '$200',
    period: '/month',
    icon: Crown,
    iconBg: 'bg-amber-500/10',
    iconFg: 'text-amber-500',
    features: [
      'Everything in Pro',
      'Early access to picks',
      'Model confidence scores',
      'API access',
      'Priority support',
      'Custom alerts',
    ],
    highlighted: false,
    tierKey: 'elite',
    buttonVariant: 'secondary',
  },
] as const;

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground">Start free. Upgrade when you&apos;re ready for the edge.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TIERS.map((tier) => {
          const isCurrent = user?.tier === (tier.tierKey || 'free');
          const buttonLabel = isCurrent
            ? 'Current Plan'
            : tier.tierKey
              ? `Upgrade to ${tier.name}`
              : isAuthenticated
                ? 'Current Plan'
                : 'Get Started';
          const href = !tier.tierKey && !isAuthenticated ? '/register' : undefined;

          return (
            <PricingCard
              key={tier.name}
              tier={tier}
              current={isCurrent}
              buttonLabel={buttonLabel}
              href={href}
              isAuthenticated={isAuthenticated}
            />
          );
        })}
      </div>
    </div>
  );
}

function PricingCard({
  tier,
  current,
  buttonLabel,
  href,
  isAuthenticated,
}: {
  tier: TierConfig;
  current?: boolean;
  buttonLabel: string;
  href?: string;
  isAuthenticated?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const Icon = tier.icon;

  async function handleCheckout() {
    if (href) {
      window.location.href = href;
      return;
    }
    if (!tier.tierKey || !isAuthenticated || current) return;

    setLoading(true);
    try {
      const data = await api<{ checkout_url: string }>('/billing/checkout', {
        method: 'POST',
        auth: true,
        body: { tier: tier.tierKey },
      });
      window.location.href = data.checkout_url;
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className={`flex flex-col relative ${tier.highlighted ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      {tier.highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Most Popular
        </Badge>
      )}
      <CardHeader className="text-center">
        <div className={`w-12 h-12 rounded-full ${tier.iconBg} flex items-center justify-center mx-auto mb-3`}>
          <Icon className={`w-6 h-6 ${tier.iconFg}`} />
        </div>
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1 mt-1">
          <span className="text-4xl font-bold text-foreground">{tier.price}</span>
          <span className="text-muted-foreground text-sm">{tier.period}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <ul className="space-y-3 mb-8 flex-1">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button
          onClick={handleCheckout}
          disabled={current || loading}
          variant={tier.buttonVariant}
          className="w-full"
        >
          {loading ? 'Loading...' : current ? buttonLabel : (
            <span className="inline-flex items-center gap-2">
              {buttonLabel}
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
