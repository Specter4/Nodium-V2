/* ==========================================================================
   NODIUM — home.js (index page renderers)
   Renders the featured products, category grid, stats and testimonials
   from the central data file. Hero headline & copy live in index.html.
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  document.addEventListener("DOMContentLoaded", function () {

    /* ---- hero stats (animated counters) ---- */
    var statsHost = document.getElementById("hero-stats");
    if (statsHost && D.home && D.home.hero) {
      statsHost.innerHTML = D.home.hero.stats.map(function (s) {
        return (
          '<div class="stat" data-reveal>' +
            '<div class="stat-value"><span data-counter="' + s.value + '" data-decimals="' + (s.decimals || 0) + '" data-suffix="' + N.esc(s.suffix || "") + '">0</span></div>' +
            '<div class="stat-label">' + N.esc(s.label) + "</div>" +
          "</div>"
        );
      }).join("");
      statsHost.setAttribute("data-reveal-group", "");
    }

    /* ---- marquee wordmarks (duplicated for a seamless loop) ---- */
    var marquee = document.getElementById("marquee-track");
    if (marquee && D.home && D.home.marquee) {
      var html = D.home.marquee.map(function (name) {
        return '<span class="marquee-item">' + N.esc(name) + "</span>";
      }).join("");
      marquee.innerHTML = html + html;
    }

    /* ---- featured / bestselling products ---- */
    var featuredHost = document.getElementById("featured-grid");
    if (featuredHost) {
      var limit = (D.home && D.home.featured && D.home.featured.limit) || 6;
      var picks = D.products
        .slice()
        .sort(function (a, b) { return b.popularity - a.popularity; })
        .slice(0, limit);
      featuredHost.innerHTML = picks.map(N.productCard).join("");
      featuredHost.setAttribute("data-reveal-group", "");
    }

    /* ---- category showcase ---- */
    var catHost = document.getElementById("category-grid");
    if (catHost) {
      catHost.innerHTML = D.categories.map(N.categoryTile).join("");
      catHost.setAttribute("data-reveal-group", "");
    }

    /* ---- testimonials ---- */
    var tHost = document.getElementById("testimonial-grid");
    if (tHost && D.home && D.home.testimonials) {
      tHost.innerHTML = D.home.testimonials.items.map(function (t) {
        var initials = t.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
        return (
          '<figure class="t-card" data-reveal>' +
            '<span class="t-mark" aria-hidden="true">"</span>' +
            '<blockquote class="t-quote">' + N.esc(t.quote) + "</blockquote>" +
            "<figcaption class=\"t-who\">" +
              '<span class="t-avatar" aria-hidden="true">' + initials + "</span>" +
              "<span><span class=\"t-name\">" + N.esc(t.name) + '</span><br><span class="t-role">' + N.esc(t.role) + "</span></span>" +
            "</figcaption>" +
          "</figure>"
        );
      }).join("");
      tHost.setAttribute("data-reveal-group", "");
    }

    /* animate the freshly injected content */
    if (N.reveal) N.reveal();
    if (N.counters) N.counters();
  });
})();
