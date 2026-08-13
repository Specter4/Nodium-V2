/* ==========================================================================
   NODIUM — catalog.js (All Products page: search, filters, sorting)
   --------------------------------------------------------------------------
   State is kept in the URL (?q=…&cat=…&price=…&sort=…) so filtered views
   are shareable and survive reloads.
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  var PRICE_BANDS = [
    { id: "any", label: "Any price", test: function () { return true; } },
    { id: "under25", label: "Under $25", test: function (p) { return p.price < 25; } },
    { id: "25to50", label: "$25 – $50", test: function (p) { return p.price >= 25 && p.price <= 50; } },
    { id: "over50", label: "Over $50", test: function (p) { return p.price > 50; } }
  ];

  var SORTS = [
    { id: "popular", label: "Most popular" },
    { id: "newest", label: "Newest" },
    { id: "rating", label: "Top rated" },
    { id: "price-asc", label: "Price: low to high" },
    { id: "price-desc", label: "Price: high to low" },
    { id: "name", label: "Name A–Z" }
  ];

  var state = { q: "", cat: "all", price: "any", sort: "popular" };

  function parseURL() {
    var p = new URLSearchParams(window.location.search);
    state.q = p.get("q") || "";
    state.cat = p.get("cat") || "all";
    state.price = p.get("price") || "any";
    state.sort = p.get("sort") || "popular";
  }

  function updateURL() {
    var p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cat && state.cat !== "all") p.set("cat", state.cat);
    if (state.price && state.price !== "any") p.set("price", state.price);
    if (state.sort && state.sort !== "popular") p.set("sort", state.sort);
    var qs = p.toString();
    try {
      history.replaceState(null, "", "products.html" + (qs ? "?" + qs : ""));
    } catch (e) { /* file:// contexts may block history — filters still work */ }
  }

  function matches(p) {
    if (state.cat !== "all" && p.category !== state.cat) return false;
    var band = PRICE_BANDS.find(function (b) { return b.id === state.price; }) || PRICE_BANDS[0];
    if (!band.test(p)) return false;
    if (state.q) {
      var cat = N.category(p.category);
      var hay = (p.name + " " + p.tagline + " " + p.description + " " + (cat ? cat.name : "")).toLowerCase();
      if (state.q.split(/\s+/).some(function (w) { return w && hay.indexOf(w) < 0; })) return false;
    }
    return true;
  }

  function sort(list) {
    var s = list.slice();
    switch (state.sort) {
      case "newest": s.sort(function (a, b) { return b.added.localeCompare(a.added); }); break;
      case "rating": s.sort(function (a, b) { return b.rating - a.rating; }); break;
      case "price-asc": s.sort(function (a, b) { return a.price - b.price; }); break;
      case "price-desc": s.sort(function (a, b) { return b.price - a.price; }); break;
      case "name": s.sort(function (a, b) { return a.name.localeCompare(b.name); }); break;
      default: s.sort(function (a, b) { return b.popularity - a.popularity; });
    }
    return s;
  }

  function renderFilters() {
    var catRow = document.getElementById("cat-chips");
    if (catRow) {
      var chips = '<button class="chip' + (state.cat === "all" ? " active" : "") + '" data-cat="all">All <span class="chip-count">' + D.products.length + "</span></button>";
      D.categories.forEach(function (c) {
        var n = N.productsIn(c.slug).length;
        chips += '<button class="chip' + (state.cat === c.slug ? " active" : "") + '" data-cat="' + c.slug + '">' + N.esc(c.name) + ' <span class="chip-count">' + n + "</span></button>";
      });
      catRow.innerHTML = chips;
    }
    var priceRow = document.getElementById("price-chips");
    if (priceRow) {
      priceRow.innerHTML = PRICE_BANDS.map(function (b) {
        return '<button class="chip' + (state.price === b.id ? " active" : "") + '" data-price="' + b.id + '">' + b.label + "</button>";
      }).join("");
    }
    var sortSel = document.getElementById("sort-select");
    if (sortSel) {
      sortSel.innerHTML = SORTS.map(function (s) {
        return '<option value="' + s.id + '"' + (state.sort === s.id ? " selected" : "") + ">" + s.label + "</option>";
      }).join("");
    }
    var search = document.getElementById("search-input");
    if (search) {
      search.value = state.q;
      if (state.q && document.activeElement !== search) { /* keep focus behavior natural */ }
    }
  }

  function render() {
    var list = sort(D.products.filter(matches));
    var grid = document.getElementById("catalog-grid");
    var count = document.getElementById("result-count");
    var clear = document.getElementById("clear-filters");
    var empty = document.getElementById("empty-state");

    if (count) {
      count.textContent = list.length + (list.length === 1 ? " product" : " products");
    }
    if (clear) {
      var active = state.q || state.cat !== "all" || state.price !== "any";
      clear.classList.toggle("show", active);
    }
    if (grid) {
      if (list.length) {
        grid.innerHTML = list.map(N.productCard).join("");
        grid.setAttribute("data-reveal-group", "");
        if (empty) empty.style.display = "none";
      } else {
        grid.innerHTML = "";
        if (empty) empty.style.display = "block";
      }
      if (N.reveal) N.reveal();
    }
  }

  function init() {
    parseURL();
    renderFilters();
    render();

    document.getElementById("search-input").addEventListener("input", function (e) {
      state.q = e.target.value.trim().toLowerCase();
      updateURL();
      render();
    });

    document.addEventListener("click", function (e) {
      var cat = e.target.closest("[data-cat]");
      if (cat) { state.cat = cat.getAttribute("data-cat"); updateURL(); renderFilters(); render(); return; }
      var price = e.target.closest("[data-price]");
      if (price) { state.price = price.getAttribute("data-price"); updateURL(); renderFilters(); render(); return; }
      var clear = e.target.closest("#clear-filters");
      if (clear) {
        state.q = ""; state.cat = "all"; state.price = "any";
        updateURL(); renderFilters(); render();
        var si = document.getElementById("search-input");
        if (si) si.value = "";
        si && si.focus();
        return;
      }
    });

    document.getElementById("sort-select").addEventListener("change", function (e) {
      state.sort = e.target.value;
      updateURL();
      render();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
