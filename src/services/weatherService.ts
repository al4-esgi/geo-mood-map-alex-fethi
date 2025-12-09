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
export async function getWeatherByCoords(_req: WeatherRequest): Promise<WeatherResponse> {
  throw new Error('getWeatherByCoords not implemented yet');
}

