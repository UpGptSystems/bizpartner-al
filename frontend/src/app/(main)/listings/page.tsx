'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import SearchBar from '@/components/marketplace/SearchBar';
import ListingCard from '@/components/marketplace/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useListings, ListingFilters } from '@/hooks/useListings';
import { cn } from '@/lib/utils';

const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'price:asc', label: 'Price: Low to High' },
  { value: 'price:desc', label: 'Price: High to Low' },
  { value: 'views:desc', label: 'Most Popular' },
];

function ListingsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const filters: ListingFilters = {
    type: searchParams.get('type') || undefined,
    category: searchParams.get('category') || undefined,
    city: searchParams.get('city') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    sortBy: searchParams.get('sort')?.split(':')[0] || 'createdAt',
    sortOrder: (searchParams.get('sort')?.split(':')[1] as 'asc' | 'desc') || 'desc',
  };

  const { data, isLoading } = useListings(filters);

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/listings?${params.toString()}`);
  }, [searchParams, router]);

  const clearFilters = () => router.push('/listings');

  const activeFilterCount = ['type', 'category', 'city', 'minPrice', 'maxPrice', 'featured']
    .filter((k) => searchParams.get(k)).length;

  return (
    <div className="min-h-screen pt-16">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold">All Listings</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {data?.pagination.total?.toLocaleString() || 0} listings found
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {showFilters && (
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="rounded-xl border bg-card p-5 space-y-6 sticky top-20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="space-y-1.5">
                    {[
                      { value: '', label: 'All Types' },
                      { value: 'JOB', label: '💼 Jobs' },
                      { value: 'REAL_ESTATE', label: '🏠 Real Estate' },
                      { value: 'SERVICE', label: '🛠 Services' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateFilter('type', value)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          filters.type === value || (!filters.type && !value)
                            ? 'bg-brand-500/10 text-brand-500 font-medium'
                            : 'hover:bg-accent'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      defaultValue={filters.minPrice}
                      onBlur={(e) => updateFilter('minPrice', e.target.value)}
                      className="text-xs"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      defaultValue={filters.maxPrice}
                      onBlur={(e) => updateFilter('maxPrice', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">City</label>
                  <Input
                    placeholder="e.g. Tirana"
                    defaultValue={filters.city}
                    onBlur={(e) => updateFilter('city', e.target.value)}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.featured === true}
                      onChange={(e) => updateFilter('featured', e.target.checked ? 'true' : '')}
                      className="rounded border-input"
                    />
                    <span className="text-sm">Featured only</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {activeFilterCount > 0 && (
                  <>
                    {filters.type && (
                      <Badge variant="brand" className="gap-1">
                        {filters.type}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('type', '')} />
                      </Badge>
                    )}
                    {filters.city && (
                      <Badge variant="secondary" className="gap-1">
                        📍 {filters.city}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('city', '')} />
                      </Badge>
                    )}
                  </>
                )}
              </div>
              <select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-background"
              >
                {sortOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl border bg-card overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : data?.listings?.length ? (
              <>
                <div className={cn(
                  'grid gap-6',
                  viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                )}>
                  {data.listings.map((listing: any) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      variant={viewMode === 'list' ? 'featured' : 'default'}
                    />
                  ))}
                </div>

                {data.pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilter('page', String(page))}
                        className={cn(
                          'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
                          filters.page === page ? 'bg-brand-500 text-white' : 'border hover:bg-accent'
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
                <Button onClick={clearFilters} variant="outline">Clear filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" /></div>}>
      <ListingsPageContent />
    </Suspense>
  );
}
