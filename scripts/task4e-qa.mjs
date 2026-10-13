import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
mkdirSync('qa-task4e',{recursive:true});
const results=[];
async function setVisits(page,value){
  await page.locator('#roiSlider').evaluate((el,n)=>{if(n>Number(el.max))el.max=String(n);el.value=String(n);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
}
async function selectLogins(page,value){await page.locator('[data-roi-logins="'+value+'"]').click();}
async function state(page){
 return page.evaluate(()=>({hours:document.getElementById('roiHrs').textContent,value:document.getElementById('roiMoney').textContent,plan:document.getElementById('roiPlan').textContent,ratio:document.getElementById('roiBreakeven').textContent,extra:document.getElementById('roiExtraUsers').hidden?'':document.getElementById('roiExtraUsers').textContent,recommended:[...document.querySelectorAll('#pricing .price-card')].map((c,i)=>c.classList.contains('so-card-recommended')?i:-1).filter(i=>i>=0)}));
}
function check(ok,message){if(!ok)throw new Error(message)}
for(const [width,height] of [[1440,900],[375,812],[390,844]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
 await page.waitForTimeout(300);
 const metrics=await page.evaluate(()=>{
  const box=selector=>document.querySelector(selector).getBoundingClientRect();
  const pricing=box('#pricing'),cards=[...document.querySelectorAll('#pricing .price-card')].map(c=>c.getBoundingClientRect().height);
  return {pricing:Math.round(pricing.height),header:Math.round(box('#pricing-cards').top-pricing.top),cards:cards.map(Math.round),cardArea:Math.round(box('.so-pricing-card-wrap').height),calculator:Math.round(box('#pricing-calculator').height),enterprise:Math.round(box('#enterprise').height),document:document.documentElement.scrollWidth,viewport:innerWidth};
 });
 console.log('TASK4E_METRICS '+width+'x'+height+' '+JSON.stringify(metrics));results.push({viewport:width+'x'+height,...metrics});
 check(metrics.pricing<=(width===1440?1500:2400),'Pricing exceeds height target '+width+': '+metrics.pricing);
 check(metrics.header<=(width===1440?260:400),'Pricing header is too tall '+width+': '+metrics.header);
 check(Math.max(...metrics.cards)<=(width===1440?520:640),'Pricing card is too tall '+width);
 check(metrics.cardArea<=(width===1440?550:640),'Mobile plan carousel exceeds height target '+width);
 check(metrics.calculator<=(width===1440?340:700),'Calculator too tall '+width+': '+metrics.calculator);
 check(metrics.enterprise<=(width===1440?140:260),'Enterprise too tall '+width+': '+metrics.enterprise);
 check(metrics.document===metrics.viewport,'Horizontal page overflow '+width+': '+JSON.stringify(metrics));
 let q=await state(page);check(q.plan==='Professional · $119/month'&&q.hours==='12 hrs'&&q.value==='$900/month'&&q.ratio.includes('7.6×')&&q.recommended.join()==='1','Calculator defaults '+JSON.stringify(q));
 if(width===390||width===1440){
  await page.locator('#pricing').screenshot({path:'qa-task4e/pricing-default-'+width+'.png'});
  await page.locator('#enterprise').screenshot({path:'qa-task4e/enterprise-'+width+'.png'});
 }
 await selectLogins(page,'1');q=await state(page);check(q.plan==='Starter · $59/month'&&q.ratio.includes('15.3×')&&q.recommended.join()==='0','Starter case '+JSON.stringify(q));
 await setVisits(page,20);q=await state(page);check(q.plan==='Business · $249/month'&&q.recommended.join()==='2','Visits decide '+JSON.stringify(q));
 await setVisits(page,8);await selectLogins(page,'4–8');q=await state(page);check(q.plan==='Business · $249/month'&&q.recommended.join()==='2','Logins decide '+JSON.stringify(q));
 await selectLogins(page,'1');await setVisits(page,45);q=await state(page);check(q.plan.includes('2 packs')&&q.plan.includes('$367/month')&&q.recommended.join()==='2','Extra jobs '+JSON.stringify(q));
 if(width===390||width===1440)await page.locator('#pricing-calculator').screenshot({path:'qa-task4e/calculator-45-'+width+'.png'});
 await selectLogins(page,'9+');q=await state(page);check(q.extra.includes('extra users from $25/mo each'),'Extra user note '+JSON.stringify(q));
 await setVisits(page,140);q=await state(page);check(q.plan.includes('Enterprise')&&q.ratio.includes('Talk to us')&&q.recommended.length===0,'Enterprise case '+JSON.stringify(q));
 if(width===390||width===1440)await page.locator('#pricing-calculator').screenshot({path:'qa-task4e/calculator-140-'+width+'.png'});
 await setVisits(page,8);await selectLogins(page,'2–3');
 if(width===390||width===1440){
   await page.locator('#toggleAnnual').click();await page.locator('#pricing').screenshot({path:'qa-task4e/pricing-annual-'+width+'.png'});
   await page.locator('#toggleMonthly').click();
   await page.locator('#plan-comparison summary').click();await page.locator('#pricing').screenshot({path:'qa-task4e/pricing-compare-'+width+'.png'});
 }
 if(width===375){
   const carousel=await page.evaluate(()=>({left:document.querySelector('#pricing-cards').scrollLeft,scroll:document.documentElement.scrollWidth}));
   check(carousel.left>0,'Mobile carousel should open on Professional');
 }
 await page.close();
}
writeFileSync('qa-task4e/metrics.json',JSON.stringify(results,null,2));
await browser.close();
console.log('TASK4E_QA_PASSED');
