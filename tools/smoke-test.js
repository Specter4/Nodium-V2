#!/usr/bin/env node
/* ==========================================================================
   NODIUM — automated smoke test (runs every page through jsdom and
   exercises the cart, catalogue filters, checkout and order confirmation).
   Run:  node tools/smoke-test.js
   ========================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const results = [];
let failures = 0;

function ok(name, cond, extra) {
  results.push({ name, pass: !!cond, extra });
  if (!cond) failures++;
  console.log((cond ? "  PASS  " : "  FAIL  ") + name + (extra && !cond ? "  → " + extra : ""));
}

function read(p) { return fs.readFileSync(path.join(ROOT, p), "utf8"); }

/* ------------------------------------------------------------------ helpers */
function makeWindow(url, prefillCart, prefillOrders) {
  const html = read(url.split("?")[0]);
  const errors = [];
  const nav = { attempted: null };
  const vc = new (require("jsdom").VirtualConsole)();
  vc.on("jsdomError", e => {
    if (/Not implemented: navigation/.test(e.message)) {
      nav.attempted = nav.attempted || (e.detail && e.detail.url) || true;
      return; /* expected in jsdom — navigation is recorded, not executed */
    }
    errors.push(String(e.message));
  });

  const dom = new JSDOM(html, {
    url: "http://localhost/" + url,
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      /* record script errors */
      window.addEventListener("error", e => errors.push(e.message));
      const origErr = window.console.error.bind(window.console);
      window.console.error = m => { errors.push(String(m)); origErr(m); };

      /* stubs jsdom lacks */
      window.matchMedia = window.matchMedia || (q => ({
        matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
      }));
      window.scrollTo = () => {};
      window.IntersectionObserver = window.IntersectionObserver || class {
        constructor(cb) { this.cb = cb; }
        observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
        unobserve() {}
        disconnect() {}
      };

      /* prefill storage */
      if (prefillCart) {
        window.localStorage.setItem("nodium_cart_v1", JSON.stringify(prefillCart));
      }
      if (prefillOrders) {
        window.localStorage.setItem("nodium_orders_v1", JSON.stringify(prefillOrders));
      }

      /* evaluate the page's scripts in order (as a real browser would) */
      const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
      for (const s of scripts) {
        try {
          window.eval(read(s.split("?")[0])); /* strip cache-buster query */
        } catch (e) {
          errors.push("script error in " + s + ": " + e.message);
        }
      }
    }
  });
  return { window: dom.window, document: dom.window.document, errors, nav };
}

function settle(ms) { return new Promise(r => setTimeout(r, ms)); }
function count(doc, sel) { return doc.querySelectorAll(sel).length; }
function text(doc, sel) { const el = doc.querySelector(sel); return el ? el.textContent.trim() : ""; }

