# Deployment Notes

This bundle mirrors your project and includes fixes for:
- `app/api/upload/route.js`: removed TypeScript syntax from a `.js` file and added safer error handling.
- Verified `app/layout.js` exports a single `metadata` and a single default `RootLayout`.

## Replace all files at once
1. Download `memorial-site-fixed.zip`.
2. Unzip and copy its contents over your repo (overwrite existing files).
3. Commit and push.
4. Trigger a new Vercel deployment.

If you still see `the name 'RootLayout' is defined multiple times`, ensure you **do not** have another `app/layout.*` file in the repo or in a submodule, and that your `app/layout.js` contains only one `export default`.
