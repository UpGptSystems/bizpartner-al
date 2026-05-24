'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Eye, Clock, Star, Briefcase, Home, CheckCircle2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Listing } from '@/types';
import { formatPrice, formatRelativeTime, truncate, cn } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/useListings';
import { useAuthStore } from '@/store/auth.store';

interface ListingCardProps {
  listing: Listing;
  variant?: 'default' | 'compact' | 'featured';
  isFavorited?: boolean;
}

export default function ListingCard({ listing, variant = 'default', isFavorited: initialFavorited = false }: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const { isAuthenticated } = useAuthStore();
  const toggleFavorite = useToggleFavorite();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setIsFavorited((prev) => !prev);
    toggleFavorite.mutate(listing.id, {
      onError: () => setIsFavorited((prev) => !prev),
    });
  };

  const mainImage = listing.images[0] || '/placeholder-listing.jpg';

  if (variant === 'compact') {
    return (
      <Link href={`/listings/${listing.slug}`}>
        <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
          <div className="relative h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <Image src={mainImage} alt={listing.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-1">{listing.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {listing.city || listing.country}
            </p>
            {listing.price && (
              <p className="text-sm font-semibold text-brand-500 mt-1">
                {formatPrice(listing.price, listing.currency, listing.priceUnit)}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group relative rounded-xl border bg-card overflow-hidden hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300',
        listing.isPremium && 'ring-1 ring-brand-500/30',
        variant === 'featured' && 'lg:flex'
      )}
    >
      {/* Image */}
      <Link href={`/listings/${listing.slug}`} className={cn('block relative overflow-hidden', variant === 'featured' ? 'lg:w-2/5' : 'h-48')}>
        <div className={cn('relative w-full', variant === 'featured' ? 'h-full min-h-48' : 'h-48')}>
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {listing.isPremium && (
            <Badge variant="premium" className="text-[10px] px-2 py-0.5">
              <Star className="h-2.5 w-2.5 mr-1" />
              Premium
            </Badge>
          )}
          {listing.isUrgent && (
            <Badge className="text-[10px] px-2 py-0.5 bg-red-500 text-white border-0">
              <Zap className="h-2.5 w-2.5 mr-1" />
              Urgent
            </Badge>
          )}
          {listing.isFeatured && (
            <Badge variant="brand" className="text-[10px] px-2 py-0.5">
              Featured
            </Badge>
          )}
        </div>

        {/* Type badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-[10px] backdrop-blur-sm bg-background/80">
            {listing.type === 'JOB' ? (
              <Briefcase className="h-2.5 w-2.5 mr-1" />
            ) : (
              <Home className="h-2.5 w-2.5 mr-1" />
            )}
            {listing.type.replace('_', ' ')}
          </Badge>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/listings/${listing.slug}`} className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-brand-500 transition-colors">
              {listing.title}
            </h3>
          </Link>

          {isAuthenticated && (
            <button
              onClick={handleFavorite}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={cn('h-4 w-4 transition-colors', isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
              />
            </button>
          )}
        </div>

        {/* Category */}
        <p className="text-xs text-brand-500 font-medium mb-2">{listing.category.name}</p>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
          {truncate(listing.description, 120)}
        </p>

        {/* Job specific */}
        {listing.type === 'JOB' && listing.jobDetails && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            <Badge variant="secondary" className="text-[10px]">{listing.jobDetails.jobType.replace('_', ' ')}</Badge>
            {listing.jobDetails.isRemote && <Badge variant="info" className="text-[10px]">Remote</Badge>}
            {listing.jobDetails.experienceLevel && (
              <Badge variant="outline" className="text-[10px]">{listing.jobDetails.experienceLevel}</Badge>
            )}
          </div>
        )}

        {/* Property specific */}
        {listing.type === 'REAL_ESTATE' && listing.propertyDetails && (
          <div className="flex gap-3 text-xs text-muted-foreground mb-3">
            {listing.propertyDetails.bedrooms && (
              <span>🛏 {listing.propertyDetails.bedrooms} bed</span>
            )}
            {listing.propertyDetails.bathrooms && (
              <span>🚿 {listing.propertyDetails.bathrooms} bath</span>
            )}
            {listing.propertyDetails.area && (
              <span>📐 {listing.propertyDetails.area}m²</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t">
          <div>
            {listing.price ? (
              <p className="font-bold text-base text-brand-500">
                {formatPrice(listing.price, listing.currency)}
                {listing.priceUnit && <span className="text-xs font-normal text-muted-foreground"> {listing.priceUnit}</span>}
              </p>
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Negotiable</p>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {listing.views}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(listing.createdAt)}
            </span>
          </div>
        </div>

        {/* Publisher info */}
        <div className="flex items-center gap-2 mt-3">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {listing.user.firstName?.[0]}{listing.user.lastName?.[0]}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {listing.user.firstName} {listing.user.lastName}
          </span>
          {listing.user.isVerified && (
            <CheckCircle2 className="h-3 w-3 text-brand-500 flex-shrink-0" />
          )}
          {listing.city && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {listing.city}
              </span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
