// Batch-add dark: variants to hardcoded light badges (skip lines already containing dark:).
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "src");
const COLORS = ["amber", "blue", "emerald", "red", "purple", "cyan", "indigo", "orange", "slate", "violet", "rose", "teal", "sky", "lime", "yellow"];

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith(".tsx")) out.push(p);
  }
  return out;
}

let total = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("dark:")) continue; // already handled
    const orig = line;
    for (const c of COLORS) {
      // bg-{c}-50 text-{c}-6/700 [ring-{c}-200]  →  add dark trio
      const re1 = new RegExp("(bg-" + c + "-50 text-" + c + "-(?:600|700))((?: ring-" + c + "-200)?)", "g");
      lines[i] = lines[i].replace(re1, (m, p1, p2) => p1 + p2 + " dark:bg-" + c + "-950/50 dark:text-" + c + "-300" + (p2 ? " dark:ring-" + c + "-900" : ""));
      // bg-{c}-100 text-{c}-700/800 ring-{c}-200
      const re2 = new RegExp("(bg-" + c + "-100 text-" + c + "-(?:700|800))((?: ring-" + c + "-200)?)", "g");
      lines[i] = lines[i].replace(re2, (m, p1, p2) => p1 + p2 + " dark:bg-" + c + "-950/60 dark:text-" + c + "-300" + (p2 ? " dark:ring-" + c + "-900" : ""));
      // ring-{c}-200 bg-{c}-100/50 pattern (ring first)
      const re3 = new RegExp("(ring-" + c + "-200 bg-" + c + "-(?:50|100) text-" + c + "-(?:600|700|800))", "g");
      lines[i] = lines[i].replace(re3, (m, p1) => p1 + " dark:ring-" + c + "-900 dark:bg-" + c + "-950/50 dark:text-" + c + "-300");
      // bg-{c}-100 text-{c}-800 (no ring)
      const re4 = new RegExp("(bg-" + c + "-100 text-" + c + "-800)", "g");
      lines[i] = lines[i].replace(re4, (m, p1) => p1 + " dark:bg-" + c + "-950/60 dark:text-" + c + "-300");
    }
    // standalone text-{c}-600/700 in a badge-like span (no bg but keep simple: only text color)
    if (!lines[i].includes("dark:") && lines[i].includes('text-') && !lines[i].includes("text-muted") && !lines[i].includes("text-primary") && !lines[i].includes("text-foreground")) {
      for (const c of COLORS) {
        const re5 = new RegExp("(text-" + c + "-(?:600|700))", "g");
        lines[i] = lines[i].replace(re5, (m, p1) => p1 + " dark:text-" + c + "-300");
      }
    }
    if (lines[i] !== orig) { changed = true; total++; }
  }
  if (changed) {
    fs.writeFileSync(file, lines.join("\n"));
    console.log("updated:", path.relative(ROOT, file));
  }
}
console.log("total lines changed:", total);
