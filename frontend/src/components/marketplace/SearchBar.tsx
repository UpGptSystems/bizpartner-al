'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  onSearch?: (query: string, location: string) => void;
}

export default function SearchBar({ variant = 'hero', onSearch }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('city') || '');
  const [activeTab, setActiveTab] = useState<'ALL' | 'JOB' | 'REAL_ESTATE'>('ALL');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query, location);
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (location) params.set('city', location);
    if (activeTab !== 'ALL') params.set('type', activeTab);

    const path = activeTab === 'JOB' ? '/jobs' : activeTab === 'REAL_ESTATE' ? '/real-estate' : '/listings';
    router.push(`${path}?${params.toString()}`);
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search listings..."
          leftIcon={<Search className="h-4 w-4" />}
          className="flex-1"
        />
        <Button type="submit" variant="brand" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-3xl mx-auto"
    >
      {/* Tab switcher */}
      <div className="flex gap-1 mb-3 bg-white/10 backdrop-blur-sm rounded-xl p-1 w-fit mx-auto">
        {(['ALL', 'JOB', 'REAL_ESTATE'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab === 'JOB' ? 'Jobs' : 'Real Estate'}
          </button>
        ))}
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-2 bg-white/95 dark:bg-card rounded-2xl p-2 shadow-2xl"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={activeTab === 'JOB' ? 'Job title, skills, company...' : activeTab === 'REAL_ESTATE' ? 'Property type, features...' : 'What are you looking for?'}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent focus:outline-none"
          />
        </div>
        <div className="w-px bg-border hidden sm:block my-1" />
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, area..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent focus:outline-none"
          />
        </div>
        <Button type="submit" variant="brand" size="lg" className="shrink-0 rounded-xl">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </Button>
      </form>

      <p className="text-center text-white/60 text-xs mt-3">
        Thousands of listings in Albania and beyond
      </p>
    </motion.div>
  );
}
