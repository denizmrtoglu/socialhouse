/**
 * Builds an Instagram profile URL from a username.
 * Usernames are stored WITHOUT @; this adds the base URL.
 */
export function instagramUrl(username: string): string {
  return `https://instagram.com/${username}`;
}

/**
 * Builds the SocialHouse Instagram DM link used in rejection notifications.
 */
export const SOCIALHOUSE_INSTAGRAM_DM =
  "https://instagram.com/socialhouse";

/**
 * Strips leading @ from a username if present.
 */
export function normalizeInstagram(handle: string): string {
  return handle.startsWith("@") ? handle.slice(1) : handle;
}
