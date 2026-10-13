import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const script=html.slice(html.indexOf('// Pricing calculator:'),html.indexOf('// Voice section tab toggle'));
test('automatic calculator inputs and all required plan cutoffs',()=>{
  for(const text of ['max="60"','id="roiLogins"','max="20"','roiHours','roiRate','roiBreakeven'])assert.ok(html.includes(text),text);
  for(const text of ["v<=8?'Starter'","v<=15?'Professional'","v<=130?'Business'","Math.ceil((v-30)/10)","users>8","prices[plan]+packs*59"])assert.ok(script.includes(text),text);
  assert.ok(!html.includes('data-roi-plan='));
});
test('all plans and allowances remain in comparison',()=>{
  for(const text of ['EXTRA USERS $29/MO','EXTRA USERS $25/MO','8 jobs a month','15 jobs a month','30 jobs a month','100 GB for $10/month','/contact'])assert.ok(html.includes(text),text);
});
