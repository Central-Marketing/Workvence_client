/**
 * Utility for Cloudinary Dynamic Optimization
 * Injects dynamic quality (`q_auto`) and automatic format delivery (`f_auto`).
 */

export interface CloudinaryTransformOptions {
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'limit' | 'pad' | 'thumb';
}

/**
 * Transforms a raw Cloudinary URL into a dynamic quality URL with auto-formatting.
 *
 * @example
 * getOptimizedCloudinaryUrl("https://res.cloudinary.com/dlqhnyh8r/image/upload/v1791778458/loginImage_cf5vyu.webp")
 * // => "https://res.cloudinary.com/dlqhnyh8r/image/upload/f_auto,q_auto/v1791778458/loginImage_cf5vyu.webp"
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options?: CloudinaryTransformOptions
): string {
  if (!url || typeof url !== "string") return url || "";
  if (!url.includes("res.cloudinary.com")) return url;

  // Build transformation string
  const transforms: string[] = [];
  const format = options?.format || 'auto';
  const quality = options?.quality || 'auto';

  transforms.push(`f_${format}`);
  transforms.push(`q_${quality}`);

  if (options?.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options?.height) {
    transforms.push(`h_${options.height}`);
  }
  if (options?.crop) {
    transforms.push(`c_${options.crop}`);
  }

  const transformSegment = transforms.join(",");

  // Check if image already has transformations injected
  if (url.includes("/image/upload/f_auto") || url.includes("/image/upload/q_auto")) {
    return url;
  }

  // Replace /image/upload/ with /image/upload/<transformations>/
  return url.replace("/image/upload/", `/image/upload/${transformSegment}/`);
}

/**
 * Pre-configured dynamic quality Cloudinary URLs for Workvence marketing & auth assets
 */
export const CLOUDINARY_ASSETS = {
  auth: {
    login: "https://res.cloudinary.com/dlqhnyh8r/image/upload/v1791778458/loginImage_cf5vyu.webp",
    register: "https://res.cloudinary.com/dlqhnyh8r/image/upload/v1791778457/registerImage_lnytwg.webp",
    verify: "https://res.cloudinary.com/dlqhnyh8r/image/upload/f_auto,q_auto/v1791777910/verifyImage_wi7srr.webp",
  },
  marketing: {
    privacyPolicy: "https://res.cloudinary.com/dlqhnyh8r/image/upload/f_auto,q_auto/v1791777896/privacypolicy_e98lvo.webp",
    findProjectBanner: "https://res.cloudinary.com/dlqhnyh8r/image/upload/f_auto,q_auto/v1791777896/find_project_banner1_pxlwhg.webp",
    freelancerBg: "https://res.cloudinary.com/dlqhnyh8r/image/upload/f_auto,q_auto/v1791777896/AFreelancerBG_lg0bw8.webp",
  },
} as const;
