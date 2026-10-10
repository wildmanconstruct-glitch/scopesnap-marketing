import { readFileSync, existsSync } from "node:fs";
import assert from "node:assert/strict";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const home=read("index.html");
assert(!home.includes("Across 30+ jobs"), "Remove unsupported job count claims");
assert(!home.includes("45+ hours"), "Remove unsupported time claims");
assert(!home.includes("trade coordination"), "Do not claim unimplemented trade coordination output");
assert(!home.includes("created from the same site capture"), "Do not call the design reports app exports");
assert(home.includes("actual report exporter"), "Report previews must come from the app exporter");
assert(!home.includes("Design preview"), "Marketing must no longer show static report design placeholders");
assert(!home.includes('class="workflow-compact"'), "No orphan homepage process strip");
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
assert(source.asset_source_commit === "9c3486ab2ccac41011d8b744e152c03e0ee2e56d", "Source capture revision matches delivered assets");
assert(home.includes("screen-room.jpg?v=demo20261010mitchell"), "Homepage room capture busts previous browser caches");
assert(read("how-it-works.html").includes("screen-voice.jpg?v=demo20261010mitchell"), "Walkthrough screenshots bust previous browser caches");
assert(read("vercel.json").includes("must-revalidate"), "Mutable image assets must revalidate");
console.log("Website content accuracy and SEO checks passed.");

const tour = home.slice(home.indexOf('class="ps-product-grid"'),home.indexOf('<!-- ── VOICE TO SCOPE DEMO ── -->'));
assert(tour.includes("01 / ROOM PHOTOS + AI"), "Photo capture must lead the feature tour");
assert(tour.indexOf("01 / ROOM PHOTOS + AI") < tour.indexOf("02 / AI VOICE CAPTURE"), "Voice follows photos");
assert(tour.indexOf("03 / ON-SITE MEASUREMENTS") < tour.indexOf("OPTIONAL / PLAN SCAN"), "Plans must remain secondary");
assert(home.includes("No plans needed to get started"), "Make it clear plans are not required");

const walkthrough = read("how-it-works.html");
assert(walkthrough.indexOf("01 / Create the job") < walkthrough.indexOf("OPTIONAL / PLAN SCAN"), "Plan Scan is not a first step");
assert(!walkthrough.includes("Start with the plans."), "No plans-first language");
assert(walkthrough.includes('id="optional-plans"'), "Plan Scan remains a useful optional tool");
assert(walkthrough.includes("No drawings required."), "Builders can start without plans");

const approvedTypes = ["New builds", "Extensions", "Renovations", "Repairs &amp; maintenance"];
for (const type of approvedTypes) {
  assert(home.includes(type), "Homepage must mention supported building work: " + type);
  assert(walkthrough.includes(type), "Walkthrough must cover supported building work: " + type);
}
assert(!home.includes("inspect renovation sites"), "Marketing must not imply a renovation-only app");
assert(!home.includes("Move through a renovation one room at a time"), "Overview must describe all project types");
assert(home.includes("same report workflow supports new builds"), "Illustrated renovation reports must not limit the product");

assert(home.includes("screen-room.jpg?v=demo20261010mitchell"), "Lead with real room capture");
assert(home.includes("screen-review.jpg?v=demo20261010mitchell"), "Voice demo must show written draft");
assert(!home.includes('class="ps-overview"'), "Do not repeat overview");
assert(!home.includes('class="workflow-compact"'), "No orphan workflow");

assert(home.includes('data-report-tab="client"') && home.includes('data-report-tab="internal"'), "Both report tabs must be present");
assert(home.includes('data-report-large="client"') && home.includes('data-report-large="internal"'), "Show readable report pages");
assert(!home.includes('class="ps-report-grid"'), "Remove tiny 3-column PDF thumbnails");

const how=read("how-it-works.html");
assert(how.includes('screen-room.jpg?v=demo20261010mitchell'), "Show actual room capture on walkthrough");
assert(how.includes('screen-review.jpg?v=demo20261010mitchell'), "Walkthrough must show AI draft rather than report selection");

assert(home.includes("Is the AI always right?"), "AI draft FAQ");
assert(home.includes("Does ScopeSnap price or quote the job?"), "Price/quote distinction");
assert(home.includes("Can I use my building company logo?"), "Company branding answer");

assert(home.includes("per month could cover"), "ROI assumptions follow user inputs without fixed sales claims");
