# Integrating this redesign into abbasaghebaty/about-me

## What to do
1. In your repo, delete the old `index.html` and the old `assets/` folder.
2. Copy everything from this package into the repo root, so you end up with:
   ```
   about-me/
     index.html
     favicon.png     <- keep your existing one
     CNAME           <- keep your existing one
     README.md       <- keep your existing one
     assets/
       css/...
       js/...
   ```
3. Keep your existing `favicon.png` and `CNAME` files exactly as they are —
   this package doesn't touch them.
4. Commit and push to `main`. GitHub Pages will redeploy automatically at
   aghebaty.ir.

## What changed structurally
- The site is now a single-page **dashboard shell** (`index.html`) with a
  sidebar + topbar, and a hash router (`assets/js/router.js`) that swaps
  independent "pages" into the content area — Overview, About Me, Projects,
  Repositories, Skills, Links, Activity — each its own URL (`#/projects`,
  `#/repositories`, etc.) and its own JS + CSS file.
- **Repositories** and **Activity** now fetch live data from the public
  GitHub API in the browser (`assets/js/utils/github.js`), with a static
  fallback baked into `assets/js/data.js` if the API is unreachable.
- All copy/content (bio, skills, projects, social links) lives in one file,
  `assets/js/data.js` — edit that file to update content without touching
  any page logic or styling.

## Folder guide
- `assets/css/tokens.css` — colors, type scale, spacing (the design system)
- `assets/css/layout.css` — sidebar, topbar, page shell
- `assets/css/components.css` — cards, tables, tags, buttons, timeline
- `assets/css/pages/*.css` — one file per page, only what's unique to it
- `assets/js/pages/*.js` — one render() module per page
- `assets/js/utils/` — GitHub API client, formatting helpers, icon set
- `assets/js/router.js` — hash router
- `assets/js/main.js` — builds the sidebar/topbar and boots the router