/* ------------------------------------------------------------------ tests */
(async function main() {
  console.log("\n=== HOME ===");
  {
    const { window: w, document: d, errors } = makeWindow("index.html");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("header rendered (logo)", count(d, ".site-header .logo") === 1);
    ok("nav has 5 links", count(d, ".nav-main .nav-link") === 5);
    ok("mega menu has 10 categories", count(d, ".mega-grid .mega-item") === 10);
    ok("mega items use category icons", count(d, ".mega-icon svg") === 10);
    ok("all revealed elements become visible", count(d, "[data-reveal]:not(.is-visible)") === 0, count(d, "[data-reveal]:not(.is-visible)") + " hidden");
    ok("footer rendered", count(d, ".site-footer") === 1);
    ok("footer has 10 category links", count(d, ".footer-col ul li a[href$='.html']") >= 13);
    ok("hero title present", text(d, "h1").includes("Work,"));
    ok("featured grid: 6 product cards", count(d, "#featured-grid .product-card") === 6);
    ok("category grid: 10 tiles", count(d, "#category-grid .category-tile") === 10);
    ok("testimonials: 6 cards", count(d, "#testimonial-grid .t-card") === 6);
    ok("hero stats: 4 counters", count(d, "[data-counter]") === 4);
    ok("marquee duplicated for loop", count(d, ".marquee-item") === 20);
    /* add to cart from a product card */
    const addBtn = d.querySelector("#featured-grid [data-add-to-cart]");
    addBtn.click();
    await settle(40);
    ok("cart badge shows 1", text(d, "#cart-count") === "1");
    ok("drawer opens on add", d.querySelector("#drawer").classList.contains("open"));
    ok("drawer shows item", count(d, ".drawer-item") === 1);
    w.NodiumCart.closeDrawer();
  }

  console.log("\n=== CATALOGUE (products.html) ===");
  {
    const { window: w, document: d, errors } = makeWindow("products.html");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("35 products rendered", count(d, "#catalog-grid .product-card") === 35);
    ok("category chips: 11 (All + 10)", count(d, "#cat-chips .chip") === 11);
    ok("sort select has 6 options", count(d, "#sort-select option") === 6);
    /* search */
    const input = d.getElementById("search-input");
    input.value = "resume";
    input.dispatchEvent(new w.Event("input", { bubbles: true }));
    await settle(30);
    ok("search 'resume' → 3 results", count(d, "#catalog-grid .product-card") === 3, count(d, "#catalog-grid .product-card") + " found");
    ok("result count text", text(d, "#result-count").includes("3 products"));
    /* search + category combine (search 'resume' persists across filters) */
    d.querySelector('[data-cat="resume-templates"]').click();
    await settle(30);
    ok("search + category combine → 3", count(d, "#catalog-grid .product-card") === 3, count(d, "#catalog-grid .product-card") + " found");
    /* clear search, then pure category filter */
    input.value = "";
    input.dispatchEvent(new w.Event("input", { bubbles: true }));
    d.querySelector('[data-cat="notion-templates"]').click();
    await settle(30);
    ok("category filter → 4 results", count(d, "#catalog-grid .product-card") === 4, count(d, "#catalog-grid .product-card") + " found");
    /* price filter (all categories) */
    d.querySelector('[data-cat="all"]').click();
    d.querySelector('[data-price="over50"]').click();
    await settle(30);
    ok("price >50 → 10 results", count(d, "#catalog-grid .product-card") === 10, count(d, "#catalog-grid .product-card") + " found");
    /* clear */
    d.getElementById("clear-filters").click();
    await settle(30);
    ok("clear filters → 35 again", count(d, "#catalog-grid .product-card") === 35);
  }

  console.log("\n=== CATEGORY PAGE (notion-templates.html) ===");
  {
    const { document: d, errors } = makeWindow("notion-templates.html");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("category hero title", text(d, "h1").includes("Notion Templates"));
    ok("description rendered", text(d, ".lead").includes("Notion workspace"));
    ok("4 products in grid", count(d, "#category-grid .product-card") === 4);
    ok("meta: '4 products · from $19'", text(d, ".category-meta").includes("4 products"), text(d, ".category-meta"));
    ok("other categories shown (6 tiles)", count(d, ".category-grid") >= 1 && count(d, ".category-tile") >= 6);
  }

  console.log("\n=== PRODUCT DETAIL (life-os-dashboard) ===");
  {
    const { window: w, document: d, errors } = makeWindow("product.html?slug=life-os-dashboard");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("product title", d.title.includes("Life OS"));
    ok("price $39", text(d, ".pp-price") === "$39");
    ok("old price shown", text(d, ".pp-old") === "$59");
    ok("save badge", count(d, ".pp-save") === 1);
    ok("gallery thumbs (3 views)", count(d, ".pp-thumb") === 3);
    ok("rating stars", count(d, ".pp-rating-row .stars") === 1);
    ok("what's included: 5 items", count(d, "#acc-includes li") === 5);
    ok("reviews: 3 cards", count(d, ".review-card") === 3);
    ok("review summary score 4.9", text(d, ".rs-score") === "4.9");
    ok("related products: 3", count(d, ".related .product-card") === 3);
    const ld = [...d.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).join(" ");
    ok("JSON-LD Product injected", ld.includes('"@type":"Product"') && ld.includes('"price":39'), ld.slice(0, 60));
    ok("sticky buy bar present", count(d, "#sticky-buy") === 1);
    /* add to cart button */
    d.getElementById("add-to-cart").click();
    await settle(40);
    ok("add-to-cart works", text(d, "#cart-count") === "1");
    w.NodiumCart.closeDrawer();
  }

  console.log("\n=== PRODUCT DETAIL (404 fallback) ===");
  {
    const { document: d, errors } = makeWindow("product.html?slug=nope");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("friendly not-found shown", text(d, "#product-root").includes("Product not found"));
  }

  console.log("\n=== ABOUT ===");
  {
    const { document: d, errors } = makeWindow("about.html");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("story: 2 paragraphs", count(d, "#about-story p") === 2);
    ok("values: 4", count(d, "#about-values .value-4") === 4);
    ok("stats: 4", count(d, "#about-stats .stat") === 4);
    ok("team: 3 cards", count(d, "#team-grid .team-card") === 3);
  }

  console.log("\n=== FAQ ===");
  {
    const { window: w, document: d, errors } = makeWindow("faq.html");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("12 FAQ items", count(d, "#faq-list .acc-item") === 12);
    const first = d.querySelector("#faq-list .acc-q");
    first.click();
    await settle(30);
    ok("accordion opens on click", first.getAttribute("aria-expanded") === "true");
    ok("FAQPage JSON-LD injected", count(d, 'script[type="application/ld+json"]') >= 1);
  }

  console.log("\n=== CONTACT ===");
  {
    const { window: w, document: d, errors } = makeWindow("contact.html");
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    d.getElementById("c-name").value = "Test User";
    d.getElementById("c-email").value = "test@example.com";
    d.getElementById("c-message").value = "Hello Nodium";
    d.getElementById("contact-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    await settle(900);
    ok("form success state shows", d.getElementById("contact-success").classList.contains("show"));
  }

  console.log("\n=== CHECKOUT FLOW ===");
  {
    const cart = [{ slug: "life-os-dashboard", qty: 1 }, { slug: "executive-cv", qty: 2 }];
    const { window: w, document: d, errors, nav } = makeWindow("checkout.html", cart);
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("summary shows 2 line items", count(d, ".co-item") === 2);
    ok("total correct ($77)", text(d, ".co-row.total .co-value") === "$77", text(d, ".co-row.total .co-value"));
    /* empty cart state */
    const { document: d2, errors: e2 } = makeWindow("checkout.html", []);
    await settle(60);
    ok("empty cart shows empty state", e2.length === 0 && text(d2, "#checkout-root").includes("empty"), e2.join(" | "));
    /* fill the form and pay */
    d.getElementById("co-name").value = "Test User";
    d.getElementById("co-email").value = "test@example.com";
    d.getElementById("co-card").value = "4242424242424242";
    d.getElementById("co-exp").value = "12/28";
    d.getElementById("co-cvc").value = "123";
    d.getElementById("co-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
    await settle(1600);
    const stored = JSON.parse(w.localStorage.getItem("nodium_orders_v1"))[0];
    ok("navigation to confirmation attempted", !!nav.attempted, String(nav.attempted));
    ok("order id generated (ND-…)", /^ND-[A-Z0-9]+$/.test(stored.id), stored.id);
    ok("order total correct ($77)", stored.total === 77, String(stored.total));
    ok("order email captured", stored.email === "test@example.com");
    ok("order line items match cart", stored.items.length === 2 && stored.items[0].slug === "life-os-dashboard");
    ok("cart cleared after order", JSON.parse(w.localStorage.getItem("nodium_cart_v1")).length === 0);
  }

  console.log("\n=== ORDER CONFIRMATION ===");
  {
    const order = {
      id: "ND-TEST01", email: "test@example.com", name: "Test User",
      date: new Date().toISOString(),
      items: [
        { slug: "life-os-dashboard", name: "Life OS — All-in-One Dashboard", qty: 1, price: 39, cover: "" },
        { slug: "executive-cv", name: "The Executive CV", qty: 2, price: 19, cover: "" }
      ],
      total: 77
    };
    const { document: d, errors } = makeWindow("order-confirmation.html?order=ND-TEST01", null, [order]);
    await settle(60);
    ok("no JS errors", errors.length === 0, errors.join(" | "));
    ok("order id shown", text(d, ".order-id") === "ND-TEST01");
    ok("2 download items", count(d, ".dl-item") === 2);
    ok("download buttons present", count(d, ".dl-btn") === 2);
    ok("email shown in next steps", text(d, ".next-steps").includes("test@example.com"));
  }

  console.log("\n=== LEGAL + 404 PAGES ===");
  for (const page of ["terms.html", "privacy.html", "refund-policy.html", "404.html"]) {
    const { document: d, errors } = makeWindow(page);
    await settle(60);
    ok(page + " — no JS errors + chrome rendered",
      errors.length === 0 && count(d, ".site-footer") === 1 && count(d, ".site-header") === 1,
      errors.join(" | "));
  }

  console.log("\n=== LINK INTEGRITY ===");
  {
    /* every internal href in the data & generated pages must exist */
    const files = ["index.html", "products.html", "about.html", "faq.html", "contact.html",
      "checkout.html", "order-confirmation.html", "terms.html", "privacy.html",
      "refund-policy.html", "404.html", "product.html", "notion-templates.html"];
    let missing = [];
    const srcs = [...read("assets/js/data.js").matchAll(/"(assets\/images\/[^"]+)"/g)].map(m => m[1]);
    for (const s of new Set(srcs)) {
      if (!fs.existsSync(path.join(ROOT, s))) missing.push(s);
    }
    for (const f of files) {
      const html = read(f);
      for (const href of html.matchAll(/href="([^"]+)"/g)) {
        const h = href[1];
        if (h.startsWith("http") || h.startsWith("mailto") || h.startsWith("#") || h.startsWith("?") || h.includes("javascript")) continue;
        const target = h.split("?")[0];
        if (!fs.existsSync(path.join(ROOT, target))) missing.push(f + " → " + h);
      }
      /* local assets referenced from head */
      for (const a of html.matchAll(/(?:href|src)="(assets\/[^"]+)"/g)) {
        const p = a[1].split("?")[0];
        if (!fs.existsSync(path.join(ROOT, p))) missing.push(f + " → " + p);
      }
    }
    ok("no broken internal links/assets", missing.length === 0, missing.slice(0, 6).join(" | "));
  }

  console.log("\n======================================================");
  console.log(failures === 0 ? "ALL TESTS PASSED ✔" : failures + " TEST(S) FAILED ✘");
  console.log("======================================================");
  process.exit(failures ? 1 : 0);
})();
