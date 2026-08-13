/* ==========================================================================
   NODIUM — about.js (story, values, stats, team — from data/site.json)
   ========================================================================== */
(function () {
  "use strict";
  var D = window.NODIUM;
  if (!D) return;
  var N = window.N;

  document.addEventListener("DOMContentLoaded", function () {
    if (!D.about) return;

    var story = document.getElementById("about-story");
    if (story) {
      story.innerHTML = D.about.story.map(function (para) { return "<p>" + N.esc(para) + "</p>"; }).join("");
    }

    var values = document.getElementById("about-values");
    if (values) {
      values.innerHTML = D.about.values.map(function (v, i) {
        return (
          '<div class="value-4" data-reveal>' +
            '<div class="v4-num">0' + (i + 1) + "</div>" +
            "<h3>" + N.esc(v.title) + "</h3>" +
            "<p>" + N.esc(v.text) + "</p>" +
          "</div>"
        );
      }).join("");
      values.setAttribute("data-reveal-group", "");
    }

    var stats = document.getElementById("about-stats");
    if (stats) {
      stats.innerHTML = D.about.stats.map(function (s) {
        return (
          '<div class="stat" data-reveal>' +
            '<div class="stat-value"><span data-counter="' + s.value + '" data-decimals="' + (s.decimals || 0) + '" data-suffix="' + N.esc(s.suffix || "") + '">0</span></div>' +
            '<div class="stat-label">' + N.esc(s.label) + "</div>" +
          "</div>"
        );
      }).join("");
      stats.setAttribute("data-reveal-group", "");
    }

    var team = document.getElementById("team-grid");
    if (team) {
      team.innerHTML = D.about.team.map(function (m) {
        return (
          '<div class="team-card" data-reveal>' +
            '<div class="t-avatar-lg" aria-hidden="true">' + N.esc(m.initials) + "</div>" +
            "<h3>" + N.esc(m.name) + "</h3>" +
            '<div class="tc-role">' + N.esc(m.role) + "</div>" +
            "<p>" + N.esc(m.bio) + "</p>" +
          "</div>"
        );
      }).join("");
      team.setAttribute("data-reveal-group", "");
    }

    N.reveal();
    if (N.counters) N.counters();
  });
})();
