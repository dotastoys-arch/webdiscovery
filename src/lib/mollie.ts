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
