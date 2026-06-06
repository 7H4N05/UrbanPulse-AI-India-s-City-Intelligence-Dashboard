'use client';

import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ArrowLeftRight, Activity, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { CityData } from '../lib/ranking-engine';

interface CityComparisonToolProps {
  cities: CityData[];
  initialCityAId?: string;
  initialCityBId?: string;
}

export default function CityComparisonTool({ cities, initialCityAId, initialCityBId }: CityComparisonToolProps) {
  // Sort cities alphabetically for select dropdowns
  const sortedDropdownCities = useMemo(() => {
    return [...cities].sort((a, b) => a.city.localeCompare(b.city));
  }, [cities]);

  // Set default cities: e.g. Delhi (first severe) and Bangalore (good)
  const defaultCityA = cities.find(c => c.city.toLowerCase() === 'delhi') || cities[0];
  const defaultCityB = cities.find(c => c.city.toLowerCase() === 'bangalore') || cities[1];

  const [cityAId, setCityAId] = useState(initialCityAId || defaultCityA.id);
  const [cityBId, setCityBId] = useState(initialCityBId || defaultCityB.id);

  const cityA = useMemo(() => cities.find(c => c.id === cityAId) || defaultCityA, [cities, cityAId, defaultCityA]);
  const cityB = useMemo(() => cities.find(c => c.id === cityBId) || defaultCityB, [cities, cityBId, defaultCityB]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Prepare trend data for Recharts by merging historical trends of city A and city B
  const trendData = useMemo(() => {
    if (!cityA || !cityB) return [];
    
    return cityA.historicalAQI.map((item, index) => {
      const bItem = cityB.historicalAQI[index] || { aqi: 0 };
      return {
        month: item.date,
        [cityA.city]: item.aqi,
        [cityB.city]: bItem.aqi,
      };
    });
  }, [cityA, cityB]);

  // Comparative metrics
  const aqiDiffFactor = useMemo(() => {
    if (!cityA || !cityB) return 1;
    const larger = Math.max(cityA.aqi, cityB.aqi);
    const smaller = Math.min(cityA.aqi, cityB.aqi);
    return Number((larger / smaller).toFixed(1));
  }, [cityA, cityB]);

  const dirtierCity = useMemo(() => {
    if (!cityA || !cityB) return null;
    return cityA.aqi > cityB.aqi ? cityA : cityB;
  }, [cityA, cityB]);

  const cleanerCity = useMemo(() => {
    if (!cityA || !cityB) return null;
    return cityA.aqi < cityB.aqi ? cityA : cityB;
  }, [cityA, cityB]);

  const getRiskAssessment = (category: string) => {
    switch (category) {
      case 'Good':
        return {
          icon: Sparkles,
          level: 'Minimal Ecological Risk',
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          desc: 'Air quality is satisfactory, and air pollution poses little or no risk. Safe for all outdoor activities and exercise.'
        };
      case 'Moderate':
        return {
          icon: ShieldCheck,
          level: 'Moderate Risk Profile',
          color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
          desc: 'Air quality is acceptable. However, sensitive individuals may experience health concerns. Restrict prolonged outdoor exertion.'
        };
      case 'Poor':
        return {
          icon: ShieldAlert,
          level: 'High Pollution Alert',
          color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
          desc: 'Members of sensitive groups may experience health effects. General public may feel irritation. Mask recommendations in place.'
        };
      default:
        return {
          icon: ShieldAlert,
          level: 'Severe Health Emergency',
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          desc: 'Serious health impacts across population. Extreme risk for respiratory illnesses. Avoid all outdoor exertion; air purifiers recommended.'
        };
    }
  };

  const riskA = getRiskAssessment(cityA.aqiCategory);
  const riskB = getRiskAssessment(cityB.aqiCategory);
  const RiskIconA = riskA.icon;
  const RiskIconB = riskB.icon;

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <ArrowLeftRight className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">City Comparison Engine</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Perform comparative analysis on demographic and CPCB data</p>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Primary City</label>
          <select
            value={cityAId}
            onChange={(e) => setCityAId(e.target.value)}
            className="w-full glass-input text-sm focus:border-blue-500"
          >
            {sortedDropdownCities.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {c.city} ({c.state})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">Comparison City</label>
          <select
            value={cityBId}
            onChange={(e) => setCityBId(e.target.value)}
            className="w-full glass-input text-sm focus:border-blue-500"
          >
            {sortedDropdownCities.map(c => (
              <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {c.city} ({c.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {cityAId === cityBId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Activity className="w-12 h-12 mb-2 opacity-40 text-blue-500 animate-pulse" />
          <p className="text-sm font-semibold">Select two different cities to enable comparison</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {/* Quick Comparison Summary */}
          {dirtierCity && cleanerCity && (
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm font-semibold text-slate-700 dark:text-slate-300">
              ⚡ Intelligence Summary: <span className="text-blue-600 dark:text-blue-400">{dirtierCity.city}</span> has an AQI of {dirtierCity.aqi}, which is <span className="text-red-500">{aqiDiffFactor}x higher</span> than <span className="text-blue-600 dark:text-blue-400">{cleanerCity.city}</span> ({cleanerCity.aqi}).
            </div>
          )}

          {/* Cards Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* City A Card */}
            <div className="p-5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-slate-500/5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{cityA.city}</h3>
                    <span className="text-xs text-slate-400 font-semibold">{cityA.state}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Rank #{cityA.rank}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-800/50 my-3">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Air Quality</span>
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{cityA.aqi} AQI</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Population</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatNumber(cityA.population)}</span>
                  </div>
                </div>
              </div>

              {/* Risk Panel */}
              <div className={`p-3 rounded-lg border ${riskA.color} mt-2`}>
                <div className="flex items-center gap-2 mb-1">
                  <RiskIconA className="w-4.5 h-4.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{riskA.level}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{riskA.desc}</p>
              </div>
            </div>

            {/* City B Card */}
            <div className="p-5 rounded-xl border border-slate-200/50 dark:border-slate-800/80 bg-slate-500/5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{cityB.city}</h3>
                    <span className="text-xs text-slate-400 font-semibold">{cityB.state}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Rank #{cityB.rank}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-800/50 my-3">
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Air Quality</span>
                    <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{cityB.aqi} AQI</span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Population</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatNumber(cityB.population)}</span>
                  </div>
                </div>
              </div>

              {/* Risk Panel */}
              <div className={`p-3 rounded-lg border ${riskB.color} mt-2`}>
                <div className="flex items-center gap-2 mb-1">
                  <RiskIconB className="w-4.5 h-4.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{riskB.level}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{riskB.desc}</p>
              </div>
            </div>
          </div>

          {/* Line Chart Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Historical 6-Month AQI Trend Overlay
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#888888" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 'auto']} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '0.5rem', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                  <Line 
                    type="monotone" 
                    dataKey={cityA.city} 
                    stroke="#3b82f6" 
                    strokeWidth={2.5} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey={cityB.city} 
                    stroke="#10b981" 
                    strokeWidth={2.5} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
