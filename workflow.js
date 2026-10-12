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
  // Keep the last decoded screen visible when a new image is still loading.
  function showScreen(number){
    const image=screens.find(el=>el.dataset.step===number);
    if(!image)return;
    if(!image.getAttribute('src') && image.dataset.wfSrc){
      image.src=image.dataset.wfSrc;
      image.removeAttribute('data-wf-src');
    }
    const reveal=()=>{
      if(active!==number)return;
      screens.forEach(el=>el.classList.toggle('is-active',el===image));
    };
    if(image.complete&&image.naturalWidth>0)reveal();
    else image.addEventListener('load',reveal,{once:true});
  }
  function selectStep(number){
    if(number===active && root.dataset.wfReady==='true')return;
    active=number;
    root.dataset.wfReady='true';
    root.dataset.activeStep=number;
    steps.forEach(el=>el.classList.toggle('is-active',el.dataset.step===number));
    showScreen(number);
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
    },{rootMargin:window.matchMedia('(min-width:1160px)').matches
      ? '550px 0px 550px 0px' : '120px 0px 120px 0px',threshold:0});
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