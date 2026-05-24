'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin, Eye, Clock, Heart, Share2, Flag, Briefcase, Home,
  CheckCircle2, Star, MessageSquare, DollarSign, BedDouble, Bath,
  Maximize, Calendar, Phone, Mail, ExternalLink, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useListing, useToggleFavorite } from '@/hooks/useListings';
import { useAuthStore } from '@/store/auth.store';
import { formatPrice, formatRelativeTime, formatDate, cn, getInitials } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: listing, isLoading } = useListing(slug);
  const { isAuthenticated, user } = useAuthStore();
  const toggleFavorite = useToggleFavorite();
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleFavorite = () => {
    if (!isAuthenticated) { toast.error('Sign in to save favorites'); return; }
    setIsFavorited((prev) => !prev);
    toggleFavorite.mutate(listing!.id, {
      onError: () => setIsFavorited((prev) => !prev),
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-2xl mb-8" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🔍</p>
          <h2 className="text-xl font-bold mb-2">Listing not found</h2>
          <p className="text-muted-foreground mb-6">This listing may have been removed or expired.</p>
          <Link href="/listings"><Button variant="brand">Browse Listings</Button></Link>
        </div>
      </div>
    );
  }

  const images = listing.images.length ? listing.images : ['/placeholder-listing.jpg'];
  const isOwner = user?.id === listing.userId;

  return (
    <div className="min-h-screen pt-16">
      {/* Image gallery */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 h-64 sm:h-96 lg:h-[500px]">
            <div className="relative overflow-hidden">
              <Image
                src={images[activeImageIndex]}
                alt={listing.title}
                fill
                className="object-cover"
                priority
              />
              {listing.isPremium && (
                <div className="absolute top-4 left-4">
                  <Badge variant="premium">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              {listing.isUrgent && (
                <div className="absolute top-4 left-4 mt-8">
                  <Badge className="bg-red-500 text-white border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="hidden lg:grid grid-cols-2 gap-1">
                {images.slice(1, 5).map((img, i) => (
                  <div
                    key={i}
                    className={cn('relative overflow-hidden cursor-pointer', i === 3 && images.length > 5 && 'relative')}
                    onClick={() => setActiveImageIndex(i + 1)}
                  >
                    <Image src={img} alt="" fill className="object-cover hover:opacity-90 transition-opacity" />
                    {i === 3 && images.length > 5 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl">
                        +{images.length - 5}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Link href="/listings" className="hover:text-foreground">Listings</Link>
              <span>/</span>
              <Link href={`/listings?type=${listing.type}`} className="hover:text-foreground">
                {listing.type.replace('_', ' ')}
              </Link>
              <span>/</span>
              <span className="text-foreground truncate">{listing.title}</span>
            </div>

            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {listing.views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatRelativeTime(listing.createdAt)}
                  </span>
                  {listing.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.city}, {listing.country}
                    </span>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {listing.category.name}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={handleFavorite} className="p-2.5 rounded-xl border hover:bg-accent transition-colors">
                  <Heart className={cn('h-5 w-5 transition-colors', isFavorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                </button>
                <button onClick={handleShare} className="p-2.5 rounded-xl border hover:bg-accent transition-colors">
                  <Share2 className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Price */}
            {listing.price && (
              <div className="rounded-xl bg-brand-500/5 border border-brand-500/20 p-4 mb-6 flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-brand-500" />
                <div>
                  <p className="text-2xl font-bold text-brand-500">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                  {listing.priceUnit && <p className="text-sm text-muted-foreground">{listing.priceUnit}</p>}
                </div>
              </div>
            )}

            {/* Job details */}
            {listing.type === 'JOB' && listing.jobDetails && (
              <div className="rounded-xl border bg-card p-5 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-brand-500" />
                  Job Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><span className="text-muted-foreground">Type:</span> <span className="font-medium ml-2">{listing.jobDetails.jobType.replace('_', ' ')}</span></div>
                  <div><span className="text-muted-foreground">Level:</span> <span className="font-medium ml-2">{listing.jobDetails.experienceLevel || 'Any'}</span></div>
                  {listing.jobDetails.salaryMin && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Salary:</span>
                      <span className="font-medium ml-2">
                        {formatPrice(listing.jobDetails.salaryMin, listing.jobDetails.salaryCurrency)} — {formatPrice(listing.jobDetails.salaryMax || 0, listing.jobDetails.salaryCurrency)} / {listing.jobDetails.salaryPeriod}
                      </span>
                    </div>
                  )}
                  <div><span className="text-muted-foreground">Positions:</span> <span className="font-medium ml-2">{listing.jobDetails.openPositions}</span></div>
                  {listing.jobDetails.isRemote && <div><Badge variant="info">Remote Available</Badge></div>}
                </div>

                {listing.jobDetails.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {listing.jobDetails.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.jobDetails.applicationDeadline && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Apply by {formatDate(listing.jobDetails.applicationDeadline)}
                  </p>
                )}
              </div>
            )}

            {/* Property details */}
            {listing.type === 'REAL_ESTATE' && listing.propertyDetails && (
              <div className="rounded-xl border bg-card p-5 mb-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Home className="h-4 w-4 text-brand-500" />
                  Property Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {listing.propertyDetails.bedrooms && (
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <BedDouble className="h-5 w-5 text-brand-500 mb-1" />
                      <span className="text-lg font-bold">{listing.propertyDetails.bedrooms}</span>
                      <span className="text-xs text-muted-foreground">Bedrooms</span>
                    </div>
                  )}
                  {listing.propertyDetails.bathrooms && (
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Bath className="h-5 w-5 text-brand-500 mb-1" />
                      <span className="text-lg font-bold">{listing.propertyDetails.bathrooms}</span>
                      <span className="text-xs text-muted-foreground">Bathrooms</span>
                    </div>
                  )}
                  {listing.propertyDetails.area && (
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Maximize className="h-5 w-5 text-brand-500 mb-1" />
                      <span className="text-lg font-bold">{listing.propertyDetails.area}</span>
                      <span className="text-xs text-muted-foreground">m²</span>
                    </div>
                  )}
                  {listing.propertyDetails.floor && (
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                      <Home className="h-5 w-5 text-brand-500 mb-1" />
                      <span className="text-lg font-bold">{listing.propertyDetails.floor}/{listing.propertyDetails.totalFloors}</span>
                      <span className="text-xs text-muted-foreground">Floor</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {listing.propertyDetails.furnished && <Badge variant="success">Furnished</Badge>}
                  {listing.propertyDetails.parking && <Badge variant="secondary">Parking</Badge>}
                  {listing.propertyDetails.balcony && <Badge variant="secondary">Balcony</Badge>}
                  {listing.propertyDetails.elevator && <Badge variant="secondary">Elevator</Badge>}
                  {listing.propertyDetails.pool && <Badge variant="secondary">Pool</Badge>}
                  {listing.propertyDetails.gym && <Badge variant="secondary">Gym</Badge>}
                  {listing.propertyDetails.petFriendly && <Badge variant="info">Pet Friendly</Badge>}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Description</h3>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.description}
              </div>
            </div>

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag) => (
                    <Badge key={tag} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact card */}
            <div className="rounded-xl border bg-card p-5 sticky top-20">
              <h3 className="font-semibold mb-4">Contact Seller</h3>

              <div className="flex items-center gap-3 mb-5">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  {listing.user.avatar ? (
                    <img src={listing.user.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    getInitials(listing.user.firstName || '', listing.user.lastName || '')
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm">
                      {listing.user.firstName} {listing.user.lastName}
                    </p>
                    {listing.user.isVerified && (
                      <CheckCircle2 className="h-4 w-4 text-brand-500" />
                    )}
                  </div>
                  {listing.user.company && (
                    <p className="text-xs text-muted-foreground">{listing.user.company}</p>
                  )}
                </div>
              </div>

              {isOwner ? (
                <Link href={`/listings/edit/${listing.id}`}>
                  <Button variant="outline" className="w-full mb-2">Edit Listing</Button>
                </Link>
              ) : (
                <>
                  <Button variant="brand" className="w-full mb-2" disabled={!isAuthenticated}>
                    <MessageSquare className="h-4 w-4" />
                    Send Message
                  </Button>
                  {listing.user.phone && (
                    <a href={`tel:${listing.user.phone}`}>
                      <Button variant="outline" className="w-full mb-2">
                        <Phone className="h-4 w-4" />
                        Call Now
                      </Button>
                    </a>
                  )}
                  {listing.user.email && (
                    <a href={`mailto:${listing.user.email}?subject=Inquiry about: ${listing.title}`}>
                      <Button variant="ghost" size="sm" className="w-full">
                        <Mail className="h-4 w-4" />
                        Email Seller
                      </Button>
                    </a>
                  )}
                </>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  <Link href="/auth/login" className="text-brand-500 hover:underline">Sign in</Link> to contact the seller
                </p>
              )}
            </div>

            {/* Safety notice */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-medium mb-1">Safety Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Meet in a public place for physical items</li>
                <li>• Never pay in advance without verification</li>
                <li>• Report suspicious listings</li>
              </ul>
              <button className="text-xs text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1">
                <Flag className="h-3 w-3" />
                Report this listing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
