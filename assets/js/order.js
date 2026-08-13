/* ==========================================================================
   NODIUM — order.js (order confirmation + download links)
   Reads the order id from ?order=…, finds it in localStorage and renders
   the confirmation with per-item download links.
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("order-root");
    if (!root) return;

    var id = new URLSearchParams(window.location.search).get("order");
    var order = null;
    if (id) {
      try {
        var orders = JSON.parse(localStorage.getItem("nodium_orders_v1") || "[]");
        order = orders.find(function (o) { return o.id === id; }) || null;
      } catch (e) {}
    }

    var email = (order && order.email) || (D.config && D.config.supportEmail);

    root.innerHTML =
      '<div class="container">' +
        '<div class="order-wrap" style="padding-block:clamp(64px,10vw,130px)">' +
          '<div class="order-check">' + N.icon("check") + "</div>" +
          "<h1 class=\"display-title\" style=\"font-size:clamp(2rem,4.6vw,3.2rem)\">Order confirmed.</h1>" +
          '<p class="lead">' + N.esc((D.order && D.order.downloadsNote) || "Your files are ready.") + "</p>" +
          '<span class="order-id">' + (order ? N.esc(order.id) : "ND-DEMO") + "</span>" +
        "</div>" +

        (order && order.items && order.items.length
          ? '<div class="dl-list">' +
              order.items.map(function (it) {
                return (
                  '<div class="dl-item">' +
                    '<div class="dl-icon">' + N.icon("download") + "</div>" +
                    "<div><div class=\"dl-name\">" + N.esc(it.name) + '</div><div class="dl-meta">' + it.qty + " × " + N.money(it.price) + " · digital file</div></div>" +
                    '<a class="btn btn-sm btn-primary dl-btn" href="product.html?slug=' + encodeURIComponent(it.slug) + '">' + N.icon("download") + " Download</a>" +
                  "</div>"
                );
              }).join("") +
            "</div>"
          : "") +

        '<div class="order-wrap">' +
          '<div class="next-steps">' +
            "<h3>What happens next</h3>" +
            "<ol>" +
              "<li>We've emailed your receipt and download links to <strong style=\"color:var(--text)\">" + N.esc(email) + "</strong>.</li>" +
              "<li>Download links never expire — keep them saved or revisit your order email anytime.</li>" +
              "<li>Every product includes lifetime updates and 14-day refunds. Questions? " +
                '<a class="link-underline" href="contact.html">Contact support</a>.' +
              "</li>" +
            "</ol>" +
          "</div>" +
          '<a class="btn btn-primary" href="products.html">Continue browsing ' + N.icon("arrowR") + "</a>" +
        "</div>" +
      "</div>";

    N.reveal();
  });
})();
