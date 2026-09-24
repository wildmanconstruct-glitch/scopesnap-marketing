import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html = await readFile(new URL('../billing.html', import.meta.url), 'utf8');
const source = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
async function page() {
 const nodes=new Map(), requests=[];
 const element=id=>{if(!nodes.has(id))nodes.set(id,{style:{},handlers:{},textContent:'',value:'',disabled:false,classList:{add(){},remove(){},toggle(){},contains(){return false;}},addEventListener(k,v){this.handlers[k]=v;}});return nodes.get(id);};
 const window={supabase:{createClient:()=>({auth:{onAuthStateChange(){},getSession:async()=>({data:{session:null}})}})},location:{search:'',pathname:'/billing',assign(url){this.href=url;}}};
 const state={quantity:2,active_seats:2,exists:true,status:'active',period_end:2000000000,legacy_seats:0};
 vm.runInNewContext(source.replace('  // ---- Init ----','  window.testSeats = {setupMonthlySeats, setupSeatsCard};\n  // ---- Init ----'),{window,document:{getElementById:element,querySelectorAll:()=>[]},URL,URLSearchParams,setTimeout,fetch:async(url,opts)=>{
  const body=JSON.parse(opts.body); requests.push({url,body});
  if(body.action==='status')return {ok:true,json:async()=>state};
  state.quantity=body.quantity;state.active_seats=body.quantity;
  return {ok:true,json:async()=>({message:'Monthly seats updated.'})};
 }});
 await new Promise(r=>setImmediate(r));
 return {element,requests,window,state};
}
test('annual customer sees monthly seats at the monthly rate and saves the monthly endpoint',async()=>{
 const {element,requests,window}=await page();
 const company={subscription_plan:'professional',billing_interval:'year',additional_seats:0};
 window.testSeats.setupSeatsCard(company);await window.testSeats.setupMonthlySeats(company);
 assert.equal(element('seatsCard').style.display,'none');assert.equal(element('monthlySeatsCard').style.display,'block');
 assert.match(element('monthlySeatTotal').textContent,/\$58\/month/);
 element('monthlySeatQty').value='3';element('monthlySeatQty').handlers.input();
 const button=element('monthlySeatSaveBtn');await button.handlers.click.call(button);
 const save=requests.find(r=>r.body.action==='save');assert.ok(save.url.endsWith('/api/billing/monthly-seats'));assert.equal(save.body.quantity,3);
 assert.match(element('monthlySeatSuccess').textContent,/updated/);assert.equal(button.disabled,false);
});
test('existing annual seats are labelled with their actual annual rate',async()=>{
 const {element,window}=await page();window.testSeats.setupSeatsCard({subscription_plan:'business',billing_interval:'year',additional_seats:2});
 assert.match(element('seatsDesc').textContent,/\$300\/year/);assert.equal(element('seatsCard').style.display,'block');
});
test('fractional monthly quantities cannot be submitted',async()=>{
 const {element,window}=await page();await window.testSeats.setupMonthlySeats({subscription_plan:'professional'});
 element('monthlySeatQty').value='1.5';element('monthlySeatQty').handlers.input();assert.equal(element('monthlySeatSaveBtn').disabled,true);
});
