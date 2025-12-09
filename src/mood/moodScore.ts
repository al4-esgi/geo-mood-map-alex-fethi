export type WeatherSnapshot = {
  condition: 'sun' | 'clouds' | 'rain' | 'snow' | 'clear';
  temperature: number;
  humidity?: number;
};

export type ImageSentiment = 'positive' | 'negative' | 'neutral';

export type MoodScoreInput = {
  rating: number; // 1–5 user rating
  text?: string;
  weather?: WeatherSnapshot;
  imageSentiment?: ImageSentiment;
};

/**
 * Computes a mood score (0–100) from user input, weather, and sentiment cues.
 */
export function computeMoodScore(input: MoodScoreInput): number {
  const base = clamp(input.rating * 20, 0, 100);

  const sentimentDelta = textSentimentDelta(input.text);
  const weatherDelta = weatherModifier(input.weather);
  const imageDelta = imageModifier(input.imageSentiment);

  return clamp(base + sentimentDelta + weatherDelta + imageDelta, 0, 100);
}

function textSentimentDelta(text?: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  const positives = ['happy', 'joy', 'joyful', 'calm', 'peaceful'];
  const negatives = ['sad', 'angry', 'mad', 'upset', 'anxious'];

  const hasPositive = positives.some((word) => lower.includes(word));
  const hasNegative = negatives.some((word) => lower.includes(word));

  if (hasPositive && !hasNegative) return 10;
  if (hasNegative && !hasPositive) return -10;
  if (hasPositive && hasNegative) return 0;
  return 0;
}

function weatherModifier(weather?: WeatherSnapshot): number {
  if (!weather) return 0;
  const isRainy = weather.condition === 'rain';
  const isCold = weather.temperature < 8;
  const isPleasantSun =
    (weather.condition === 'sun' || weather.condition === 'clear') &&
    weather.temperature >= 18 &&
    weather.temperature <= 28;

  if (isRainy || isCold) return -20;
  if (isPleasantSun) return 5;
  return 0;
}

function imageModifier(sentiment?: ImageSentiment): number {
  if (sentiment === 'positive') return 5;
  if (sentiment === 'negative') return -5;
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

