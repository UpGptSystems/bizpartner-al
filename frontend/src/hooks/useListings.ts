'use client';

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Listing } from '@/types';
import { buildQueryString } from '@/lib/utils';

export interface ListingFilters {
  type?: string;
  category?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  premium?: boolean;
  jobType?: string;
  propertyType?: string;
  deal?: string;
  page?: number;
  limit?: number;
}

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data } = await api.get(`/listings?${buildQueryString(filters as any)}`);
      return data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useListing(slug: string) {
  return useQuery({
    queryKey: ['listing', slug],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${slug}`);
      return data.data as Listing;
    },
    enabled: !!slug,
  });
}

export function useFeaturedListings() {
  return useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/listings/featured');
      return data.data as Listing[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyListings(status?: string) {
  return useQuery({
    queryKey: ['my-listings', status],
    queryFn: async () => {
      const { data } = await api.get(`/listings/me${status ? `?status=${status}` : ''}`);
      return data.data;
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await api.get('/listings/favorites');
      return data.data as Listing[];
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listingId: string) => {
      const { data } = await api.post(`/listings/${listingId}/favorite`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(data.isFavorited ? 'Added to favorites' : 'Removed from favorites');
    },
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing submitted for review');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete listing');
    },
  });
}
