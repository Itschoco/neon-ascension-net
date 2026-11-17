const audio=document.getElementById('background-audio');
const panel=document.getElementById('music-panel');
const toggle=document.getElementById('music-toggle');
const play=document.getElementById('music-play');
const status=document.getElementById('music-status');
const volume=document.getElementById('music-volume');
const seek=document.getElementById('music-seek');
const clock=document.getElementById('music-time');
const format=s=>Math.floor((s||0)/60)+':'+String(Math.floor((s||0)%60)).padStart(2,'0');
function message(text){if(status.textContent!==text)status.textContent=text;}
function show(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));}
function update(){const active=!audio.paused;play.textContent=active?'Pause music':'Play music';play.setAttribute('aria-label',active?'Pause background music':'Play background music');toggle.querySelector('span').textContent=active?'Music · playing':'Music';}
function setVolume(value){audio.volume=Math.max(0,Math.min(1,value/100));volume.value=String(Math.round(audio.volume*100));document.getElementById('volume-value').textContent=volume.value+'%';}
try{const saved=localStorage.getItem('neonnet-music-volume');setVolume(saved===null?25:Number(saved));}catch{setVolume(25);}
async function start(){try{await audio.play();message('Playing · loops while you browse.');}catch(error){message(error.name==='NotAllowedError'?'Your browser requires a click. Press Play music.':'Audio could not start. Press Play music to retry.');update();}}
toggle.addEventListener('click',()=>show(panel.hidden));
document.getElementById('music-minimise').addEventListener('click',()=>show(false));
play.addEventListener('click',()=>{if(audio.paused)start();else audio.pause();});
volume.addEventListener('input',()=>{setVolume(Number(volume.value));try{localStorage.setItem('neonnet-music-volume',volume.value);}catch{}});
seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Math.min(audio.duration,Number(seek.value));});
audio.addEventListener('playing',()=>{update();message('Playing · loops while you browse.');});
audio.addEventListener('pause',()=>{update();message('Paused. Press Play music to resume.');});
audio.addEventListener('waiting',()=>message('Buffering background music…'));
audio.addEventListener('error',()=>message('The track could not load. Reload the page to retry.'));
audio.addEventListener('loadedmetadata',()=>{seek.max=String(Math.floor(audio.duration));clock.textContent=format(audio.currentTime)+' / '+format(audio.duration)+' · LOOP';});
audio.addEventListener('timeupdate',()=>{seek.value=String(Math.floor(audio.currentTime));clock.textContent=format(audio.currentTime)+' / '+format(audio.duration)+' · LOOP';});
show(true);start();
