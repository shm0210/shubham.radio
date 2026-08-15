const PLAYLIST_ID = "9495307201/papa-ke-jamane-ke-gaane";
const BASE_URL = "https://pub-dca67106d684416ebbeaf0588d7d3363.r2.dev/papa-ke-jamane-ke-gaane/";
const FAVORITES_KEY = "pkj-favorites-v1";
const RECENT_KEY = "pkj-recent-v1";

const audio = document.getElementById("audio");
const playlistEl = document.getElementById("playlist");
const searchInput = document.getElementById("searchInput");
const nowTitle = document.getElementById("nowTitle");
const nowArtist = document.getElementById("nowArtist");
const cover = document.getElementById("cover");
const playBtn = document.getElementById("playBtn");
const seek = document.getElementById("seek");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const volumeRange = document.getElementById("volumeRange");
const volumeIcon = document.getElementById("volumeIcon");
const muteBtn = document.getElementById("muteBtn");
const likeBtn = document.getElementById("likeBtn");
const toast = document.getElementById("toast");
const errorPanel = document.getElementById("errorPanel");
const errorText = document.getElementById("errorText");

const state = {
  index: -1,
  view: "all",
  search: "",
  shuffle: false,
  repeat: false,
  favorites: new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]")),
  recent: JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"),
  filtered: []
};

