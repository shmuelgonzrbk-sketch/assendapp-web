// Menú móvil: panel con su cabecera, fondo oscurecido, foco atrapado y scroll del fondo bloqueado
(function () {
  var boton = document.querySelector('.abrir-menu');
  var menu = document.getElementById('menu');
  if (!boton || !menu) return;
  var movil = window.matchMedia('(max-width: 1080px)');
  var menosMov = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Cabecera del panel (logo + cerrar) y fondo, creados una sola vez
  var marca = document.querySelector('.barra .marca');
  var cab = document.createElement('div');
  cab.className = 'menu-cab';
  cab.innerHTML = (marca ? marca.outerHTML : '') +
    '<button class="menu-cerrar" type="button" aria-label="Cerrar menú"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>';
  var marcaPanel = cab.querySelector('.marca');
  if (marcaPanel) marcaPanel.setAttribute('tabindex', '-1');
  menu.insertBefore(cab, menu.firstChild);
  var cerrar = cab.querySelector('.menu-cerrar');
  var velo = document.createElement('div');
  velo.className = 'menu-velo'; velo.setAttribute('aria-hidden', 'true');
  (document.querySelector('.barra') || document.body).appendChild(velo);

  // Orden de aparición escalonada
  var items = [].slice.call(menu.querySelectorAll(':scope > a'));
  items.forEach(function (a, i) { a.style.setProperty('--i', i); });
  menu.setAttribute('aria-label', 'Principal');

  var fondo = function () { return [].slice.call(document.body.children).filter(function (n) { return n.tagName !== 'HEADER' && n !== velo && n.tagName !== 'SCRIPT'; }); };
  var abierto = false, cerrando = 0;

  function poner(abrir) {
    if (abrir === abierto) return;
    abierto = abrir;
    clearTimeout(cerrando);
    boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    if (abrir) {
      menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true');
      document.documentElement.classList.add('menu-bloqueo');
      fondo().forEach(function (n) { n.inert = true; });
      menu.classList.remove('cerrandose');
      menu.classList.add('abierto'); velo.classList.add('ver');
      setTimeout(function () { (menu.querySelector('a[aria-current="page"]') || items[0] || cerrar).focus({ preventScroll: true }); }, menosMov.matches ? 0 : 120);
    } else {
      menu.classList.add('cerrandose');
      menu.classList.remove('abierto'); velo.classList.remove('ver');
      fondo().forEach(function (n) { n.inert = false; });
      document.documentElement.classList.remove('menu-bloqueo');
      menu.removeAttribute('role'); menu.removeAttribute('aria-modal');
      cerrando = setTimeout(function () { menu.classList.remove('cerrandose'); }, 260);
      if (movil.matches) boton.focus({ preventScroll: true });
    }
  }

  boton.addEventListener('click', function () { poner(!abierto); });
  cerrar.addEventListener('click', function () { poner(false); });
  velo.addEventListener('click', function () { poner(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) poner(false); });
  document.addEventListener('keydown', function (e) {
    if (!abierto) return;
    if (e.key === 'Escape') { e.preventDefault(); poner(false); return; }
    if (e.key !== 'Tab') return;
    // Mantener el foco dentro del panel
    var f = [].slice.call(menu.querySelectorAll('a[href], button')).filter(function (x) { return x.offsetParent !== null && x.tabIndex !== -1; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  (movil.addEventListener ? movil.addEventListener.bind(movil, 'change') : movil.addListener.bind(movil))(function () { if (!movil.matches) poner(false); });
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

// "Una visión más clara de tu semana": la semana real de hoy, con actividades inventadas
(function () {
  var raiz = document.getElementById('semanaApp');
  if (!raiz) return;
  var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  var CORTO = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var PERSONAS = [['Ana Lucía Vargas', 'c'], ['Carmen Ruiz', 'c'], ['Miguel Flores', 'c'], ['Rosa Pérez', 'r'], ['Pedro Ramírez', 'r'],
                  ['María López', 'r'], ['José Mendoza', 'r'], ['Lucía Torres', 'r'], ['Elena Castro', 'r'], ['Julio Herrera', 'c']];
  var PARTES = ['Empiece conversaciones', 'Haga revisitas', 'Lectura de la Biblia', 'Haga discípulos', 'Explique sus creencias'];
  var HORAS = ['9:00 a. m.', '10:30 a. m.', '11:00 a. m.', '3:30 p. m.', '4:00 p. m.', '5:30 p. m.', '6:00 p. m.'];
  var COLOR = { c: ['#DDF3E6', '#2E9E5B'], r: ['#E3E7FB', '#4F5BD5'], a: ['#F3E7DA', '#9A6A2E'] };
  var PUNTO = { c: '#2E9E5B', r: '#4F5BD5', a: '#E0A21B' };

  // Números "al azar" pero siempre iguales para la misma fecha
  function semilla(d) { var s = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); return function () { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }

  function actividades(d, esHoy) {
    var r = semilla(d), dow = (d.getDay() + 6) % 7, lista = [];
    var n = esHoy ? 2 : (r() < 0.25 ? 0 : 1 + Math.floor(r() * 2));
    var usados = {};
    for (var i = 0; i < n; i++) {
      var p = PERSONAS[Math.floor(r() * PERSONAS.length)];
      if (usados[p[0]]) continue; usados[p[0]] = 1;
      var h = HORAS[Math.floor(r() * HORAS.length)];
      if (p[1] === 'c') lista.push({ k: 'c', t: p[0], s: 'Curso bíblico · ' + h + (r() > .5 ? ' · se repite' : ''), chip: ['Regular', '#E4E8F4', '#475170'] });
      else lista.push({ k: 'r', t: p[0], s: 'Revisita · ' + h, chip: r() > .5 ? ['Interesado', '#E2F4E8', '#1E8A4C'] : ['Pendiente', '#FDF0D9', '#B7791F'] });
    }
    // Las asignaciones caen el día de la reunión entre semana (aquí, jueves) cada dos semanas
    if (dow === 3 && r() > .35) lista.push({ k: 'a', t: PARTES[Math.floor(r() * PARTES.length)], s: 'Asignación · Sala principal · 7:00 p. m.', chip: ['Pendiente', '#FDF0D9', '#B7791F'] });
    return lista;
  }

  var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  var lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  var semana = [];
  for (var i = 0; i < 7; i++) { var d = new Date(lunes); d.setDate(lunes.getDate() + i); semana.push({ d: d, hoy: d.getTime() === hoy.getTime() }); }
  semana.forEach(function (x) { x.act = actividades(x.d, x.hoy); });

  var dom = semana[6].d;
  document.getElementById('saRango').textContent = lunes.getDate() + ' ' + MESES[lunes.getMonth()] + ' — ' + dom.getDate() + ' ' + MESES[dom.getMonth()];

  var cajaDias = document.getElementById('saDias'), lista = document.getElementById('saLista');
  var titulo = document.getElementById('saTitulo'), cuenta = document.getElementById('saCuenta');
  var ICONO_A = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>';
  var FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  semana.forEach(function (x, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'sa-dia' + (x.hoy ? ' hoy' : '');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', DIAS[i] + ' ' + x.d.getDate() + (x.act.length ? ', ' + x.act.length + ' actividades' : ', sin actividades'));
    var puntos = x.act.slice(0, 3).map(function (a) { return '<span style="background:' + PUNTO[a.k] + '"></span>'; }).join('');
    b.innerHTML = '<small>' + CORTO[i] + '</small><b>' + x.d.getDate() + '</b><i>' + puntos + '</i>';
    b.addEventListener('click', function () { elegir(i, true); });
    b.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (j >= 0 && j < 7) { e.preventDefault(); elegir(j, true); cajaDias.children[j].focus(); }
    });
    cajaDias.appendChild(b);
  });

  function elegir(i, animar) {
    var x = semana[i];
    [].forEach.call(cajaDias.children, function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; });
    titulo.textContent = x.hoy ? 'Actividades de hoy' : 'Actividades del ' + DIAS[i] + ' ' + x.d.getDate();
    cuenta.textContent = x.act.length;
    lista.innerHTML = x.act.length ? x.act.map(function (a) {
      var c = COLOR[a.k];
      var av = a.k === 'a' ? ICONO_A : esc(a.t[0]);
      return '<div class="sa-fila"><span class="sa-av" style="background:' + c[0] + ';color:' + c[1] + '">' + av + '</span>' +
        '<div><b>' + esc(a.t) + '</b><small>' + esc(a.s) + '</small></div>' +
        '<span class="sa-chip" style="background:' + a.chip[1] + ';color:' + a.chip[2] + '">' + a.chip[0] + '</span>' + FLECHA + '</div>';
    }).join('') : '<div class="sa-vacio"><b>Día libre</b>No tienes visitas ni asignaciones.</div>';
    if (animar) { lista.classList.remove('cambia'); void lista.offsetWidth; lista.classList.add('cambia'); }
  }
  elegir(semana.findIndex(function (x) { return x.hoy; }), false);
})();
