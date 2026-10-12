import { LOCALE_INFO } from "@/shared/i18n/locales";

import { EFFECTS_STORAGE_KEY, RICH_EFFECTS_DEVICES } from "./effects";
import { DATE_FORMATS, RELATIVE_UNITS } from "./format";
import { SITE } from "./site";
import { THEME_STORAGE_KEY } from "./theme";

const TAGS = Object.fromEntries(Object.entries(LOCALE_INFO).map(([locale, info]) => [locale, info.intl]));

const SOURCE = `
var d = document.documentElement, theme = null, effects = null, cache = {}, relative = null;
try { theme = localStorage.getItem(STORAGE); effects = localStorage.getItem(EFFECTS); } catch (e) {}
if (theme === "light" || theme === "dark") d.dataset.theme = theme;
var rich = new RegExp(RICH).test(navigator.userAgent);
d.dataset.effects = effects === "full" || effects === "reduced" ? effects : rich ? "full" : "reduced";
if (/[?&](?:range|a|b)=/.test(location.search)) d.dataset.pending = "";
var tag = TAGS[d.lang] || "en-GB";
function dateFormat(style) { return cache[style] || (cache[style] = new Intl.DateTimeFormat(tag, FORMATS[style])); }
function since(timestamp) {
  relative = relative || new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  var seconds = Math.round((timestamp - Date.now()) / 1000);
  for (var i = 0; i < UNITS.length; i++) {
    if (Math.abs(seconds) >= UNITS[i][1]) return relative.format(Math.round(seconds / UNITS[i][1]), UNITS[i][0]);
  }
  return relative.format(0, "second");
}
function apply(node) {
  if (node.nodeName === "TIME") {
    var style = node.getAttribute("data-format"), timestamp = Date.parse(node.dateTime);
    if (!style || isNaN(timestamp)) return;
    try { node.textContent = style === "relative" ? since(timestamp) : dateFormat(style).format(timestamp); } catch (e) {}
  } else if (d.dataset.theme) {
    node.content = COLORS[d.dataset.theme];
  }
}
function scan(node) {
  if (node.nodeType !== 1) return;
  var selector = "time[data-format],meta[name=theme-color]";
  if (node.matches(selector)) apply(node);
  var found = node.querySelectorAll(selector);
  for (var i = 0; i < found.length; i++) apply(found[i]);
}
var observer = new MutationObserver(function (records) {
  for (var i = 0; i < records.length; i++) {
    for (var j = 0; j < records[i].addedNodes.length; j++) scan(records[i].addedNodes[j]);
  }
});
observer.observe(d, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", function () { scan(d); observer.disconnect(); });
`;

export const BOOT_SCRIPT = `(function(STORAGE, EFFECTS, RICH, COLORS, FORMATS, UNITS, TAGS){${SOURCE.replaceAll(/\s*\n\s*/g, "")}})(${[
  JSON.stringify(THEME_STORAGE_KEY),
  JSON.stringify(EFFECTS_STORAGE_KEY),
  JSON.stringify(RICH_EFFECTS_DEVICES.source),
  JSON.stringify(SITE.themeColor),
  JSON.stringify(DATE_FORMATS),
  JSON.stringify(RELATIVE_UNITS),
  JSON.stringify(TAGS),
].join(",")})`;
