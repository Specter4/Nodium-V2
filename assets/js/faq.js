/* ==========================================================================
   NODIUM — faq.js (FAQ page accordion, content from data/site.json)
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("faq-list");
    if (!host || !D.faqs) return;
    host.innerHTML = D.faqs.map(function (f, i) {
      return (
        '<div class="acc-item" data-reveal>' +
          '<button class="acc-q" aria-expanded="false" aria-controls="faq-a-' + i + '">' +
            N.esc(f.q) + ' <span class="acc-icon">' + N.icon("plus") + "</span>" +
          "</button>" +
          '<div class="accordion-panel" id="faq-a-' + i + '"><div class="acc-a"><p>' + N.esc(f.a) + "</p></div></div>" +
        "</div>"
      );
    }).join("");
    N.reveal();

    /* SEO: inject FAQPage JSON-LD from the same data the accordion uses */
    var ld = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": D.faqs.map(function (f) {
        return { "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } };
      })
    };
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
  });
})();
