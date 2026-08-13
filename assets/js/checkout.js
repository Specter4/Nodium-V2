/* ==========================================================================
   NODIUM — checkout.js
   --------------------------------------------------------------------------
   A clean, honest checkout flow:
   • demo mode (default) — payment is simulated; nothing is charged or stored
   • Stripe-ready — see data/site.json → config.checkout for the switch:
     provider "stripe-payment-link" redirects to a Stripe Payment Link you
     paste into config; "stripe-checkout" POSTs to your backend URL, which
     creates a Stripe Checkout Session and redirects. See README.md.
   On success an order is recorded locally and the customer is sent to
   order-confirmation.html?order=…
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  function fmtCard(v) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function fmtExp(v) {
    var d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("checkout-root");
    if (!root || !window.NodiumCart) return;

    var Cart = window.NodiumCart;

    if (!Cart.items.length) {
      root.innerHTML =
        '<div class="container" style="padding-block:110px;text-align:center">' +
          '<h1 style="margin-bottom:14px">Your cart is empty</h1>' +
          '<p style="color:var(--text-2);margin-bottom:28px">Add a product or two, then come back.</p>' +
          '<a class="btn btn-primary" href="products.html">Browse products ' + N.icon("arrowR") + "</a>" +
        "</div>";
      return;
    }

    var cfg = D.config || {};
    var checkoutCfg = cfg.checkout || { provider: "demo" };

    root.innerHTML =
      '<div class="container">' +
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span class="sep">/</span><a href="products.html">Products</a><span class="sep">/</span><span class="current">Checkout</span></nav>' +

        '<div class="steps" aria-hidden="true">' +
          '<span class="step active"><span class="step-dot">1</span> Contact</span><span class="step-line"></span>' +
          '<span class="step"><span class="step-dot">2</span> Payment</span><span class="step-line"></span>' +
          '<span class="step"><span class="step-dot">3</span> Done</span>' +
        "</div>" +

        '<div class="checkout-grid">' +

          /* ---- left: form ---- */
          '<div>' +
            '<form id="co-form" novalidate>' +

              '<section class="checkout-section">' +
                "<h2><span class=\"num\">1</span> Contact details</h2>" +
                '<div class="form-2col">' +
                  '<div class="field"><label class="field-label" for="co-name">Full name</label>' +
                    '<input class="input" id="co-name" name="name" type="text" autocomplete="name" placeholder="Alex Morgan" required></div>' +
                  '<div class="field"><label class="field-label" for="co-email">Email</label>' +
                    '<input class="input" id="co-email" name="email" type="email" autocomplete="email" placeholder="alex@company.com" required></div>' +
                "</div>" +
              "</section>" +

              '<section class="checkout-section">' +
                "<h2><span class=\"num\">2</span> Payment</h2>" +
                '<div class="demo-note">' +
                  N.icon("lock") +
                  "<span><strong>Demo checkout.</strong> No real payment is processed and nothing is stored. " +
                  "To accept live payments, follow the Stripe-ready instructions in the README (one config change).</span>" +
                "</div>" +
                '<div class="card-row">' +
                  '<div class="field"><label class="field-label" for="co-card">Card number</label>' +
                    '<input class="input" id="co-card" type="text" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="cc-number"></div>' +
                  '<div class="field"><label class="field-label" for="co-exp">Expiry</label>' +
                    '<input class="input" id="co-exp" type="text" inputmode="numeric" placeholder="MM / YY" autocomplete="cc-exp"></div>' +
                  '<div class="field"><label class="field-label" for="co-cvc">CVC</label>' +
                    '<input class="input" id="co-cvc" type="text" inputmode="numeric" placeholder="123" autocomplete="cc-csc"></div>' +
                "</div>" +
              "</section>" +

              '<button class="btn btn-primary btn-block" type="submit" id="co-pay" style="padding:17px">' +
                N.icon("lock") + ' <span id="co-pay-label">Pay ' + N.money(Cart.subtotal()) + "</span>" +
              "</button>" +
              '<p class="co-secure">' + N.icon("shield") + " Secure demo checkout · 14-day refunds · Instant delivery</p>" +
            "</form>" +
          "</div>" +

          /* ---- right: order summary ---- */
          '<aside class="summary-card" data-reveal>' +
            "<h2>Order summary</h2>" +
            Cart.items.map(function (it) {
              var p = N.product(it.slug);
              if (!p) return "";
              return (
                '<div class="co-item">' +
                  '<div class="co-thumb"><img src="' + N.img(p.cover) + '" alt="" loading="lazy"></div>' +
                  "<div><div class=\"co-name\">" + N.esc(p.name) + '</div><div class="co-qty">Qty ' + it.qty + "</div></div>" +
                  '<div class="co-price">' + N.money(p.price * it.qty) + "</div>" +
                "</div>"
              );
            }).join("") +
            '<div class="co-totals">' +
              '<div class="co-row"><span>Subtotal</span><span>' + N.money(Cart.subtotal()) + "</span></div>" +
              '<div class="co-row"><span>Digital delivery</span><span>Free</span></div>' +
              '<div class="co-row"><span>Tax</span><span>—</span></div>' +
              '<div class="co-row total"><span>Total</span><span class="co-value">' + N.money(Cart.subtotal()) + "</span></div>" +
            "</div>" +
          "</aside>" +
        "</div>" +
      "</div>";

    /* ---------- card field formatting ---------- */
    var card = document.getElementById("co-card");
    var exp = document.getElementById("co-exp");
    if (card) card.addEventListener("input", function () { card.value = fmtCard(card.value); });
    if (exp) exp.addEventListener("input", function () { exp.value = fmtExp(exp.value); });

    /* ---------- submit ---------- */
    var form = document.getElementById("co-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("co-name").value.trim();
      var email = document.getElementById("co-email").value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!name) { flash(document.getElementById("co-name")); return; }
      if (!emailOk) { flash(document.getElementById("co-email")); return; }

      var payBtn = document.getElementById("co-pay");
      var label = document.getElementById("co-pay-label");
      payBtn.disabled = true;
      label.textContent = "Processing…";

      function finish() {
        /* record the order locally */
        var order = {
          id: "ND-" + Date.now().toString(36).slice(-5).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase(),
          email: email,
          name: name,
          date: new Date().toISOString(),
          items: Cart.items.map(function (it) {
            var p = N.product(it.slug);
            return { slug: it.slug, name: p ? p.name : it.slug, qty: it.qty, price: p ? p.price : 0, cover: p ? N.img(p.cover) : "" };
          }),
          total: Cart.subtotal()
        };
        var orders = [];
        try { orders = JSON.parse(localStorage.getItem("nodium_orders_v1") || "[]"); } catch (err) {}
        orders.unshift(order);
        try { localStorage.setItem("nodium_orders_v1", JSON.stringify(orders)); } catch (err) {}
        Cart.clear();
        window.location.href = "order-confirmation.html?order=" + encodeURIComponent(order.id);
      }

      if (checkoutCfg.provider === "stripe-payment-link" && checkoutCfg.stripe && checkoutCfg.stripe.paymentLinkUrl) {
        window.location.href = checkoutCfg.stripe.paymentLinkUrl;
        return;
      }
      if (checkoutCfg.provider === "stripe-checkout" && checkoutCfg.stripe && checkoutCfg.stripe.backendUrl) {
        fetch(checkoutCfg.stripe.backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: Cart.items, email: email })
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res && res.url) { window.location.href = res.url; } else { finish(); }
          })
          .catch(function () { finish(); });
        return;
      }
      /* demo mode */
      setTimeout(finish, 1400);
    });

    function flash(el) {
      el.style.borderColor = "#e5e5e5";
      el.style.boxShadow = "0 0 0 3px rgba(229,229,229,0.25)";
      el.focus();
      setTimeout(function () { el.style.borderColor = ""; el.style.boxShadow = ""; }, 1600);
    }
  });
})();
