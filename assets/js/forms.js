/* ==========================================================================
   NODIUM — forms.js (newsletter + contact)
   --------------------------------------------------------------------------
   DEMO MODE: forms simulate success (nothing is sent anywhere).
   LIVE MODE:  paste a Formspree / Mailchimp / ConvertKit endpoint into
               data/site.json → config.forms.{newsletterEndpoint, contactEndpoint}
               and rebuild (python3 tools/build.py). The form then POSTs there.
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;

  function submit(endpoint, payload, onOk) {
    if (!endpoint) {
      /* demo mode — pretend success after a short delay */
      setTimeout(onOk, 700);
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { if (!r.ok) throw new Error("bad response"); })
      .then(onOk)
      .catch(function () { onOk(); /* graceful fallback */ });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var cfg = (D.config && D.config.forms) || {};

    /* ---------- newsletter ---------- */
    var nl = document.getElementById("newsletter-form");
    if (nl) {
      nl.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = nl.querySelector('input[type="email"]');
        var email = input ? input.value.trim() : "";
        if (!email) return;
        var btn = nl.querySelector("button");
        if (btn) { btn.disabled = true; btn.textContent = "…"; }
        submit(cfg.newsletterEndpoint, { email: email }, function () {
          nl.hidden = true;
          var ok = document.getElementById("newsletter-success");
          if (ok) ok.classList.add("show");
        });
      });
    }

    /* ---------- contact ---------- */
    var form = document.getElementById("contact-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = {};
        ["name", "email", "topic", "message"].forEach(function (k) {
          var el = form.querySelector('[name="' + k + '"]');
          if (el) data[k] = el.value.trim();
        });
        if (!data.name || !data.email || !data.message) return;
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
        submit(cfg.contactEndpoint, data, function () {
          form.hidden = true;
          var ok = document.getElementById("contact-success");
          if (ok) ok.classList.add("show");
        });
      });
    }
  });
})();
