if(document.body.dataset.playerCabinet==='page'){
 let host;
 for(let i=0;i<300;i++){
  host=document.getElementById('painting-cabinet');
  if(host?.shadowRoot&&document.querySelector('.cabinet-intro'))break;
  await new Promise(r=>setTimeout(r,100));
 }
 if(host?.shadowRoot){
  const s=host.shadowRoot;
  const pageStyle=document.createElement('style');
  pageStyle.textContent='html{min-height:100%;background:#131611!important}body{min-height:100vh;min-height:100dvh;background:#131611!important}';document.head.append(pageStyle);
  const style=document.createElement('style');
  style.textContent='#list,.notes-grid{align-items:stretch}#list article,.notes-grid article{display:flex;flex-direction:column;gap:12px;min-width:0;min-height:220px;height:100%}#list article>a:first-child{display:block;font-size:19px;line-height:1.35;font-weight:500;overflow-wrap:anywhere}#list article p,.notes-grid article p,.notes-grid article h3{margin:0}.cabinet-actions{display:grid!important;grid-template-columns:minmax(0,1fr);gap:8px!important;margin: auto 0 0!important;padding-top:16px;width:100%}.cabinet-actions>button,.cabinet-actions>a{display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;min-width:0;min-height:46px;margin:0!important;padding:10px 14px!important;line-height:1.4;text-align:center;white-space:normal;overflow-wrap:anywhere}.cabinet-actions>a{border:1px solid #58664b;border-radius:9px;text-decoration:none}.cabinet-actions>a:hover{background:#252d1f;border-color:#d2df98}';s.append(style);
  function arrange(){
   for(const card of s.querySelectorAll('#list article,.notes-grid article')){
    let actions=card.querySelector(':scope>.cabinet-actions');
    const existing=card.querySelector(':scope>.row');
    if(!actions){actions=existing||document.createElement('div');actions.classList.add('cabinet-actions');if(!existing)card.append(actions);}
    for(const child of [...card.children]){
     if(child.matches('button')||(card.closest('.notes-grid')&&child.matches('a[href]')))actions.append(child);
    }
   }
  }
  let scheduled=false;
  new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;arrange();});}}).observe(s,{childList:true,subtree:true});
  arrange();
 }
}
