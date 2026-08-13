/* ==========================================================================
   NODIUM — category.js (category pages, one template for all 10 categories)
   The page URL determines which category renders: body[data-category].
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("category-root");
    if (!root) return;
    var slug = document.body.getAttribute("data-category");
    var cat = N.category(slug);
    if (!cat) {
      root.innerHTML =
        '<div class="empty-state" style="margin-top:120px">' +
          "<h3>Category not found</h3><p>It may have been renamed. <a class='link-underline' href='products.html'>Browse all products →</a></p>" +
        "</div>";
      return;
    }

    var products = N.productsIn(slug);
    var minPrice = products.length ? Math.min.apply(null, products.map(function (p) { return p.price; })) : 0;
    var others = D.categories.filter(function (c) { return c.slug !== slug; });

    root.innerHTML =
      /* ---- category hero ---- */
      '<section class="subhero">' +
        '<div class="container subhero-inner">' +
          '<nav class="crumbs" aria-label="Breadcrumb">' +
            '<a href="index.html">Home</a><span class="sep">/</span>' +
            '<a href="products.html">Products</a><span class="sep">/</span>' +
            '<span class="current">' + N.esc(cat.name) + "</span>" +
          "</nav>" +
          '<div class="category-hero">' +
            "<div>" +
              '<span class="kicker" data-reveal>' + N.esc(cat.kicker) + "</span>" +
              '<h1 class="display-title" data-reveal style="margin-bottom:20px">' + N.esc(cat.name) + "</h1>" +
              '<p class="lead" data-reveal>' + N.esc(cat.description) + "</p>" +
              '<p class="category-meta" data-reveal style="margin-top:22px;font-size:13px;color:var(--text-3);letter-spacing:.08em;text-transform:uppercase">' +
                products.length + " products · from " + N.money(minPrice) + " · lifetime updates" +
              "</p>" +
            "</div>" +
            '<div data-reveal style="border-radius:16px;overflow:hidden;border:1px solid var(--line);aspect-ratio:4/3">' +
              '<img src="' + N.img(cat.cover) + '" alt="' + N.esc(cat.name) + ' — cover artwork" style="width:100%;height:100%;object-fit:cover" fetchpriority="high">' +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>" +

      /* ---- product grid ---- */
      '<section class="section" style="padding-top:clamp(48px,6vw,72px)">' +
        '<div class="container">' +
          '<div class="section-head" data-reveal>' +
            '<span class="kicker">Inside ' + N.esc(cat.name) + "</span>" +
            '<h2 class="section-title">Everything in this category.</h2>' +
          "</div>" +
          '<div class="product-grid" id="category-grid" data-reveal-group>' +
            (products.map(N.productCard).join("") || '<p style="color:var(--text-2)">Products are on their way — check back soon.</p>') +
          "</div>" +
        "</div>" +
      "</section>" +

      /* ---- other categories ---- */
      '<section class="section" style="padding-top:0">' +
        '<div class="container">' +
          '<div class="section-head" data-reveal>' +
            '<span class="kicker">Keep exploring</span>' +
            '<h2 class="section-title">Other categories.</h2>' +
          "</div>" +
          '<div class="category-grid" data-reveal-group>' +
            others.slice(0, 6).map(function (c) { return N.categoryTile(c); }).join("") +
          "</div>" +
        "</div>" +
      "</section>" +

      /* ---- CTA ---- */
      '<section class="section" style="padding-top:0">' +
        '<div class="container">' +
          '<div style="border:1px solid var(--line);border-radius:18px;padding:clamp(32px,6vw,64px);text-align:center;background:var(--card)" data-reveal>' +
            '<span class="kicker" style="justify-content:center">Can’t find it?</span>' +
            '<h2 class="section-title" style="margin-bottom:12px">Need a custom template or workflow?</h2>' +
            '<p style="color:var(--text-2);max-width:520px;margin:0 auto 26px">We take on a limited number of bespoke projects each quarter — internal tools, automation systems and template suites.</p>' +
            '<a class="btn btn-primary" href="contact.html">Start a project ' + N.icon("arrowR") + "</a>" +
          "</div>" +
        "</div>" +
      "</section>";

    /* re-run reveal for dynamically injected content */
    if (window.N && N.reveal) N.reveal();
  });
})();
