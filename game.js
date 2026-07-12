const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const speedEl = document.querySelector('#speed');
const startScreen = document.querySelector('#startScreen');
const gameOver = document.querySelector('#gameOver');
const finalScore = document.querySelector('#finalScore');
const driverName = document.querySelector('#driverName');
const keys = new Set();

const W = canvas.width, H = canvas.height, lanes = [78, 182, 286];
let player, obstacles, score, speed, running, lastTime, spawnTimer, roadOffset, plate = 'DRIVER';

function reset() {
  player = { x: lanes[1], y: H - 118, w: 56, h: 94 };
  obstacles = []; score = 0; speed = 5; spawnTimer = 0; roadOffset = 0;
  scoreEl.textContent = score; speedEl.textContent = '1.0x';
}
function start() {
  plate = (driverName.value.trim().toUpperCase() || 'DRIVER').slice(0, 10);
  reset(); running = true; lastTime = performance.now();
  startScreen.classList.add('hidden'); gameOver.classList.add('hidden');
  requestAnimationFrame(loop);
}
function addObstacle() {
  const openLanes = lanes.filter(x => !obstacles.some(o => o.x === x && o.y < 170));
  const x = openLanes[Math.floor(Math.random() * openLanes.length)] ?? lanes[Math.floor(Math.random() * 3)];
  obstacles.push({ x, y: -110, w: 56, h: 94, color: ['#f97316','#a855f7','#22c55e'][Math.floor(Math.random()*3)] });
}
function hit(a, b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function update(dt) {
  const move = (keys.has('ArrowLeft') || keys.has('a')) ? -1 : (keys.has('ArrowRight') || keys.has('d')) ? 1 : 0;
  player.x = Math.max(47, Math.min(W - player.w - 47, player.x + move * 330 * dt));
  spawnTimer += dt; roadOffset = (roadOffset + speed * 52 * dt) % 72;
  if (spawnTimer > Math.max(.48, 1.05 - score * .025)) { addObstacle(); spawnTimer = 0; }
  obstacles.forEach(o => o.y += speed * 58 * dt);
  obstacles = obstacles.filter(o => {
    if (o.y > H + 20) { score++; speed += .34; scoreEl.textContent = score; speedEl.textContent = (speed/5).toFixed(1) + 'x'; return false; }
    return true;
  });
  if (obstacles.some(o => hit(player, o))) end();
}
function car(c, x, y, color, licensePlate = '') {
  c.save(); c.translate(x, y); c.fillStyle = '#111827'; c.fillRect(3, 10, 8, 23); c.fillRect(45, 10, 8, 23); c.fillRect(3, 62, 8, 23); c.fillRect(45, 62, 8, 23);
  c.fillStyle = color; c.beginPath(); c.roundRect(7, 0, 42, 94, 12); c.fill();
  c.fillStyle = '#651018'; c.beginPath(); c.roundRect(11, 12, 34, 21, 5); c.fill();
  c.fillStyle = '#020617'; c.beginPath(); c.roundRect(9, 39, 38, 24, 5); c.fill();
  c.fillStyle = '#e5e7eb'; [[13,42],[33,42]].forEach(([lx,ly]) => { c.beginPath(); c.arc(lx,ly,6,0,Math.PI*2); c.fill(); c.fillStyle='#111827'; c.beginPath(); c.arc(lx,ly,3,0,Math.PI*2); c.fill(); c.fillStyle='#e5e7eb'; });
  c.fillStyle = '#f8fafc'; c.beginPath(); c.roundRect(15, 67, 26, 12, 2); c.fill();
  if (licensePlate) { c.fillStyle = '#111827'; c.font = 'bold 5px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(licensePlate, 28, 73); }
  c.fillStyle = '#0f172a'; c.beginPath(); c.roundRect(12, 82, 32, 7, 3); c.fill(); c.restore();
}
function draw() {
  ctx.fillStyle = '#2d3748'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#4b5563'; ctx.fillRect(34, 0, W - 68, H);
  ctx.fillStyle = '#f8fafc';
  [137, 241].forEach(x => { for (let y = -72 + roadOffset; y < H; y += 72) ctx.fillRect(x, y, 8, 42); });
  ctx.fillStyle = '#fbbf24'; ctx.fillRect(40, 0, 5, H); ctx.fillRect(W-45, 0, 5, H);
  obstacles.forEach(o => car(ctx, o.x, o.y, o.color)); car(ctx, player.x, player.y, '#c6101d', plate);
}
function loop(now) { if (!running) return; const dt = Math.min(.04, (now-lastTime)/1000); lastTime = now; update(dt); draw(); if (running) requestAnimationFrame(loop); }
function end() { running = false; finalScore.textContent = score; gameOver.classList.remove('hidden'); }
document.addEventListener('keydown', e => { if (['ArrowLeft','ArrowRight','a','d'].includes(e.key)) { keys.add(e.key); e.preventDefault(); } });
document.addEventListener('keyup', e => keys.delete(e.key));
canvas.addEventListener('pointermove', e => { if (!running) return; const r = canvas.getBoundingClientRect(); player.x = Math.max(47, Math.min(W-player.w-47, (e.clientX-r.left) * W/r.width - player.w/2)); });
document.querySelector('#startButton').onclick = start; document.querySelector('#restartButton').onclick = start;
draw();
