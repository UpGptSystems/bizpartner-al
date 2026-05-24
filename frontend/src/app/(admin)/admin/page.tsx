'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, ListFilter, DollarSign, Clock, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { formatPrice, formatRelativeTime, cn, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color, subtext }: {
  label: string; value: string | number; icon: any; color: string; subtext?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/admin/listings/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Listing approved');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.put(`/admin/listings/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Listing rejected');
    },
  });

  const handleReject = (id: string) => {
    const reason = prompt('Rejection reason:');
    if (reason) rejectMutation.mutate({ id, reason });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform statistics and management</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Users" value={data?.stats.totalUsers?.toLocaleString() || 0} icon={Users} color="bg-blue-500/10 text-blue-500" subtext="Registered accounts" />
          <StatCard label="Total Listings" value={data?.stats.totalListings?.toLocaleString() || 0} icon={ListFilter} color="bg-brand-500/10 text-brand-500" subtext="All time" />
          <StatCard label="Total Revenue" value={formatPrice(data?.stats.totalRevenue || 0)} icon={DollarSign} color="bg-green-500/10 text-green-500" subtext="Completed payments" />
          <StatCard label="Active Listings" value={data?.stats.activeListings || 0} icon={CheckCircle} color="bg-emerald-500/10 text-emerald-500" subtext="Currently live" />
          <StatCard label="Pending Review" value={data?.stats.pendingListings || 0} icon={Clock} color="bg-yellow-500/10 text-yellow-500" subtext="Awaiting moderation" />
          <StatCard label="New Users (Month)" value={data?.stats.newUsersThisMonth || 0} icon={TrendingUp} color="bg-purple-500/10 text-purple-500" subtext="This month" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Listings */}
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Pending Listings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Listings awaiting your review</p>
          </div>
          <div className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="h-12 w-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : data?.recentListings?.length ? (
              data.recentListings.map((listing: any) => (
                <div key={listing.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="h-12 w-14 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {listing.user?.firstName} {listing.user?.lastName} · {listing.category?.name} · {formatRelativeTime(listing.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-green-500/30 text-green-500 hover:bg-green-500/10"
                      onClick={() => approveMutation.mutate(listing.id)}
                      loading={approveMutation.isPending}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-red-500/30 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleReject(listing.id)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-500" />
                <p className="font-medium">All caught up!</p>
                <p className="text-sm">No listings pending review</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="rounded-xl border bg-card">
          <div className="p-5 border-b">
            <h2 className="font-semibold">Top Categories</h2>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))
            ) : data?.topCategories?.map((cat: any, i: number) => (
              <div key={cat.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{cat._count?.listings}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
