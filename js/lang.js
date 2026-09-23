/* DisplayORZ — language detection & memory
 * - First visit to the default (English) pages: redirect to the best
 *   match for the visitor's browser languages.
 * - A language picked via the top-right selector is stored and
 *   respected on later visits (choosing English stops
 *   auto-redirects). */
(function () {
  "use strict";

  var KEY = "displayorz-lang";
  var LANGS = ["en", "zh-Hans", "zh-Hant", "ja", "es", "pt-BR", "pt-PT", "ko", "fr"];

  function currentLang() {
    var parts = location.pathname.split("/").filter(Boolean);
    var last = parts[parts.length - 1] || "";
    if (/\.[a-z]+$/i.test(last)) parts.pop();
    var tail = parts[parts.length - 1];
    return LANGS.indexOf(tail) !== -1 ? tail : "en";
  }

  function storedLang() {
    try {
      var v = localStorage.getItem(KEY);
      return LANGS.indexOf(v) !== -1 ? v : null;
    } catch (e) { return null; }
  }

  function matchBrowser() {
    var list = navigator.languages || [navigator.language || navigator.userLanguage || ""];
    for (var i = 0; i < list.length; i++) {
      var tag = String(list[i] || "").toLowerCase().replace("_", "-");
      if (!tag) continue;
      if (tag === "zh" || tag.indexOf("zh-") === 0) {
        var region = tag.split("-")[1] || "";
        if (["tw", "hk", "mo", "hant"].indexOf(region) !== -1) return "zh-Hant";
        return "zh-Hans"; /* zh, zh-cn, zh-sg and undetermined variants */
      }
      for (var j = 0; j < LANGS.length; j++) {
        if (tag === LANGS[j].toLowerCase()) return LANGS[j];
      }
      var base = tag.split("-")[0];
      if (base === "pt") return "pt-BR";
      if (base === "es") return "es";
      if (base === "fr") return "fr";
      if (base === "ja") return "ja";
      if (base === "ko") return "ko";
      if (base === "en") return null;
    }
    return null;
  }

  /* Follow the top-right selector and remember the choice. */
  var select = document.querySelector(".lang-select");
  if (select) {
    select.addEventListener("change", function () {
      var opt = select.options[select.selectedIndex];
      try { localStorage.setItem(KEY, opt.getAttribute("data-lang") || ""); } catch (err) {}
      if (select.value) location.href = select.value;
    });
  }

  /* Only auto-redirect viewers of the default (English) pages. */
  if (currentLang() !== "en") return;
  var stored = storedLang();
  var target = stored !== null ? stored : matchBrowser();
  if (!target || target === "en") return;
  var file = (location.pathname.split("/").pop() || "").toLowerCase();
  var page = file === "privacy.html" || file === "terms.html" ? file : "index.html";
  location.replace(target + "/" + page);
})();
