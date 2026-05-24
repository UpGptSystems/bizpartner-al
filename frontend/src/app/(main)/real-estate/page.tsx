'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ListingCard from '@/components/marketplace/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useListings } from '@/hooks/useListings';
import SearchBar from '@/components/marketplace/SearchBar';

const dealTypes = [
  { value: '', label: 'All' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'SALE', label: 'For Sale' },
  { value: 'LEASE', label: 'For Lease' },
];

const propertyTypes = ['APARTMENT', 'HOUSE', 'VILLA', 'OFFICE', 'LAND', 'COMMERCIAL'];

function RealEstatePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    type: 'REAL_ESTATE',
    search: searchParams.get('search') || undefined,
    city: searchParams.get('city') || undefined,
    deal: searchParams.get('deal') || undefined,
    propertyType: searchParams.get('propertyType') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const { data, isLoading } = useListings(filters);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/real-estate?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Real Estate
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Dream Property</h1>
          <p className="text-white/70 text-lg mb-8">Browse apartments, villas, and commercial properties across Albania</p>
          <SearchBar variant="hero" />
        </div>
      </div>

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground mr-2">Deal Type:</span>
            {dealTypes.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateFilter('deal', value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  (filters.deal || '') === value
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'border-input hover:border-brand-500 hover:text-brand-500'
                }`}
              >
                {label}
              </button>
            ))}
            <div className="ml-auto flex gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => updateFilter('propertyType', filters.propertyType === type ? '' : type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    filters.propertyType === type
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'border-input hover:border-purple-500 hover:text-purple-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold">
            {data?.pagination.total?.toLocaleString() || 0} properties found
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try different search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RealEstatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" /></div>}>
      <RealEstatePageContent />
    </Suspense>
  );
}
