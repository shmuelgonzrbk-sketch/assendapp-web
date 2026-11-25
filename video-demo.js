(function () {
  'use strict';
  var sec = document.querySelector('.video-demo'), modal = document.querySelector('.vd-modal');
  if (!sec || !modal) return;
  var marco = sec.querySelector('.vd-marco'), corto = sec.querySelector('.vd-corto');
  var completo = modal.querySelector('.vd-completo'), falta = modal.querySelector('.vd-falta');
  var calma = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (corto && !calma && 'IntersectionObserver' in window) {
    corto.addEventListener('loadeddata', function () { marco.classList.add('con-video'); });
    corto.addEventListener('error', function () { marco.classList.remove('con-video'); }, true);
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (!corto.src) corto.src = corto.dataset.src;
          var p = corto.play(); if (p && p.catch) p.catch(function () {});
        } else if (corto.src) corto.pause();
      });
    }, { threshold: 0.35 }).observe(marco);
  }

  var hayCompleto = null;
  function preparar(cb) {
    if (hayCompleto !== null) return cb();
    completo.addEventListener('loadedmetadata', function () { hayCompleto = true; cb(); }, { once: true });
    completo.addEventListener('error', function () { hayCompleto = false; cb(); }, { once: true, capture: true });
    completo.src = completo.dataset.src;
    completo.load();
  }
  function abrir(t) {
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    document.documentElement.classList.add('vd-abierto');
    preparar(function () {
      falta.hidden = hayCompleto; completo.hidden = !hayCompleto;
      if (!hayCompleto) return;
      completo.currentTime = t || 0;
      var p = completo.play(); if (p && p.catch) p.catch(function () {});
    });
  }
  function cerrar() {
    completo.pause();
    if (modal.open && typeof modal.close === 'function') modal.close(); else modal.removeAttribute('open');
  }
  modal.addEventListener('close', function () { completo.pause(); document.documentElement.classList.remove('vd-abierto'); });
  modal.querySelector('.vd-cerrar').addEventListener('click', cerrar);
  modal.addEventListener('click', function (e) { if (e.target === modal) cerrar(); });
  sec.querySelectorAll('.vd-abrir, .vd-play').forEach(function (b) { b.addEventListener('click', function () { abrir(0); }); });
  sec.querySelectorAll('.vd-pasos button').forEach(function (b) {
    b.addEventListener('click', function () { abrir(+b.dataset.t || 0); });
  });
})();
