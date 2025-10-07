# Alkana Coating Website (High-Performance WordPress)

A fast WordPress + WooCommerce foundation optimized for shared/cloud hosting (e.g., Mắt Bão Premium Cloud Hosting – Shop). Includes a lean custom theme, a core plugin for custom content types, and a must-use plugin with performance tweaks.

## Architecture

- Backend: WordPress (PHP 8.2+/MySQL), WooCommerce-ready
- Frontend: Custom block-friendly theme, minimal JS (no heavy page builders)
- Data: MySQL (Products via WooCommerce, Projects/Distributors via CPT)
- Caching/CDN: Page cache + optional Redis object cache + Cloudflare CDN

## Folder layout (in this repo)

- `wp-content/themes/alkana` – Custom theme (assets/css, assets/js)
- `wp-content/plugins/alkana-core` – Custom types/taxonomies/hooks
- `wp-content/mu-plugins/alkana-performance.php` – Must-use performance tweaks

> WordPress core files are not included. Download WordPress from wordpress.org and deploy alongside this `wp-content` directory.

## Requirements

- PHP 8.2+ with OPcache enabled
- MySQL/MariaDB 10.4+
- HTTPS (Let’s Encrypt/Cloudflare)
- Optional: Redis server for object cache, HTTP/2 or HTTP/3

## Quick start (local or hosting)

1. Download WordPress (latest stable) and extract to your web root.

- Vietnamese: https://vi.wordpress.org/download/
- English: https://wordpress.org/download/

2. Copy the `wp-content/` from this repo, merge with the WordPress `wp-content/`.
3. Create the database and user; note credentials.
4. Create `wp-config.php` and set:

```php
// wp-config.php (snippets)
define('WP_ENVIRONMENT_TYPE', 'production');
define('WP_DEBUG', false);
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '256M');
define('DISABLE_WP_CRON', true); // set a real cron below
// Page cache (for WP Rocket/LiteSpeed Cache)
define('WP_CACHE', true);

// Optional: Redis object cache
// define('WP_REDIS_HOST', '127.0.0.1');
// define('WP_REDIS_PORT', 6379);
```

5. Set up a real cron job (replace `domain.tld`):

- cPanel Cron: every 5 minutes: `wget -q -O - https://domain.tld/wp-cron.php?doing_wp_cron >/dev/null 2>&1`

6. Activate theme “Alkana” and the plugin “Alkana Core”.

7. Install recommended plugins:

- Cache: WP Rocket (or LiteSpeed Cache if server supports LiteSpeed)
- SEO: Rank Math (or Yoast)
- Images: Optimole/ShortPixel, enable WebP/AVIF
- Search/Filter: FacetWP or FiboSearch
- Security: Wordfence/Sucuri; SMTP: WP Mail SMTP; Backup: UpdraftPlus

## Performance checklist

- Hosting
  - PHP 8.2+, OPcache enabled; HTTP/2 or HTTP/3; Brotli/Gzip on
  - Increase PHP limits: memory_limit 256M, max_execution_time 120, upload_max_filesize 32M
- WordPress
  - Use the included MU plugin for: disable emojis/oEmbed bloat, clean head, throttle Heartbeat, lazyload
  - Use Gutenberg + ACF Blocks or native blocks; avoid heavy page builders
  - Limit autoloaded options (<1–2MB). Audit with `SELECT SUM(LENGTH(option_value)) FROM wp_options WHERE autoload='yes';`
- Cache/CDN
  - Page cache: enable caching for all non-logged users; preload sitemap
  - Object cache: Redis if available (use `Redis Object Cache` plugin)
  - CDN: Cloudflare (HTTP/3, Brotli, cache rules, image Polish/AVIF if Pro)
- Media
  - Serve WebP/AVIF; lazyload; correct `srcset`; compress to 70–82% JPEG quality
  - Use responsive images and avoid oversized hero banners
- Database
  - Index hot queries; keep `wp_postmeta` lean; avoid meta queries where possible
  - Schedule DB optimization (transients/options cleanup)

## Optional headless path

If later you need a separate frontend (Next.js/Astro) consuming WordPress via REST/GraphQL:

- Build static pages (SSG) for marketing; leave checkout/admin on WP
- Host the built static assets on the same hosting; CI builds on GitHub Actions
- Use WooGraphQL + WPGraphQL (advanced; increases complexity)

## Development workflow

- Edit theme assets in `assets/css` and `assets/js` (simple, no build step required). For advanced styling, you can introduce Vite/Tailwind in a separate branch and compile locally, then commit built assets.

