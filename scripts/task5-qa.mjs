import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync('qa-task5',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
for(const [width,height] of [[1440,900],[390,844],[375,812]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:8080/',{waitUntil:'networkidle'});
 const faq=page.locator('#faq');
 const items=faq.locator('.faq-item');
 if(await items.count()!==9)throw Error('Exactly nine FAQ entries required');
 const questions=await faq.locator('.faq-q').allTextContents();
 if(!questions[3].includes('Can my whole team use it?'))throw Error('New team question must be fourth');
 const checks=[];
 for(let i=0;i<questions.length;i++){
   await faq.locator('.faq-q').nth(i).click();
   await page.waitForTimeout(370);
   const info=await faq.locator('.faq-a p').nth(i).evaluate(el=>{
     const css=getComputedStyle(el);
     const box=el.getBoundingClientRect();
     return {text:el.innerText,lines:box.height/parseFloat(css.lineHeight),width:box.width};
   });
   checks.push(info);
   if(info.width>720.5)throw Error('FAQ answer exceeds 720px: '+questions[i]+' '+JSON.stringify(info));
   if(info.lines>(width===1440?4.1:7.1))throw Error('FAQ answer too long: '+questions[i]+' '+JSON.stringify(info));
 }
 await faq.locator('.faq-q').nth(3).click();
 await page.waitForTimeout(370);
 const intro=page.locator('#get-started .so-final-assurance');
 const cta=await intro.evaluate(el=>{
   const range=document.createRange();range.selectNodeContents(el);
   return {lineRects:range.getClientRects().length,width:el.getBoundingClientRect().width,scrollWidth:el.scrollWidth};
 });
 if(width===1440 && cta.lineRects!==1)throw Error('CTA assurance must fit in one line: '+JSON.stringify(cta));
 if(cta.scrollWidth>cta.width+2)throw Error('CTA assurance overflows');
 const footer=page.locator('footer');
 const links=await footer.locator('a[href]').evaluateAll(els=>els.map(el=>({text:el.textContent.trim(),href:el.getAttribute('href')})));
 for(const link of links){
  if(link.href.startsWith('mailto:'))continue;
  if(link.href.startsWith('https://')){
    if(new URL(link.href).hostname!=='app.scopesnap.com.au')throw Error('Unexpected external footer link: '+link.href);
    continue;
  }
  if(link.href.startsWith('/#')){
    const id=link.href.slice(2);if(!await page.locator('#'+id).count())throw Error('Missing homepage section '+id);
    continue;
  }
  if(link.href.startsWith('#')){
    if(!await page.locator(link.href).count())throw Error('Broken footer anchor '+link.href);
    continue;
  }
  const route=link.href.split('?')[0];
  const filepath=resolve('.',route==='/'?'index.html':route.slice(1)+(route.includes('.')?'':'.html'));
  if(!existsSync(filepath))throw Error('Footer link file not found: '+link.href+' -> '+filepath);
  const response=await page.request.get('http://127.0.0.1:8080/'+(route==='/'?'index.html':route.slice(1)+(route.includes('.')?'':'.html')));
  if(response.status()!==200)throw Error('Footer link returned '+response.status()+': '+link.href);
 }

 for(const secondary of ['/contact.html','/terms.html']){
   await page.goto('http://127.0.0.1:8080'+secondary,{waitUntil:'domcontentloaded'});
   for(const [title,hash] of [['Features','#features'],['Pricing','#pricing']]){
     const link=page.locator('footer a').filter({hasText:title});
     if(await link.count()!==1)throw Error(secondary+' footer missing '+title);
     await link.click();
     await page.waitForURL('**/'+hash);
     if(new URL(page.url()).hash!==hash)throw Error(secondary+' navigation to '+hash+' failed');
     if(!await page.locator(hash).count())throw Error('Missing landing section '+hash);
     await page.goto('http://127.0.0.1:8080'+secondary,{waitUntil:'domcontentloaded'});
   }
 }
 await page.goto('http://127.0.0.1:8080/',{waitUntil:'domcontentloaded'});

 const pageWidth=await page.evaluate(()=>document.documentElement.scrollWidth);
 if(pageWidth>width+2)throw Error('Horizontal page overflow '+width+' / '+pageWidth);
 if(width!==375){
  await faq.screenshot({path:'qa-task5/faq-'+width+'x'+height+'.png'});
  await page.locator('#get-started').screenshot({path:'qa-task5/cta-'+width+'x'+height+'.png'});
  await footer.screenshot({path:'qa-task5/footer-'+width+'x'+height+'.png'});
 }
 console.log('TASK5_QA '+width+'x'+height+' '+JSON.stringify({faqLines:checks.map(x=>x.lines),cta,footerLinks:links.map(x=>x.href),pageWidth}));
 results.push({width,height,faqLines:checks.map(x=>x.lines),cta,footerLinks:links.map(x=>x.href)});
 await page.close();
}
await browser.close();
writeFileSync('qa-task5/results.json',JSON.stringify(results,null,2));
console.log('TASK5_QA_PASSED');
