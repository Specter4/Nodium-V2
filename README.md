# Nodium — Premium Digital Products Website

A complete, production-ready storefront for Nodium: a boutique digital-products
business selling templates, tools and automation resources. Pure HTML/CSS/JS —
**no build step, no framework, no database** — styled entirely in a black &
white premium design system.

```
nodium/
├── index.html                  ← Home
├── products.html               ← All Products (search + filters + sorting)
├── notion-templates.html       ← 10 category pages (GENERATED — see tools/build.py)
├── resume-templates.html
├── website-templates.html
├── canva-templates.html
├── ebooks.html
├── spreadsheets.html
├── ai-tools.html
├── n8n-workflows.html
├── ai-prompt-packs.html
├── automation-kits.html
├── product.html                ← Product detail (?slug=…, one template for all 35 products)
├── about.html / faq.html / contact.html
├── checkout.html / order-confirmation.html   ← cart & checkout flow
├── terms.html / privacy.html / refund-policy.html   ← legal pages
├── 404.html
├── assets/
│   ├── css/main.css            ← THE DESIGN SYSTEM (tokens at the top)
│   ├── js/
│   │   ├── data.js             ← AUTO-GENERATED site data (window.NODIUM)
│   │   ├── app.js              ← header, mega menu, footer, animations, helpers
│   │   ├── cart.js             ← cart store (localStorage) + drawer
│   │   └── *.js                ← one module per page
│   └── images/                 ← monochrome artwork (photos + generated SVGs)
├── data/                       ← ★ EDIT CONTENT HERE ★
│   ├── site.json               ← brand info, home copy, testimonials, FAQs, config
│   ├── categories.json         ← the 10 categories (names, icons, descriptions)
│   └── products.json           ← all 35 products (name, price, images, reviews)
├── tools/
│   ├── build.py                ← regenerates data.js + category pages + sitemap
│   ├── make_art.py             ← regenerates the SVG cover artwork
│   └── smoke-test.js           ← automated test of every page (80 checks)
├── favicon.svg · robots.txt · sitemap.xml
└── README.md
```

---

## 1 · How to edit content (no code required)

Everything a non-technical editor needs lives in **`data/`**. Edit the JSON,
then regenerate:

```bash
python3 tools/build.py
```

| I want to change…                    | Edit this file                    |
| ------------------------------------ | --------------------------------- |
| Email, socials, site URL, tagline    | `data/site.json` → `config`       |
| Home hero copy, stats, testimonials  | `data/site.json` → `home`         |
| FAQ questions & answers              | `data/site.json` → `faqs`         |
| About story, values, team            | `data/site.json` → `about`        |
| Category names / descriptions / icons| `data/categories.json`            |
| Add / remove / price a product       | `data/products.json`              |
| **Whole-site look (colors, fonts)**  | `assets/css/main.css` → section 01 *Design tokens* |

**Adding a product:** copy any product object in `data/products.json`, change
its `slug` (unique), `name`, `price`, `category` (must match a category slug),
`cover` (an image key like `"notion-1"` or `"ai-tools-2"`), then run
`python3 tools/build.py`. It appears everywhere — home, catalogue, category
page, search — automatically.

**Adding a category:** add an object to `data/categories.json` (copy an
existing one, give it a unique `slug`, pick an icon), add an image pair
(reuse an existing key or generate new art), run the build. A brand-new
category page (`{slug}.html`) is generated for you.

**Changing the look:** every color, font, radius and spacing value is a CSS
variable at the top of `assets/css/main.css`. Swap the palette there and the
whole site re-themes.

---

## 2 · Run locally

**Recommended — no Python required, works on any machine with Node.js:**

```bash
npm run dev
# → http://localhost:8080   (Ctrl+C to stop)
#   custom port:  node server.js 3000   or   PORT=4000 npm run dev
```

Alternatives:

```bash
npm run serve              # same as npm run dev (Node server)
python3 -m http.server 8080   # if you have Python
```

