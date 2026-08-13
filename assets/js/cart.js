/* ==========================================================================
   NODIUM — cart.js (localStorage cart + drawer UI)
   --------------------------------------------------------------------------
   The cart persists in the browser (localStorage key: nodium_cart_v1).
   Checkout is handled by checkout.js; this file owns the drawer and badge.
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;

  var KEY = "nodium_cart_v1";
  var Cart = {
    items: [], /* [{ slug, qty }] */

    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        this.items = raw ? JSON.parse(raw) : [];
      } catch (e) { this.items = []; }
      /* drop slugs that no longer exist in the catalogue */
      this.items = this.items.filter(function (it) {
        return D.products.some(function (p) { return p.slug === it.slug; });
      });
    },
    save: function () {
      try { localStorage.setItem(KEY, JSON.stringify(this.items)); } catch (e) {}
      this.render();
    },
    count: function () {
      return this.items.reduce(function (n, it) { return n + it.qty; }, 0);
    },
    subtotal: function () {
      return this.items.reduce(function (sum, it) {
        var p = D.products.find(function (x) { return x.slug === it.slug; });
        return sum + (p ? p.price * it.qty : 0);
      }, 0);
    },
    add: function (slug, qty) {
      qty = qty || 1;
      var it = this.items.find(function (x) { return x.slug === slug; });
      if (it) { it.qty += qty; } else { this.items.push({ slug: slug, qty: qty }); }
      this.save();
      var p = D.products.find(function (x) { return x.slug === slug; });
      if (p) {
        N.showToast(
          "<strong>" + N.esc(p.name) + "</strong> added to cart",
          "View cart", "checkout.html"
        );
      }
      this.openDrawer(); /* open the drawer on add — clear feedback */
    },
    setQty: function (slug, qty) {
      var it = this.items.find(function (x) { return x.slug === slug; });
      if (!it) return;
      it.qty = Math.max(1, qty);
      this.save();
    },
    remove: function (slug) {
      this.items = this.items.filter(function (x) { return x.slug !== slug; });
      this.save();
    },
    clear: function () {
      this.items = [];
      this.save();
    },

    /* ---------- drawer UI ---------- */
    build: function () {
      var host = document.getElementById("cart-drawer");
      if (!host) return;
      host.innerHTML =
        '<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">' +
          '<div class="drawer-backdrop" data-close-cart></div>' +
          '<div class="drawer-inner">' +
            '<div class="drawer-header">' +
              "<h3>Cart (<span id=\"drawer-count\">0</span>)</h3>" +
              '<button class="icon-btn" data-close-cart aria-label="Close cart">' + N.icon("x") + "</button>" +
            "</div>" +
            '<div class="drawer-items" id="drawer-items"></div>' +
            '<div class="drawer-foot" id="drawer-foot">' +
              '<div class="drawer-subtotal"><span class="ds-label">Subtotal</span><span class="ds-value" id="drawer-subtotal">$0</span></div>' +
              '<p class="drawer-note">Digital delivery · Instant download · No shipping</p>' +
              '<div class="drawer-actions">' +
                '<a class="btn btn-primary btn-block" href="checkout.html">Checkout ' + N.icon("arrowR") + "</a>" +
                '<button class="btn btn-ghost btn-block" data-close-cart>Continue browsing</button>' +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
    },

    openDrawer: function () {
      var d = document.getElementById("drawer");
      if (!d) return;
      d.classList.add("open");
      document.body.classList.add("no-scroll");
      var closeBtn = d.querySelector("[data-close-cart]");
      if (closeBtn) closeBtn.focus();
    },
    closeDrawer: function () {
      var d = document.getElementById("drawer");
      if (!d) return;
      d.classList.remove("open");
      document.body.classList.remove("no-scroll");
    },

    itemHTML: function (it) {
      var p = D.products.find(function (x) { return x.slug === it.slug; });
      if (!p) return "";
      var cat = N.category(p.category);
      return (
        '<div class="drawer-item">' +
          '<div class="drawer-thumb"><img src="' + N.img(p.cover) + '" alt="" loading="lazy"></div>' +
          '<div>' +
            '<div class="drawer-name">' + N.esc(p.name) + "</div>" +
            '<div class="drawer-cat">' + N.esc(cat ? cat.name : "") + "</div>" +
            '<div class="drawer-price">' + N.money(p.price) + "</div>" +
            '<div class="drawer-qty" aria-label="Quantity">' +
              '<button data-cart-dec="' + p.slug + '" aria-label="Decrease quantity">' + N.icon("minus") + "</button>" +
              '<span class="dq-n">' + it.qty + "</span>" +
              '<button data-cart-inc="' + p.slug + '" aria-label="Increase quantity">' + N.icon("plus") + "</button>" +
            "</div>" +
          "</div>" +
          '<button class="drawer-remove" data-cart-remove="' + p.slug + '" aria-label="Remove ' + N.esc(p.name) + ' from cart">' + N.icon("x") + "</button>" +
        "</div>"
      );
    },

    render: function () {
      var badge = document.getElementById("cart-count");
      if (badge) {
        var n = this.count();
        badge.textContent = n;
        badge.classList.toggle("has-items", n > 0);
      }
      var items = document.getElementById("drawer-items");
      var foot = document.getElementById("drawer-foot");
      var count = document.getElementById("drawer-count");
      var sub = document.getElementById("drawer-subtotal");
      if (!items) return;
      if (count) count.textContent = this.count();
      if (sub) sub.textContent = N.money(this.subtotal());
      if (!this.items.length) {
        items.innerHTML =
          '<div class="drawer-empty">' +
            '<div class="de-icon">' + N.icon("bag", 26) + "</div>" +
            "<p>Your cart is empty.</p>" +
            '<p style="margin-top:6px"><a class="link-underline" href="products.html">Browse products →</a></p>' +
          "</div>";
        if (foot) foot.style.display = "none";
        return;
      }
      if (foot) foot.style.display = "";
      items.innerHTML = this.items.map(this.itemHTML.bind(this)).join("");
    },

    init: function () {
      this.load();
      this.build();
      this.render();

      document.addEventListener("click", function (e) {
        /* add-to-cart buttons on product cards */
        var add = e.target.closest("[data-add-to-cart]");
        if (add) {
          e.preventDefault();
          e.stopPropagation();
          Cart.add(decodeURIComponent(add.getAttribute("data-add-to-cart")), 1);
          return;
        }
        var inc = e.target.closest("[data-cart-inc]");
        if (inc) {
          var incSlug = inc.getAttribute("data-cart-inc");
          var incItem = Cart.items.find(function (x) { return x.slug === incSlug; });
          if (incItem) Cart.setQty(incSlug, incItem.qty + 1);
          return;
        }
        var dec = e.target.closest("[data-cart-dec]");
        if (dec) {
          var slug = dec.getAttribute("data-cart-dec");
          var it = Cart.items.find(function (x) { return x.slug === slug; });
          if (it) {
            if (it.qty <= 1) { Cart.remove(slug); } else { Cart.setQty(slug, it.qty - 1); }
          }
          return;
        }
        var rm = e.target.closest("[data-cart-remove]");
        if (rm) { Cart.remove(rm.getAttribute("data-cart-remove")); return; }
        /* open / close drawer */
        var opener = e.target.closest("#cart-open");
        if (opener) { e.preventDefault(); Cart.openDrawer(); return; }
        if (e.target.closest("[data-close-cart]")) { Cart.closeDrawer(); return; }
      });
      /* keyboard access for add-to-cart buttons (Enter / Space) */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { Cart.closeDrawer(); return; }
        if (e.key !== "Enter" && e.key !== " ") return;
        var kb = e.target.closest("[data-add-to-cart]");
        if (kb) {
          e.preventDefault();
          Cart.add(decodeURIComponent(kb.getAttribute("data-add-to-cart")), 1);
        }
      });
    }
  };

  window.NodiumCart = Cart;
  document.addEventListener("DOMContentLoaded", function () { Cart.init(); });
})();
