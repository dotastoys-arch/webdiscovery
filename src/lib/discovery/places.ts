// Google Places API (v1) — Text Search.
// Vindt bedrijven per zoekterm + regio. Levert naam, adres, telefoon, website
// en place_id. GEEN e-mail (die halen we later uit de website — zie enrich.ts).
//
// Kosten: gebruikt het maandelijkse Google-tegoed; daarboven betaald. Houd
// maxResults laag om binnen budget te blijven. Zonder key gooit dit een fout;
// gebruik dan de handmatige import.

export interface RawBusiness {
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  placeId: string | null;
  email?: string | null; // niet door Places gezet; wel bij handmatige import
}

interface PlacesResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    websiteUri?: string;
    nationalPhoneNumber?: string;
    addressComponents?: Array<{ longText?: string; types?: string[] }>;
  }>;
  nextPageToken?: string;
}

type PlaceItem = NonNullable<PlacesResponse['places']>[number];

function extractCity(components?: PlaceItem['addressComponents']): string | null {
  if (!components) return null;
  const locality = components.find((c) => c.types?.includes('locality'));
  return locality?.longText ?? null;
}

/**
 * Zoek bedrijven via Places Text Search.
 * @param query bv. "kappers in Utrecht" of "loodgieter Amsterdam"
 * @param maxResults max. aantal (per pagina 20; wij stoppen rond dit getal)
 */
export async function searchBusinesses(query: string, maxResults = 20): Promise<RawBusiness[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY ontbreekt — gebruik de handmatige import.');

  const results: RawBusiness[] = [];
  let pageToken: string | undefined;

  do {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.addressComponents,nextPageToken',
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'nl',
        regionCode: 'NL',
        ...(pageToken ? { pageToken } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Places API fout (${res.status}): ${text.slice(0, 300)}`);
    }

    const data = (await res.json()) as PlacesResponse;
    for (const p of data.places ?? []) {
      results.push({
        name: p.displayName?.text ?? 'Onbekend',
        website: p.websiteUri ?? null,
        phone: p.nationalPhoneNumber ?? null,
        address: p.formattedAddress ?? null,
        city: extractCity(p.addressComponents),
        placeId: p.id ?? null,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken && results.length < maxResults);

  return results.slice(0, maxResults);
}