Or just open `index.html` (everything works over `file://` too, though the
catalogue page uses `history.replaceState`, which some browsers block on
`file://` — it degrades gracefully).

> Note: the `dev` script runs `server.js`, a zero-dependency static server —
> `npm install` is only needed for the test suite (jsdom).

## 3 · Run the automated test suite

```bash
npm install          # installs jsdom (dev-only)
node tools/smoke-test.js
```

80 checks across every page: rendering, cart, filters, checkout flow, order
confirmation, link integrity.

---

## 4 · Deploy

The folder is a static site. Drag it onto any of these:

- **Netlify / Vercel** — drop the folder, done (no build command, no settings).
- **GitHub Pages** — push to a repo, serve from the root.
- **Any web server / S3 / Cloudflare Pages** — just upload.

**Before publishing**, change `siteUrl` in `data/site.json` (`https://nodium.co`
is a placeholder) and re-run the build — this updates canonical URLs,
`sitemap.xml` and `robots.txt` automatically.

---

## 5 · Going live: payments, forms, newsletter

The site ships in **demo mode** so the whole flow is clickable without any
accounts. Three switches in `data/site.json` → `config` take it live:

### Payments (Stripe)
```json
"checkout": {
  "provider": "demo",                        // → "stripe-payment-link"
  "stripe": { "paymentLinkUrl": "https://buy.stripe.com/your-link" }
}
```
- **`stripe-payment-link`** — no backend needed. Paste one Stripe Payment
  Link URL; checkout redirects to it. Best for a single featured product or
  "Buy now" flows.
- **`stripe-checkout`** — for multi-item carts. Set `publishableKey` and
  `backendUrl`; the checkout POSTs the cart to your backend, which creates a
  Stripe Checkout Session and returns `{ "url": … }`. (The backend is a
  ~20-line Stripe API call — any serverless function works.)

### Contact form & newsletter (Formspree / Mailchimp / ConvertKit)
```json
"forms": {
  "newsletterEndpoint": "https://formspree.io/f/xxxx",   // or Mailchimp/ConvertKit URL
  "contactEndpoint": "https://formspree.io/f/yyyy"
}
```
Empty strings = demo mode (simulated success). Paste endpoints = real delivery.

---

## 6 · Structure notes for developers

- **One data bundle.** `tools/build.py` merges the JSON in `data/` into
  `assets/js/data.js` (`window.NODIUM`). All pages read from it — nothing is
  hardcoded in markup.
- **Shared chrome.** Header, mega menu, mobile nav and footer are rendered by
  `assets/js/app.js` into `#app-header` / `#app-footer` — edit once, applies
  everywhere.
- **Components.** `N.productCard()` and `N.categoryTile()` in `app.js` are the
  reusable card components; `N.stars()` renders ratings; `N.catIcon()` renders
  each category's icon.
- **Category pages are generated.** `tools/build.py` writes one page per
  category from a template — add a category to `categories.json` and its page
  is created; no HTML to touch.
- **SEO.** Per-page titles/descriptions, canonical URLs, Open Graph,
  JSON-LD (`Organization`, `WebSite`, `Product`, `FAQPage`, `CollectionPage`),
  semantic HTML, alt text, `sitemap.xml`, `robots.txt`, `favicon.svg`.
- **Accessibility.** Skip link, focus-visible outlines, ARIA on menus /
  accordions / drawer, keyboard navigation (Esc closes everything), reduced-
  motion support, WCAG-AA contrast throughout.
- **Performance.** Zero dependencies, lazy-loaded images, `fetchpriority`
  on hero images, system-friendly font loading, no layout shift (fixed
  aspect ratios), IntersectionObserver-driven animations.
- **Imagery.** Photos are in `assets/images/`; the SVG covers are generated
  by `tools/make_art.py` — run it to regenerate or add new artwork.

## 7 · Legal note

The legal pages (Terms, Privacy, Refund & License) are solid, ready-to-publish
drafts. Have them reviewed by a lawyer in your jurisdiction before a big
launch — standard practice for any storefront.
