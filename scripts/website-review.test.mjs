import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const home=read("index.html");
assert(!home.includes("Across 30+ jobs"), "Remove unsupported job count claims");
assert(!home.includes("45+ hours"), "Remove unsupported time claims");
assert(!home.includes("trade coordination"), "Do not claim unimplemented trade coordination output");
assert(!home.includes("created from the same site capture"), "Do not call the design reports app exports");
assert(home.includes("app-generated"), "Report pages must be identified as app-generated");
assert(!home.includes("Design preview"), "Marketing must no longer show static report design placeholders");
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
assert(read("sitemap.xml").includes("https://scopesnap.com.au/contact</loc>"), "Canonical contact route in sitemap");
assert(!read("sitemap.xml").includes("contact.html"), "No obsolete contact URL in sitemap");
const deletePage = read("delete-account.html");
assert(deletePage.includes('property="og:image"'), "Account deletion share image");
assert(deletePage.includes('property="og:title"'), "Account deletion share title");
const errorPage = read("404.html");
assert(errorPage.includes("Barlow Condensed"), "404 matches heading font");
assert(errorPage.includes("#C49A3C"), "404 matches gold aperture identity");
for(const variant of ["client","internal"]) {
 const buffer = readFileSync(new URL(`../sample-${variant}-report.pdf`, import.meta.url));
 assert(buffer.subarray(0,5).toString() === "%PDF-", "Valid " + variant + " PDF");
 assert(!buffer.includes(Buffer.from("ReportLab")), "PDFs must use the actual ScopeSnap exporter");
}
const source = JSON.parse(read("assets/source-manifest.json"));
assert(source.asset_source_commit === "63cea3dc03468782e0874425192f7280722928d1", "Source capture revision matches delivered assets");
console.log("Website content accuracy and SEO checks passed.");
