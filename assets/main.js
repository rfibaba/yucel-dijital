(function () {
  'use strict';
  var WA = '905423968527';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* mobile nav */
  var burger = $('#burger'), mnav = $('#mnav');
  if (burger) burger.addEventListener('click', function () {
    var open = mnav.classList.toggle('open'); burger.setAttribute('aria-expanded', open);
  });
  $$('#mnav a').forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('open'); }); });

  /* reveal */
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = $$('.rv');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) e.classList.add('in'); }); }, 800);
  }

  /* counters */
  $$('[data-count]').forEach(function (el) {
    var to = +el.dataset.count, t0 = null;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); }
    if (reduce) el.textContent = to; else setTimeout(function () { requestAnimationFrame(step); }, 500);
  });

  /* menu demo */
  var MENU = {
    'Kahveler': [['Türk kahvesi', 45], ['Filtre kahve', 60], ['Latte', 75], ['Espresso', 50], ['Sahlep', 65]],
    'Tatlılar': [['Künefe', 120], ['San Sebastian', 140], ['Sütlaç', 70], ['Tiramisu', 130]],
    'Soğuk İçecekler': [['Ayran', 25], ['Limonata', 55], ['Soğuk kahve', 70], ['Meyve suyu', 45]]
  };
  var cats = $('#cats'), items = $('#items'), toast = $('#toast'), cur = 'Kahveler';
  function tl(n) { return n.toLocaleString('tr-TR') + ' ₺'; }
  function render() {
    if (!cats) return;
    cats.innerHTML = Object.keys(MENU).map(function (c) { return '<button type="button" class="' + (c === cur ? 'on' : '') + '" data-c="' + c + '">' + c + '</button>'; }).join('');
    items.innerHTML = MENU[cur].map(function (it) { return '<li><span>' + it[0] + '</span><b>' + tl(it[1]) + '</b></li>'; }).join('');
  }
  if (cats) {
    cats.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { cur = b.dataset.c; render(); } });
    render();
    var upd = $('#upd');
    upd.addEventListener('click', function () {
      var list = MENU[cur], i = Math.floor(Math.random() * list.length);
      list[i][1] += 5; render();
      var b = items.children[i].querySelector('b'); b.classList.add('flash');
      toast.classList.add('show'); setTimeout(function () { toast.classList.remove('show'); }, 2200);
    });
  }

  /* form -> WhatsApp */
  var f = $('#f'), ok = $('#ok');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!f.ad.value.trim() || !f.tel.value.trim()) { (f.ad.value.trim() ? f.tel : f.ad).focus(); return; }
    var msg = 'Merhaba, ben ' + f.ad.value.trim() + (f.isl.value.trim() ? ' (' + f.isl.value.trim() + ')' : '') + '. Telefonum ' + f.tel.value.trim() + '. İlgilendiğim hizmet: ' + f.hiz.value + '.' + (f.msg.value.trim() ? ' ' + f.msg.value.trim() : '');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    ok.classList.add('show');
  });
})();
