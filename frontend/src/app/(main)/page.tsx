'use client';
export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, Building2, Shield, Zap, TrendingUp, Users, Star, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SearchBar from '@/components/marketplace/SearchBar';
import ListingCard from '@/components/marketplace/ListingCard';
import { useFeaturedListings } from '@/hooks/useListings';
import { Skeleton } from '@/components/ui/skeleton';

const stats = [
  { value: '50,000+', label: 'Active Listings', icon: TrendingUp },
  { value: '120,000+', label: 'Registered Users', icon: Users },
  { value: '98%', label: 'Satisfaction Rate', icon: Star },
  { value: '24/7', label: 'Support Available', icon: Shield },
];

const categories = [
  { icon: '💼', label: 'Technology', count: '1,240', href: '/jobs?category=technology' },
  { icon: '🏠', label: 'Real Estate', count: '3,850', href: '/real-estate' },
  { icon: '🏥', label: 'Healthcare', count: '580', href: '/jobs?category=healthcare' },
  { icon: '📊', label: 'Finance', count: '720', href: '/jobs?category=finance' },
  { icon: '🎨', label: 'Design', count: '430', href: '/jobs?category=design' },
  { icon: '🚗', label: 'Automotive', count: '290', href: '/listings?category=automotive' },
  { icon: '🍕', label: 'Food & Beverage', count: '180', href: '/listings?category=food' },
  { icon: '📚', label: 'Education', count: '640', href: '/jobs?category=education' },
];

const features = [
  { icon: Shield, title: 'Verified Listings', desc: 'All listings verified by our moderation team' },
  { icon: Zap, title: 'Instant Alerts', desc: 'Real-time notifications for new matches' },
  { icon: Star, title: 'Premium Ads', desc: 'Boost your listing visibility with premium plans' },
];

export default function HomePage() {
  const { data: featuredListings, isLoading } = useFeaturedListings();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-hero-gradient">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="brand" className="mb-6 text-sm px-4 py-1.5">
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Albania's #1 Marketplace Platform
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your Next
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">
                Opportunity
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Discover thousands of jobs, properties, and services. Connect with verified employers and sellers across Albania.
            </p>

            <SearchBar variant="hero" />

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['Remote Jobs', 'Apartments in Tirana', 'Tech Startups', 'Villas for Sale'].map((tag) => (
                <button
                  key={tag}
                  className="text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-full px-3 py-1 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-6 w-6 text-brand-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Browse Categories</h2>
            <p className="text-muted-foreground">Find exactly what you're looking for</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(({ icon, label, count, href }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={href}
                  className="group flex flex-col items-center p-6 rounded-xl border bg-card hover:border-brand-500 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300"
                >
                  <span className="text-3xl mb-3">{icon}</span>
                  <span className="font-semibold text-sm text-center group-hover:text-brand-500 transition-colors">{label}</span>
                  <span className="text-xs text-muted-foreground mt-1">{count} listings</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
              <p className="text-muted-foreground">Hand-picked premium opportunities</p>
            </div>
            <Link href="/listings?featured=true">
              <Button variant="outline">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings?.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick links: Jobs & Real Estate */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Jobs CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white"
            >
              <div className="absolute top-4 right-4 opacity-20">
                <Briefcase className="h-24 w-24" />
              </div>
              <Badge className="bg-white/20 text-white border-0 mb-4">Jobs Marketplace</Badge>
              <h3 className="text-2xl font-bold mb-3">Find Your Dream Job</h3>
              <p className="text-white/80 mb-6">Browse thousands of opportunities from top Albanian companies.</p>
              <ul className="space-y-2 mb-6">
                {['Remote & On-site', 'All experience levels', 'Competitive salaries'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/jobs">
                <Button className="bg-white text-brand-600 hover:bg-white/90 font-semibold">
                  Browse Jobs <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Real Estate CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900 p-8 text-white"
            >
              <div className="absolute top-4 right-4 opacity-20">
                <Building2 className="h-24 w-24" />
              </div>
              <Badge className="bg-white/20 text-white border-0 mb-4">Real Estate</Badge>
              <h3 className="text-2xl font-bold mb-3">Find Your Perfect Home</h3>
              <p className="text-white/80 mb-6">Explore apartments, villas, and commercial properties.</p>
              <ul className="space-y-2 mb-6">
                {['Rent & Sale options', 'Verified properties', 'Virtual tours available'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/real-estate">
                <Button className="bg-white text-purple-600 hover:bg-white/90 font-semibold">
                  Browse Properties <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3">Why Choose BizPartner AL?</h2>
          <p className="text-muted-foreground mb-12">Everything you need in one platform</p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-xl border bg-card"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-brand-500" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-brand-500 to-purple-600 p-12 text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Join over 120,000 users and start discovering opportunities today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="xl" className="bg-white text-brand-600 hover:bg-white/90 font-semibold w-full sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/listings">
                <Button size="xl" variant="glass" className="w-full sm:w-auto">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
