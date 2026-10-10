import {readFileSync,existsSync} from "node:fs";
import assert from "node:assert/strict";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const home=read("index.html"),css=read("brand-sync.css"),guide=read("how-it-works.html");
for(const part of ['class="so-hero"','class="so-hero-grid"','class="so-dim so-dim-h"','class="so-plan-tag"','class="so-specbar"','class="so-steps"','class="so-voice-grid"','class="so-report-layout"','class="so-final"']) assert(home.includes(part),"Missing Site Set-Out component: "+part);
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
for(const path of ["/images/demo/kitchen.jpg","/images/demo/exterior.jpg","/images/screen-room.jpg","/images/screen-planscan.jpg","/images/screen-photo.jpg","/images/screen-voice.jpg","/images/screen-measure.jpg","/images/report-client-detail.jpg","/images/report-internal-detail.jpg","/sample-client-report.pdf","/sample-internal-report.pdf"])assert((home+css).includes(path),"Missing asset URL "+path);
assert(home.includes('id="so-report-preview"')&&home.includes('class="so-report-option"'),"Functional report preview");
assert(home.includes("setBilling('monthly')")&&home.includes("setBilling('annual')"),"Monthly/annual prices");
for(const id of ["solo-price","pro-price","biz-price","roiSlider","roiPlan","faq"])assert(home.includes('id="'+id+'"'),"Missing interactive control "+id);
for(const phrase of ["$59","$119","$249","$1,309","$2,739","50 GB company storage","200 GB company storage","10 voice recordings per job","15 voice recordings per job","20 voice recordings per job","100 GB for $10"])assert(home.includes(phrase),"Preserve pricing fact "+phrase);
for(const question of ["Is the AI always right?","Does ScopeSnap price or quote the job?","Can I use my building company logo?"])assert(home.includes(question),"FAQ "+question);
for(const p of ["contact","privacy","terms","billing"]) {
 const page=read(p+".html");
 assert(page.includes('rel="canonical" href="https://scopesnap.com.au/'+p+'"'),"Canonical "+p);
 assert(page.includes('og:image" content="https://scopesnap.com.au/og.png"'),"Social image "+p);
 assert(page.includes("brand-sync.css?v=20261010setout1"),"Site Set-Out stylesheet on "+p);
}
for(const p of ["how-it-works","delete-account","404"])assert(read(p+".html").includes("brand-sync.css?v=20261010setout1"),"Unified styling on "+p);
assert(guide.includes("No drawings required."),"Plan scan stays optional");
for(const type of ["New builds","Extensions","Renovations","Repairs &amp; maintenance"])assert(guide.includes(type),"Guide coverage: "+type);
assert(read("sitemap.xml").includes("https://scopesnap.com.au/contact</loc>"),"Canonical contact route");
assert(existsSync(new URL("../favicon.ico",import.meta.url)),"Favicon");
for(const name of ["client","internal"]){const pdf=readFileSync(new URL("../sample-"+name+"-report.pdf",import.meta.url));assert(pdf.subarray(0,5).toString()==="%PDF-","PDF "+name);assert(!pdf.includes(Buffer.from("ReportLab")),"Actual app exporter PDF "+name)}
assert(!home.includes("Across 30+ jobs")&&!home.includes("45+ hours"),"No unsupported results");
console.log("ScopeSnap Site Set-Out content, pricing, accessibility structure and SEO checks passed.");
