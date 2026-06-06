'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertOctagon, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';
import { InsightItem } from '../lib/data-processing';

interface InsightsPanelProps {
  insights: InsightItem[];
}

export default function InsightsPanel({ insights }: InsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return AlertOctagon;
      case 'warning':
        return TrendingUp;
      case 'success':
        return Sparkles;
      default:
        return Lightbulb;
    }
  };

  const getColorStyles = (type: string) => {
    switch (type) {
      case 'danger':
        return {
          border: 'border-red-500/20 dark:border-red-500/10',
          bg: 'bg-red-500/5 dark:bg-red-500/5',
          text: 'text-red-600 dark:text-red-400',
          badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
          bullet: 'bg-red-500',
        };
      case 'warning':
        return {
          border: 'border-amber-500/20 dark:border-amber-500/10',
          bg: 'bg-amber-500/5 dark:bg-amber-500/5',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
          bullet: 'bg-amber-500',
        };
      case 'success':
        return {
          border: 'border-emerald-500/20 dark:border-emerald-500/10',
          bg: 'bg-emerald-500/5 dark:bg-emerald-500/5',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
          bullet: 'bg-emerald-500',
        };
      default:
        return {
          border: 'border-blue-500/20 dark:border-blue-500/10',
          bg: 'bg-blue-500/5 dark:bg-blue-500/5',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
          bullet: 'bg-blue-500',
        };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Intelligence Insights</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Dynamic analysis of environmental and demographic overlays</p>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 flex-1 overflow-y-auto pr-1"
      >
        {insights.map((insight) => {
          const Icon = getIcon(insight.type);
          const colors = getColorStyles(insight.type);

          return (
            <motion.div
              key={insight.id}
              variants={item}
              className={`p-4 rounded-xl border ${colors.border} ${colors.bg} transition-all duration-300 hover:shadow-sm`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 ${colors.text} shrink-0`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {insight.title}
                    </span>
                    {insight.stat && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                        {insight.stat}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                    {insight.text}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        {insights.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <HelpCircle className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm font-medium">No insights generated for current selection</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
