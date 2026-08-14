/* ========================================================================== 
   NODIUM — review-form.js
   Removes placeholder/demo review content from product pages and replaces it
   with a simple customer review submission form.
   ========================================================================== */
(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function init() {
    var root = document.getElementById("product-root");
    if (!root) return;

    var product = window.NODIUM && window.NODIUM.products
      ? window.NODIUM.products.find(function (item) {
          return item.slug === new URLSearchParams(window.location.search).get("slug");
        })
      : null;

    /* Remove any legacy/fabricated proof from the rendered product page. */
    root.querySelectorAll(".pp-rating-row, .reviews").forEach(function (el) {
      el.remove();
    });

    var oldForm = document.getElementById("leave-review");
    if (oldForm) oldForm.remove();

    var productName = product ? product.name : "this product";
    var section = document.createElement("section");
    section.className = "review-submit-section";
    section.id = "leave-review";
    section.setAttribute("aria-labelledby", "leave-review-title");
    section.innerHTML =
      '<div class="review-submit-card">' +
        '<span class="kicker">Customer feedback</span>' +
        '<h2 class="section-title" id="leave-review-title">Have you used it?</h2>' +
        '<p class="review-submit-intro">Tell us how the product worked for you. We only publish genuine customer reviews after checking the submission.</p>' +
        '<form class="review-form" id="review-form">' +
          '<div class="review-form-grid">' +
            '<label><span>Name</span><input name="name" type="text" autocomplete="name" maxlength="80" required placeholder="Your name"></label>' +
            '<label><span>Email</span><input name="email" type="email" autocomplete="email" maxlength="160" required placeholder="you@example.com"></label>' +
          '</div>' +
          '<label><span>Rating</span><select name="rating" required>' +
            '<option value="">Choose a rating</option>' +
            '<option value="5">5 — Excellent</option>' +
            '<option value="4">4 — Very good</option>' +
            '<option value="3">3 — Good</option>' +
            '<option value="2">2 — Could be better</option>' +
            '<option value="1">1 — Not for me</option>' +
          '</select></label>' +
          '<label><span>Your review</span><textarea name="review" rows="6" maxlength="1200" required placeholder="What did you use it for, and how did it work for you?"></textarea></label>' +
          '<label><span>Order number <small>(optional)</small></span><input name="order" type="text" maxlength="80" placeholder="e.g. NOD-1042"></label>' +
          '<button class="btn btn-primary" type="submit">Send review</button>' +
          '<p class="review-form-note">Submitting opens your email app with the review addressed to hello@nodium.co. Your review is not published automatically.</p>' +
          '<p class="review-form-status" id="review-form-status" role="status" aria-live="polite"></p>' +
        '</form>' +
      '</div>';

    var desc = root.querySelector(".pp-desc");
    if (desc) {
      desc.insertAdjacentElement("afterend", section);
    } else {
      root.appendChild(section);
    }

    var form = document.getElementById("review-form");
    var status = document.getElementById("review-form-status");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var email = String(data.get("email") || "").trim();
      var rating = String(data.get("rating") || "").trim();
      var review = String(data.get("review") || "").trim();
      var order = String(data.get("order") || "").trim();

      if (!name || !email || !rating || !review) {
        status.textContent = "Please complete your name, email, rating and review.";
        return;
      }

      var subject = "Review — " + productName;
      var body = [
        "Product: " + productName,
        "Name: " + name,
        "Email: " + email,
        "Rating: " + rating + "/5",
        "Order number: " + (order || "Not provided"),
        "",
        "Review:",
        review
      ].join("\n");

      status.textContent = "Opening your email app…";
      window.location.href = "mailto:hello@nodium.co?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
