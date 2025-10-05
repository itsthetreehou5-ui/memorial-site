// Simple shared in-memory store (resets on redeploy)
export const CLIPS = [];
export const MESSAGES = [];

export function randToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
