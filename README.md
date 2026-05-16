# jonahsussman.net

Personal website and project portfolio. Built with Eleventy v3, containerized with Docker, and served via nginx reverse proxy.

## Architecture

```
Browser -> nginx proxy (port 80/443)
             |-- /                              -> main-site container
             |-- /projects/software-renderer/   -> software-renderer container (embedded)
             |-- /projects/red-and-black-knights/-> rbk container (standalone)
             |-- /projects/scavanger/           -> scavanger container (standalone)
```

Each project runs in its own container with its own nginx. The top-level nginx reverse proxy routes requests by URL path.

### Project types

- **Embedded**: Has a wrapper page rendered by Eleventy (nav, footer, site theme). Two build steps in the Containerfile: (1) build project artifacts, (2) run Eleventy to render the wrapper page. Example: `software-renderer`.
- **Standalone**: Serves its own HTML directly, no site shell. Single build step. Example: `red-and-black-knights`, `scavanger`.

### Directory structure

```
jonahsussman.github.io/
  docker-compose.yaml          # Production
  docker-compose.dev.yaml      # Local dev overrides (no SSL, port 8080)

  site/                        # Main site (Eleventy v3)
    Containerfile
    eleventy.config.js
    package.json
    nginx.conf                 # Internal nginx for this container
    src/                       # Eleventy input
      _includes/layouts/       # base.njk, post.njk, single-card.njk
      _data/                   # metadata.json, projects.json, helpers.js
      posts/                   # Blog posts (markdown)
      projects/index.njk       # Project listing page
      assets/                  # CSS, images, PDFs
      error.njk                # Error page (uses SSI for status codes)
      ...

  nginx/                       # Reverse proxy
    Containerfile
    nginx.conf                 # Top-level nginx config (worker, map)
    conf.d/
      default.conf             # Production: SSL + routing
      dev.conf                 # Dev: no SSL, port 80 only

  projects/                    # One dir per project
    red-and-black-knights/
      Containerfile            # Standalone: Trunk/WASM build -> nginx
    software-renderer/
      Containerfile            # Embedded: emscripten build + Eleventy render
      src/software-renderer.njk  # Wrapper page (copied into site/ at build time)
    scavanger/
      Containerfile            # Standalone: static files -> nginx
    this-wiki-dne/             # Not yet containerized
```

## Development

### Main site only (fastest iteration)

```bash
cd site/
npm install
npm run serve
```

Eleventy dev server with live reload. Project links will 404 (no project containers running).

### Full stack

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build
```

Visit http://localhost:8080. Everything works: main site, projects, error pages.

### Rebuild a single service

```bash
# Rebuild and restart while the stack is running (in another terminal):
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build software-renderer

# Build only (no start):
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml build software-renderer

# Force rebuild (no cache):
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml build --no-cache software-renderer
```

## Adding a new project

### Standalone (no site shell)

1. Create `projects/<name>/Containerfile`
2. Add service to `docker-compose.yaml`:
   ```yaml
   <name>:
     build:
       context: ./projects/<name>
       dockerfile: Containerfile
     restart: always
     expose:
       - "80"
     networks:
       - internal
   ```
3. Add location blocks to `nginx/conf.d/default.conf` and `nginx/conf.d/dev.conf`:
   ```nginx
   location /projects/<name>/ {
       set $<var> http://<name>;
       rewrite ^/projects/<name>/(.*) /$1 break;
       proxy_pass $<var>;
   }
   ```
4. Add entry to `site/src/_data/projects.json`
5. `docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up --build`

### Embedded (with site shell)

Same as standalone, plus:

- Create a wrapper `.njk` page in `projects/<name>/src/` with `layout: layouts/base.njk`
- Set the docker-compose build context to repo root so the Containerfile can `COPY site/ .`
- In the Containerfile: copy the `.njk` into `src/projects/<name>/index.njk`, run Eleventy, then copy rendered output + project artifacts into the final nginx stage

See `projects/software-renderer/Containerfile` for a working example.

### Asset paths

Projects served behind the reverse proxy must use **relative paths** (`./`) for assets, not absolute paths (`/`). The proxy serves projects under `/projects/<name>/`, so absolute paths would resolve against the domain root (main site) instead of the project.

Each build tool has its own way to set this:
- **Trunk** (Rust/WASM): `trunk build --public-url ./`
- **Emscripten**: paths in the HTML shell are already relative
- **Vite**: `base: './'` in vite.config.js
- **Webpack**: `output.publicPath: './'`
- **Plain HTML**: use `./` or no leading `/` in `src`/`href`

## Updating a project version

Edit the `ARG REF=` line in the project's Containerfile to point to a different branch/tag/commit, then rebuild:

```bash
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml build <name>
```

## Production deployment

```bash
git pull
docker compose up -d --build --force-recreate
```

### SSL / Certbot

SSL certificates are expected at `/etc/letsencrypt/` on the host. The nginx proxy mounts them read-only. ACME challenges are served from `./certbot/webroot/`.

To issue certificates for the first time:
```bash
certbot certonly --webroot -w ./certbot/webroot -d jonahsussman.net -d www.jonahsussman.net
docker compose exec nginx nginx -s reload
```

To auto-renew via crontab, add this to `crontab -e`:
```
0 3 1 */2 * certbot renew --webroot -w /path/to/repo/certbot/webroot --quiet && docker compose -f /path/to/repo/docker-compose.yaml exec nginx nginx -s reload
```

This runs at 3am on the 1st of every other month. Certbot only renews if the certificate is within 30 days of expiry. The reload makes nginx re-read the new certificate without downtime.

### www vs non-www

`www.jonahsussman.net` is canonical. Both names are served, with HTTP redirecting to HTTPS and non-www redirecting to www. A `Link: rel="canonical"` header is set on all responses.

## Error pages

`site/src/error.njk` renders with the full site shell (nav/footer) and uses nginx SSI directives to display the HTTP status code and message. The rendered `error.html` is copied into the nginx proxy container at build time.
