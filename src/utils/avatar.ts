/**
 * Generates an actual image URL using ui-avatars.com API for users without custom uploaded profile photos.
 * Example: https://ui-avatars.com/api/?name=Alex+Dev&background=0D9488&color=fff&bold=true
 */
export const getAvatarUrl = (
  imageUrl?: string | null,
  name?: string | null,
  options?: { size?: number; background?: string; color?: string }
): string => {
  if (
    imageUrl &&
    imageUrl !== '/media/noavatar.png' &&
    imageUrl !== 'noavatar.png' &&
    !imageUrl.includes('noavatar')
  ) {
    return imageUrl;
  }

  const cleanName = encodeURIComponent((name || 'User').trim());
  const size = options?.size || 128;
  const bg = options?.background || '0D9488'; // Emerald teal brand color
  const color = options?.color || 'FFFFFF';

  return `https://ui-avatars.com/api/?name=${cleanName}&background=${bg}&color=${color}&size=${size}&bold=true&length=2`;
};

export default getAvatarUrl;
