import type { Block, BlockData, BlockType, SiteDoc } from './types';
import { newId } from './types';

// Startinhoud = de oorspronkelijke one-pager. Wordt gebruikt zolang er nog
// niets in de database staat.

const noImage = { id: '', alt: '' };

export const BLOCK_LABELS: Record<BlockType, { name: string; hint: string }> = {
  hero: { name: 'Openingsblok', hint: 'Grote titel bovenaan met knoppen' },
  services: { name: 'Diensten', hint: 'Raster met diensten en iconen' },
  steps: { name: 'Werkwijze', hint: 'Stappen onder elkaar' },
  focus: { name: 'Regio’s / kaarten', hint: 'Donkere kaarten met korte titel' },
  text: { name: 'Tekst', hint: 'Titel met alinea’s' },
  image: { name: 'Foto', hint: 'Eén grote foto met onderschrift' },
  imageText: { name: 'Foto + tekst', hint: 'Foto naast een tekst' },
  gallery: { name: 'Fotogalerij', hint: 'Meerdere foto’s in een raster' },
  quote: { name: 'Citaat', hint: 'Uitspraak of referentie' },
  cta: { name: 'Actiebalk', hint: 'Opvallende balk met knop' },
  contact: { name: 'Contactformulier', hint: 'Formulier dat mailt naar AITD' },
};

export function blockTemplate<T extends BlockType>(type: T): BlockData<T> {
  const t: { [K in BlockType]: BlockData<K> } = {
    hero: {
      eyebrow: 'Your eyebrow text',
      title: 'A strong headline.',
      highlight: 'A second line.',
      text: 'A short introduction for your visitors.',
      primary: { label: 'Contact us', href: '#contact' },
      secondary: { label: '', href: '' },
      visual: 'none',
      image: noImage,
      strip: '',
    },
    services: {
      label: 'What we do',
      title: 'Our services',
      items: [
        { icon: 'globe', title: 'Service one', text: 'Describe this service.' },
        { icon: 'chart', title: 'Service two', text: 'Describe this service.' },
      ],
    },
    steps: {
      label: 'How we work',
      title: 'Our approach',
      text: '',
      steps: [
        { title: 'Step one', text: 'Describe this step.' },
        { title: 'Step two', text: 'Describe this step.' },
      ],
      finalTitle: 'The result',
      finalText: 'Describe the outcome.',
    },
    focus: {
      label: 'Regional focus',
      cards: [{ tag: 'TAG', title: 'Card title' }],
      note: '',
    },
    text: { label: '', title: 'A new section', body: 'Write your text here.', align: 'left', background: 'white' },
    image: { image: noImage, caption: '', size: 'contained' },
    imageText: {
      label: '',
      title: 'Title next to the photo',
      text: 'Write your text here.',
      image: noImage,
      side: 'left',
      background: 'white',
    },
    gallery: { label: '', title: 'Gallery', images: [] },
    quote: { text: 'A short quote or testimonial.', author: 'Name', role: 'Role, organisation' },
    cta: {
      title: 'Ready to talk?',
      text: 'Let us know what you need.',
      button: { label: 'Get in touch', href: '#contact' },
      background: 'navy',
    },
    contact: {
      label: 'Contact',
      title: 'Facing a complex environment? Let’s talk.',
      text: 'Tell us about your requirements and we will propose an analytical product that fits — in confidence.',
    },
  };
  return structuredClone(t[type]) as BlockData<T>;
}

export function makeBlock(type: BlockType): Block {
  return { id: newId(), type, nav: '', data: blockTemplate(type) } as Block;
}

// About-onderdeel (op verzoek van de klant toegevoegd, oktober 2026).
export function aboutBlock(): Block {
  return {
    id: 'about',
    type: 'text',
    nav: 'About',
    data: {
      label: 'About',
      title: 'Independent political and security analysis',
      body:
        'Independent political and security analyst with over 20 years’ experience delivering intelligence reports, threat assessments, and strategic insights for the United Nations, international tribunals, and other agencies.\n\n' +
        'I specialise in helping organisations understand complex political and security environments so they can make informed decisions, manage risk, and operate safely.',
      align: 'left',
      background: 'light',
    },
  };
}

