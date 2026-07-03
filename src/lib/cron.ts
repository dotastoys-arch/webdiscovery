import { NextRequest } from 'next/server';

// Beveiligt cron-endpoints. Vercel Cron stuurt de header
// `Authorization: Bearer <CRON_SECRET>` mee (of zet je zelf).
export function assertCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}
