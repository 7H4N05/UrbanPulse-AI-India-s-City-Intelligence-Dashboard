'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Wind, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { DashboardStats } from '../lib/data-processing';

interface DashboardOverviewProps {
  stats: DashboardStats;
}

export default function DashboardOverview({ stats }: DashboardOverviewProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return 'text-emerald-500 dark:text-emerald-400';
    if (aqi <= 150) return 'text-amber-500 dark:text-amber-400';
    if (aqi <= 300) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };

  const cards = [
    {
      title: 'Total Cities',
      value: stats.totalCities,
      subtitle: 'Monitored Urban Hubs',
      icon: Building2,
      color: 'text-blue-500 dark:text-blue-400 bg-blue-500/10',
    },
    {
      title: 'National Avg AQI',
      value: stats.averageAQI,
      subtitle: 'Weighted Pollutant Index',
      icon: Wind,
      color: getAqiColor(stats.averageAQI) + ' bg-slate-500/10',
      customValueStyle: getAqiColor(stats.averageAQI),
    },
    {
      title: 'Highest AQI City',
      value: stats.highestAQICity.aqi,
      subtitle: `${stats.highestAQICity.city}, ${stats.highestAQICity.state}`,
      icon: ShieldAlert,
      color: 'text-red-500 dark:text-red-400 bg-red-500/10',
      isCityCard: true,
      category: stats.highestAQICity.aqiCategory,
    },
    {
      title: 'Cleanest City',
      value: stats.cleanestCity.aqi,
      subtitle: `${stats.cleanestCity.city}, ${stats.cleanestCity.state}`,
      icon: Sparkles,
      color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10',
      isCityCard: true,
      category: stats.cleanestCity.aqiCategory,
    },
    {
      title: 'Population Covered',
      value: formatNumber(stats.totalPopulationCovered),
      subtitle: 'Census Demographics',
      icon: Users,
      color: 'text-cyan-500 dark:text-cyan-400 bg-cyan-500/10',
      isLargeText: true,
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            className="glass-card-interactive p-6 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-lg ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <h3 className={`text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 ${card.customValueStyle || ''}`}>
                  {card.value}
                </h3>
                {card.isCityCard && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    card.category === 'Good' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' :
                    card.category === 'Moderate' ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400' :
                    card.category === 'Poor' ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400' :
                    'bg-red-500/10 text-red-500 dark:text-red-400'
                  }`}>
                    {card.category}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                {card.subtitle}
              </p>
            </div>
            
            {/* Bottom Accent Decorator */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
