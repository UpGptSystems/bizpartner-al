'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Users, ListFilter, BarChart3,
  Settings, Shield, LogOut, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/listings', icon: ListFilter, label: 'Listings' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user?.role]);

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Admin Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r bg-card fixed left-0 top-0 bottom-0 flex flex-col">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
              B
            </div>
            <div>
              <span className="font-bold text-sm gradient-text">BizPartner AL</span>
              <span className="ml-1.5 text-[10px] bg-brand-500/10 text-brand-500 px-1.5 py-0.5 rounded font-medium">Admin</span>
            </div>
          </div>
        </div>

        <div className="p-3 border-b">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Shield className="h-4 w-4 text-brand-500" />
            <div>
              <p className="text-xs font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-muted-foreground">{user.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {adminNav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-500/10 text-brand-500'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent transition-colors">
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to App
          </Link>
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  );
}
