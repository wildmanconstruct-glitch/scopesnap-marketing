import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";

const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
const script=html.match(/\/\/ Pricing calculator:[^\n]*\n([\s\S]*?)\/\/ Voice section tab toggle/);
assert(script,"Published pricing calculator script missing");
function create(){
 const controls=new Map();
 const node=id=>{
  if(!controls.has(id))controls.set(id,{
   value:{roiSlider:"8",roiHours:"1.5",roiRate:"75"}[id]||"",textContent:"",attrs:{},handlers:{},
   addEventListener(type,callback){this.handlers[type]=callback},
   setAttribute(name,value){this.attrs[name]=value}
  });
  return controls.get(id);
 };
 const buttons=["Starter","Professional","Business"].map(plan=>({dataset:{roiPlan:plan},attrs:{},handlers:{},
  addEventListener(type,fn){this.handlers[type]=fn},setAttribute(name,val){this.attrs[name]=val}}));
 vm.runInNewContext(script[1],{document:{getElementById:node,querySelectorAll:()=>buttons}});
 return{node,buttons,slide(id,value){const el=node(id);el.value=String(value);el.handlers.input()},choose(name){buttons.find(x=>x.dataset.roiPlan===name).handlers.click()}};
}
test("default is 8 visits x 1.5h x $75, compared with Professional",()=>{
 const c=create();
 assert.equal(c.node("roiHrs").textContent,"12 hrs");
 assert.equal(c.node("roiMoney").textContent,"$900/month");
 assert.equal(c.node("roiPlan").textContent,"$119/month");
 assert.equal(c.node("roiBreakeven").textContent,"About 7.6× the plan cost.");
});
test("every slider recalculates, including decimal hours and accessible text",()=>{
 const c=create();c.slide("roiSlider",10);
 assert.equal(c.node("roiHrs").textContent,"15 hrs");
 c.slide("roiHours",2.5);assert.equal(c.node("roiHrs").textContent,"25 hrs");
 c.slide("roiRate",100);assert.equal(c.node("roiMoney").textContent,"$2,500/month");
 assert.equal(c.node("roiSlider").attrs["aria-valuetext"],"10 site visits per month");
 assert.equal(c.node("roiHours").attrs["aria-valuetext"],"2.5 hours saved per scope");
 assert.equal(c.node("roiRate").attrs["aria-valuetext"],"$100 per hour");
});
test("three comparison buttons update price and value ratio",()=>{
 const c=create();c.choose("Starter");assert.equal(c.node("roiPlan").textContent,"$59/month");
 assert.equal(c.node("roiBreakeven").textContent,"About 15.3× the plan cost.");
 c.choose("Business");assert.equal(c.node("roiPlan").textContent,"$249/month");
 assert.equal(c.buttons.filter(x=>x.attrs["aria-pressed"]==="true").length,1);
});
