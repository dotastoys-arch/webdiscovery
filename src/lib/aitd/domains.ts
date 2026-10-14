// Eigen domein(en) van AITD. Op deze hosts draait de site zonder "/aitd" in het
// adres (de proxy herschrijft naar /aitd). Edge-veilig: geen Node/Next-imports.
export const AITD_DOMAINS = ['aitdconsulting.eu'];

export function isAitdDomain(host: string | null | undefined): boolean {
  const h = (host ?? '').split(':')[0].toLowerCase().replace(/^www\./, '');
  return AITD_DOMAINS.includes(h);
}
