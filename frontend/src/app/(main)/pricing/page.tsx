'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, Zap, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const planIcons = { FREE: Shield, BASIC: Zap, PREMIUM: Star, ENTERPRISE: CheckCircle };
const planColors: Record<string, string> = {
  FREE: 'border-border',
  BASIC: 'border-brand-500/50',
  PREMIUM: 'border-yellow-500/50 ring-1 ring-yellow-500/20',
  ENTERPRISE: 'border-purple-500/50',
};

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await api.get('/payments/plans');
      return data.data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await api.post('/payments/checkout', { planId });
      return data.data;
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: () => toast.error('Failed to start checkout'),
  });

  const handleSelectPlan = (plan: any) => {
    if (!isAuthenticated) {
      router.push('/auth/register');
      return;
    }
    if (plan.price === 0) {
      toast.success('You are on the Free plan!');
      return;
    }
    checkoutMutation.mutate(plan.id);
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="brand" className="mb-4">Pricing Plans</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5">
            Choose your{' '}
            <span className="gradient-text">plan</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include our core features.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 rounded-2xl border bg-card animate-pulse" />
            ))
          ) : (
            plans?.map((plan: any, i: number) => {
              const Icon = planIcons[plan.type as keyof typeof planIcons] || Shield;
              const isPopular = plan.type === 'PREMIUM';
              const features = plan.features as Record<string, boolean | string>;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border bg-card p-6 flex flex-col ${planColors[plan.type] || 'border-border'}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="premium" className="px-3 py-1">Most Popular</Badge>
                    </div>
                  )}

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isPopular ? 'bg-yellow-500/10 text-yellow-500' : 'bg-brand-500/10 text-brand-500'}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/{plan.interval.toLowerCase()}</span>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {[
                      `${plan.maxListings} listings`,
                      `${plan.featuredListings} featured listings`,
                      `${plan.premiumListings} premium placements`,
                      ...(Array.isArray(features) ? features : Object.entries(features).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '))),
                    ].map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="capitalize">{String(feature)}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isPopular ? 'gradient' : 'outline'}
                    className="w-full"
                    onClick={() => handleSelectPlan(plan)}
                    loading={checkoutMutation.isPending}
                  >
                    {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name}`}
                  </Button>
                </motion.div>
              );
            })
          )}
        </div>

        {/* FAQ or trust badges */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            All plans include SSL security, 24/7 support, and no hidden fees.
            <br />
            Cancel anytime. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
