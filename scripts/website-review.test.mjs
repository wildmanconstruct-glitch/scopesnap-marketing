import {readFileSync,existsSync} from "node:fs";
import assert from "node:assert/strict";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),css=read("brand-sync.css"),guide=read("how-it-works.html");
for(const part of ['class="so-hero"','class="so-hero-grid"','class="so-photo-dimensions"','class="so-plan-tag"','class="so-specbar"','class="so-steps"','class="so-voice-grid"','class="so-report-layout"','class="so-final"']) assert(home.includes(part),"Missing Site Set-Out component: "+part);
assert(home.includes('class="site-setout"'),"Homepage design variant");
assert(css.includes("--ink:#0E0E0D")&&css.includes("--bone:#ECE8E0")&&css.includes("--cu:#C8843F"),"Site Set-Out design tokens");
assert(css.includes("Archivo:wdth,wght")&&css.includes("JetBrains+Mono"),"Spec sheet fonts");
assert(css.includes("scroll-snap-type:x mandatory"),"Swipe workflow on mobile");
assert(css.includes("prefers-reduced-motion"),"Reduced-motion support");
assert(!home.includes('class="trust-bar"'),"Remove old trust icons");
assert(!home.includes('class="ps-product-grid"'),"Remove AI-template product cards");
assert(!home.includes('class="hero-report-peek"'),"Never display full PDF in hero");
assert(!home.includes('font-style:italic'),"No italic hero accent");
assert(home.includes("Plans optional."),"Plans not required");
for(const text of ["renovations","extensions","new builds","repairs and maintenance"])assert(home.toLowerCase().includes(text),"Supported job type "+text);
for(const path of ["/images/demo/kitchen.jpg","/images/demo/exterior.jpg","/images/screen-hero.jpg","/images/screen-planscan.jpg","/images/screen-photo.jpg","/images/screen-voice.jpg","/images/screen-measure.jpg","/images/report-client-photos.jpg","/images/report-internal-detail.jpg"])assert((home+css).includes(path),"Missing asset URL "+path);
assert(home.includes('id="so-report-preview"')&&home.includes('class="so-report-option"'),"Functional report preview");
assert(home.includes("setBilling('monthly')")&&home.includes("setBilling('annual')"),"Monthly/annual prices");
for(const id of ["solo-price","pro-price","biz-price","roiSlider","roiPlan","faq"])assert(home.includes('id="'+id+'"'),"Missing interactive control "+id);
for(const phrase of ["$59","$119","$249","$1,309","$2,739","50 GB company storage","200 GB company storage","10 voice recordings per job","15 voice recordings per job","20 voice recordings per job","100 GB for $10"])assert(home.includes(phrase),"Preserve pricing fact "+phrase);
for(const question of ["Is the AI always right?","Does ScopeSnap price or quote the job?","Can I use my building company logo?"])assert(home.includes(question),"FAQ "+question);
for(const p of ["contact","privacy","terms","billing"]) {
 const page=read(p+".html");
 assert(page.includes('rel="canonical" href="https://scopesnap.com.au/'+p+'"'),"Canonical "+p);
 assert(page.includes('og:image" content="https://scopesnap.com.au/og.png?v=20261011rev1"'),"Social image "+p);
 assert(page.includes("brand-sync.css?v=20261011rev1"),"Site Set-Out stylesheet on "+p);
}
for(const p of ["how-it-works","delete-account","404"])assert(read(p+".html").includes("brand-sync.css?v=20261011rev1"),"Unified styling on "+p);
assert(guide.includes("No drawings required."),"Plan scan stays optional");
for(const type of ["New builds","Extensions","Renovations","Repairs &amp; maintenance"])assert(guide.includes(type),"Guide coverage: "+type);
assert(read("sitemap.xml").includes("https://scopesnap.com.au/contact</loc>"),"Canonical contact route");
assert(existsSync(new URL("../favicon.ico",import.meta.url)),"Favicon");
for(const name of ["client","internal"])assert(!existsSync(new URL("../sample-"+name+"-report.pdf",import.meta.url)),"Full example PDF must never be publicly deployed: "+name);
assert(!home.includes('data-pdf=')&&!home.includes('id="so-pdf-link"')&&!home.includes('id="so-report-preview-link"'),"Marketing may only display in-page report previews");
assert(!/sample-(?:client|internal)-report\.pdf/i.test(home+guide),"No publicly linked full report PDFs");
assert(home.includes('so-report-preview-frame')&&home.includes('so-report-view-only'),"Reports remain visible as non-clickable previews");
assert(home.includes('so-workflow-swipe'),"Mobile workflow explains swipe navigation");
assert(css.includes('.so-step{')&&css.includes('flex:0 0 calc(100% - 23px)'),"Mobile workflow displays one readable step at a time");
assert(css.includes('.so-report-side{')&&css.includes('grid-template-columns:minmax(0,1fr) minmax(0,1fr)'),"Compact mobile report selector");
assert(css.includes('width:185px;right:17px;bottom:-35px'),"Larger mobile hero phone with natural crop");
assert(!home.includes('Open full client PDF')&&!home.includes('Open full internal PDF'),"No report download CTA");
assert(!existsSync(new URL("../assets/pdf-chunks",import.meta.url)),"Reconstructible full PDF chunks cannot be public");
const vercel=JSON.parse(read("vercel.json"));
assert(!vercel.redirects.some(r=>/sample.*report/.test(r.source)),"No download aliases");
assert(!home.includes("Across 30+ jobs")&&!home.includes("45+ hours"),"No unsupported results");


