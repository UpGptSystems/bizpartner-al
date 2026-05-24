import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'USD', priceUnit?: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return priceUnit ? `${formatted} ${priceUnit}` : formatted;
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date, fmt = 'MMM dd, yyyy'): string {
  return format(new Date(date), fmt);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
}

export function getListingTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    JOB: '💼',
    REAL_ESTATE: '🏠',
    PRODUCT: '📦',
    SERVICE: '🛠️',
  };
  return icons[type] || '📋';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ACTIVE: 'text-green-500 bg-green-500/10',
    PENDING: 'text-yellow-500 bg-yellow-500/10',
    REJECTED: 'text-red-500 bg-red-500/10',
    DRAFT: 'text-gray-500 bg-gray-500/10',
    EXPIRED: 'text-orange-500 bg-orange-500/10',
    SOLD: 'text-blue-500 bg-blue-500/10',
  };
  return colors[status] || 'text-gray-500 bg-gray-500/10';
}
