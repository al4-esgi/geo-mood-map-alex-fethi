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
  const isTestEnv = import.meta.env.MODE === 'test' || import.meta.env.NODE_ENV === 'test';
  const isFetchMocked = typeof (fetch as any)?.mock === 'object';
  if (isTestEnv && !isFetchMocked) return mockWeather(req);

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
  if (!apiKey) return mockWeather(req);

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${req.lat}&lon=${req.lon}&units=metric&appid=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      return mockWeather(req);
    }
    const data = (await res.json()) as OpenWeatherResponse;
    return mapOpenWeather(req, data);
  } catch {
    return mockWeather(req);
  }
}

type OpenWeatherResponse = {
  weather: { main: string }[];
  main: { temp: number; humidity?: number };
};

function mapOpenWeather(req: WeatherRequest, data: OpenWeatherResponse): WeatherResponse {
  const main = data.weather?.[0]?.main ?? 'Clear';
  return {
    lat: req.lat,
    lon: req.lon,
    condition: mapCondition(main),
    temperature: data.main?.temp ?? 0,
    humidity: data.main?.humidity,
    source: 'api',
  };
}

function mapCondition(main: string): WeatherResponse['condition'] {
  const normalized = main.toLowerCase();
  if (normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('thunderstorm')) return 'rain';
  if (normalized.includes('snow')) return 'snow';
  if (normalized.includes('cloud')) return 'clouds';
  if (normalized.includes('clear')) return 'sun';
  return 'clear';
}

function mockWeather(req: WeatherRequest): WeatherResponse {
  return {
    lat: req.lat,
    lon: req.lon,
    condition: 'clouds',
    temperature: 17,
    humidity: 65,
    source: 'mock',
  };
}

