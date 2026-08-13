/* ==========================================================================
   NODIUM — product.js (product detail page, one template for every product)
   Reads ?slug=… and renders gallery, info, details, reviews and related
   products. Also injects Product JSON-LD for SEO.
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("product-root");
    if (!root) return;

    var slug = new URLSearchParams(window.location.search).get("slug");
    var p = slug ? N.product(slug) : null;

    if (!p) {
      root.innerHTML =
        '<div class="container" style="padding-block:120px;text-align:center">' +
          "<h1 style='margin-bottom:12px'>Product not found</h1>" +
          "<p style='color:var(--text-2);margin-bottom:26px'>It may have been renamed or moved.</p>" +
          '<a class="btn btn-primary" href="products.html">Browse all products ' + N.icon("arrowR") + "</a>" +
        "</div>";
      return;
    }

    var cat = N.category(p.category);
    var related = N.productsIn(p.category).filter(function (x) { return x.slug !== p.slug; })
      .concat(D.products.filter(function (x) { return x.category !== p.category; }))
      .sort(function (a, b) { return b.popularity - a.popularity; })
      .slice(0, 3);

    /* gallery: unique previews, up to 3.
       Each entry is {key, pos} — the same artwork at different crops reads
       as a distinct preview, so even 2-image categories get 3 views. */
    var galleryViews = [{ key: p.cover, pos: p.pos || "center" }];
    (p.gallery || []).forEach(function (k) {
      var exists = galleryViews.some(function (v) { return v.key === k; });
      if (!exists) galleryViews.push({ key: k, pos: "center" });
    });
    if (galleryViews.length < 3) {
      var shifts = ["top", "bottom", "center"];
      var alt = shifts.filter(function (s) {
        return !galleryViews.some(function (v) { return v.pos === s; });
      })[0] || "top";
      galleryViews.push({ key: p.cover, pos: alt });
    }
    galleryViews = galleryViews.slice(0, 3);
    var galleryKeys = galleryViews.map(function (v) { return v.key; });

    var savePct = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

    document.title = p.name + " — " + D.config.siteName;
    document.querySelector('meta[name="description"]') &&
      document.querySelector('meta[name="description"]').setAttribute("content", p.tagline);

    root.innerHTML =
      '<div class="container" style="padding-bottom:clamp(64px,9vw,120px)">' +

        /* ---- breadcrumbs ---- */
        '<nav class="crumbs" aria-label="Breadcrumb">' +
          '<a href="index.html">Home</a><span class="sep">/</span>' +
          '<a href="products.html">Products</a><span class="sep">/</span>' +
          '<a href="' + cat.slug + '.html">' + N.esc(cat.name) + "</a><span class=\"sep\">/</span>" +
          '<span class="current">' + N.esc(p.name) + "</span>" +
        "</nav>" +

        /* ---- main grid ---- */
        '<div class="pp-grid">' +

          /* gallery */
          '<div class="pp-gallery" data-reveal>' +
            '<div class="pp-main-img" id="pp-main">' +
              '<img src="' + N.img(galleryViews[0].key) + '" alt="' + N.esc(p.name) + ' — main preview" id="pp-main-img" style="object-position:' + (galleryViews[0].pos || "center") + '" fetchpriority="high">' +
            "</div>" +
            (galleryKeys.length > 1
              ? '<div class="pp-thumbs">' + galleryViews.map(function (v, i) {
                  return '<button class="pp-thumb' + (i === 0 ? " active" : "") + '" data-gallery="' + v.key + '" data-pos="' + v.pos + '" aria-label="Preview ' + (i + 1) + '">' +
                    '<img src="' + N.img(v.key) + '" alt="" loading="lazy" style="object-position:' + v.pos + '"></button>';
                }).join("") + "</div>"
              : "") +
          "</div>" +

          /* info */
          '<div class="pp-info" data-reveal>' +
            '<a class="pp-cat-link" href="' + cat.slug + '.html">' + N.esc(cat.name) + "</a>" +
            "<h1>" + N.esc(p.name) + "</h1>" +
            '<div class="pp-rating-row">' +
              N.stars(p.rating) +
              "<span>" + p.rating.toFixed(1) + " · " + p.reviewCount + " reviews</span>" +
              '<a href="#reviews" style="color:var(--text-3)">Read reviews</a>' +
            "</div>" +
            '<div class="pp-price-row">' +
              '<span class="pp-price">' + N.money(p.price) + "</span>" +
              (p.compareAt ? '<span class="pp-old">' + N.money(p.compareAt) + "</span>" : "") +
              (savePct ? '<span class="pp-save">Save ' + savePct + "%</span>" : "") +
            "</div>" +
            '<p class="pp-tagline">' + N.esc(p.tagline) + "</p>" +

            '<div class="pp-ctas" id="pp-ctas">' +
              '<button class="btn btn-primary" id="add-to-cart">' + N.icon("bag") + " Add to cart</button>" +
              '<button class="btn btn-ghost" id="buy-now">Buy now</button>' +
            "</div>" +

            '<div class="trust-row">' +
              '<span class="trust-item">' + N.icon("download") + " Instant download</span>" +
              '<span class="trust-item">' + N.icon("refresh") + " Lifetime updates</span>" +
              '<span class="trust-item">' + N.icon("shield") + " " + N.esc(p.license) + " license</span>" +
            "</div>" +

            /* details accordion */
            '<div class="acc-list acc-single">' +
              '<div class="acc-item">' +
                '<button class="acc-q" aria-expanded="true" aria-controls="acc-includes">What’s included <span class="acc-icon">' + N.icon("plus") + "</span></button>" +
                '<div class="accordion-panel open" id="acc-includes"><div class="acc-a"><ul>' +
                  p.includes.map(function (i) { return "<li>" + N.esc(i) + "</li>"; }).join("") +
                "</ul></div></div>" +
              "</div>" +
              '<div class="acc-item">' +
                '<button class="acc-q" aria-expanded="false" aria-controls="acc-format">Format & delivery <span class="acc-icon">' + N.icon("plus") + "</span></button>" +
                '<div class="accordion-panel" id="acc-format"><div class="acc-a"><p><strong style="color:var(--text)">' +
                  N.esc(p.format) + "</strong></p><p>Delivered as an instant download immediately after checkout, and emailed to you as a backup. Files never expire.</p></div></div>" +
              "</div>" +
              '<div class="acc-item">' +
                '<button class="acc-q" aria-expanded="false" aria-controls="acc-license">License <span class="acc-icon">' + N.icon("plus") + "</span></button>" +
                '<div class="accordion-panel" id="acc-license"><div class="acc-a"><p>' +
                  (p.license === "Commercial"
                    ? "<strong style=\"color:var(--text)\">Commercial license.</strong> Use this product in client work, commercial projects and internal team use. Redistributing, reselling or sharing the raw files is not permitted."
                    : "<strong style=\"color:var(--text)\">Personal license.</strong> Use this product for your own personal use and projects. Client/commercial use requires the commercial tier — contact us to upgrade.") +
                  "</p><p>See the <a class='link-underline' href='refund-policy.html'>license policy</a> for full terms.</p></div></div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +

        /* ---- description + features ---- */
        '<section class="pp-desc" id="description">' +
          '<div class="pp-desc-cols">' +
            "<div>" +
              '<span class="kicker">About this product</span>' +
              "<h2 class=\"section-title\" style=\"margin-bottom:22px\">" + N.esc(p.name) + "</h2>" +
              p.description.split(/\n\s*\n/).map(function (para) { return "<p>" + N.esc(para) + "</p>"; }).join("") +
            "</div>" +
            "<div>" +
              '<span class="kicker">Highlights</span>' +
              '<ul class="features-list">' +
                p.features.map(function (f) {
                  return '<li><span class="fl-icon">' + N.icon("check") + "</span>" + N.esc(f) + "</li>";
                }).join("") +
              "</ul>" +
            "</div>" +
          "</div>" +
        "</section>" +

        /* ---- reviews ---- */
        '<section class="reviews" id="reviews">' +
          '<span class="kicker">Reviews</span>' +
          '<h2 class="section-title" style="margin-bottom:26px">What buyers say.</h2>' +
          '<div class="review-summary">' +
            '<span class="rs-score">' + p.rating.toFixed(1) + "</span>" +
            "<div>" +
              '<div class="rs-stars">' + N.stars(p.rating) + "</div>" +
              '<div class="rs-meta">' + p.reviewCount + " verified reviews · updated " + new Date(p.added).getFullYear() + "</div>" +
            "</div>" +
          "</div>" +
          p.reviews.map(function (r) {
            var initials = r.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
            return (
              '<div class="review-card">' +
                '<div class="rc-head">' +
                  '<span class="t-avatar">' + initials + "</span>" +
                  "<div><div class=\"rc-name\">" + N.esc(r.name) + '</div><div class="rc-role">' + N.esc(r.role) + "</div></div>" +
                  '<div class="rc-stars">' + N.stars(r.rating) + "</div>" +
                "</div>" +
                '<p class="rc-text">' + N.esc(r.text) + "</p>" +
                '<div class="rc-date">' + N.esc(r.date) + "</div>" +
              "</div>"
            );
          }).join("") +
        "</section>" +

        /* ---- related ---- */
        (related.length
          ? '<section class="related" style="margin-top:clamp(56px,8vw,90px)">' +
              '<div class="section-head">' +
                '<span class="kicker">You might also like</span>' +
                '<h2 class="section-title">Related products.</h2>' +
              "</div>" +
              '<div class="product-grid" data-reveal-group>' +
                related.map(N.productCard).join("") +
              "</div>" +
            "</section>"
          : "") +
      "</div>" +

      /* ---- sticky mobile buy bar ---- */
      '<div class="sticky-buy" id="sticky-buy" aria-hidden="true">' +
        '<span class="sb-price">' + N.money(p.price) + "</span>" +
        '<button class="btn btn-primary" data-sticky-add>' + N.icon("bag") + " Add to cart</button>" +
      "</div>";

    /* ---- gallery thumb switching ---- */
    root.querySelectorAll(".pp-thumb").forEach(function (th) {
      th.addEventListener("click", function () {
        root.querySelectorAll(".pp-thumb").forEach(function (t) { t.classList.remove("active"); });
        th.classList.add("active");
        var img = document.getElementById("pp-main-img");
        img.src = N.img(th.getAttribute("data-gallery"));
        img.style.objectPosition = th.getAttribute("data-pos") || "center";
      });
    });

    /* ---- buy buttons ---- */
    document.getElementById("add-to-cart").addEventListener("click", function () {
      if (window.NodiumCart) NodiumCart.add(p.slug, 1);
    });
    document.getElementById("buy-now").addEventListener("click", function () {
      if (window.NodiumCart) {
        NodiumCart.items = NodiumCart.items.filter(function (x) { return x.slug !== p.slug; });
        NodiumCart.add(p.slug, 1);
        window.location.href = "checkout.html";
      }
    });
    var stickyAdd = root.querySelector("[data-sticky-add]");
    if (stickyAdd) {
      stickyAdd.addEventListener("click", function () {
        if (window.NodiumCart) NodiumCart.add(p.slug, 1);
      });
    }

    /* ---- sticky bar appears when the main CTAs scroll out of view ---- */
    if ("IntersectionObserver" in window) {
      var ctas = document.getElementById("pp-ctas");
      var sticky = document.getElementById("sticky-buy");
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          sticky.classList.toggle("show", !entry.isIntersecting);
        });
      }, { threshold: 0 }).observe(ctas);
    }

    /* ---- SEO: Product JSON-LD ---- */
    var ld = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": p.tagline,
      "image": D.config.siteUrl + "/" + N.img(p.cover),
      "brand": { "@type": "Brand", "name": D.config.siteName },
      "offers": {
        "@type": "Offer",
        "price": p.price,
        "priceCurrency": (D.config.currency || "USD").toUpperCase(),
        "availability": "https://schema.org/InStock",
        "url": D.config.siteUrl + "/product.html?slug=" + encodeURIComponent(p.slug)
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": p.rating, "reviewCount": p.reviewCount }
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);

    N.reveal();
  });
})();
