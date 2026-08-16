const PLAYLIST_ID = "9495307201/papa-ke-jamane-ke-gaane";
const BASE_URL = "https://pub-dca67106d684416ebbeaf0588d7d3363.r2.dev/papa-ke-jamane-ke-gaane/";
const BHOJPURI_BASE_URL = "https://pub-dca67106d684416ebbeaf0588d7d3363.r2.dev/bihari-banger/";
const CHANNEL_KEY = "pkj-channel-v1";

const audio = document.getElementById("audio");
const playlistEl = document.getElementById("playlist");
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
const toast = document.getElementById("toast");
const errorPanel = document.getElementById("errorPanel");
const errorText = document.getElementById("errorText");
const playlistPopup = document.getElementById("playlistPopup");
const playlistPopupBtn = document.getElementById("playlistPopupBtn");
const playlistPopupClose = document.getElementById("playlistPopupClose");
const popupList = document.getElementById("popupList");
const popupCount = document.getElementById("popupCount");
const channelBtn = document.getElementById("channelBtn");
const channelMenu = document.getElementById("channelMenu");
const currentChannelName = document.getElementById("currentChannelName");
const playlistTitle = document.getElementById("playlistTitle");
const queueTitle = document.getElementById("queueTitle");
const heroTitle = document.getElementById("heroTitle");
const heroSub = document.getElementById("heroSub");

// Channel configurations
const CHANNELS = {
  papa: {
    id: 'papa',
    name: 'Papa Ke Jamane Ke Gaane',
    songList: songs,
    baseUrl: BASE_URL,
    heroTitle: 'पापा के<br>ज़माने के गाने',
    heroSub: 'पुराने गीत, वही एहसास — एक सुकून भरी शाम के लिए।'
  },
  bhojpuri: {
    id: 'bhojpuri',
    name: 'Bhojpuri Banger',
    songList: bhojpuriSongs, // Merged Bhojpuri Tadka + Bihari Banger
    baseUrl: BHOJPURI_BASE_URL,
    heroTitle: 'भोजपुरी<br>बैंगर',
    heroSub: 'गाँव की मस्ती, ढोलक की थाप — पूरा यूपी-बिहार झूमेगा!'
  },
  '2009': {
    id: '2009',
    name: '2009s Vibe',
    songList: [],
    baseUrl: '',
    heroTitle: '2009<br>की यादें',
    heroSub: 'वो साल, वो गाने — एक सुनहरी यात्रा।'
  },
  bartam: {
    id: 'bartam',
    name: 'Bartan Time',
    songList: [],
    baseUrl: '',
    heroTitle: 'बर्तन<br>टाइम',
    heroSub: 'किचन में काम करते हुए गाने — मज़ा आ जाए!'
  },
  gym: {
    id: 'gym',
    name: 'Gym Jam',
    songList: [],
    baseUrl: '',
    heroTitle: 'GYM<br>JAM',
    heroSub: 'पंप करो, मसल्स बनाओ — हार्ड वर्कआउट के लिए!'
  },
  genz: {
    id: 'genz',
    name: 'Genz Gaane',
    songList: [],
    baseUrl: '',
    heroTitle: 'Gen Z<br>गाने',
    heroSub: 'नई पीढ़ी के हिट्स — हर दिन नया ट्रेंड!'
  },
  neendi: {
    id: 'neendi',
    name: 'Neendi Time',
    songList: [],
    baseUrl: '',
    heroTitle: 'नींदी<br>टाइम',
    heroSub: 'सुकून भरी रातें, मीठे सपने — आराम की लोरी।'
  },
  chatpate: {
    id: 'chatpate',
    name: 'Chatpate Songs',
    songList: [],
    baseUrl: '',
    heroTitle: 'चटपटे<br>गाने',
    heroSub: 'मसालेदार गाने जो दिल को छू जाएं — बस चटपट!'
  },
  tamil: {
    id: 'tamil',
    name: 'Tamil Hits',
    songList: [],
    baseUrl: '',
    heroTitle: 'TAMIL<br>HITS',
    heroSub: 'तमिल सिनेमा का जादू — साउथ की धमाकेदार म्यूजिक।'
  },
  punjabi: {
    id: 'punjabi',
    name: 'Punjabi Tadka',
    songList: [],
    baseUrl: '',
    heroTitle: 'PUNJABI<br>TADKA',
    heroSub: 'भंगड़ा, ढोल, और मस्ती — पंजाब का असली स्वाद!'
  },
  kk: {
    id: 'kk',
    name: 'The Great KK',
    songList: [],
    baseUrl: '',
    heroTitle: 'THE GREAT<br>KK',
    heroSub: 'KK के सबसे बेहतरीन गाने — एक शानदार श्रद्धांजलि।'
  }
};

