export type WeatherRequest = { lat: number; lon: number; when?: Date };

export type WeatherResponse = {
  lat: number;
  lon: number;
  condition: 'sun' | 'clouds' | 'rain' | 'snow' | 'clear';
  temperature: number;
  humidity?: number;
  source: 'api' | 'mock';
};

/**
 * Retrieves weather for given coordinates. Phase 1 uses a deterministic mock
 * unless real API integration is added. Behaviour will be defined by tests.
 */
export async function getWeatherByCoords(req: WeatherRequest): Promise<WeatherResponse> {
  // Deterministic mock keeps TDD loop stable in Phase 1.
  return Promise.resolve({
    lat: req.lat,
    lon: req.lon,
    condition: 'clouds',
    temperature: 17,
    humidity: 65,
    source: 'mock',
  });
}

