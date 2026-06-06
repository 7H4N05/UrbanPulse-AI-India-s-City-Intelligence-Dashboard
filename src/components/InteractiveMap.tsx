'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Info, X, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { CityData } from '../lib/ranking-engine';

interface InteractiveMapProps {
  cities: CityData[];
}

export default function InteractiveMap({ cities }: InteractiveMapProps) {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(cities[0]?.id || null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);

  // Geographic Bounding Box for India coordinate projection
  const minLat = 7.0;
  const maxLat = 37.5;
  const minLng = 67.0;
  const maxLng = 98.0;

  // Projects geographic latitude/longitude to SVG coordinate percentage space (0 - 100)
  const projectCoordinates = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Latitude goes bottom-up, SVG goes top-down
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  // Border coordinates of India to draw a stylized vector background
  const indiaBorderPoints = useMemo(() => {
    const points = [
      { lat: 37.0, lng: 74.5 }, // Kashmir Top
      { lat: 35.5, lng: 78.0 }, // Ladakh Northeast
      { lat: 32.5, lng: 78.5 }, // Himachal Border
      { lat: 29.0, lng: 80.0 }, // Uttarakhand Border
      { lat: 26.5, lng: 87.0 }, // Nepal border start
      { lat: 27.8, lng: 88.0 }, // Sikkim
      { lat: 26.8, lng: 89.0 }, // Bhutan
      { lat: 28.2, lng: 97.0 }, // Arunachal East Tip
      { lat: 24.0, lng: 94.0 }, // Nagaland/Manipur
      { lat: 22.0, lng: 92.5 }, // Mizoram
      { lat: 22.5, lng: 89.5 }, // Sundarbans West Bengal
      { lat: 20.0, lng: 86.5 }, // Odisha Coast
      { lat: 16.5, lng: 82.2 }, // Andhra Coast
      { lat: 13.0, lng: 80.3 }, // Chennai Coast
      { lat: 9.0, lng: 78.5 },  // Rameswaram Coast
      { lat: 8.0, lng: 77.0 },  // Southern Tip (Kanyakumari)
      { lat: 9.5, lng: 76.3 },  // Kerala Coast
      { lat: 13.0, lng: 74.8 }, // Mangalore Coast
      { lat: 15.5, lng: 73.8 }, // Goa Coast
      { lat: 19.0, lng: 72.8 }, // Mumbai Coast
      { lat: 22.0, lng: 72.5 }, // Gulf of Khambhat
      { lat: 22.0, lng: 69.0 }, // Gujarat Peninsula
      { lat: 23.5, lng: 68.5 }, // Westernmost point
      { lat: 24.5, lng: 71.0 }, // Rann of Kutch
      { lat: 28.0, lng: 71.0 }, // Rajasthan West Border
      { lat: 32.5, lng: 74.0 }, // Jammu Border
      { lat: 35.0, lng: 74.0 }, // Kashmir West
    ];

    return points.map(p => {
      const { x, y } = projectCoordinates(p.lat, p.lng);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, []);

  const selectedCity = useMemo(() => {
    return cities.find(c => c.id === selectedCityId) || null;
  }, [cities, selectedCityId]);

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'rgba(16, 185, 129, 0.9)'; // emerald
    if (aqi <= 150) return 'rgba(245, 158, 11, 0.9)'; // amber
    if (aqi <= 300) return 'rgba(249, 115, 22, 0.9)'; // orange
    return 'rgba(239, 68, 68, 0.9)'; // red
  };

  const getAqiShadow = (aqi: number) => {
    if (aqi <= 50) return 'shadow-emerald-500/20';
    if (aqi <= 150) return 'shadow-amber-500/20';
    if (aqi <= 300) return 'shadow-orange-500/20';
    return 'shadow-red-500/20';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <Map className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Interactive Spatial Analytics</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click any city coordinate node to view real-time ecological data</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Map Canvas (2/3 cols) */}
        <div className="lg:col-span-2 relative border border-slate-200/50 dark:border-slate-800/80 bg-slate-500/5 dark:bg-slate-950/20 rounded-xl overflow-hidden min-h-[350px] p-4 flex items-center justify-center">
          {/* Map Legend */}
          <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800 backdrop-blur-sm rounded-lg p-2.5 text-[10px] font-bold text-slate-500 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Moderate (51-150)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Poor (151-300)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Severe (301+)</span>
            </div>
          </div>

          {/* Interactive SVG Layer */}
          <div className="w-full max-w-[450px] aspect-[4/5] relative">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full select-none"
            >
              {/* Background Path of India */}
              <polygon
                points={indiaBorderPoints}
                className="india-map-path"
              />

              {/* Connecting grid line accents for premium look */}
              <path
                d="M 10,50 L 90,50 M 50,10 L 50,90"
                stroke="rgba(148, 163, 184, 0.05)"
                strokeWidth="0.5"
                strokeDasharray="1 1"
              />

              {/* City Dots */}
              {cities.map((city) => {
                const { x, y } = projectCoordinates(city.latitude, city.longitude);
                const isSelected = city.id === selectedCityId;
                const dotColor = getAqiColor(city.aqi);

                return (
                  <g key={city.id}>
                    {/* Ring highlight for selected city */}
                    {isSelected && (
                      <circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="none"
                        stroke={dotColor}
                        strokeWidth="0.6"
                        className="animate-ping origin-center"
                        style={{ transformOrigin: `${x}% ${y}%` }}
                      />
                    )}
                    
                    {/* Hover hotspot */}
                    <circle
                      cx={x}
                      cy={y}
                      r="1.8"
                      fill={dotColor}
                      stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.4)"}
                      strokeWidth="0.3"
                      className="cursor-pointer transition-all duration-200 hover:scale-150"
                      onClick={() => setSelectedCityId(city.id)}
                      onMouseEnter={() => setHoveredCity(city)}
                      onMouseLeave={() => setHoveredCity(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            <AnimatePresence>
              {hoveredCity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="absolute pointer-events-none bg-slate-950/90 dark:bg-slate-900/95 border border-slate-800 text-slate-100 text-xs rounded-lg p-2.5 shadow-xl font-semibold z-20 w-44"
                  style={{
                    left: `${projectCoordinates(hoveredCity.latitude, hoveredCity.longitude).x}%`,
                    top: `${projectCoordinates(hoveredCity.latitude, hoveredCity.longitude).y - 10}%`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  <p className="font-bold text-slate-200">{hoveredCity.city}</p>
                  <p className="text-slate-400 text-[10px] mb-1">{hoveredCity.state}</p>
                  <div className="flex items-center justify-between text-[10px] mt-1 border-t border-slate-800 pt-1">
                    <span>AQI: <strong style={{ color: getAqiColor(hoveredCity.aqi) }}>{hoveredCity.aqi}</strong></span>
                    <span>Rank: <strong>#{hoveredCity.rank}</strong></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected City Panel (1/3 cols) */}
        <div className="flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {selectedCity ? (
              <motion.div
                key={selectedCity.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/80 bg-slate-500/5 p-5 rounded-xl"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                        {selectedCity.city}
                      </h3>
                      <span className="text-xs font-semibold text-slate-400">
                        {selectedCity.state}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/50 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
                      Rank #{selectedCity.rank}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-200/50 dark:border-slate-800/50 my-4">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Current AQI
                      </span>
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 mt-0.5">
                        {selectedCity.aqi}
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block border border-white/20 shadow-sm"
                          style={{ backgroundColor: getAqiColor(selectedCity.aqi) }}
                        />
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Population
                      </span>
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1 block">
                        {formatNumber(selectedCity.population)}
                      </span>
                    </div>
                  </div>

                  {/* Health Advisory Warning Box */}
                  <div className={`p-3 rounded-lg flex items-start gap-2 text-xs font-medium border ${
                    selectedCity.aqiCategory === 'Good' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                    selectedCity.aqiCategory === 'Moderate' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                    selectedCity.aqiCategory === 'Poor' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' :
                    'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                  }`}>
                    {selectedCity.aqiCategory === 'Good' ? (
                      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold uppercase tracking-wider text-[10px] mb-0.5">{selectedCity.aqiCategory} Air Category</div>
                      <p className="opacity-90 leading-normal">
                        {selectedCity.aqiCategory === 'Good' && 'Minimal to no health concerns. Safe environment.'}
                        {selectedCity.aqiCategory === 'Moderate' && 'Acceptable quality, minor risk for sensitive groups.'}
                        {selectedCity.aqiCategory === 'Poor' && 'Respiratory issues possible on prolonged exposure.'}
                        {selectedCity.aqiCategory === 'Severe' && 'Health emergency. Everyone may begin to experience health effects.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro trend inside map view */}
                <div className="mt-6">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>6-Month Trend Overview</span>
                  </div>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedCity.historicalAQI} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="date" fontSize={9} stroke="#888888" tickLine={false} axisLine={false} />
                        <YAxis fontSize={9} stroke="#888888" tickLine={false} axisLine={false} domain={[0, 'auto']} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            borderRadius: '0.25rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: '9px'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="aqi"
                          stroke={getAqiColor(selectedCity.aqi)}
                          fill={getAqiColor(selectedCity.aqi)}
                          fillOpacity={0.15}
                          strokeWidth={1.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Info className="w-10 h-10 mb-2 opacity-40 text-blue-500 animate-pulse" />
                <p className="text-sm font-semibold">Select a node on the map to display metrics</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
