'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TrendingUp, Eye, Heart, MessageSquare, Plus, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { useMyListings } from '@/hooks/useListings';
import api from '@/lib/api';
import { formatPrice, formatRelativeTime, getStatusColor, cn } from '@/lib/utils';

function StatCard({ label, value, icon: Icon, color, change }: {
  label: string; value: string | number; icon: any; color: string; change?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {change && <p className="text-xs text-muted-foreground">{change}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: listingsData, isLoading: listingsLoading } = useMyListings();
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const { data } = await api.get('/payments/my-subscription');
      return data.data;
    },
  });

  const listings = listingsData?.listings || [];
  const stats = {
    total: listings.length,
    active: listings.filter((l: any) => l.status === 'ACTIVE').length,
    views: listings.reduce((sum: number, l: any) => sum + (l.views || 0), 0),
    pending: listings.filter((l: any) => l.status === 'PENDING').length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your listings</p>
        </div>
        <Link href="/listings/create">
          <Button variant="brand">
            <Plus className="h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Listings" value={stats.total} icon={TrendingUp} color="bg-brand-500/10 text-brand-500" change="All time" />
        <StatCard label="Active Listings" value={stats.active} icon={CheckCircle} color="bg-green-500/10 text-green-500" change="Currently live" />
        <StatCard label="Total Views" value={stats.views.toLocaleString()} icon={Eye} color="bg-blue-500/10 text-blue-500" change="Across all listings" />
        <StatCard label="Pending Review" value={stats.pending} icon={Clock} color="bg-yellow-500/10 text-yellow-500" change="Awaiting approval" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Listings */}
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-semibold">Recent Listings</h2>
            <Link href="/dashboard/listings">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {listingsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-14 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))
            ) : listings.length ? (
              listings.slice(0, 5).map((listing: any) => (
                <div key={listing.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-12 w-14 rounded-lg bg-muted flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listings/${listing.slug}`} className="font-medium text-sm hover:text-brand-500 transition-colors line-clamp-1">
                      {listing.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{listing.category?.name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.views}</span>
                      <span>·</span>
                      <span>{formatRelativeTime(listing.createdAt)}</span>
                    </div>
                  </div>
                  <Badge className={cn('text-[10px] shrink-0', getStatusColor(listing.status))}>
                    {listing.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📝</p>
                <p className="font-medium mb-1">No listings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Create your first listing to get started</p>
                <Link href="/listings/create">
                  <Button variant="brand" size="sm">
                    <Plus className="h-4 w-4" />
                    Create Listing
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Subscription card */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Your Plan</h3>
            {subscription ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="premium">{subscription.plan.name}</Badge>
                  <Badge variant="success" className="text-[10px]">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Renews {formatRelativeTime(subscription.currentPeriodEnd)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {subscription.plan.maxListings} max listings · {subscription.plan.featuredListings} featured
                </p>
                <Link href="/pricing" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full">Manage Plan</Button>
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to get more visibility for your listings.
                </p>
                <Link href="/pricing">
                  <Button variant="brand" size="sm" className="w-full">Upgrade Plan</Button>
                </Link>
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { href: '/listings/create', icon: Plus, label: 'Post New Ad', variant: 'brand' as const },
                { href: '/dashboard/messages', icon: MessageSquare, label: 'View Messages', variant: 'outline' as const },
                { href: '/dashboard/favorites', icon: Heart, label: 'My Favorites', variant: 'outline' as const },
              ].map(({ href, icon: Icon, label, variant }) => (
                <Link key={href} href={href}>
                  <Button variant={variant} size="sm" className="w-full justify-start">
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
