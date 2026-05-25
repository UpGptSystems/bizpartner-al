'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Briefcase, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ListingCard from '@/components/marketplace/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useListings } from '@/hooks/useListings';
import SearchBar from '@/components/marketplace/SearchBar';
import { mockJobs } from '@/lib/mockListings';

const jobTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'FREELANCE', 'INTERNSHIP'];

function JobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    type: 'JOB',
    search: searchParams.get('search') || undefined,
    city: searchParams.get('city') || undefined,
    category: searchParams.get('category') || undefined,
    jobType: searchParams.get('jobType') || undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const { data, isLoading } = useListings(filters);
  const listings = data?.listings?.length ? data.listings : mockJobs;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-16">
      <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-gray-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <Badge variant="brand" className="mb-4">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            Job Marketplace
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Job</h1>
          <p className="text-white/70 text-lg mb-8">Thousands of opportunities from top Albanian companies</p>
          <SearchBar variant="hero" />
        </div>
      </div>

      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <span className="text-sm font-medium text-muted-foreground self-center mr-2">Job Type:</span>
            {jobTypes.map((type) => (
              <button
                key={type}
                onClick={() => updateFilter('jobType', filters.jobType === type ? '' : type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  filters.jobType === type
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'border-input hover:border-brand-500 hover:text-brand-500'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold">
              {listings.length.toLocaleString()} jobs found
            </h2>
            {filters.city && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {filters.city}
              </p>
            )}
          </div>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-16 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" /></div>}>
      <JobsPageContent />
    </Suspense>
  );
}
