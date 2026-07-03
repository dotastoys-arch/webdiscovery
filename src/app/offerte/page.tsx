import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site-chrome';
import { OfferteForm } from './offerte-form';

export const metadata: Metadata = {
  title: 'Offerte aanvragen — WebDiscovery',
  description: 'Vraag vrijblijvend een offerte of gratis ontwerp aan. Vanaf €500 volledig live.',
};

export default function OffertePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-6 py-16">
        <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em]">Vraag een offerte aan</h1>
        <p className="mt-3 text-neutral-600">
          Vertel ons kort wat je zoekt. Je krijgt vrijblijvend een voorstel — en vaak zelfs alvast
          een ontwerp om te bekijken. Een complete website is er vanaf €500,-.
        </p>
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6">
          <OfferteForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
