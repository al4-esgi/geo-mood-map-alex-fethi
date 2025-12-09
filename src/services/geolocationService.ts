export type GeoRequest = { lat: number; lon: number };

export type GeoResponse = {
  lat: number;
  lon: number;
  name: string;
  type: 'park' | 'cafe' | 'beach' | 'city' | 'unknown';
  source: 'api' | 'mock';
};

/**
 * Resolves coordinates to a named place. Phase 1 can rely on deterministic
 * mock values to keep tests stable.
 */
export async function getPlaceByCoords(_req: GeoRequest): Promise<GeoResponse> {
  throw new Error('getPlaceByCoords not implemented yet');
}

