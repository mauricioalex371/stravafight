/**
 * STRAVA FIGHT — Image Optimizer & Responsive Media Utility
 * 
 * Provides:
 * - Dynamic WebP/AVIF format auto-negotiation
 * - Responsive srcset generation for high-DPI retina mobile devices
 * - Thumbnail generator for avatars, comments, search results, and feed cards
 * - Aspect ratio definitions to eliminate Cumulative Layout Shift (CLS)
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  fit?: 'cover' | 'crop' | 'contain';
}

/**
 * Optimizes an image URL for display, appending CDN parameters for Unsplash or Supabase Storage.
 */
export function getOptimizedImageUrl(url: string, options: ImageOptimizationOptions = {}): string {
  if (!url || typeof url !== 'string') return '';

  // Data URLs, Blobs or local assets
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/assets/')) {
    return url;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    fit = 'crop'
  } = options;

  try {
    // 1. Unsplash CDN Optimization
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      if (width) urlObj.searchParams.set('w', width.toString());
      if (height) urlObj.searchParams.set('h', height.toString());
      urlObj.searchParams.set('q', quality.toString());
      urlObj.searchParams.set('fit', fit);
      
      if (format === 'auto') {
        urlObj.searchParams.set('auto', 'format');
      } else {
        urlObj.searchParams.set('fm', format);
      }
      return urlObj.toString();
    }

    // 2. Supabase Storage Image Transformation (Pro/Enterprise or via Edge Function)
    if (url.includes('supabase.co/storage/v1/object/public')) {
      // Supabase supports image transformations on the /render/image/public endpoint
      const transformedUrl = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
      );
      const urlObj = new URL(transformedUrl);
      if (width) urlObj.searchParams.set('width', width.toString());
      if (height) urlObj.searchParams.set('height', height.toString());
      urlObj.searchParams.set('quality', quality.toString());
      if (format !== 'auto') {
        urlObj.searchParams.set('format', format);
      }
      return urlObj.toString();
    }
  } catch (e) {
    // If URL parsing fails, return original URL safely
    return url;
  }

  return url;
}

/**
 * Generates an optimized thumbnail for user avatars (80px), search previews (150px) or comments (96px).
 */
export function getThumbnailUrl(url: string, size: 'micro' | 'avatar' | 'card' | 'banner' = 'avatar'): string {
  const dimensions: Record<string, { width: number; height: number; quality: number }> = {
    micro: { width: 64, height: 64, quality: 75 },
    avatar: { width: 120, height: 120, quality: 80 },
    card: { width: 480, height: 480, quality: 80 },
    banner: { width: 960, height: 540, quality: 85 }
  };

  const dim = dimensions[size] || dimensions.avatar;
  return getOptimizedImageUrl(url, {
    width: dim.width,
    height: dim.height,
    quality: dim.quality,
    fit: 'crop',
    format: 'auto'
  });
}

/**
 * Generates a responsive srcset string for 1x, 2x and 3x retina displays.
 */
export function getResponsiveSrcSet(url: string, baseWidth: number): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/assets/')) {
    return '';
  }

  const widths = [baseWidth, Math.round(baseWidth * 1.5), baseWidth * 2];
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w, quality: 80 })} ${w}w`)
    .join(', ');
}

/**
 * Recommended CSS Aspect Ratios to prevent CLS (Cumulative Layout Shift)
 */
export const ASPECT_RATIOS = {
  SQUARE: 'aspect-square', // 1:1 Feed photo, avatar
  PORTRAIT_FEED: 'aspect-[4/5]', // Instagram standard feed portrait
  STORY_REEL: 'aspect-[9/16]', // Reels & Stories
  WIDE_BANNER: 'aspect-[16/9]' // Event banners, Cover photos
};