const state = {
  index: -1,
  shuffle: true, // Always on
  repeat: false,
  channel: localStorage.getItem(CHANNEL_KEY) || 'papa'
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

// EXACT URL construction for Papa songs
const urlFor = (filename, channelId) => {
  const channel = CHANNELS[channelId || state.channel];
  const base = channel.baseUrl || '';
  
  // For Papa channel, use the exact URL format from your file
  if (channelId === 'papa' || state.channel === 'papa') {
    let encoded = encodeURIComponent(filename)
      .replace(/%2C/g, ',')
      .replace(/%20/g, '%20');
    
    encoded = encoded
      .replace(/%26/g, '&')
      .replace(/%28/g, '(')
      .replace(/%29/g, ')')
      .replace(/%2B/g, '+');
    
    return base + encoded;
  }
  
  return base + encodeURIComponent(filename);
};

function savePrefs(){
  localStorage.setItem(CHANNEL_KEY, state.channel);
}
function notify(msg){
  toast.textContent = msg; toast.classList.add("show");
  clearTimeout(notify.t); notify.t = setTimeout(()=>toast.classList.remove("show"),2200);
}

function getCurrentSongs() {
  return CHANNELS[state.channel].songList || [];
}

function render(){
  const currentSongs = getCurrentSongs();
  playlistEl.innerHTML = "";
  if(!currentSongs.length){
    playlistEl.innerHTML = `<div style="padding:25px 14px;color:#847a70;font-size:11px">No songs found.</div>`;
    return;
  }
  currentSongs.forEach((title, index)=>{
    const row = document.createElement("div");
    row.className = "song" + (index===state.index ? " active" : "");
    row.innerHTML = `
      <div class="song-num">${index===state.index && !audio.paused ? "♫" : String(index+1).padStart(2,"0")}</div>
      <div class="song-info"><div class="song-title">${escapeHtml(nameOf(title))}</div><div class="song-artist">${escapeHtml(artistOf(title))}</div></div>`;
    row.addEventListener("click", e=>{
      loadSong(index,false);
    });
    playlistEl.appendChild(row);
  });
}

function renderPopup() {
  const currentSongs = getCurrentSongs();
  if(!currentSongs.length) {
    popupList.innerHTML = `<div style="padding:30px;color:#847a70;font-size:12px;text-align:center;">🎵 No songs in this channel</div>`;
    popupCount.textContent = '0';
    return;
  }
  popupCount.textContent = currentSongs.length;
  popupList.innerHTML = "";
  currentSongs.forEach((title, index) => {
    const row = document.createElement("div");
    row.className = "popup-song" + (index===state.index ? " active" : "");
    row.innerHTML = `
      <div class="popup-song-num">${index===state.index && !audio.paused ? "♫" : index+1}</div>
      <div class="popup-song-info">
        <div class="popup-song-title">${escapeHtml(nameOf(title))}</div>
        <div class="popup-song-artist">${escapeHtml(artistOf(title))}</div>
      </div>`;
    row.addEventListener("click", () => {
      loadSong(index, true);
      closePlaylistPopup();
    });
    popupList.appendChild(row);
  });
}

function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

async function loadSong(index, autoplay=false){
  const currentSongs = getCurrentSongs();
  if(index<0 || index>=currentSongs.length) return;
  state.index=index;
  const title=currentSongs[index];
  nowTitle.textContent=nameOf(title);
  nowArtist.textContent=artistOf(title);
  cover.querySelector("span").textContent = "♫";
  
  const fullUrl = urlFor(title, state.channel);
  console.log("Loading song URL:", fullUrl);
  
  audio.src = fullUrl;
  audio.load();
  errorPanel.hidden=true;
  render();
  renderPopup();
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
  playBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}
function togglePlay(){
  const currentSongs = getCurrentSongs();
  if(state.index<0 || state.index>=currentSongs.length){ 
    const randomIndex = Math.floor(Math.random() * currentSongs.length);
    loadSong(randomIndex, true);
    return; 
  }
  if(audio.paused) audio.play().catch(showPlaybackError);
  else audio.pause();
}
function next(autoplay=false){
  const currentSongs = getCurrentSongs();
  if(!currentSongs.length)return;
  let nextIndex;
  do { nextIndex=Math.floor(Math.random()*currentSongs.length); } while(currentSongs.length>1 && nextIndex===state.index);
  loadSong(nextIndex,autoplay);
}
function previous(){
  const currentSongs = getCurrentSongs();
  if(audio.currentTime>4){audio.currentTime=0;return;}
  loadSong((state.index-1+currentSongs.length)%currentSongs.length,false);
}
function syncPlayer(){
  const isPaused = audio.paused;
  playBtn.innerHTML = isPaused 
    ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  seek.value=audio.duration?((audio.currentTime/audio.duration)*100):0;
  currentTime.textContent=fmt(audio.currentTime);
  duration.textContent=fmt(audio.duration);
  if(state.index>=0) { render(); renderPopup(); }
}
function toggleMute(){
  audio.muted=!audio.muted;
  volumeIcon.textContent=audio.muted?"◌":"◖";
  muteBtn.innerHTML = audio.muted
    ? `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/><path d="M16 7c2 2 2 6 0 8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M19 4c4 4 4 12 0 16" stroke="currentColor" stroke-width="2" fill="none"/></svg>`
    : `<svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/><path d="M16 7c2 2 2 6 0 8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19 4c4 4 4 12 0 16" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
}
function escapeKey(e){
  if(["INPUT","TEXTAREA"].includes(document.activeElement.tagName)) return;
  if(e.code==="Space"){e.preventDefault();togglePlay()}
  if(e.code==="ArrowRight") audio.currentTime=Math.min(audio.duration||0,audio.currentTime+5);
  if(e.code==="ArrowLeft") audio.currentTime=Math.max(0,audio.currentTime-5);
  if(e.code==="ArrowUp"){e.preventDefault();volumeRange.value=Math.min(1,+volumeRange.value+.05);audio.volume=+volumeRange.value}
  if(e.code==="ArrowDown"){e.preventDefault();volumeRange.value=Math.max(0,+volumeRange.value-.05);audio.volume=+volumeRange.value}
}

// Playlist Popup
function openPlaylistPopup() {
  renderPopup();
  playlistPopup.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closePlaylistPopup() {
  playlistPopup.hidden = true;
  document.body.style.overflow = '';
}

// Channel switching
function switchChannel(channelId) {
  if(channelId === state.channel) return;
  state.channel = channelId;
  state.index = -1;
  
  const channel = CHANNELS[channelId];
  currentChannelName.textContent = channel.name;
  playlistTitle.textContent = channel.name;
  queueTitle.textContent = channel.name;
  heroTitle.innerHTML = channel.heroTitle || 'पापा के<br>ज़माने के गाने';
  heroSub.textContent = channel.heroSub || 'पुराने गीत, वही एहसास — एक सुकून भरी शाम के लिए।';
  
  document.querySelectorAll('.channel-item').forEach(el => {
    el.classList.toggle('active', el.dataset.channel === channelId);
  });
  
  channelMenu.classList.remove('open');
  channelBtn.parentElement.classList.remove('open');
  
  savePrefs();
  render();
  renderPopup();
  
  const songs = getCurrentSongs();
  if(songs.length > 0) {
    const randomIndex = Math.floor(Math.random() * songs.length);
    loadSong(randomIndex, true);
  }
  
  notify(`📻 Switched to ${channel.name}`);
}

document.getElementById("nextBtn").onclick=()=>next(true);
document.getElementById("prevBtn").onclick=previous;
playBtn.onclick=togglePlay;
document.getElementById("retryBtn").onclick=()=>loadSong(state.index,false);
volumeRange.oninput=()=>{audio.volume=+volumeRange.value;audio.muted=audio.volume===0};
volumeIcon.onclick=toggleMute;
muteBtn.onclick=toggleMute;
seek.oninput=()=>{if(audio.duration)audio.currentTime=(+seek.value/100)*audio.duration};
document.getElementById("supportBtn").onclick=()=>notify("☕ Support us — add your own payment link in app.js.");
document.getElementById("fullscreenBtn").onclick=async()=>{
  try{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }catch{notify("Fullscreen is not available in this browser")}
};

// Playlist popup events
playlistPopupBtn.onclick = openPlaylistPopup;
playlistPopupClose.onclick = closePlaylistPopup;
document.addEventListener('click', (e) => {
  if(!playlistPopup.hidden && !playlistPopup.contains(e.target) && e.target !== playlistPopupBtn) {
    closePlaylistPopup();
  }
});

// Channel dropdown events
channelBtn.onclick = (e) => {
  e.stopPropagation();
  channelMenu.classList.toggle('open');
  channelBtn.parentElement.classList.toggle('open');
};
document.querySelectorAll('.channel-item').forEach(el => {
  el.onclick = () => switchChannel(el.dataset.channel);
});
document.addEventListener('click', (e) => {
  if(!channelMenu.contains(e.target) && e.target !== channelBtn) {
    channelMenu.classList.remove('open');
    channelBtn.parentElement.classList.remove('open');
  }
});

audio.addEventListener("play",syncPlayer);
audio.addEventListener("pause",syncPlayer);
audio.addEventListener("timeupdate",syncPlayer);
audio.addEventListener("loadedmetadata",syncPlayer);
audio.addEventListener("error",(e) => {
  console.error("Audio error:", e);
  showPlaybackError();
});
audio.addEventListener("ended",()=>{ if(state.repeat) loadSong(state.index,true); else next(true); });
window.addEventListener("keydown",escapeKey);

function tickClock(){
  document.getElementById("clock").textContent=new Intl.DateTimeFormat([], {hour:"numeric",minute:"2-digit"}).format(new Date());
}
tickClock(); setInterval(tickClock,30000);
audio.volume=0.85;

// Initialize channel
const initialChannel = state.channel;
const channel = CHANNELS[initialChannel];
if(channel) {
  currentChannelName.textContent = channel.name;
  playlistTitle.textContent = channel.name;
  queueTitle.textContent = channel.name;
  heroTitle.innerHTML = channel.heroTitle || 'पापा के<br>ज़माने के गाने';
  heroSub.textContent = channel.heroSub || 'पुराने गीत, वही एहसास — एक सुकून भरी शाम के लिए।';
  document.querySelectorAll('.channel-item').forEach(el => {
    el.classList.toggle('active', el.dataset.channel === initialChannel);
  });
}

render();
renderPopup();

// Auto-play random song on load (user must press play)
const initialSongs = getCurrentSongs();
if(initialSongs.length > 0) {
  const randomIndex = Math.floor(Math.random() * initialSongs.length);
  loadSong(randomIndex, false);
}
