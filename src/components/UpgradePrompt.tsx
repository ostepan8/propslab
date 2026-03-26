'use client';

import Link from 'next/link';

export default function UpgradePrompt({ feature }: { feature: string }) {
  return (
    <div className="border border-yellow-800 bg-yellow-950/30 rounded-xl p-8 text-center max-w-lg mx-auto">
      <h3 className="text-xl font-semibold text-yellow-400 mb-2">Upgrade Required</h3>
      <p className="text-gray-400 mb-6">
        {feature} requires a Pro or Elite subscription.
      </p>
      <Link
        href="/pricing"
        className="inline-block bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        View Plans
      </Link>
    </div>
  );
}
