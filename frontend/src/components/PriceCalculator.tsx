import React, { useState } from 'react';
import { Card } from './ui/Card';

export default function PriceCalculator() {
  const [claims, setClaims] = useState(200);

  const freeClaims = 25;
  const billable = Math.max(0, claims - freeClaims);
  const rate = claims >= 500 ? 3.5 : 4;
  const price = billable * rate;
  const manualCostLow = claims * 20;
  const manualCostHigh = claims * 60;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-center mb-4">
        See what you'd pay &mdash; $4/claim, first 25 free
      </h3>
      <div className="container mx-auto max-w-xl px-6">
        <Card className="space-y-4 p-6">
          <div>
            <label className="block font-medium mb-1">
              Claims per month: <span className="font-semibold">{claims}</span>
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="25"
              value={claims}
              onChange={e => setClaims(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <p className="text-center text-lg font-semibold">
            {claims.toLocaleString()} claims = {price === 0 ? 'Free' : `$${price.toLocaleString()}/month`}
          </p>
          {claims >= 500 && (
            <p className="text-center text-sm text-emerald-600">
              Volume discount applied: $3.50/claim
            </p>
          )}
          {claims <= 25 && claims > 0 && (
            <p className="text-center text-sm text-emerald-600">
              Covered by your free monthly allowance
            </p>
          )}
          <p className="text-center text-sm text-gray-500">
            vs. ${manualCostLow.toLocaleString()}–${manualCostHigh.toLocaleString()}/mo manual prep cost ($20–$60/claim)
          </p>
          <p className="text-center text-xs text-gray-400">
            No subscriptions &bull; No seat licenses &bull; No annual contracts
          </p>
        </Card>
      </div>
    </section>
  );
}
