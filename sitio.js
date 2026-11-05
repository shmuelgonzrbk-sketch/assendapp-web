// Menú móvil
(function () {
  var boton = document.querySelector('.abrir-menu');
  var menu = document.getElementById('menu');
  if (!boton || !menu) return;
  function poner(abierto) {
    boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('abierto', abierto);
  }
  boton.addEventListener('click', function () { poner(boton.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('abierto')) { poner(false); boton.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('abierto') && !menu.contains(e.target) && !boton.contains(e.target)) poner(false);
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) poner(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1080) poner(false); });
})();

// Año del pie
(function () {
  var a = document.getElementById('anio');
  if (a) a.textContent = new Date().getFullYear();
})();

// La conversación de la portada aparece una vez al cargar
(function () {
  var chat = document.getElementById('chat');
  if (!chat || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var pasos = Array.prototype.slice.call(chat.querySelectorAll('[data-paso]'));
  pasos.forEach(function (p) { p.classList.add('oculto'); });
  var i = 0;
  function siguiente() {
    if (i >= pasos.length) return;
    var p = pasos[i++];
    var deNubi = !p.classList.contains('yo');
    if (deNubi && !p.classList.contains('botones-chat')) {
      var puntos = document.createElement('div');
      puntos.className = 'escribiendo';
      puntos.setAttribute('aria-hidden', 'true');
      puntos.innerHTML = '<i></i><i></i><i></i>';
      chat.insertBefore(puntos, p);
      setTimeout(function () { puntos.remove(); p.classList.remove('oculto'); setTimeout(siguiente, 700); }, 850);
    } else {
      p.classList.remove('oculto');
      setTimeout(siguiente, p.classList.contains('yo') ? 500 : 900);
    }
  }
  setTimeout(siguiente, 600);
})();

// Si la persona pidió menos movimiento, el video queda quieto
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach(function (v) { v.pause(); v.removeAttribute('autoplay'); });
}

// La tarjeta de "Cada persona" se despliega sola al llegar a ella
(function () {
  var f = document.getElementById('fichaApp');
  if (!f) return;
  var boton = f.querySelector('.fa-cab');
  function poner(abierta) { f.classList.toggle('cerrada', !abierta); boton.setAttribute('aria-expanded', abierta ? 'true' : 'false'); }
  boton.addEventListener('click', function () { poner(f.classList.contains('cerrada')); });
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  poner(false);
  new IntersectionObserver(function (e, ob) {
    if (e[0].isIntersecting) { setTimeout(function () { poner(true); }, 350); ob.disconnect(); }
  }, { threshold: 0.6 }).observe(f);
})();

// La meta de "Tus horas" se llena al llegar a ella
(function () {
  var m = document.getElementById('metaApp');
  if (!m || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var horas = document.getElementById('maHoras'), p1 = document.getElementById('maPct1'), p2 = document.getElementById('maPct2');
  m.classList.add('en-cero'); horas.textContent = '0'; p1.textContent = p2.textContent = '0%';
  new IntersectionObserver(function (e, ob) {
    if (!e[0].isIntersecting) return;
    ob.disconnect();
    setTimeout(function () {
      m.classList.remove('en-cero');
      var t0 = performance.now(), dur = 1400;
      (function paso(t) {
        var k = Math.min(1, (t - t0) / dur), s = 1 - Math.pow(1 - k, 3);
        horas.textContent = Math.round(8 * s);
        p1.textContent = p2.textContent = Math.round(16 * s) + '%';
        if (k < 1) requestAnimationFrame(paso);
      })(t0);
    }, 250);
  }, { threshold: 0.6 }).observe(m);
})();
