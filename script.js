const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const CELL = 6;
// Math.floor: W/H hücre boyutuna (CELL) tam bölünmeyebilir (örn. 560/6 =
// 93.333...); bölünmeyen kalan olduğunda ROWS/2 gibi hesaplar tam sayı
// olmayan bir satıra denk gelip motosikletleri çizilen grid çizgileriyle
// hizasız bırakıyordu.
const COLS = Math.floor(W/CELL), ROWS = Math.floor(H/CELL);

// ===== SES MOTORU =====
const actx = new (window.AudioContext || window.webkitAudioContext)();
function unlockAudio(){
  if(actx.state === "suspended") actx.resume();
  window.removeEventListener('keydown', unlockAudio);
  window.removeEventListener('click', unlockAudio);
}
window.addEventListener('keydown', unlockAudio);
window.addEventListener('click', unlockAudio);

function playTone(freq, duration, type='square', volume=0.15, glideTo=null){
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, actx.currentTime);
  if(glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, actx.currentTime + duration);
  gain.gain.setValueAtTime(volume, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
  osc.connect(gain).connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + duration);
}
function playNoise(duration, volume=0.2){
  const bufferSize = actx.sampleRate * duration;
  const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (1 - i/bufferSize);
  const noise = actx.createBufferSource();
  noise.buffer = buffer;
  const gain = actx.createGain();
  gain.gain.setValueAtTime(volume, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + duration);
  noise.connect(gain).connect(actx.destination);
  noise.start();
}
const sfx = {
  turn: () => playTone(500, 0.05, 'square', 0.05, 600),
  crash: () => { playNoise(0.3, 0.25); playTone(80, 0.25, 'sawtooth', 0.15, 30); },
  countdown: (f) => playTone(f, 0.15, 'square', 0.12),
  win: () => { [523,659,784,1046].forEach((f,i)=> setTimeout(()=>playTone(f,0.3,'square',0.15),i*130)); }
};

const keys = {};
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => keys[e.code] = false);
// Pencere odağı kaybolursa (Alt+Tab, başka pencereye tıklama vb.) keyup hiç
// tetiklenmeyebilir; bu da basılı tutulan yön tuşunun "takılı" kalıp bir
// sonraki turda beklenmedik bir dönüşe yol açmasına neden olur. Odak
// kaybında tüm tuşları sıfırlıyoruz.
window.addEventListener('blur', () => {
  for(const code in keys) keys[code] = false;
});

const DIRS = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

class Cycle {
  constructor(x,y,dir,color,controls){
    this.x=x; this.y=y; this.dir=dir; this.color=color; this.controls=controls;
    this.trail = new Set();
    this.trail.add(x+","+y);
    this.alive = true;
    this.moveTimer = 0;
    this.pendingDir = dir;
  }
  handleInput(){
    const c = this.controls;
    const opp = {up:'down',down:'up',left:'right',right:'left'};
    let want = null;
    if(keys[c.up]) want='up';
    else if(keys[c.down]) want='down';
    else if(keys[c.left]) want='left';
    else if(keys[c.right]) want='right';
    if(want && want !== opp[this.dir]){
      if(want !== this.pendingDir) sfx.turn();
      this.pendingDir = want;
    }
  }
  step(){
    if(!this.alive) return;
    this.dir = this.pendingDir;
    const [dx,dy] = DIRS[this.dir];
    this.x += dx; this.y += dy;
  }
  draw(){
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    for(const key of this.trail){
      const [tx,ty] = key.split(",").map(Number);
      ctx.fillRect(tx*CELL, ty*CELL, CELL-1, CELL-1);
    }
    // kafa (parlak)
    if(this.alive){
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(this.x*CELL, this.y*CELL, CELL-1, CELL-1);
    }
    ctx.shadowBlur = 0;
  }
}

let p1, p2, running=false, score1=0, score2=0, moveInterval=60; // ms per step
let lastStep = 0;

