import { CityData } from './ranking-engine';

export interface DashboardStats {
  totalCities: number;
  averageAQI: number;
  highestAQICity: CityData;
  cleanestCity: CityData;
  totalPopulationCovered: number;
}

export interface InsightItem {
  id: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  title: string;
  text: string;
  stat?: string;
}

/**
 * Calculates high-level metrics for the dashboard overview
 */
export function getDashboardStats(cities: CityData[]): DashboardStats {
  if (cities.length === 0) {
    throw new Error("City dataset is empty");
  }

  const totalCities = cities.length;
  const totalAQI = cities.reduce((sum, c) => sum + c.aqi, 0);
  const averageAQI = Math.round(totalAQI / totalCities);

  const highestAQICity = cities.reduce((max, c) => c.aqi > max.aqi ? c : max, cities[0]);
  const cleanestCity = cities.reduce((min, c) => c.aqi < min.aqi ? c : min, cities[0]);
  const totalPopulationCovered = cities.reduce((sum, c) => sum + c.population, 0);

  return {
    totalCities,
    averageAQI,
    highestAQICity,
    cleanestCity,
    totalPopulationCovered
  };
}

/**
 * Generates dynamic, data-driven AI style insights
 */
export function generateInsights(cities: CityData[]): InsightItem[] {
  const insights: InsightItem[] = [];
  if (cities.length === 0) return insights;

  const stats = getDashboardStats(cities);
  const nationalAvg = stats.averageAQI;

  // 1. National Average comparison (Delhi or Highest AQI)
  const delhi = cities.find(c => c.city.toLowerCase() === 'delhi');
  if (delhi) {
    const ratio = (delhi.aqi / nationalAvg).toFixed(1);
    insights.push({
      id: 'insight-delhi',
      type: 'danger',
      title: 'High Pollution Alert',
      text: `${delhi.city} (${delhi.state}) records an AQI of ${delhi.aqi}, which is ${ratio}x higher than the national average (${nationalAvg}).`,
      stat: `${ratio}x`
    });
  }

  // 2. Population vs AQI threshold analysis (Cities > 5M)
  const largeCities = cities.filter(c => c.population > 5000000);
  const smallCities = cities.filter(c => c.population <= 5000000);
  if (largeCities.length > 0 && smallCities.length > 0) {
    const avgLargeAQI = largeCities.reduce((sum, c) => sum + c.aqi, 0) / largeCities.length;
    const avgSmallAQI = smallCities.reduce((sum, c) => sum + c.aqi, 0) / smallCities.length;
    const percentDiff = Math.round(((avgLargeAQI - avgSmallAQI) / avgSmallAQI) * 100);
    insights.push({
      id: 'insight-pop-threshold',
      type: 'warning',
      title: 'Demographic Correlation',
      text: `Mega-cities (population > 5M) exhibit an average AQI of ${Math.round(avgLargeAQI)}, which is ${percentDiff}% higher than smaller cities (${Math.round(avgSmallAQI)}).`,
      stat: `+${percentDiff}%`
    });
  }

  // 3. Efficiency anomaly (e.g. Nagpur or Indore vs similar sized cities)
  const nagpur = cities.find(c => c.city.toLowerCase() === 'nagpur');
  const comparisonCities = cities.filter(c => c.population > 2000000 && c.population < 3500000 && c.city.toLowerCase() !== 'nagpur');
  if (nagpur && comparisonCities.length > 0) {
    const avgCompAQI = comparisonCities.reduce((sum, c) => sum + c.aqi, 0) / comparisonCities.length;
    const diffPercent = Math.round(((avgCompAQI - nagpur.aqi) / avgCompAQI) * 100);
    insights.push({
      id: 'insight-nagpur-anomaly',
      type: 'success',
      title: 'Sustainability Champion',
      text: `${nagpur.city} maintains a moderate AQI of ${nagpur.aqi}, which is ${diffPercent}% cleaner than the average of similar-tier cities (${Math.round(avgCompAQI)}).`,
      stat: `-${diffPercent}%`
    });
  }

  // 4. Cleanest state aggregation
  const stateAverages: { [state: string]: { totalAqi: number; count: number } } = {};
  cities.forEach(c => {
    if (!stateAverages[c.state]) {
      stateAverages[c.state] = { totalAqi: 0, count: 0 };
    }
    stateAverages[c.state].totalAqi += c.aqi;
    stateAverages[c.state].count += 1;
  });

  let cleanestState = '';
  let minStateAvg = Infinity;
  Object.keys(stateAverages).forEach(state => {
    const avg = stateAverages[state].totalAqi / stateAverages[state].count;
    // Only consider states with at least 2 cities to avoid outliers
    if (avg < minStateAvg && stateAverages[state].count >= 2) {
      minStateAvg = avg;
      cleanestState = state;
    }
  });

  if (cleanestState) {
    insights.push({
      id: 'insight-state-cleanest',
      type: 'success',
      title: 'State Performance',
      text: `Monitored cities in ${cleanestState} demonstrate the highest ecological performance with an average AQI of ${Math.round(minStateAvg)}.`,
      stat: `${Math.round(minStateAvg)} AQI`
    });
  }

  // 5. Region of Concern (Highest State Avg AQI)
  let pollutedState = '';
  let maxStateAvg = -Infinity;
  Object.keys(stateAverages).forEach(state => {
    const avg = stateAverages[state].totalAqi / stateAverages[state].count;
    if (avg > maxStateAvg && stateAverages[state].count >= 3) {
      maxStateAvg = avg;
      pollutedState = state;
    }
  });

  if (pollutedState) {
    insights.push({
      id: 'insight-state-polluted',
      type: 'danger',
      title: 'Regional Concern',
      text: `${pollutedState} records the highest regional pollution index with an average city AQI of ${Math.round(maxStateAvg)}.`,
      stat: `${Math.round(maxStateAvg)} AQI`
    });
  }

  return insights;
}

/**
 * Exports city rankings and details to CSV format
 */
export function exportToCSV(cities: CityData[]): string {
  const headers = ["Rank", "City", "State", "Population", "AQI", "AQI Category", "Latitude", "Longitude", "AQI Per 100k"];
  const rows = cities.map(c => {
    const aqiPer100k = ((c.aqi / c.population) * 100000).toFixed(4);
    return [
      c.rank,
      `"${c.city.replace(/"/g, '""')}"`,
      `"${c.state.replace(/"/g, '""')}"`,
      c.population,
      c.aqi,
      c.aqiCategory,
      c.latitude,
      c.longitude,
      aqiPer100k
    ];
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