assert(home.includes('class="so-phone so-hero-phone so-voice-capture-phone"'),"Hero phone shows voice recording screen");
assert(home.includes('src="/images/screen-hero.jpg?v=20261011roomvoice1"'),"Hero uses genuine full Kitchen room app capture");
assert(home.includes('2:37 remaining')&&home.includes('class="so-live-waveform"'),"Hero recording has a visible timer and live waveform");
assert(home.includes('id="so-voice-clock"')&&home.includes('setInterval(update,1000)'),"Hero timer ticks instead of covering a second time");
assert(css.includes('left:71.2821%;top:49.5853%')&&css.includes('left:7.4359%;top:49.1114%'),"Hero voice overlays match actual browser screenshot bounds");
assert(css.includes('width:248px;right:4.5%;bottom:-28px')&&css.includes('width:200px;right:3%;bottom:-20px')&&css.includes('width:160px;right:15px;bottom:-18px'),"Slightly larger phone intentionally cropped by the hero at desktop and mobile");
assert(css.includes('.so-live-countdown')&&css.includes('@keyframes so-live-audio'),"Live hero overlays styled and animated");
assert(home.includes('/images/screen-measure.jpg?v=20261011rev1'),"Workflow measure uses the camera overlay screenshot");
assert(home.includes('brand-sync.css?v=20261011mobile-preview2'),"Voice hero styles cache version");

assert(home.includes('Built by builders, for builders.'),"Keep generic builder-led credibility");
assert(!home.includes('Wildheart Homes'),"Do not name the building company on marketing homepage");
assert(home.includes('viewBox="0 0 1448 1086"'),"Measurement overlay must use the photo coordinates");
assert((home.match(/class="so-ar-line"/g)||[]).length===2,"Exactly two AR measurement lines");
assert((home.match(/class="so-ar-point"/g)||[]).length===4,"Two circular endpoints per AR line");
assert(!home.includes('so-window-witness')&&!home.includes('so-window-tick'),"No drafting-style witness lines or ticks");
assert(home.includes('x1="615" y1="226" x2="1034" y2="202"'),"Top line follows actual window angle");
assert(home.includes('x1="1034" y1="202" x2="1028" y2="496"'),"Height line follows actual side angle");
assert(css.includes('stroke:#f2d68f')&&css.includes('.so-ar-point{fill:#f2d68f;stroke:#fff'),"Use exactly the gold used by TapeMeasure");
assert(home.includes('brand-sync.css?v=20261011mobile-preview2'),"Hero styling has refreshed cache version");
assert(css.includes('.so-photo-dimensions')&&css.includes('inset:0 0 0 30%'),"Window dimension overlay matches photo inset");
assert(home.includes('id="so-report-caption"'),"Show a correct caption for report content");
assert(!home.includes('class="so-report-call'),"No inaccurate report callouts");
assert(home.includes('/images/report-client-photos.jpg?v=20261011rev1'),"Use fuller genuine report page");
assert(home.includes('id="savings"')&&home.indexOf('id="savings"')>home.indexOf('id="faq"'),"Put optional calculator below FAQ");
assert(home.includes('<details class="so-savings-disclosure">'),"Calculator should default closed");
assert(css.includes('@media(min-width:960px)')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),"Big phones in two desktop rows");
assert(css.includes('.so-savings .roi-money-num{color:var(--ink)')||css.includes('.so-savings .roi-money-num{color:var(--ink);'),"Estimator numbers no green");
for(const path of ["index.html","how-it-works.html","contact.html","billing.html","privacy.html","terms.html","delete-account.html","404.html"]){
 const page=read(path);
 for(const m of page.matchAll(/\/(?:images\/[\w./-]+|sample-[\w-]+\.pdf)[^"'\s<>]*/g)){
  const expected=m[0].startsWith('/images/screen-hero.jpg') ? '?v=20261011roomvoice1' : '?v=20261011rev1';
  assert(m[0].includes(expected),"Old image/PDF URL in "+path+": "+m[0]);
 }
}

console.log("ScopeSnap Site Set-Out refinements, asset versions, pricing, accessible layout and SEO checks passed.");
