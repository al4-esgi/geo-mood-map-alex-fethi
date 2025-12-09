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
 * Implementation will be added after tests define the expected behaviour.
 */
export function computeMoodScore(_input: MoodScoreInput): number {
  throw new Error('computeMoodScore not implemented yet');
}