export function defaultSite(): SiteDoc {
  return {
    layout: 'one_page',
    settings: {
      seoTitle: 'AITD Consulting — Geopolitical analysis & strategic foresight',
      seoDescription:
        'AITD Consulting provides tailored geopolitical analysis, scenario modelling, situational awareness and imagery analysis, with a focus on MENA and the Horn of Africa.',
      headerCta: { label: 'Contact', href: '#contact' },
    },
    pages: [
      {
        id: 'home',
        slug: '',
        title: 'Home',
        blocks: [
          {
            id: 'hero',
            type: 'hero',
            nav: '',
            data: {
              eyebrow: 'Geopolitical risk & intelligence advisory',
              title: 'Strategic foresight.',
              highlight: 'All in the detail.',
              text: 'Tailored, client-specific analysis that helps you anticipate what comes next — built on open sources, informed interlocutors and field visits.',
              primary: { label: 'Discuss your requirements', href: '#contact' },
              secondary: { label: 'Our services', href: '#services' },
              visual: 'radar',
              image: noImage,
              strip: 'Focus: Middle East & North Africa · Horn of Africa',
            },
          },
          aboutBlock(),
          {
            id: 'services',
            type: 'services',
            nav: 'Services',
            data: {
              label: 'What we do',
              title: 'Four disciplines, one aim: decisions informed by the full picture.',
              items: [
                {
                  icon: 'globe',
                  title: 'Geopolitical analysis',
                  text: 'Fusing information from open sources, informed interlocutors and field visits, we provide tailored reporting with client-specific analysis that offers strategic foresight. We focus on MENA and the Horn of Africa but can leverage expertise across other geographical and subject-matter areas.',
                },
                {
                  icon: 'scenario',
                  title: 'Scenario modelling',
                  text: 'Using structured analytical techniques, we anticipate possible outcomes and identify warnings and indicators that inform strategy and allow contingency planning.',
                },
                {
                  icon: 'radar',
                  title: 'Situational awareness',
                  text: 'We provide active monitoring of flash points and crisis events with the ability to provide rapid threat assessments.',
                },
                {
                  icon: 'imagery',
                  title: 'Imagery analysis',
                  text: 'We use tactical imagery analysis and geolocation to support broader assessments and can provide stand-alone analytical products.',
                },
              ],
            },
          },
          {
            id: 'approach',
            type: 'steps',
            nav: 'Approach',
            data: {
              label: 'Our approach',
              title: 'Multiple sources. One clear assessment.',
              text: 'We fuse information from different streams and apply structured analytical techniques, so every product is tailored to your questions — not generic reporting.',
              steps: [
                { title: 'Open sources', text: 'Systematic collection and verification of publicly available information.' },
                { title: 'Informed interlocutors', text: 'Insight from trusted contacts with direct knowledge of the ground.' },
                { title: 'Field visits', text: 'First-hand observation where it matters most.' },
              ],
              finalTitle: 'Tailored analysis & strategic foresight',
              finalText:
                'Client-specific reporting, scenarios with warnings and indicators, and rapid threat assessments when events unfold.',
            },
          },
          {
            id: 'focus',
            type: 'focus',
            nav: 'Focus',
            data: {
              label: 'Regional focus',
              cards: [
                { tag: 'MENA', title: 'Middle East & North Africa' },
                { tag: 'HoA', title: 'Horn of Africa' },
              ],
              note: 'Beyond our core regions, we can leverage expertise across other geographical and subject-matter areas.',
            },
          },
          {
            id: 'contact',
            type: 'contact',
            nav: '',
            data: {
              label: 'Contact',
              title: 'Facing a complex environment? Let’s talk.',
              text: 'Tell us about your requirements and we will propose an analytical product that fits — in confidence.',
            },
          },
        ],
      },
    ],
  };
}
