## Manifest (Expo + Vercel Web)

### Scripts
- `npm start` — dev server
- `npm run web` — dev server (web)
- `npm run build:web` — static export to `dist/`
- `npm run vercel-build` — Vercel build (exports to `dist/` and adds `.nojekyll`)

### Vercel
- **Framework preset**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`

### Branding assets
- Put logo at `assets/brand/icon.png` (1024x1024 PNG recommended)
- Optional: update `assets/brand/splash.png`, `assets/brand/adaptive-foreground.png`, `assets/brand/favicon.png`
- Paths configured in `app.json`

### Roadmap
- Auth onboarding (Email/Apple/Google)
- Profile (photo, name, one-line bio, general location)
- Mindfulness primer + intention creation
- Semantic matching → group manifestation
- 6-hour synced notifications with rotating exercises
- Timeline with comments and impressions

