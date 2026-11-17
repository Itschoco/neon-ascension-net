const panel=document.getElementById('music-panel');
const toggle=document.getElementById('music-toggle');
const play=document.getElementById('music-play');
const status=document.getElementById('music-status');
let controller=null,playing=false,started=false;
function message(text){if(status.textContent!==text)status.textContent=text;}
function show(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));}
function playbackState(active){playing=active;play.textContent=active?'Pause music':'Play music';play.setAttribute('aria-label',active?'Pause background music':'Play background music');toggle.querySelector('span').textContent=active?'Music · playing':'Music';}
toggle.addEventListener('click',()=>show(panel.hidden));
document.getElementById('music-minimise').addEventListener('click',()=>show(false));
play.addEventListener('click',()=>{show(true);if(!controller){message('Spotify is still loading. You can also open the track directly.');return;}try{if(playing)controller.pause();else controller.play();}catch{message('Use Play inside the Spotify player, or open the track directly.');}});
window.onSpotifyIframeApiReady=api=>{
  api.createController(document.getElementById('spotify-mount'),{url:'https://open.spotify.com/track/098z6VSAmmxyts3ogCGPfr?theme=0',width:'100%',height:152},c=>{
    controller=c;
    const iframe=panel.querySelector('iframe');
    if(iframe){iframe.title="Spotify background music: You Can't Run From Me by Rico Nasty";iframe.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');}
    c.addListener('ready',()=>{
      message('Attempting automatic playback…');
      try{c.play();}catch{message('Automatic playback was unavailable. Press Play music.');}
      setTimeout(()=>{if(!started)message('If autoplay is blocked, press Play music. Spotify may offer a preview.');},5000);
    });
    c.addListener('playback_started',()=>{started=true;playbackState(true);message('Playing through Spotify. Music stays on while you browse.');});
    c.addListener('playback_update',event=>{const d=event.data;if(!d)return;playbackState(!d.isPaused);if(!d.isPaused){started=true;message(d.isBuffering?'Spotify is buffering…':'Playing through Spotify. Music stays on while you browse.');}else if(started)message('Paused. Press Play music to resume.');});
  });
};
show(true);
const script=document.createElement('script');
script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;
script.addEventListener('error',()=>message('Spotify could not load. Open the track directly using the link below.'));
document.body.appendChild(script);
