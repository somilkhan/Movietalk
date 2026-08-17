import { useEffect, useRef } from 'react';

export default function PlayerStabilityBridge(){
  const wantsPlay=useRef(false);
  const suppressPauseClear=useRef(false);
  const retryTimer=useRef<ReturnType<typeof setInterval>|null>(null);
  const lastVideo=useRef<HTMLVideoElement|null>(null);

  useEffect(()=>{
    let disposed=false; let cleanup:(()=>void)|null=null;
    const stopRetry=()=>{if(retryTimer.current)clearInterval(retryTimer.current);retryTimer.current=null;};
    const startRetry=(video:HTMLVideoElement)=>{
      stopRetry();
      let attempts=0;
      const tryPlay=()=>{
        if(disposed||!wantsPlay.current||video.ended){stopRetry();return;}
        if(!video.paused&&!video.seeking){stopRetry();return;}
        attempts+=1;
        const promise=video.play();
        if(promise&&typeof promise.then==='function') promise.then(()=>stopRetry()).catch(()=>{if(attempts>=20)stopRetry();});
      };
      tryPlay();
      retryTimer.current=setInterval(tryPlay,350);
    };
    const attach=()=>{
      const video=document.querySelector('video');
      if(!(video instanceof HTMLVideoElement)||video===lastVideo.current)return;
      cleanup?.(); lastVideo.current=video;
      const onPlay=()=>{wantsPlay.current=true;stopRetry();};
      const onPause=()=>{if(!suppressPauseClear.current)wantsPlay.current=false;};
      const onPointerDown=()=>{if(!video.paused)wantsPlay.current=true;};
      const onSeeking=()=>{if(!video.paused)wantsPlay.current=true;};
      const onSeeked=()=>{if(wantsPlay.current)startRetry(video);};
      const onWaiting=()=>{if(wantsPlay.current)startRetry(video);};
      const onStalled=()=>{if(wantsPlay.current)startRetry(video);};
      const onLoadStart=()=>{if(wantsPlay.current){suppressPauseClear.current=true;window.setTimeout(()=>{suppressPauseClear.current=false;},1800);}};
      const onReady=()=>{if(wantsPlay.current)startRetry(video);};
      const onEnded=()=>{wantsPlay.current=false;stopRetry();};
      const onClick=(event:MouseEvent)=>{
        const target=event.target instanceof Element?event.target:null;
        const control=target?.closest('[data-player-control]');
        const label=control?.getAttribute('aria-label')||'';
        if(/^Play$/i.test(label)){wantsPlay.current=true;startRetry(video);}
        else if(/^Pause$/i.test(label)){wantsPlay.current=false;stopRetry();}
      };
      video.addEventListener('play',onPlay);video.addEventListener('pause',onPause);video.addEventListener('pointerdown',onPointerDown);video.addEventListener('seeking',onSeeking);video.addEventListener('seeked',onSeeked);video.addEventListener('waiting',onWaiting);video.addEventListener('stalled',onStalled);video.addEventListener('loadstart',onLoadStart);video.addEventListener('canplay',onReady);video.addEventListener('canplaythrough',onReady);video.addEventListener('loadeddata',onReady);video.addEventListener('playing',onReady);document.addEventListener('pointerdown',onPointerDown,true);document.addEventListener('click',onClick,true);
      cleanup=()=>{video.removeEventListener('play',onPlay);video.removeEventListener('pause',onPause);video.removeEventListener('pointerdown',onPointerDown);video.removeEventListener('seeking',onSeeking);video.removeEventListener('seeked',onSeeked);video.removeEventListener('waiting',onWaiting);video.removeEventListener('stalled',onStalled);video.removeEventListener('loadstart',onLoadStart);video.removeEventListener('canplay',onReady);video.removeEventListener('canplaythrough',onReady);video.removeEventListener('loadeddata',onReady);video.removeEventListener('playing',onReady);document.removeEventListener('pointerdown',onPointerDown,true);document.removeEventListener('click',onClick,true);stopRetry();};
    };
    const observer=new MutationObserver(attach);observer.observe(document.body,{childList:true,subtree:true});const timer=window.setInterval(attach,250);attach();
    return()=>{disposed=true;observer.disconnect();window.clearInterval(timer);stopRetry();cleanup?.();cleanup=null;lastVideo.current=null;};
  },[]);
  return null;
}
