/* Five-stage ScopeSnap workflow. Normal scrolling, no scroll interception. */
(function(){
  const root=document.querySelector('#features.wf');
  if(!root)return;
  const steps=[...root.querySelectorAll('.wf-step')];
  const screens=[...root.querySelectorAll('.wf-screen')];
  const report=root.querySelector('.wf-report');
  const controls=[...root.querySelectorAll('[data-wf-type]')];
  const loadDeferred=()=>{
    root.querySelectorAll('img[data-wf-src]').forEach(img=>{
      img.src=img.dataset.wfSrc;
      img.removeAttribute('data-wf-src');
    });
  };
  let active='1';
  function selectStep(number){
    if(number===active && root.dataset.wfReady==='true')return;
    active=number;
    root.dataset.wfReady='true';
    steps.forEach(el=>el.classList.toggle('is-active',el.dataset.step===number));
    screens.forEach(el=>el.classList.toggle('is-active',el.dataset.step===number));
    const show=number==='5';
    report.classList.toggle('is-active',show);
    report.setAttribute('aria-hidden',String(!show));
    report.querySelectorAll('button').forEach(btn=>btn.tabIndex=show?0:-1);
  }
  controls.forEach(btn=>btn.addEventListener('click',()=>{
    const kind=btn.dataset.wfType;
    root.querySelectorAll('[data-wf-report]').forEach(el=>el.dataset.show=kind);
    controls.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wfType===kind)));
  }));
  selectStep('1');
  if('IntersectionObserver' in window){
    const preload=new IntersectionObserver(entries=>{
      if(entries.some(e=>e.isIntersecting)){loadDeferred();preload.disconnect();}
    },{rootMargin:'800px 0px 800px 0px',threshold:0});
    preload.observe(root);
    const centerObserver=new IntersectionObserver(entries=>{
      const crossing=entries.filter(e=>e.isIntersecting);
      if(!crossing.length)return;
      crossing.sort((a,b)=>{
        const midpoint=window.innerHeight/2;
        const d=e=>Math.abs(e.boundingClientRect.top+e.boundingClientRect.height/2-midpoint);
        return d(a)-d(b);
      });
      selectStep(crossing[0].target.dataset.step);
    },{rootMargin:'-45% 0px -45% 0px',threshold:0});
    steps.forEach(el=>centerObserver.observe(el));
  }else{
    loadDeferred();
  }
})();