const clean = s => s.replace(/\.mp3$/i, "");
const artistOf = title => {
  const i = title.indexOf(" - ");
  return i > -1 ? title.slice(0, i) : "Unknown artist";
};
const nameOf = title => {
  const i = title.indexOf(" - ");
  return i > -1 ? title.slice(i + 3) : title;
};
const fmt = seconds => {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2,"0")}`;
};
const urlFor = filename => BASE_URL + encodeURIComponent(filename);

function savePrefs(){
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...state.favorites]));
  localStorage.setItem(RECENT_KEY, JSON.stringify(state.recent.slice(0,30)));
}
function notify(msg){
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(notify.t); notify.t = setTimeout(()=>toast.classList.remove("show"),2200);
}
function updateCounts(){
  document.getElementById("songCount").textContent = `${songs.length} songs`;
  document.getElementById("allCount").textContent = songs.length;
  document.getElementById("favCount").textContent = state.favorites.size;
}
function filteredSongs(){
  const q = state.search.trim().toLowerCase();
  let list = songs.map((title, index)=>({title,index}));
  if(state.view === "favorites") list = list.filter(x=>state.favorites.has(x.index));
  if(state.view === "recent") list = state.recent.map(i=>({title:songs[i],index:i})).filter(x=>x.title);
  if(q) list = list.filter(x => x.title.toLowerCase().includes(q));
  return list;
}
function render(){
  state.filtered = filteredSongs();
  playlistEl.innerHTML = "";
  if(!state.filtered.length){
    playlistEl.innerHTML = `<div style="padding:25px 14px;color:#847a70;font-size:11px">No songs found.</div>`;
    return;
  }
  state.filtered.forEach(({title,index})=>{
    const row = document.createElement("div");
    row.className = "song" + (index===state.index ? " active" : "");
    row.innerHTML = `
      <div class="song-num">${index===state.index && !audio.paused ? "♫" : String(index+1).padStart(2,"0")}</div>
      <div class="song-info"><div class="song-title">${escapeHtml(nameOf(title))}</div><div class="song-artist">${escapeHtml(artistOf(title))}</div></div>
      <button class="song-like ${state.favorites.has(index)?"liked":""}" title="Favorite">${state.favorites.has(index)?"♥":"♡"}</button>`;
    row.addEventListener("click", e=>{
      if(e.target.closest(".song-like")) return;
      loadSong(index,false);
    });
    row.querySelector(".song-like").addEventListener("click", e=>{
      e.stopPropagation(); toggleFavorite(index);
    });
    playlistEl.appendChild(row);
  });
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function loadSong(index, autoplay=false){
  if(index<0 || index>=songs.length) return;
  state.index=index;
  const title=songs[index];
  nowTitle.textContent=nameOf(title);
  nowArtist.textContent=artistOf(title);
  cover.querySelector("span").textContent = "♫";
  audio.src=urlFor(title);
  audio.load();
  state.recent=[index,...state.recent.filter(i=>i!==index)].slice(0,30);
  savePrefs();
  errorPanel.hidden=true;
  render();
  if(autoplay){
    try { await audio.play(); }
    catch(err){ showPlaybackError(err); }
  }
}
function showPlaybackError(err){
  errorPanel.hidden=false;
  const blocked = err && (err.name==="NotAllowedError" || err.name==="AbortError");
  errorText.textContent = blocked
    ? "Browser blocked automatic playback. Press Play again after interacting with the page."
    : "The MP3 URL may be unavailable, blocked by the host, or not reachable right now.";
  playBtn.textContent="▶";
}
function togglePlay(){
  if(state.index<0){ loadSong(0,false); return; }
  if(audio.paused) audio.play().catch(showPlaybackError);
  else audio.pause();
}
function next(autoplay=false){
  if(!songs.length)return;
  let nextIndex;
  if(state.shuffle){
    do { nextIndex=Math.floor(Math.random()*songs.length); } while(songs.length>1 && nextIndex===state.index);
  } else nextIndex=(state.index+1)%songs.length;
  loadSong(nextIndex,autoplay);
}
function previous(){
  if(audio.currentTime>4){audio.currentTime=0;return;}
  loadSong((state.index-1+songs.length)%songs.length,false);
}
function toggleFavorite(index=state.index){
  if(index<0)return;
  state.favorites.has(index)?state.favorites.delete(index):state.favorites.add(index);
  savePrefs(); updateCounts(); render();
  likeBtn.classList.toggle("liked",state.favorites.has(index));
  likeBtn.textContent=state.favorites.has(index)?"♥":"♡";
}
function syncPlayer(){
  playBtn.textContent=audio.paused?"▶":"Ⅱ";
  seek.value=audio.duration?((audio.currentTime/audio.duration)*100):0;
  currentTime.textContent=fmt(audio.currentTime);
  duration.textContent=fmt(audio.duration);
  if(state.index>=0) render();
}
function toggleMute(){
  audio.muted=!audio.muted;
  volumeIcon.textContent=audio.muted?"◌":"◖";
  muteBtn.textContent=audio.muted?"◌":"◖";
}
function setActiveView(view){
  state.view=view;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  render();
}
function escapeKey(e){
  if(["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;
  if(e.code==="Space"){e.preventDefault();togglePlay()}
  if(e.code==="ArrowRight") audio.currentTime=Math.min(audio.duration||0,audio.currentTime+5);
  if(e.code==="ArrowLeft") audio.currentTime=Math.max(0,audio.currentTime-5);
  if(e.code==="ArrowUp"){e.preventDefault();volumeRange.value=Math.min(1,+volumeRange.value+.05);audio.volume=+volumeRange.value}
  if(e.code==="ArrowDown"){e.preventDefault();volumeRange.value=Math.max(0,+volumeRange.value-.05);audio.volume=+volumeRange.value}
}
document.getElementById("nextBtn").onclick=next;
document.getElementById("prevBtn").onclick=previous;
playBtn.onclick=togglePlay;
likeBtn.onclick=()=>toggleFavorite();
document.getElementById("shuffleBtn").onclick=()=>{
  state.shuffle=!state.shuffle;
  document.getElementById("shuffleBtn").textContent=state.shuffle?"⤨ Shuffle: On":"⤨ Shuffle";
  notify(state.shuffle?"Shuffle enabled":"Shuffle disabled");
};
document.getElementById("repeatBtn").onclick=()=>{
  state.repeat=!state.repeat;
  document.getElementById("repeatBtn").textContent=state.repeat?"↻ Repeat: On":"↻ Repeat: Off";
};
document.getElementById("retryBtn").onclick=()=>loadSong(state.index,false);
volumeRange.oninput=()=>{audio.volume=+volumeRange.value;audio.muted=audio.volume===0};
volumeIcon.onclick=toggleMute;
muteBtn.onclick=toggleMute;
seek.oninput=()=>{if(audio.duration)audio.currentTime=(+seek.value/100)*audio.duration};
searchInput.oninput=e=>{state.search=e.target.value;render()};
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>setActiveView(b.dataset.view));
document.getElementById("queueBtn").onclick=()=>document.querySelector(".sidebar").scrollIntoView({behavior:"smooth"});
document.getElementById("fullscreenBtn").onclick=async()=>{
  try{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }catch{notify("Fullscreen is not available in this browser")}
};
document.getElementById("themeBtn").onclick=()=>document.body.classList.toggle("light");
document.getElementById("supportBtn").onclick=()=>notify("Support button ready — add your own payment link in app.js.");
audio.addEventListener("play",syncPlayer);
audio.addEventListener("pause",syncPlayer);
audio.addEventListener("timeupdate",syncPlayer);
audio.addEventListener("loadedmetadata",syncPlayer);
audio.addEventListener("error",()=>showPlaybackError());
audio.addEventListener("ended",()=>{ if(state.repeat) loadSong(state.index,true); else next(true); });
window.addEventListener("keydown",escapeKey);

function tickClock(){
  document.getElementById("clock").textContent=new Intl.DateTimeFormat([], {hour:"numeric",minute:"2-digit"}).format(new Date());
}
tickClock(); setInterval(tickClock,30000);
audio.volume=0.85;
updateCounts();
render();
