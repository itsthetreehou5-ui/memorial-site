// super simple in-memory stores (reset on each server restart)
export const MESSAGES = [];
export const CLIPS = [];

// random token helper
export function randToken(len = 32) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
