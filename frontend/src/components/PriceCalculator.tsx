import React, { useState } from 'react';
import { Card } from './ui/Card';

export default function PriceCalculator() {
  const [invoices, setInvoices] = useState(5000);
  const [users, setUsers] = useState(4);

  const price = (invoices / 1000) * 10 + users * 5;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <h3 className="text-2xl font-bold text-center mb-4">
        Need more invoices or team members? Customize your plan.
      </h3>
      <div className="container mx-auto max-w-xl px-6">
        <Card className="space-y-4 p-6">
          <div>
            <label className="block font-medium mb-1">
              Invoices per month: <span className="font-semibold">{invoices}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="20000"
              step="1000"
              value={invoices}
              onChange={e => setInvoices(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">
              Team members: <span className="font-semibold">{users}</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={users}
              onChange={e => setUsers(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <p className="text-center text-lg font-semibold">
            {invoices.toLocaleString()} invoices &bull; {users} users = ${price}/month
          </p>
        </Card>
      </div>
    </section>
  );
}
