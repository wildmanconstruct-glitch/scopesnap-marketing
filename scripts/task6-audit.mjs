import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
mkdirSync('qa-task6',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const cases=[[375,812],[390,844],[1440,900]];
const summary=[];
for(const [w,h] of cases){
 const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
 await page.waitForTimeout(500);
 const data=await page.evaluate(()=>{
  const selectors='p,li,span,a,button,small';
  const visible=[...document.querySelectorAll(selectors)].filter(e=>e.offsetParent&&e.textContent.trim());
  const bad=visible.map(e=>({e,size:parseFloat(getComputedStyle(e).fontSize)})).filter(o=>o.size<11);
  const desc=e=>({tag:e.tagName,cls:e.className?.baseVal??e.className,text:e.textContent.trim().slice(0,75),size:parseFloat(getComputedStyle(e).fontSize),color:getComputedStyle(e).color,parents:[e.parentElement?.className,e.parentElement?.parentElement?.className].map(String)});
  const backgrounds=[...document.querySelectorAll('section,footer,header,.so-final')].map(e=>({id:e.id,className:e.className,color:getComputedStyle(e).backgroundColor}));
  return {count:bad.length,bad:bad.map(o=>desc(o.e)).slice(0,250),backgrounds,overflow:document.documentElement.scrollWidth-innerWidth};
 });
 console.log('TASK6_AUDIT '+w+' '+JSON.stringify(data));
 const sections=[['why','#why'],['voice','#voice-demo'],['reports','#reports'],['pricing','#pricing'],['enterprise','#enterprise'],['faq','#faq'],['cta','#get-started'],['footer','footer']];
 if(w!==375){
  for(const [name,selector] of sections){
   if(name==='pricing')await page.locator('#plan-comparison').evaluate(el=>el.open=true);
   if(name==='faq')await page.locator('#faq .faq-q').nth(3).click();
   await page.locator(selector).screenshot({path:'qa-task6/'+name+'-'+w+'x'+h+'.png'});
  }
 }
 summary.push({width:w,height:h,...data});
 await page.close();
}
writeFileSync('qa-task6/audit.json',JSON.stringify(summary,null,2));
await browser.close();
if(summary[0].count!==0)throw Error('Visible mobile text below 11px: '+summary[0].count);
if(summary.some(x=>x.overflow>2))throw Error('Horizontal overflow');
console.log('TASK6_MOBILE_FONTS_PASSED');
