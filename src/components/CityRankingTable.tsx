'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { CityData } from '../lib/ranking-engine';
import { exportToCSV } from '../lib/data-processing';

interface CityRankingTableProps {
  cities: CityData[];
}

type SortField = 'rank' | 'city' | 'aqi' | 'population' | 'aqiPer100k';
type SortOrder = 'asc' | 'desc';

export default function CityRankingTable({ cities }: CityRankingTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Compute AQI per 100k for sorting and display
  const processedCities = useMemo(() => {
    return cities.map(c => ({
      ...c,
      aqiPer100k: (c.aqi / c.population) * 100000
    }));
  }, [cities]);

  // Handle category filtering
  const filteredCities = useMemo(() => {
    return processedCities.filter(c => {
      const matchesSearch = c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || c.aqiCategory === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [processedCities, searchTerm, selectedCategory]);

  // Handle sorting
  const sortedCities = useMemo(() => {
    const sorted = [...filteredCities];
    sorted.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      // Numbers
      return sortOrder === 'asc' 
        ? (valA as number) - (valB as number) 
        : (valB as number) - (valA as number);
    });
    return sorted;
  }, [filteredCities, sortField, sortOrder]);

  // Handle pagination
  const paginatedCities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCities.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCities, currentPage]);

  const totalPages = Math.ceil(sortedCities.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleDownloadCSV = () => {
    // Generate CSV string based on currently sorted and filtered data
    const csvContent = exportToCSV(sortedCities);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `urbanpulse_ranking_${selectedCategory.toLowerCase()}_page_${currentPage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAqiBadgeStyle = (category: string) => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'Poor':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4 ml-1 inline" /> : <ChevronDown className="w-4 h-4 ml-1 inline" />;
  };

  return (
    <div className="glass-panel p-6 flex flex-col h-full">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">National Air Quality Index Ranking</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Interactive directory sorted by environmental sustainability</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative max-w-xs w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search city or state..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input pl-9 w-full text-sm py-2"
            />
          </div>

          {/* Export Button */}
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/10 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mr-2">Filters:</span>
        {['All', 'Good', 'Moderate', 'Poor', 'Severe'].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
              selectedCategory === cat
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'bg-slate-500/5 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-500/10'
            } cursor-pointer`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200/50 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <th onClick={() => handleSort('rank')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors w-20">
                Rank <SortIcon field="rank" />
              </th>
              <th onClick={() => handleSort('city')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
                City <SortIcon field="city" />
              </th>
              <th onClick={() => handleSort('aqi')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-right w-24">
                AQI <SortIcon field="aqi" />
              </th>
              <th className="py-3.5 px-4 text-center w-28">Category</th>
              <th onClick={() => handleSort('population')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-right hidden md:table-cell w-36">
                Population <SortIcon field="population" />
              </th>
              <th onClick={() => handleSort('aqiPer100k')} className="py-3.5 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-right hidden lg:table-cell w-44">
                AQI / 100k <SortIcon field="aqiPer100k" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/80 text-sm font-medium text-slate-700 dark:text-slate-300">
            {paginatedCities.map((city) => (
              <tr 
                key={city.id} 
                className="hover:bg-slate-500/5 dark:hover:bg-slate-400/5 transition-colors duration-150"
              >
                <td className="py-4 px-4 font-bold text-slate-400 dark:text-slate-500">
                  #{city.rank}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{city.city}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">{city.state}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-semibold text-slate-800 dark:text-slate-100">
                  {city.aqi}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-bold border ${getAqiBadgeStyle(city.aqiCategory)}`}>
                    {city.aqiCategory}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">
                  {formatNumber(city.population)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-[13px] text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                  {city.aqiPer100k.toFixed(3)}
                </td>
              </tr>
            ))}

            {paginatedCities.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No cities found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800 pt-5 mt-4 text-xs font-semibold text-slate-500">
          <div>
            Showing <span className="text-slate-700 dark:text-slate-300">{Math.min(filteredCities.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
            <span className="text-slate-700 dark:text-slate-300">
              {Math.min(filteredCities.length, currentPage * itemsPerPage)}
            </span>{' '}
            of <span className="text-slate-700 dark:text-slate-300">{filteredCities.length}</span> cities
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 hover:bg-slate-500/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Display page numbers around the current page
              let pageNum = currentPage;
              if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all border ${
                    currentPage === pageNum
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200/20 hover:bg-slate-500/10 text-slate-600 dark:text-slate-400'
                  } cursor-pointer`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-800 hover:bg-slate-500/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
