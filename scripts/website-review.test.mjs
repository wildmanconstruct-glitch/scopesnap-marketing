import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const home=read("index.html");
assert(!home.includes("Across 30+ jobs"), "Remove unsupported job count claims");
assert(!home.includes("45+ hours"), "Remove unsupported time claims");
assert(!home.includes("trade coordination"), "Do not claim unimplemented trade coordination output");
assert(!home.includes("created from the same site capture"), "Do not call the design reports app exports");
assert(home.includes("Design preview"), "Report previews need truthful labels");
assert(home.includes("workflow-compact"), "The homepage should link to the walkthrough instead of duplicating it");
assert(!home.includes('class="rf-row'), "Do not restore the redundant long home walkthrough");
assert(home.includes("/sample-client-report.pdf") && home.includes("/sample-internal-report.pdf"), "Keep both report links");
for(const slug of ["contact","privacy","terms","billing"]){
 const page=read(slug+".html");
 assert(page.includes(`rel="canonical" href="https://scopesnap.com.au/${slug}"`), slug+" canonical");
 assert(page.includes(`og:image" content="https://scopesnap.com.au/og.png"`), slug+" social image");
}
assert(existsSync(new URL("../404.html", import.meta.url)), "Custom 404");
assert(existsSync(new URL("../favicon.ico", import.meta.url)), "Browser ICO");
console.log("Website content accuracy and SEO checks passed.");
