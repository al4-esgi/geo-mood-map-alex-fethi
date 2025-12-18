export type GeoRequest = { lat: number; lon: number }

export type GeoResponse = {
  lat: number
  lon: number
  name: string
  type: 'park' | 'cafe' | 'beach' | 'city' | 'unknown'
  source: 'api' | 'mock'
}

/**
 * Resolves coordinates to a named place. Phase 1 can rely on deterministic
 * mock values to keep tests stable.
 */
export async function getPlaceByCoords(req: GeoRequest): Promise<GeoResponse> {
  const isTestEnv =
    import.meta.env.MODE === 'test' || import.meta.env.NODE_ENV === 'test'
  const isFetchMocked = typeof (fetch as any)?.mock === 'object'
  if (isTestEnv && !isFetchMocked) return mockPlace(req)

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${req.lat}&lon=${req.lon}&format=jsonv2`
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GeoMoodMap/1.0 (course project)',
      },
    })
    if (!res.ok) return mockPlace(req)
    const data = (await res.json()) as NominatimResponse
    return mapNominatim(req, data)
  } catch {
    return mockPlace(req)
  }
}

type NominatimResponse = {
  display_name?: string
  type?: string
  category?: string
}

function mapNominatim(req: GeoRequest, data: NominatimResponse): GeoResponse {
  return {
    lat: req.lat,
    lon: req.lon,
    name: data.display_name ?? 'Unknown place',
    type: mapType(data.type, data.category),
    source: 'api',
  }
}

function mapType(type?: string, category?: string): GeoResponse['type'] {
  const value = (type || category || '').toLowerCase()
  if (value.includes('park')) return 'park'
  if (value.includes('cafe')) return 'cafe'
  if (value.includes('beach')) return 'beach'
  if (value.includes('city') || value.includes('town')) return 'city'
  return 'unknown'
}

function mockPlace(req: GeoRequest): GeoResponse {
  return {
    lat: req.lat,
    lon: req.lon,
    name: 'Mock Place',
    type: 'park',
    source: 'mock',
  }
}
