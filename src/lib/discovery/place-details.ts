// Haalt de rijke Google-profielgegevens van één bedrijf op (Place Details, v1):
// omschrijving, categorie, rating, openingstijden en echte reviews.
// Gebruikt de place_id (opgeslagen als lead.source_ref). Zonder key: null.

export interface PlaceDetails {
  description: string | null;
  category: string | null;
  rating: number | null;
  ratingCount: number | null;
  openingHours: { day: string; hours: string }[];
  reviews: { author: string; text: string; rating: number | null }[];
}

interface DetailsResponse {
  editorialSummary?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  reviews?: Array<{
    text?: { text?: string };
    rating?: number;
    authorAttribution?: { displayName?: string };
  }>;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || !placeId) return null;

  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask':
        'editorialSummary,primaryTypeDisplayName,rating,userRatingCount,regularOpeningHours.weekdayDescriptions,reviews.text,reviews.rating,reviews.authorAttribution.displayName',
      'Accept-Language': 'nl',
    },
  });
  if (!res.ok) return null;

  const d = (await res.json()) as DetailsResponse;

  const openingHours = (d.regularOpeningHours?.weekdayDescriptions ?? []).map((line) => {
    const idx = line.indexOf(': ');
    return idx > -1
      ? { day: line.slice(0, idx), hours: line.slice(idx + 2) }
      : { day: line, hours: '' };
  });

  const reviews = (d.reviews ?? [])
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? 'Klant',
      text: r.text?.text ?? '',
      rating: r.rating ?? null,
    }))
    .filter((r) => r.text)
    .slice(0, 4);

  return {
    description: d.editorialSummary?.text ?? null,
    category: d.primaryTypeDisplayName?.text ?? null,
    rating: d.rating ?? null,
    ratingCount: d.userRatingCount ?? null,
    openingHours,
    reviews,
  };
}
