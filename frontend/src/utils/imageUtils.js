import { API_ROOT } from '../services/api'

/**
 * Get the primary image URL for a product
 * @param {Object} product - Product object with images array
 * @returns {string|null} - Primary image URL or null if no images
 */
export const getPrimaryImageUrl = (product) => {
  if (!product) return null;

  const base = API_ROOT
  // If product has images array, find the primary image
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.is_primary === 1);
    if (primaryImage && primaryImage.image_path) {
      return `${base}/${primaryImage.image_path}`;
    }

    // If no primary image found, use the first image
    const firstImage = product.images[0];
    if (firstImage && firstImage.image_path) {
      return `${base}/${firstImage.image_path}`;
    }
  }

  // Fallback to thumbnail path if exists (already includes relative path)
  if (product.thumbnail) {
    return `${base}/${product.thumbnail}`;
  }

  return null;
}

/**
 * Get all image URLs for a product
 * @param {Object} product - Product object with images array
 * @returns {Array} - Array of image URLs
 */
export const getAllImageUrls = (product) => {
  if (!product) return [];

  const base = API_ROOT
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images
      .filter(img => img.image_path)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(img => ({
        url: `${base}/${img.image_path}`,
        alt: img.alt_text || product.name,
        isPrimary: img.is_primary === 1
      }));
  }

  // Fallback to thumbnail path if exists
  if (product.thumbnail) {
    return [{
      url: `${base}/${product.thumbnail}`,
      alt: product.name,
      isPrimary: true
    }];
  }

  return [];
};