function newRound(){
  const midRow = Math.floor(ROWS/2); // ROWS tek sayı olsa bile tam bir grid satırında başlasınlar
  p1 = new Cycle(10, midRow, 'right', "#5cd6ff", {up:"KeyW",down:"KeyS",left:"KeyA",right:"KeyD"});
  p2 = new Cycle(COLS-11, midRow, 'left', "#ff5c8a", {up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"});
  document.getElementById('msg').style.display='none';
  document.getElementById('restart').style.display='none';
  document.getElementById('score').textContent = score1 + " — " + score2;
  runCountdown();
}

function runCountdown(){
  running = false;
  const cd = document.getElementById('countdown');
  cd.style.display = 'block';
  let n = 3;
  cd.textContent = n;
  sfx.countdown(440);
  const iv = setInterval(()=>{
    n--;
    if(n>0){ cd.textContent = n; sfx.countdown(440); }
    else if(n===0){ cd.textContent = "GİT!"; sfx.countdown(700); }
    else {
      clearInterval(iv);
      cd.style.display='none';
      running = true;
      lastStep = performance.now();
    }
  }, 650);
}

function checkCollision(cyc, other){
  if(cyc.x<0||cyc.x>=COLS||cyc.y<0||cyc.y>=ROWS) return true;
  const key = cyc.x+","+cyc.y;
  if(cyc.trail.has(key)) return true;
  if(other.trail.has(key)) return true;
  return false;
}

function endRound(winner, draw){
  running = false;
  const msg = document.getElementById('msg');
  if(draw){
    msg.style.color = "#ffcf5c";
    msg.textContent = "BERABERE!";
  } else {
    msg.style.color = winner===p1 ? "#5cd6ff" : "#ff5c8a";
    msg.textContent = (winner===p1 ? "OYUNCU 1" : "OYUNCU 2") + " KAZANDI!";
    if(winner===p1) score1++; else score2++;
  }
  document.getElementById('score').textContent = score1 + " — " + score2;
  msg.style.display = 'block';
  document.getElementById('restart').style.display = 'block';
  sfx.win();
}

document.getElementById('restart').addEventListener('click', newRound);

function drawGrid(){
  ctx.strokeStyle = "rgba(92,255,224,0.03)";
  for(let x=0;x<COLS;x++){ ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
  for(let y=0;y<ROWS;y++){ ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }
}

function loop(ts){
  ctx.clearRect(0,0,W,H);
  drawGrid();

  if(running){
    p1.handleInput();
    p2.handleInput();

    if(ts - lastStep >= moveInterval){
      lastStep = ts;
      p1.step();
      p2.step();

      // checkCollision sadece HENÜZ GÜNCELLENMEMİŞ (bu adımdan önceki) izlere
      // bakıyor; iki motosiklet birbirine tam bakıp aralarında çift sayıda
      // hücre varsa, bir adım sonra AYNI hücreye inip ikisi de kendi/rakip
      // izinde henüz bulunmayan bu ortak hücreyi hiç çarpışma saymıyordu.
      // Bu yüzden yeni pozisyonların birebir çakışmasını da ayrıca kontrol ediyoruz.
      const headOn = p1.x===p2.x && p1.y===p2.y;
      const p1crash = checkCollision(p1, p2) || headOn;
      const p2crash = checkCollision(p2, p1) || headOn;

      if(p1crash || p2crash) sfx.crash();

      if(p1crash) p1.alive = false;
      if(p2crash) p2.alive = false;

      if(!p1crash) p1.trail.add(p1.x+","+p1.y);
      if(!p2crash) p2.trail.add(p2.x+","+p2.y);

      if(p1crash && p2crash) endRound(null, true);
      else if(p1crash) endRound(p2, false);
      else if(p2crash) endRound(p1, false);
    }
  }

  p1.draw();
  p2.draw();

  requestAnimationFrame(loop);
}

newRound();
requestAnimationFrame(loop);
