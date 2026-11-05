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
