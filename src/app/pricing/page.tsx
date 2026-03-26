'use client';

import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useState } from 'react';

export default function PricingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-3">Simple, Transparent Pricing</h1>
        <p className="text-gray-400">Start free. Upgrade when you&apos;re ready for the edge.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <PricingCard
          name="Free"
          price="$0"
          period="forever"
          features={[
            'Model leaderboard access',
            'Model backtest data',
            'Paper trading (limited)',
            'Community access',
          ]}
          current={user?.tier === 'free'}
          buttonLabel={user?.tier === 'free' ? 'Current Plan' : 'Get Started'}
          href={isAuthenticated ? undefined : '/register'}
        />
        <PricingCard
          name="Pro"
          price="$30"
          period="/month"
          features={[
            'Everything in Free',
            'Daily picks (all models)',
            'Full pick history',
            'Unlimited paper trading',
            'Advanced filters & stats',
          ]}
          highlighted
          current={user?.tier === 'pro'}
          buttonLabel={user?.tier === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
          tier="pro"
          isAuthenticated={isAuthenticated}
        />
        <PricingCard
          name="Elite"
          price="$200"
          period="/month"
          features={[
            'Everything in Pro',
            'Early access to picks',
            'Model confidence scores',
            'API access',
            'Priority support',
            'Custom alerts',
          ]}
          current={user?.tier === 'elite'}
          buttonLabel={user?.tier === 'elite' ? 'Current Plan' : 'Upgrade to Elite'}
          tier="elite"
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  highlighted,
  current,
  buttonLabel,
  href,
  tier,
  isAuthenticated,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
  buttonLabel: string;
  href?: string;
  tier?: string;
  isAuthenticated?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (href) {
      window.location.href = href;
      return;
    }
    if (!tier || !isAuthenticated || current) return;

    setLoading(true);
    try {
      const data = await api<{ checkout_url: string }>('/billing/checkout', {
        method: 'POST',
        auth: true,
        body: { tier },
      });
      window.location.href = data.checkout_url;
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl p-6 flex flex-col ${
        highlighted
          ? 'bg-green-950/30 border-2 border-green-600 relative'
          : 'bg-gray-900/50 border border-gray-800'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-3xl font-bold text-white">{price}</span>
        <span className="text-gray-400 text-sm">{period}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={handleCheckout}
        disabled={current || loading}
        className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
          current
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : highlighted
            ? 'bg-green-600 hover:bg-green-500 text-white'
            : 'border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white'
        }`}
      >
        {loading ? 'Loading...' : buttonLabel}
      </button>
    </div>
  );
}
