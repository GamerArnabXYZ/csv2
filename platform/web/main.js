// CraftSprint.IO — main.js v3.1.6 (Layering & Loop Fix)
'use strict';

var Module = {
    canvas: (function() {
        var c = document.getElementById('canvas');
        if (!c) console.warn("Game canvas not found (expected on game page)");
        return c;
    })(),
    onRuntimeInitialized: function() {
        if (typeof Module._set_high_score === 'function')
            Module._set_high_score(parseInt(localStorage.getItem('cs_best') || '0'));
        if (typeof Module._start_game === 'function') Module._start_game();
    }
};

// ── State ───────────────────────────────────────────────────────
var startX = 0, startY = 0;
var isGameOver = false;
var lastBiome  = null;
var bestScore  = parseInt(localStorage.getItem('cs_best') || '0');

var BIOME_NAMES = { 0:'🌿 Plains', 1:'🌵 Desert', 2:'🔥 Nether', 3:'❄ Snowy' };
var DEATH_MSGS = [
    "Steve was blown up by TNT", "Steve tried to swim in lava",
    "Steve fell from a high place", "Steve was slain by a Creeper",
    "Steve burned to a crisp", "Steve hit the ground too hard"
];

// ── Restart / Stop ──────────────────────────────────────────────
function doRestart() {
    isGameOver = false;
    if(document.getElementById('game-over')) document.getElementById('game-over').style.display = 'none';
    if(document.getElementById('combo-display')) document.getElementById('combo-display').style.display = 'none';
    if(document.getElementById('dist-bar')) document.getElementById('dist-bar').style.width = '0%';
    if (typeof Module._restart_game === 'function') Module._restart_game();
}

function doStop() { if (typeof Module._stop_game === 'function') Module._stop_game(); }

document.addEventListener('visibilitychange', function() { if (document.hidden) doStop(); });

// ── Touch input ─────────────────────────────────────────────────
document.addEventListener('touchstart', function(e) {
    if (e.target.tagName === 'INPUT') return; 
    if (isGameOver) return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    var t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (e.target.tagName === 'INPUT') return;
    if (isGameOver) return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    var dy = startY - t.clientY;
    
    var sens = parseInt(localStorage.getItem('cs_sensitivity') || '50');
    var mult = 0.2 + (sens / 100) * 1.8;

    if (typeof Module._handle_swipe === 'function') Module._handle_swipe(dx * mult, dy * mult);
    e.preventDefault();
}, { passive: false });

// ── Keyboard ───────────────────────────────────────────────────
document.addEventListener('keydown', function(e) {
    if (isGameOver) return;
    var map = { ArrowLeft:[-200,0], ArrowRight:[200,0], ArrowUp:[0,200], ArrowDown:[0,-200],
                KeyA:[-200,0], KeyD:[200,0], KeyW:[0,200], KeyS:[0,-200] };
    var v = map[e.code];
    if (v && typeof Module._handle_swipe === 'function') Module._handle_swipe(v[0], v[1]);
});

// ── UI Sync ────────────────────────────────────────────────────
function updateUI(score, gameOverInt, combo, highScore, distance) {
    var scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = 'Score: ' + score;

    var comboEl = document.getElementById('combo-display');
    if (comboEl) {
        if (combo > 1) { comboEl.style.display = 'block'; comboEl.textContent = '×' + combo + ' COMBO'; }
        else { comboEl.style.display = 'none'; }
    }

    var dist = distance || 0;
    var biomeIdx = 0;
    if (dist > 2000) biomeIdx = 2; else if (dist > 1000) biomeIdx = 3; else if (dist > 400) biomeIdx = 1;

    var biomeName = BIOME_NAMES[biomeIdx] || '🌿 Plains';
    var biomeEl = document.getElementById('biome-display');
    if (biomeEl) biomeEl.textContent = biomeName;
    if (lastBiome !== null && biomeName !== lastBiome) {
        var toast = document.getElementById('biome-toast');
        if(toast) {
            toast.textContent = 'Entering ' + biomeName + '!';
            toast.style.display = 'block';
            setTimeout(function(){ toast.style.display = 'none'; }, 2500);
        }
    }
    lastBiome = biomeName;

    var bar = document.getElementById('dist-bar');
    if (bar) bar.style.width = Math.min((dist / 2500) * 100, 100) + '%';

    if (gameOverInt && !isGameOver) {
        isGameOver = true;
        if (score > bestScore) { bestScore = score; localStorage.setItem('cs_best', score); }
        if(document.getElementById('death-msg')) document.getElementById('death-msg').textContent = DEATH_MSGS[Math.floor(Math.random()*DEATH_MSGS.length)];
        if(document.getElementById('final-score')) document.getElementById('final-score').textContent = 'Score: ' + score;
        if(document.getElementById('high-score-display')) 
            document.getElementById('high-score-display').textContent = score >= bestScore ? '🏆 New Best!' : 'Best: ' + bestScore;
        if(document.getElementById('game-over')) document.getElementById('game-over').style.display = 'flex';
    }
}

// ── Global Appliers ────────────────────────────────────────────
window.applyDark = function(v) {
    var opacity = (v / 100).toFixed(2);
    document.documentElement.style.setProperty('--bg-opacity', opacity);
    var overlays = document.querySelectorAll('.full-screen');
    overlays.forEach(function(el) { el.style.backgroundColor = 'rgba(0,0,0,' + opacity + ')'; });
};

// ── Sequential Panorama Animation ─────────────────────────────
function initPanorama() {
    var canvas = document.getElementById('menu-canvas');
    if (!canvas) {
        window.applyDark(localStorage.getItem('cs_bg-darkness') || 45);
        return;
    }
    var ctx = canvas.getContext('2d');
    var p1 = new Image(), p2 = new Image();
    var l1 = false, l2 = false;
    
    p1.onload = function() { l1 = true; console.log("Pano1 loaded"); };
    p2.onload = function() { l2 = true; console.log("Pano2 loaded"); };
    p1.onerror = function() { console.error("Pano1 failed"); };
    p2.onerror = function() { console.error("Pano2 failed"); };

    p1.src = 'assets/panorama_bg.png';
    p2.src = 'assets/panorama_bg1.png';

    var offset = 0;
    function loop() {
        var vw = canvas.width = window.innerWidth, vh = canvas.height = window.innerHeight;
        if (!l1 || !l2) {
            requestAnimationFrame(loop);
            return;
        }
        var s1 = vh / p1.height, s2 = vh / p2.height;
        var w1 = p1.width * s1, w2 = p2.width * s2, totalW = w1 + w2;
        offset = (offset + 0.8) % totalW;
        var x = -offset;
        ctx.clearRect(0, 0, vw, vh);
        while (x < vw) {
            if (x + w1 > 0) ctx.drawImage(p1, x, 0, w1, vh);
            x += w1;
            if (x < vw && x + w2 > 0) ctx.drawImage(p2, x, 0, w2, vh);
            x += w2;
        }
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    window.applyDark(localStorage.getItem('cs_bg-darkness') || 45);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPanorama);
else initPanorama();
