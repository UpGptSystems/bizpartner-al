'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/hooks/useAuth';

const registerSchema = z.object({
  firstName: z.string().min(2, 'At least 2 characters'),
  lastName: z.string().min(2, 'At least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const register = useRegister();

  const { register: reg, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    const { confirmPassword, ...payload } = data;
    register.mutate(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
          <p className="text-white/60 text-sm">Join BizPartner AL today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">First Name</label>
              <Input
                {...reg('firstName')}
                placeholder="John"
                error={errors.firstName?.message}
                leftIcon={<User className="h-3.5 w-3.5" />}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Last Name</label>
              <Input
                {...reg('lastName')}
                placeholder="Doe"
                error={errors.lastName?.message}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">Email</label>
            <Input
              {...reg('email')}
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              leftIcon={<Mail className="h-4 w-4" />}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">Phone (optional)</label>
            <Input
              {...reg('phone')}
              placeholder="+355 6X XXX XXXX"
              leftIcon={<Phone className="h-4 w-4" />}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">Password</label>
            <Input
              {...reg('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              error={errors.password?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80 mb-1.5">Confirm Password</label>
            <Input
              {...reg('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="h-4 w-4" />}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-brand-500"
            />
          </div>

          <p className="text-xs text-white/50">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-brand-400 hover:underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
          </p>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            loading={register.isPending}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
