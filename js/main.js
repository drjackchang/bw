(function () {
  "use strict";

  var PAGE_SIZE = 6;
  var state = { pubs: [], expanded: false };

  function boldName(authors) {
    // Bold every occurrence of "Williams B" / "Williams" (Brett Williams) in the author string
    return authors.replace(/Williams(?:\s?B\.?)?/g, function (match) {
      return '<span class="my-name">' + match + '</span>';
    });
  }

  function el(tag, className, html) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function render() {
    var list = document.getElementById("pub-list");
    if (!list) return;
    list.innerHTML = "";

    var sorted = state.pubs.slice().sort(function (a, b) {
      return (b.year || 0) - (a.year || 0);
    });
    var visible = state.expanded ? sorted : sorted.slice(0, PAGE_SIZE);

    visible.forEach(function (p) {
      var item = el("div", "pub-item");
      var yearRow = el("span", "pub-year", String(p.year || ""));
      item.appendChild(yearRow);
      if (p.source === "orcid-sync") {
        var badge = el("span", "orcid-badge", "ORCID sync");
        item.appendChild(badge);
      }
      item.appendChild(document.createElement("br"));
      var body = el("span", null,
        boldName(p.authors || "") + ' "' + (p.title || "") + '." <em>' + (p.venue || "") + "</em>"
      );
      item.appendChild(body);
      list.appendChild(item);
    });

    var moreBtn = document.getElementById("pub-toggle");
    if (sorted.length <= PAGE_SIZE) {
      moreBtn.style.display = "none";
    } else {
      moreBtn.style.display = "";
      moreBtn.textContent = state.expanded ? "Show fewer" : "Show more (" + sorted.length + " total)";
    }
  }

  function init() {
    var toggle = document.getElementById("pub-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        state.expanded = !state.expanded;
        render();
      });
    }

    fetch("data/publications.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.pubs = data;
        render();
      })
      .catch(function (err) {
        console.error("Failed to load publications:", err);
        var list = document.getElementById("pub-list");
        if (list) {
          list.innerHTML = "<p>Could not load publication list. Please view via a web server (e.g. GitHub Pages), not by opening the file directly.</p>";
        }
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
