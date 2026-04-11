/* =========================================
   FILOSOFIADI — Main Script
   ========================================= */

// Nav: border è sempre visibile, nessun comportamento scroll necessario

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
}

// Active nav link
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage) {
    link.classList.add('active');
  } else if (href === 'episodi.html' && currentPage === 'episodio.html') {
    link.classList.add('active');
  }
});

// Scroll-reveal
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// Staggered reveal for groups
document.querySelectorAll('.reveal-group').forEach(group => {
  [...group.children].forEach((child, i) => {
    child.style.transitionDelay = (i * 0.08) + 's';
    child.classList.add('reveal');
    revealObs.observe(child);
  });
});

/* =========================================
   Audio Player
   ========================================= */

class AudioPlayer {
  constructor(el) {
    this.el        = el;
    this.src       = el.dataset.src || '';
    this.audio     = this.src ? new Audio(this.src) : null;
    this.playBtn   = el.querySelector('.ap-play');
    this.fill      = el.querySelector('.ap-fill');
    this.bar       = el.querySelector('.ap-bar');
    this.timeCur   = el.querySelector('.time-cur');
    this.timeTot   = el.querySelector('.time-tot');
    this.playing   = false;

    el._player = this;
    this._bind();
  }

  _bind() {
    this.playBtn.addEventListener('click', () => this.toggle());

    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      const pct = (this.audio.currentTime / (this.audio.duration || 1)) * 100;
      if (this.fill) this.fill.style.width = pct + '%';
      if (this.timeCur) this.timeCur.textContent = this._fmt(this.audio.currentTime);
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.timeTot) this.timeTot.textContent = this._fmt(this.audio.duration);
    });

    this.audio.addEventListener('ended', () => {
      this.playing = false;
      this._update();
      if (this.fill) this.fill.style.width = '0%';
      if (this.timeCur) this.timeCur.textContent = '0:00';
    });

    if (this.bar) {
      this.bar.addEventListener('click', e => {
        const r = this.bar.getBoundingClientRect();
        this.audio.currentTime = ((e.clientX - r.left) / r.width) * (this.audio.duration || 0);
      });
    }
  }

  toggle() {
    // Stop all other players
    document.querySelectorAll('.audio-player').forEach(p => {
      if (p !== this.el && p._player && p._player.playing) p._player.pause();
    });
    this.playing ? this.pause() : this.play();
  }

  play() {
    if (this.audio) this.audio.play().catch(() => {});
    this.playing = true;
    this._update();
  }

  pause() {
    if (this.audio) this.audio.pause();
    this.playing = false;
    this._update();
  }

  _update() {
    const iconPlay  = this.playBtn.querySelector('.icon-play');
    const iconPause = this.playBtn.querySelector('.icon-pause');
    if (iconPlay)  iconPlay.style.display  = this.playing ? 'none' : 'block';
    if (iconPause) iconPause.style.display = this.playing ? 'block' : 'none';
    this.playBtn.classList.toggle('playing', this.playing);
  }

  _fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }
}

document.querySelectorAll('.audio-player').forEach(el => new AudioPlayer(el));

// Card inline player toggle
document.querySelectorAll('.card-play').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const card   = btn.closest('.ep-card');
    const player = card?.querySelector('.card-player');
    if (player) {
      player.classList.toggle('open');
      btn.classList.toggle('playing', player.classList.contains('open'));
    }
  });
});

/* =========================================
   Modal system (backstage + video)
   ========================================= */

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.querySelector('.fd-modal-close')?.focus();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';

  // Stop video iframe if present
  const iframe = modal.querySelector('iframe');
  if (iframe) {
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  }
}

// Open triggers
const btnBackstage = document.getElementById('btnBackstage');
if (btnBackstage) btnBackstage.addEventListener('click', () => openModal('modalBackstage'));

const btnFonti = document.getElementById('btnFonti');
if (btnFonti) btnFonti.addEventListener('click', () => openModal('modalFonti'));

const btnVideo = document.getElementById('btnVideo');
if (btnVideo) btnVideo.addEventListener('click', () => openModal('modalVideo'));

// Close buttons
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});

// Click outside to close
document.querySelectorAll('.fd-modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// ESC key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.fd-modal.open').forEach(m => closeModal(m.id));
  }
});

// Auto-open video modal if URL contains #video
if (window.location.hash === '#video') {
  window.addEventListener('load', () => openModal('modalVideo'));
}
