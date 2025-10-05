// Simple shared in-memory data across API route files.
// (Resets on redeploy; use Vercel KV later for persistence.)
export const CLIPS = [];
export const MESSAGES = [];

export function randToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
