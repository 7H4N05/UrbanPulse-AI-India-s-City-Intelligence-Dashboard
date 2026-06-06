export interface HistoricalAQI {
  date: string;
  aqi: number;
}

export interface CityData {
  id: string;
  city: string;
  state: string;
  population: number;
  aqi: number;
  aqiCategory: 'Good' | 'Moderate' | 'Poor' | 'Severe';
  latitude: number;
  longitude: number;
  rank: number;
  historicalAQI: HistoricalAQI[];
}

/**
 * Normalizes AQI: 0 is worst (AQI >= 500), 100 is best (AQI = 0)
 */
export function calculateAQIScore(aqi: number): number {
  return Math.max(0, Math.min(100, 100 - (aqi / 500) * 100));
}

/**
 * Population Adjusted Sustainability Score:
 * Combines air quality with population metrics, rewarding larger cities
 * that manage to keep their pollution levels low.
 */
export function calculateSustainabilityScore(
  aqi: number,
  population: number,
  minPop: number,
  maxPop: number
): number {
  const aqiScore = calculateAQIScore(aqi);
  
  // Logarithmic scale for population to ensure balanced comparisons across sizes
  const logPop = Math.log10(population);
  const logMin = Math.log10(minPop || 50000);
  const logMax = Math.log10(maxPop || 20000000);
  
  // Normalization factor (0.2 to 1.0) so small cities aren't completely zeroed out
  const popFactor = 0.2 + 0.8 * ((logPop - logMin) / (logMax - logMin));
  
  return aqiScore * popFactor;
}

/**
 * Overall score calculation combining 70% AQI and 30% Sustainability
 */
export function calculateOverallScore(
  aqi: number,
  population: number,
  minPop: number,
  maxPop: number
): number {
  const aqiScore = calculateAQIScore(aqi);
  const sustainabilityScore = calculateSustainabilityScore(aqi, population, minPop, maxPop);
  return 0.7 * aqiScore + 0.3 * sustainabilityScore;
}

/**
 * Dynamic city ranking function
 */
export function rankCities(cities: Omit<CityData, 'rank'>[]): CityData[] {
  if (cities.length === 0) return [];

  const populations = cities.map(c => c.population);
  const minPop = Math.min(...populations);
  const maxPop = Math.max(...populations);

  const scored = cities.map(city => {
    const score = calculateOverallScore(city.aqi, city.population, minPop, maxPop);
    return { ...city, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Map to final ranks
  return scored.map((c, index) => {
    const { score, ...cityData } = c;
    return {
      ...cityData,
      rank: index + 1
    } as CityData;
  });
}
