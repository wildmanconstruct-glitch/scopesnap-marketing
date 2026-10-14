/* ScopeSnap swipe standard (locked 14 Oct 2026): peek cards, square dots, mono hint.
   Wires any .ss-dots[data-ss-dots="<track id>"] to its horizontal scroll track.
   The pricing cards use the same look but keep their own script (calculator sync). */
(function(){
  document.querySelectorAll('.ss-dots[data-ss-dots]').forEach(function(group){
    var track=document.getElementById(group.dataset.ssDots);
    if(!track)return;
    var cards=[].slice.call(track.children),dots=[].slice.call(group.querySelectorAll('button'));
    if(!cards.length||cards.length!==dots.length)return;
    var current=0,frame=0;
    function setCurrent(i){
      current=i;
      dots.forEach(function(dot,n){dot.setAttribute('aria-current',String(n===i));});
    }
    function nearest(){
      var box=track.getBoundingClientRect(),mid=box.left+box.width/2,best=0,gap=Infinity;
      cards.forEach(function(card,n){
        var r=card.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);
        if(d<gap){gap=d;best=n;}
      });
      return best;
    }
    track.addEventListener('scroll',function(){
      if(frame)return;
      frame=requestAnimationFrame(function(){frame=0;var i=nearest();if(i!==current)setCurrent(i);});
    },{passive:true});
    dots.forEach(function(dot,i){
      dot.addEventListener('click',function(){
        var card=cards[i],box=track.getBoundingClientRect(),r=card.getBoundingClientRect();
        track.scrollTo({left:track.scrollLeft+r.left-box.left-(box.width-r.width)/2,behavior:'smooth'});
        setCurrent(i);
      });
    });
  });
})();
