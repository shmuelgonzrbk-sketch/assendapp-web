(function () {
  'use strict';
  var html = document.documentElement;
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducir || !('IntersectionObserver' in window) || !document.querySelector('.portada')) return;

  var escritorio = window.matchMedia('(min-width: 1024px)').matches;
  var movil = window.matchMedia('(max-width: 600px)').matches;
  var PASO = movil ? 60 : 85;
  var MAX_ESCALON = movil ? 5 : 9;
  var DUR = movil ? 520 : 760;

  function tipo(t) {
    if (!movil) return t;
    return { mask: 'up', clip: 'fade', right: 'up', depth: 'up', scale: 'scale' }[t] || t;
  }
  function $$(raiz, sel) { return raiz ? [].slice.call(raiz.querySelectorAll(sel)) : []; }

  function marcar(lista, t, desde) {
    var i = desde || 0;
    lista.forEach(function (el) {
      if (!el || el.dataset.m) return;
      el.dataset.m = tipo(t);
      el.style.setProperty('--m-i', Math.min(i, MAX_ESCALON));
      i++;
    });
    return i;
  }

  function texto(sec, i) {
    i = marcar($$(sec, '.pega'), 'up', i || 0);
    i = marcar($$(sec, 'h2'), 'mask', i);
    i = marcar($$(sec, '.lead'), 'up', i);
    i = marcar($$(sec, '.puntos > li'), 'up', i);
    i = marcar($$(sec, '.texto > .acciones, .texto .enlace-flecha'), 'up', i);
    return i;
  }

  var secciones = [];
  function seccion(sel, preparar, alEntrar) {
    var s = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!s || s.dataset.mSec) return;
    s.dataset.mSec = '1';
    preparar(s);
    secciones.push({ el: s, alEntrar: alEntrar });
  }
  function bloqueCon(sel) { var e = document.querySelector(sel); return e && e.closest('section'); }

  seccion('.portada', function (s) {
    var col = s.querySelector('.ancho > div:first-child');
    var i = marcar($$(col, '.pega'), 'up', 0);
    i = marcar($$(col, 'h1'), 'up', i);
    i = marcar($$(col, '.lead'), 'up', i);
    i = marcar($$(col, '.acciones'), 'up', i);
    i = marcar($$(col, '.confianza'), 'up', i);
    marcar($$(s, '.escena > .movil'), 'right', i);
    marcar($$(s, '.escena > .fondo, .escena > .orbitas, .escena > .chispa'), 'fade', i + 2);
  });

  seccion('.video-demo', function (s) {
    var i = texto(s);
    i = marcar($$(s, '.vd-pasos > li'), 'up', i);
    marcar($$(s, '.vd-abrir'), 'up', i);
    marcar($$(s, '.vd-marco'), 'depth', 2);
  });

  seccion('.intro-mod', function (s) { var i = texto(s); marcar($$(s, '.pegatinas'), 'up', i); });

  seccion(bloqueCon('#fichaApp'), function (s) {
    var i = texto(s);
    i = marcar($$(s, '.ficha-app'), 'depth', i);
    marcar($$(s, '.fa-datos > div, .fa-aviso, .fa-botones'), 'up', i + 2);
  });

  seccion(bloqueCon('#horasDemo'), function (s) {
    var i = texto(s);
    var tarjetas = $$(s, '.hd-card');
    tarjetas.forEach(function (c, k) {
      marcar([c], 'depth', i + k * 3);
      marcar($$(c, '.hd-falta, .hd-semana, .hd-hoy, .hd-atajos, .hd-nota'), 'up', i + k * 3 + 1);
    });
  }, function (s) { contarHoras(s); });

  seccion(bloqueCon('.asig-demo'), function (s) {
    var i = texto(s);
    i = marcar($$(s, '.asig-noti'), 'scale', i);
    i = marcar($$(s, '.asig-card'), 'up', i);
    marcar($$(s, '.asig-card li, .asig-rec'), 'up', i);
  });

  seccion(bloqueCon('#mapaDemo'), function (s) {
    var i = texto(s);
    var caja = document.getElementById('mapaDemo');
    marcar([caja.closest('.dibujo') || caja], 'clip', i);
  });

  seccion(bloqueCon('#semanaApp'), function (s) {
    var i = texto(s);
    i = marcar($$(s, '.semana-app'), 'up', i);
    i = marcar($$(s, '.sa-cab, .sa-rango'), 'fade', i);
    s.classList.add('m-cal');
  });

  seccion(bloqueCon('.avisos'), function (s) { texto(s); });

  seccion('.privada', function (s) {
    var i = marcar($$(s, 'h2'), 'mask', 0);
    i = marcar($$(s, '.lead'), 'up', i);
    i = marcar($$(s, '.dibujo-orby'), 'scale', i);
    i = marcar($$(s, '.hechos > li'), 'up', i);
    marcar($$(s, '.acciones'), 'up', i);
  });

  seccion('.preguntas', function (s) {
    var i = marcar($$(s, '.pega'), 'up', 0);
    i = marcar($$(s, 'h2'), 'mask', i);
    i = marcar($$(s, '.fq-intro .lead, .fq-intro .enlace-flecha'), 'up', i);
    i = marcar($$(s, '.fq-lista > details'), 'up', i);
    marcar($$(s, '.fq-ayuda'), 'up', i);
  });

  seccion('.final', function (s) {
    marcar($$(s, '.panel'), 'scale', 0);
    var i = marcar($$(s, 'h2'), 'mask', 1);
    i = marcar($$(s, '.lead, .acciones'), 'up', i);
    marcar($$(s, '.nubi-final'), 'scale', i);
  });
  seccion('.pie', function (s) { marcar([s.querySelector('.ancho') || s], 'fade', 0); });

  html.classList.add('m-on');
  function entrar(reg) {
    var s = reg.el;
    if (s.classList.contains('m-in')) return;
    s.classList.add('m-in', 'm-anim');
    if (reg.alEntrar) reg.alEntrar(s);

    var mayor = 0;
    $$(s, '[data-m]').forEach(function (e) { mayor = Math.max(mayor, +e.style.getPropertyValue('--m-i') || 0); });
    setTimeout(function () { s.classList.remove('m-anim'); }, mayor * PASO + DUR + 900);
  }
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      if (!e.isIntersecting) return;
      var reg = secciones.filter(function (r) { return r.el === e.target; })[0];
      obs.unobserve(e.target);
      if (reg) entrar(reg);
    });
  }, { threshold: movil ? 0.08 : 0.16, rootMargin: '0px 0px -10% 0px' });
  secciones.forEach(function (r) { if (r.el.classList.contains('portada')) entrar(r); else obs.observe(r.el); });

  function revisar() {
    secciones.forEach(function (r) {
      if (r.el.classList.contains('m-in')) return;
      var b = r.el.getBoundingClientRect();
      if (b.top < innerHeight && b.bottom > 0) entrar(r);
    });
  }
  window.addEventListener('hashchange', function () { setTimeout(revisar, 60); });
  setTimeout(revisar, 1500);

  function contarHoras(s) {
    var el = s.querySelector('#hdTotal');
    if (!el) return;
    var final = el.textContent.trim(), valor = parseFloat(final.replace(',', '.'));
    if (!isFinite(valor) || valor <= 0) return;
    var t0 = 0, escrito = '';
    function paso(t) {
      if (!t0) t0 = t;
      if (escrito && el.textContent !== escrito) return;
      var k = Math.min(1, (t - t0) / 1300), v = valor * (1 - Math.pow(1 - k, 3));
      escrito = k < 1 ? String(Math.round(v * 2) / 2).replace('.5', ',5') : final;
      el.textContent = escrito;
      if (k < 1) requestAnimationFrame(paso);
    }
    setTimeout(function () { el.textContent = escrito = '0'; requestAnimationFrame(paso); }, 200);
  }

  if (escritorio) {
    var bloqueFicha = bloqueCon('#fichaApp');
    if (bloqueFicha) {
      var ajustar = function () {
        var t = bloqueFicha.querySelector('.texto'), d = bloqueFicha.querySelector('.dibujo');
        if (!t || !d) return;
        bloqueFicha.classList.remove('m-pega-texto', 'm-pega-dibujo');
        var dif = t.offsetHeight - d.offsetHeight;
        if (Math.abs(dif) > 40) bloqueFicha.classList.add(dif > 0 ? 'm-pega-dibujo' : 'm-pega-texto');
      };
      setTimeout(ajustar, 600); setTimeout(ajustar, 2500);
      window.addEventListener('load', ajustar);
      window.addEventListener('resize', function () { clearTimeout(ajustar.t); ajustar.t = setTimeout(ajustar, 200); });
      document.getElementById('fichaApp').addEventListener('transitionend', ajustar);
    }
  }

  if (escritorio) {
    var capas = [
      { el: document.querySelector('.portada .escena > .movil'), f: -0.05 },
      { el: document.querySelector('.portada .escena > .fondo'), f: 0.04 },
      { el: document.querySelector('.portada .escena > .orbitas'), f: 0.07 },
      { el: document.querySelector('.privada .dibujo-orby'), f: -0.04, rel: true }
    ].filter(function (c) { return c.el; });
    var visibles = new Set(), pendiente = false;
    var vigia = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target); });
      pedir();
    });
    capas.forEach(function (c) { vigia.observe(c.el); });
    function pintar() {
      pendiente = false;
      var y = window.scrollY;
      capas.forEach(function (c) {
        if (!visibles.has(c.el)) return;
        var base = y;
        if (c.rel) { var b = c.el.getBoundingClientRect(); base = (b.top + b.height / 2) - innerHeight / 2; }
        var d = Math.max(-40, Math.min(40, base * c.f));
        c.el.style.translate = '0 ' + d.toFixed(1) + 'px';
      });
    }
    function pedir() { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }
    window.addEventListener('scroll', pedir, { passive: true });
  }
})();
