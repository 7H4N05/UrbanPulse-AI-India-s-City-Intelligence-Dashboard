'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, LineChart as ScatterIcon, Map } from 'lucide-react';
import { CityData } from '../lib/ranking-engine';

interface VisualizationsProps {
  cities: CityData[];
}

type TabType = 'polluted' | 'cleanest' | 'scatter' | 'distribution' | 'states';

export default function Visualizations({ cities }: VisualizationsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('polluted');

  // 1. Top 10 Most Polluted Cities
  const topPolluted = useMemo(() => {
    return [...cities]
      .sort((a, b) => b.aqi - a.aqi)
      .slice(0, 10)
      .map(c => ({ name: c.city, AQI: c.aqi, state: c.state }));
  }, [cities]);

  // 2. Top 10 Cleanest Cities
  const topCleanest = useMemo(() => {
    return [...cities]
      .sort((a, b) => a.aqi - b.aqi)
      .slice(0, 10)
      .map(c => ({ name: c.city, AQI: c.aqi, state: c.state }));
  }, [cities]);

  // 3. AQI Category Distribution Pie Chart
  const categoryDistribution = useMemo(() => {
    const counts = { Good: 0, Moderate: 0, Poor: 0, Severe: 0 };
    cities.forEach(c => {
      if (c.aqiCategory in counts) {
        counts[c.aqiCategory as keyof typeof counts]++;
      }
    });

    return [
      { name: 'Good (0-50)', value: counts.Good, color: '#10b981' },
      { name: 'Moderate (51-150)', value: counts.Moderate, color: '#f59e0b' },
      { name: 'Poor (151-300)', value: counts.Poor, color: '#f97316' },
      { name: 'Severe (301+)', value: counts.Severe, color: '#ef4444' },
    ];
  }, [cities]);

  // 4. Population vs AQI Scatter Plot Data
  const scatterData = useMemo(() => {
    return cities.map(c => ({
      city: c.city,
      population: c.population,
      aqi: c.aqi,
      category: c.aqiCategory
    }));
  }, [cities]);

  // 5. State Average AQI Bar Chart Data
  const stateAverages = useMemo(() => {
    const sums: { [state: string]: { totalAqi: number; count: number } } = {};
    cities.forEach(c => {
      if (!sums[c.state]) sums[c.state] = { totalAqi: 0, count: 0 };
      sums[c.state].totalAqi += c.aqi;
      sums[c.state].count++;
    });

    return Object.keys(sums)
      .map(state => ({
        state,
        AverageAQI: Math.round(sums[state].totalAqi / sums[state].count)
      }))
      .sort((a, b) => b.AverageAQI - a.AverageAQI)
      .slice(0, 12); // top 12 states by average AQI
  }, [cities]);

  const tabs = [
    { id: 'polluted', name: 'Top 10 Polluted', icon: BarChart3 },
    { id: 'cleanest', name: 'Top 10 Cleanest', icon: BarChart3 },
    { id: 'states', name: 'State Averages', icon: Map },
    { id: 'scatter', name: 'Population vs AQI', icon: ScatterIcon },
    { id: 'distribution', name: 'AQI Categories', icon: PieIcon },
  ];

  // Custom tooltips to maintain premium glassmorphic style
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-slate-950/90 dark:bg-slate-900/95 border border-slate-800 text-slate-100 rounded-lg shadow-xl text-xs font-semibold">
          <p className="font-bold text-slate-200 mb-1">{data.name || data.state || data.city}</p>
          {data.state && <p className="text-slate-400 text-[10px] mb-1">State: {data.state}</p>}
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>AQI: <strong className="text-blue-300">{payload[0].value}</strong></span>
          </p>
          {data.population && (
            <p className="flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Population: <strong className="text-emerald-300">{new Intl.NumberFormat('en-IN').format(data.population)}</strong></span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getScatterDotColor = (category: string) => {
    switch (category) {
      case 'Good': return '#10b981';
      case 'Moderate': return '#f59e0b';
      case 'Poor': return '#f97316';
      default: return '#ef4444';
    }
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      {/* Header and Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Analytical Visualizations</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Environmental distributions and demographic scatter correlations</p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-500/5 dark:bg-slate-950/20 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 border shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 border border-transparent'
                } cursor-pointer`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 min-h-[350px] w-full flex items-center justify-center">
        {activeTab === 'polluted' && (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={topPolluted} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                angle={-25}
                textAnchor="end"
              />
              <YAxis 
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 450]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="AQI" fill="#ef4444" radius={[6, 6, 0, 0]}>
                {topPolluted.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#pollutedGrad)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="pollutedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'cleanest' && (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={topCleanest} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                angle={-25}
                textAnchor="end"
              />
              <YAxis 
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="AQI" fill="#10b981" radius={[6, 6, 0, 0]}>
                {topCleanest.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#cleanestGrad)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="cleanestGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'states' && (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={stateAverages} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="state" 
                stroke="#888888" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                angle={-35}
                textAnchor="end"
              />
              <YAxis 
                stroke="#888888" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="AverageAQI" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                {stateAverages.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="url(#statesGrad)" />
                ))}
              </Bar>
              <defs>
                <linearGradient id="statesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'scatter' && (
          <div className="w-full h-[380px] flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="92%">
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="population" 
                  name="Population" 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={(val) => val >= 10000000 ? `${(val/10000000).toFixed(1)}Cr` : `${(val/100000).toFixed(0)}L`}
                />
                <YAxis 
                  type="number" 
                  dataKey="aqi" 
                  name="AQI" 
                  stroke="#888888" 
                  fontSize={10} 
                  tickLine={false}
                  domain={[0, 400]}
                />
                <ZAxis type="number" range={[50, 50]} />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ strokeDasharray: '3 3' }} 
                />
                <Scatter name="Cities" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getScatterDotColor(entry.category)} 
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth={1}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Custom scatter legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Good AQI</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate AQI</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Poor AQI</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Severe AQI</span>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-full md:w-1/2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderRadius: '0.5rem', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Pie Legend */}
            <div className="flex flex-col gap-3 font-semibold text-sm">
              {categoryDistribution.map((item, index) => {
                const percentage = Math.round((item.value / cities.length) * 100);
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="w-40 text-slate-700 dark:text-slate-300">{item.name}</div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{item.value} cities</div>
                    <div className="text-slate-400 text-xs w-10 text-right">({percentage}%)</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
