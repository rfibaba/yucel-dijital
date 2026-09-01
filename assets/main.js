(function () {
  'use strict';
  var WA = '905423968527';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (G) gsap.registerPlugin(ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  var f = $('#f'), ok = $('#ok');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = 'Merhaba, ben ' + f.ad.value.trim() + '. Telefonum ' + f.tel.value.trim() + '. ' + f.ne.value.trim();
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    ok.classList.add('show');
  });

  var nav = $('.nav');
  function fmt(n, kind) { var v = Math.round(n).toLocaleString('tr-TR'); return kind === 'tl' ? v + ' ₺' : v; }
  function countUp(el) {
    var to = +el.dataset.count, kind = el.dataset.fmt;
    if (reduce || !G) { el.textContent = fmt(to, kind); return; }
    var o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power3.out', onUpdate: function () { el.textContent = fmt(o.v, kind); } });
  }
  var hv = $('#hv'), vidStarted = false;
  function startVideo() {
    if (!hv || reduce || vidStarted) return; vidStarted = true;
    hv.src = 'assets/hero.mp4'; hv.load();
    hv.addEventListener('canplay', function () { hv.play().catch(function () {}); }, { once: true });
  }

  if (reduce || !G) {
    $$('.rv').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    $$('[data-count]').forEach(countUp);
    addEventListener('scroll', function () { nav.classList.toggle('on', scrollY > 60); }, { passive: true });
    return;
  }

  /* ---------- the film: one pinned timeline, scrubbed ---------- */
  var scenes = $$('.scene'), chaps = $$('.chap'), tl = $$('.tl span');
  var N = scenes.length;               // 7
  var ph = $('#ph'), notif = $('#notif'), rep = $('#rep');
  var film = gsap.timeline({ defaults: { ease: 'none' } });
  var L = 10;                          // length per chapter (timeline units)

  /* intro: visible at start, fades as chapter 1 arrives */
  film.to('.intro', { opacity: 0, y: -40, duration: L * .6 }, 0);
  film.to('.cue', { opacity: 0, duration: L * .3 }, 0);
  film.fromTo(scenes[0], { scale: 1.06 }, { scale: 1, duration: L * 1.6 }, 0);

  for (var i = 0; i < N; i++) {
    var t = L * (i + 1);
    var chap = chaps[i];
    if (i > 0) {
      film.fromTo(scenes[i], { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: L * .9 }, t - L * .3);
      film.to(scenes[i - 1], { opacity: 0, duration: L * .6 }, t + L * .3);
    }
    film.fromTo(chap, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: L * .35 }, t);
    if (i < N - 1) film.to(chap, { opacity: 0, y: -20, duration: L * .28 }, t + L * .7);
    (function (idx) {
      film.call(function () { tl.forEach(function (s, k) { s.classList.toggle('on', k === idx); }); }, null, t + L * .05);
    })(i);
  }
  /* chapter 3 (index 2): the phone appears and the price gets edited */
  film.fromTo(ph, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: L * .35 }, L * 3 + L * .1);
  film.call(function () { var e = $('#edprice'); if (e) e.textContent = '60 ₺'; }, null, L * 3 + L * .55);
  film.to(ph, { opacity: 0, y: -40, duration: L * .3 }, L * 3 + L * .8);
  /* chapter 5 (index 4): notifications drop in */
  film.fromTo(notif, { opacity: 0 }, { opacity: 1, duration: L * .2 }, L * 5 + L * .1);
  film.to($$('.notif div'), { opacity: 1, x: 0, duration: L * .25, stagger: L * .12 }, L * 5 + L * .15);
  film.to(notif, { opacity: 0, duration: L * .25 }, L * 5 + L * .8);
  /* chapter 6 (index 5): the report number */
  film.fromTo(rep, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: L * .3 }, L * 6 + L * .15);
  film.call(function () { countUp($('.rep b')); }, null, L * 6 + L * .2);
  film.to(rep, { opacity: 0, duration: L * .25 }, L * 6 + L * .8);
  /* chapter 7: the video */
  film.call(startVideo, null, L * 7 - L * .5);
  film.to({}, { duration: L * .6 });   // hold at the end

  ScrollTrigger.create({
    trigger: '.film', start: 'top top', end: '+=' + (N * 110) + '%', pin: true, scrub: 1.2,
    animation: film, anticipatePin: 1,
    onToggle: function (s) { if (!s.isActive && s.progress > .5) nav.classList.add('on'); }
  });
  ScrollTrigger.create({ start: 80, end: 'max', onToggle: function (s) { nav.classList.toggle('on', s.isActive); }, onRefresh: function (s) { nav.classList.toggle('on', s.isActive); } });

  /* ---------- the site below ---------- */
  ScrollTrigger.batch('.rv', { start: 'top 90%', once: true, onEnter: function (els) {
    gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: .1, overwrite: true });
  } });
  $$('.cmp [data-count]').forEach(function (el) { ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: function () { countUp(el); } }); });
  gsap.to('.cta .bg', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.utils.toArray('.ed .pics img').forEach(function (im, k) {
    gsap.to(im, { yPercent: k ? -10 : 8, ease: 'none', scrollTrigger: { trigger: '.ed', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  addEventListener('load', function () { ScrollTrigger.refresh(); });
  setTimeout(function () { ScrollTrigger.refresh(); }, 600);
  if ('ResizeObserver' in window) {
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 150); }).observe(document.documentElement);
  }
})();
