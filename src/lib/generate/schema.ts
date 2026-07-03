import { z } from 'zod';
import type { ModuleId } from '@/lib/modules';

// De structuur van een gegenereerde website. De preview-pagina rendert dit,
// de klant beheert het later via het CMS.
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
  }),
  about: z.object({
    title: z.string(),
    body: z.string(),
  }),
  services: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .default([]),
  highlights: z.array(z.string()).default([]),
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
