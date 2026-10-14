import { getPublishedInfo } from '@/lib/aitd/db';
import type { Block } from '@/lib/aitd/types';
import { AITD_ORIGIN, pagePath, seoContext, visiblePages } from '@/lib/aitd/seo';

// aitdconsulting.eu/llms.txt — samenvatting van de site voor AI-zoekmachines
// (llmstxt.org). Wordt automatisch opgebouwd uit de gepubliceerde inhoud.
export const dynamic = 'force-dynamic';

function blockMarkdown(b: Block): string {
  const lines: string[] = [];
  const h = (t: string) => t.trim() && lines.push(`### ${t.trim()}`);
  const p = (t: string) => t.trim() && lines.push(t.trim());
  switch (b.type) {
    case 'hero':
      h([b.data.title, b.data.highlight].filter(Boolean).join(' '));
      p(b.data.text);
      p(b.data.strip);
      break;
    case 'services':
      h(b.data.title || b.data.label);
      b.data.items.forEach((i) => lines.push(`- **${i.title}**: ${i.text.replace(/\s+/g, ' ')}`));
      break;
    case 'steps':
      h(b.data.title || b.data.label);
      p(b.data.text);
      b.data.steps.forEach((s) => lines.push(`- **${s.title}**: ${s.text}`));
      if (b.data.finalTitle) lines.push(`- **${b.data.finalTitle}**: ${b.data.finalText}`);
      break;
    case 'focus':
      h(b.data.label);
      b.data.cards.forEach((c) => lines.push(`- ${c.title}`));
      p(b.data.note);
      break;
    case 'text':
      h(b.data.title || b.data.label);
      p(b.data.body);
      break;
    case 'imageText':
      h(b.data.title || b.data.label);
      p(b.data.text);
      break;
    case 'quote':
      p(`> ${b.data.text}${b.data.author ? ` — ${b.data.author}${b.data.role ? `, ${b.data.role}` : ''}` : ''}`);
      break;
    case 'cta':
      h(b.data.title);
      p(b.data.text);
      break;
    case 'contact':
      h(b.data.title || 'Contact');
      p(b.data.text);
      break;
  }
  return lines.join('\n\n');
}

export async function GET() {
  const { live } = await seoContext();
  if (!live) return new Response('Not found', { status: 404 });
  const { site } = await getPublishedInfo();
  const sections = visiblePages(site).map((page) => {
    const body = page.blocks.map(blockMarkdown).filter(Boolean).join('\n\n');
    return `## ${page.title} (${AITD_ORIGIN}${pagePath(page)})\n\n${body}`;
  });
  const md = [
    '# AITD Consulting BV',
    `> ${site.settings.seoDescription}`,
    'Slogan: All in the detail. Enquiries can be sent via the contact form on the website.',
    ...sections,
  ].join('\n\n');
  return new Response(`${md}\n`, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
