/**
 * Server-side data fetching service for Workvence gigs and packages.
 * Designed for Next.js SSR and ISR with built-in timeout and graceful fallback shielding.
 */

const getBackendBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    const cleaned = envUrl.trim().replace(/\/$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  return "https://devadmin.workvence.com/api";
};

export async function getInitialPackages(params?: Record<string, string | string[] | undefined>) {
  try {
    const baseUrl = getBackendBaseUrl();
    const query = new URLSearchParams();

    const getParam = (key: string): string => {
      const val = params?.[key];
      if (Array.isArray(val)) return val[0] || '';
      return typeof val === 'string' ? val : '';
    };

    const search = getParam('search');
    const category = getParam('category') || getParam('cat');
    const min = getParam('min');
    const max = getParam('max');
    const sort = getParam('sort');
    const page = getParam('page');

    if (search.trim()) query.set('search', search.trim());
    if (category.trim() && category !== 'All services' && category !== 'Results') {
      query.set('category', category.trim());
    }
    if (min.trim()) query.set('min', min.trim());
    if (max.trim()) query.set('max', max.trim());
    if (sort.trim()) query.set('sort', sort.trim());
    query.set('limit', '20');
    query.set('page', page.trim() || '1');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${baseUrl}/gigs?${query.toString()}`, {
      signal: controller.signal,
      next: { revalidate: 60 }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[getInitialPackages] Backend returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data || [];
  } catch (error: any) {
    console.warn(`[getInitialPackages] Non-fatal fetch error:`, error?.message || error);
    return [];
  }
}

export async function getSingleGig(id: string) {
  if (!id) return null;
  try {
    const baseUrl = getBackendBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${baseUrl}/gigs/single/${encodeURIComponent(id)}`, {
      signal: controller.signal,
      next: { revalidate: 60 }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[getSingleGig] Backend returned HTTP ${res.status} for ID: ${id}`);
      return null;
    }

    const data = await res.json();
    if (data) {
      const rawImgs = Array.isArray(data.images) ? data.images : [];
      data.images = Array.from(new Set([data.cover, ...rawImgs].filter(Boolean)));
    }
    return data || null;
  } catch (error: any) {
    console.warn(`[getSingleGig] Non-fatal fetch error for ID ${id}:`, error?.message || error);
    return null;
  }
}
