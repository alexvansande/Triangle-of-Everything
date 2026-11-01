// An SVG label with superscripts ("10¹⁵ Gt") set as raised, smaller ordinary digits. The font draws
// the Latin-1 ¹ ² ³ bigger and lower than ⁰ ⁴–⁹ from the superscripts block, so "10¹⁵" had a big 1
// next to a small 5 (the author, 2026-11-01).
const SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹⁻", PLAIN = "0123456789−";
export function supText(sel, s) {
  sel.text(null);
  for (const [, a, b] of String(s).matchAll(/([^⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)/g)) {
    if (!a && !b) break;
    if (a) sel.append("tspan").text(a);
    if (b) sel.append("tspan").attr("baseline-shift", "super").attr("font-size", "68%")
      .text([...b].map(c => PLAIN[SUPS.indexOf(c)]).join(""));
  }
  return sel;
}
