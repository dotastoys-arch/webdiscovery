import createMollieClient, { type MollieClient } from '@mollie/api-client';

// Dunne wrapper rond Mollie. Werkt pas als MOLLIE_API_KEY gezet is.
let _client: MollieClient | null = null;

export function hasMollie(): boolean {
  return !!process.env.MOLLIE_API_KEY;
}

export function mollie(): MollieClient {
  if (!process.env.MOLLIE_API_KEY) throw new Error('MOLLIE_API_KEY ontbreekt');
  if (!_client) _client = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  return _client;
}

export function euroValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

// Maandelijkse incasso alleen aanzetten als het Mollie-account daarvoor
// geactiveerd is (recurring/SEPA). Tot die tijd blijft de gewone €500-flow werken.
export function hasRecurring(): boolean {
  return hasMollie() && process.env.MOLLIE_RECURRING === 'true';
}

// Maakt een Mollie-klant aan (nodig om later automatisch te kunnen incasseren).
export async function createCustomer(name: string | null, email: string | null): Promise<string> {
  const customer = await mollie().customers.create({
    name: name || 'Klant',
    ...(email ? { email } : {}),
  });
  return customer.id;
}

// Start een maandelijks abonnement op een bestaande klant (met geldige machtiging).
export async function createMonthlySubscription(opts: {
  customerId: string;
  amountCents: number;
  description: string;
  webhookUrl: string;
  startDate: string; // YYYY-MM-DD — eerste incasso
}): Promise<string> {
  const sub = await mollie().customerSubscriptions.create({
    customerId: opts.customerId,
    amount: { currency: 'EUR', value: euroValue(opts.amountCents) },
    interval: '1 month',
    description: opts.description,
    webhookUrl: opts.webhookUrl,
    startDate: opts.startDate,
  });
  return sub.id;
}

export async function cancelSubscription(customerId: string, subscriptionId: string): Promise<void> {
  await mollie().customerSubscriptions.cancel(subscriptionId, { customerId });
}
