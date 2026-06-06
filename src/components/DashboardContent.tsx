'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sun, Moon, Download, FileText, Share2, Printer, ShieldCheck } from 'lucide-react';
import citiesData from '../data/cities.json';
import { CityData } from '../lib/ranking-engine';
import { getDashboardStats, generateInsights } from '../lib/data-processing';
import DashboardOverview from './DashboardOverview';
import InteractiveMap from './InteractiveMap';
import InsightsPanel from './InsightsPanel';
import CityRankingTable from './CityRankingTable';
import CityComparisonTool from './CityComparisonTool';
import Visualizations from './Visualizations';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // Initialize theme from system preference or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Typecast cities data
  const cities = citiesData as CityData[];

  // Calculate statistics and generate insights
  const stats = getDashboardStats(cities);
  const insights = generateInsights(cities);

  // Grab shared city IDs from query params (if any)
  const city1Param = searchParams.get('city1') || undefined;
  const city2Param = searchParams.get('city2') || undefined;

  // Bonus: Download City Summary Report (JSON format)
  const handleDownloadReport = () => {
    const reportData = {
      reportTitle: "UrbanPulse AI - India City Intelligence Report",
      generatedAt: new Date().toLocaleString('en-IN'),
      nationalMetrics: {
        totalCities: stats.totalCities,
        averageNationalAQI: stats.averageAQI,
        highestAQICity: {
          city: stats.highestAQICity.city,
          state: stats.highestAQICity.state,
          aqi: stats.highestAQICity.aqi,
        },
        cleanestCity: {
          city: stats.cleanestCity.city,
          state: stats.cleanestCity.state,
          aqi: stats.cleanestCity.aqi,
        },
        populationCoverage: stats.totalPopulationCovered,
      },
      keyInsights: insights.map(i => ({
        category: i.title,
        detail: i.text,
        metric: i.stat || 'N/A'
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `urbanpulse_national_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bonus: Share Comparison Link
  const handleShareLink = () => {
    // Select default or current compared cities in Comparison panel
    const compAElement = document.querySelector('select:nth-of-type(1)') as HTMLSelectElement | null;
    const compBElement = document.querySelector('select:nth-of-type(2)') as HTMLSelectElement | null;
    
    const idA = compAElement?.value || 'city-1'; // Delhi ID
    const idB = compBElement?.value || 'city-3'; // Bangalore ID

    const shareUrl = `${window.location.origin}${window.location.pathname}?city1=${idA}&city2=${idB}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareStatus('Comparison link copied!');
      setTimeout(() => setShareStatus(null), 3000);
    }).catch(() => {
      setShareStatus('Failed to copy link');
      setTimeout(() => setShareStatus(null), 3000);
    });
  };

  // Bonus: Export to PDF (Trigger print view with custom print sheets)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/80 pb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
              UrbanPulse AI
              <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                IN-Admin
              </span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              India's Environmental & Demographic Intelligence Hub
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Share Comparison */}
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-500/5 dark:hover:bg-slate-400/5 text-slate-700 dark:text-slate-300 transition-colors relative cursor-pointer"
            title="Copy current comparison setup as a shareable URL link"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>{shareStatus || 'Share Link'}</span>
          </button>

          {/* Download JSON Report */}
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-500/5 dark:hover:bg-slate-400/5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Download national ecological report in JSON format"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Report JSON</span>
          </button>

          {/* Print PDF */}
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-500/5 dark:hover:bg-slate-400/5 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Print dashboard or save as PDF"
          >
            <Printer className="w-4 h-4 text-cyan-500" />
            <span>Print / PDF</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-500/5 dark:hover:bg-slate-400/5 transition-colors cursor-pointer"
            aria-label="Toggle light/dark theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4.5 h-4.5 text-indigo-500" />
            ) : (
              <Sun className="w-4.5 h-4.5 text-amber-500" />
            )}
          </button>
        </div>
      </header>

      {/* KPI METRIC CARDS ROW */}
      <section className="print:block">
        <DashboardOverview stats={stats} />
      </section>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Spatial Map (2/3 cols) */}
        <section className="lg:col-span-2 print:break-inside-avoid">
          <InteractiveMap cities={cities} />
        </section>

        {/* AI Insights (1/3 col) */}
        <section className="print:break-inside-avoid">
          <InsightsPanel insights={insights} />
        </section>

        {/* Charts & Visualizations (2/3 cols) */}
        <section className="lg:col-span-2 print:break-inside-avoid">
          <Visualizations cities={cities} />
        </section>

        {/* City Comparison (1/3 col) */}
        <section className="print:break-inside-avoid">
          <CityComparisonTool 
            cities={cities} 
            initialCityAId={city1Param} 
            initialCityBId={city2Param} 
          />
        </section>

        {/* City Ranking Table (Full width) */}
        <section className="lg:col-span-3 print:break-inside-avoid">
          <CityRankingTable cities={cities} />
        </section>
      </div>

      {/* FOOTER */}
      <footer className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/80 pt-6 mt-6 print:hidden">
        UrbanPulse AI © {new Date().getFullYear()} — Ministry of Municipal Ecology & Demographics. Generated with CPCB datasets and Census aggregates.
      </footer>
    </div>
  );
}
