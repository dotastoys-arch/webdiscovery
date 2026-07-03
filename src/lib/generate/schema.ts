import { z } from 'zod';
import type { ModuleId } from '@/lib/modules';

// De structuur van een gegenereerde website. De preview-pagina rendert dit,
// de klant beheert het later via het CMS. Extra secties zijn optioneel zodat
// oudere gegenereerde sites blijven werken.
export const siteContentSchema = z.object({
  brand: z.object({
    name: z.string(),
    tagline: z.string(),
  }),
  theme: z.object({
    accent: z.string().default('#2563eb'), // hex-kleur
  }),
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaLabel: z.string().default('Neem contact op'),
    ctaSecondary: z.string().nullable().optional(),
  }),
  highlights: z.array(z.string()).default([]),
  stats: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .default([]),
  about: z.object({
    title: z.string(),
    body: z.string(),
  }),
  services: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .default([]),
  // Branche-specifieke menukaart (restaurant/horeca).
  menu: z
    .array(z.object({ name: z.string(), description: z.string().default(''), price: z.string().default('') }))
    .default([]),
  reviews: z
    .array(z.object({ name: z.string(), text: z.string() }))
    .default([]),
  faq: z
    .array(z.object({ q: z.string(), a: z.string() }))
    .default([]),
  openingHours: z
    .array(z.object({ day: z.string(), hours: z.string() }))
    .default([]),
  cta: z
    .object({
      title: z.string(),
      subtitle: z.string().default(''),
      buttonLabel: z.string().default('Neem contact op'),
    })
    .nullable()
    .optional(),
  contact: z.object({
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

export interface GeneratedResult {
  content: SiteContent;
  modules: ModuleId[];
}