### Local development on Windows

- Recommended options:
  - Laragon (Apache/MySQL/PHP) or WampServer/XAMPP
  - Local WP (GUI) if you prefer point-and-click
  - Optional Docker (Traefik/DevContainers) if bạn quen docker
- Steps (Laragon example):
  1. Install Laragon (PHP 8.2+), create a site folder (e.g. `C:/laragon/www/alkana`).
  2. Download WordPress stable, extract into site folder.
  3. Replace WordPress `wp-content/` with this repo’s `wp-content/`.
  4. Create DB in phpMyAdmin; run WordPress installer at http://alkana.test.
  5. Commit changes to Git; push to GitHub; deploy to hosting (see below).

### Optional: Local dev with Docker (non-XAMPP)

If you prefer Docker:

- Use an off-the-shelf compose like DDEV or Devilbox, or a simple compose with services: `wordpress` (php-apache), `db` (mariadb), and `phpmyadmin`.
- Mount this repo into `/var/www/html` and map ports 80:80.
- Ensure `wp-config.php` DB host points to the DB service name (e.g., `db`).

## Git-based deployment to Mắt Bão

You can code on this machine and deploy via Git. Two common approaches:

### A) cPanel Git Version Control (pull from GitHub)

1. Push this project to a private GitHub repo.
2. On cPanel: Git Version Control → Create
   - Clone URL: your GitHub repo HTTPS/SSH URL
   - Repository Path (deployment path): WordPress root (e.g. `/home/USER/public_html` or `/home/USER/public_html/site`)
   - Ensure WordPress core is already present on server (this repo only contains `wp-content`).
3. If cPanel shows “Deploy HEAD Commit”, click it to place/merge `wp-content/` into the WordPress root.
4. On updates, either click Deploy again or enable automatic deployment (webhook) if your cPanel supports it.

Notes:

- Backup existing `wp-content/` before the first deploy.
- If the server already has `wp-content/uploads`, keep it on server and avoid committing uploads to Git.
- Keep `wp-config.php` and WordPress core out of Git (already ignored in `.gitignore`).

### B) GitHub Actions over FTP/SFTP (push from GitHub)

Use when cPanel Git isn’t available or you prefer automatic deploys on push.

Example workflow (deploy only `wp-content/`):

```yaml
name: Deploy wp-content to Hosting
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: FTP Deploy
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_HOST }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          protocol: ftps
          local-dir: wp-content/
          server-dir: public_html/wp-content/
```

Set repository secrets in GitHub: `FTP_HOST`, `FTP_USERNAME`, `FTP_PASSWORD`. If your hosting supports SFTP with SSH keys, use an SFTP action and key-based auth instead.

### Database and media considerations

- Database is not in Git. Content changes happen on the server. For schema/code changes (CPT/taxonomies), this repo carries the code—deployment is enough. For initial content, migrate via WP export/import or WP-CLI if available.
- Media uploads (`wp-content/uploads`) should live on the server and be excluded from Git. Sync only when necessary using SFTP or a media offload plugin.

## Notes

- The MU plugin is safe-by-default. Some aggressive optimizations are toggled via constants at the top of the file; read comments before enabling.

## Site-building quick notes

- Set Homepage: after activating Alkana Core, a "Home" page is created and set as the static homepage. You can edit it in Pages → Home. Alternatively, go to Settings → Reading to choose a different page.
- Menus: go to Appearance → Menus (or Appearance → Editor in block themes) and assign your primary menu to the "Primary" location. Footer menu uses the "Footer" location.
- Projects & Distributors: add items under the new post types. Use Applications/Substrates taxonomies to categorize. Archives are at `/projects/` and `/distributors/`. Taxonomy views are at `/application/{term}` and `/substrate/{term}`.
- Filtering: on projects/distributors archives, simple dropdown filters by Application/Substrate are included—select and submit to filter.
- Contact form: place the shortcode `[alkana_contact_form]` on any page (e.g., Contact). By default it sends to the site admin email; you can override recipient: `[alkana_contact_form to="sales@yourdomain.com"]`.
- Templates: base templates exist for pages, singles, archives, search, and 404. Reusable cards live in `template-parts/content-card.php`.

---

© 2025 Alkana Coating – Starter skeleton prepared for high performance on shared/cloud hosting.
© 2025 Alkana Coating – Starter skeleton prepared for high performance on shared/cloud hosting.
