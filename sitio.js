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

// «Prueba a decirle»: demostración de conversación (respuestas de ejemplo, sin IA real)
(function () {
  var raiz = document.getElementById('demoNubi');
  if (!raiz) return;
  var cuerpo = document.getElementById('demoCuerpo'), entrada = document.getElementById('demoEntrada');
  var chips = document.getElementById('demoChips'), barra = raiz.querySelector('.dc-escribir');
  var menosMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  // a: acciones comprendidas [texto, tipo] · tipo: '' hecho, 'dato' detalle, 'falta' le falta un dato
  var EJ = [
    { f: 'Conocí a Rosa en el mercado, vuelvo el viernes a las 4',
      r: 'Listo, guardé a Rosa en tus revisitas. La visitas el viernes a las 4:00 p. m. y te aviso antes.',
      a: [['Persona nueva: Rosa', ''], ['Revisita', 'dato'], ['Vie 4:00 p. m.', 'dato'], ['Aviso antes', 'dato']], b: ['Deshacer'] },
    { f: 'Hoy hice 2 horas y media',
      r: 'Anotado: 2 h 30 min hoy. Llevas 10 h 30 min este mes y te faltan 39 h 30 min para tu meta.',
      a: [['Horas: +2 h 30 min', ''], ['Hoy', 'dato'], ['Meta al 21 %', 'dato']], b: ['Deshacer'] },
    { f: 'Tengo lectura de la Biblia el jueves',
      r: 'Agregué tu lectura de la Biblia para el jueves a las 7:00 p. m. ¿Qué pasaje te tocó?',
      a: [['Asignación nueva', ''], ['Lectura de la Biblia', 'dato'], ['Jue 7:00 p. m.', 'dato'], ['Falta el pasaje', 'falta']] },
    { f: '¿A quién me toca visitar?',
      r: 'Esta semana tienes 3 visitas:\n· Rosa Pérez, viernes 4:00 p. m.\n· José Mendoza, sábado 10:30 a. m.\n· Miguel Flores, se te pasó el lunes',
      a: [['Consulté tu agenda', ''], ['3 visitas', 'dato'], ['1 atrasada', 'falta']] },
    { f: 'Cambia la visita de Rosa al sábado a las 5',
      r: 'Listo, pasé la visita de Rosa al sábado a las 5:00 p. m. También moví su aviso.',
      a: [['Visita movida', ''], ['Rosa Pérez', 'dato'], ['Sáb 5:00 p. m.', 'dato']], b: ['Deshacer'] },
    { f: 'Ayúdame con un horario, trabajo de lunes a viernes de 8 a 1',
      r: 'Te propongo esto para llegar a tu meta:\n· Lunes, miércoles y viernes, 3:00 a 5:00 p. m.\n· Sábado, 9:00 a. m. a 12:00 p. m.\nSon 9 h por semana.',
      a: [['Horario propuesto', ''], ['Respeta tu trabajo', 'dato'], ['9 h por semana', 'dato']], b: ['Aplicar a Mi Horario', 'Más horas'] },
    { f: 'Pásame el contacto de Pedro',
      r: 'Aquí tienes a Pedro Ramírez:',
      a: [['Contacto encontrado', ''], ['Pedro Ramírez', 'dato']], b: ['Llamar', 'WhatsApp', 'Cómo llegar', 'Compartir'] },
    { f: 'Fui donde María pero no estaba',
      r: 'Anoté en el historial de María que hoy no estaba. ¿Quieres programar otra visita?',
      a: [['Visita anotada', ''], ['María López', 'dato'], ['No estaba', 'falta']], b: ['Programar visita'] },
  ];

  var turno = 0, tiempos = [];
  function esperar(ms) { return new Promise(function (ok) { tiempos.push(setTimeout(ok, menosMov ? 0 : ms)); }); }
  function nodo(tag, cls, html) { var e = document.createElement(tag); e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function avatar() { return '<svg class="dc-av" viewBox="0 0 120 120" aria-hidden="true"><use href="#nubi"/></svg>'; }

  function mostrar(i) {
    var mio = ++turno, ej = EJ[i];
    tiempos.forEach(clearTimeout); tiempos = [];
    [].forEach.call(chips.children, function (c, k) { c.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    cuerpo.classList.add('saliendo');
    esperar(170).then(function () {
      if (mio !== turno) return;
      cuerpo.innerHTML = ''; cuerpo.classList.remove('saliendo');
      // Se escribe la frase en la barra y se envía
      barra.classList.add('activa');
      var n = 0, paso = function () {
        if (mio !== turno) return;
        n += 2; entrada.textContent = ej.f.slice(0, n);
        if (n < ej.f.length && !menosMov) tiempos.push(setTimeout(paso, 16)); else enviar();
      };
      paso();
    });
    function enviar() {
      esperar(160).then(function () {
        if (mio !== turno) return;
        entrada.textContent = 'Escríbele a Nubi…'; barra.classList.remove('activa');
        cuerpo.appendChild(nodo('div', 'dc-msg yo', '')).textContent = ej.f;
        var fila = nodo('div', 'dc-fila', avatar() + '<span class="dc-pensando" aria-label="Nubi está escribiendo"><i></i><i></i><i></i></span>');
        return esperar(260).then(function () { if (mio === turno) cuerpo.appendChild(fila); return esperar(750); }).then(function () {
          if (mio !== turno) return;
          fila.innerHTML = avatar();
          fila.appendChild(nodo('div', 'dc-msg el', '')).textContent = ej.r;
          var acc = nodo('div', 'dc-acciones', '');
          ej.a.forEach(function (x, k) {
            var s = nodo('span', 'dc-acc ' + x[1], (x[1] ? '' : OK) + '');
            s.appendChild(document.createTextNode(x[0])); s.style.animationDelay = (0.25 + k * 0.08) + 's'; acc.appendChild(s);
          });
          cuerpo.appendChild(acc);
          if (ej.b) {
            var bt = nodo('div', 'dc-botones', '');
            ej.b.forEach(function (x, k) { var s = nodo('span', k === 0 ? 'prin' : '', ''); s.textContent = x; s.style.animationDelay = (0.45 + k * 0.06) + 's'; bt.appendChild(s); });
            cuerpo.appendChild(bt);
          }
        });
      });
    }
  }

  EJ.forEach(function (ej, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'dc-chip'; b.textContent = '«' + ej.f + '»';
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () { mostrar(i); });
    chips.appendChild(b);
  });

  // El primer ejemplo se reproduce solo al llegar a la sección
  if ('IntersectionObserver' in window && !menosMov) {
    new IntersectionObserver(function (e, ob) { if (e[0].isIntersecting) { ob.disconnect(); mostrar(0); } }, { threshold: 0.45 }).observe(raiz);
  } else mostrar(0);
})();

// Índice de las páginas legales: muestra la sección actual y se cierra al elegir
(function () {
  var ind = document.querySelector('.legal .indice-movil');
  if (!ind) return;
  var sum = ind.querySelector('summary');
  var actual = document.createElement('span'); actual.className = 'actual'; sum.appendChild(actual);
  var links = [].slice.call(ind.querySelectorAll('a[href^="#"]'));
  links.forEach(function (a) { a.addEventListener('click', function () { ind.open = false; }); });
  document.addEventListener('click', function (e) { if (ind.open && !ind.contains(e.target)) ind.open = false; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ind.open) { ind.open = false; sum.focus(); } });
  var secciones = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  function marcar() {
    var y = window.scrollY + 170, k = 0;
    secciones.forEach(function (s, i) { if (s.offsetTop <= y) k = i; });
    links.forEach(function (a, i) { a.classList.toggle('activo', i === k); });
    actual.textContent = links[k] ? links[k].textContent : '';
  }
  window.addEventListener('scroll', marcar, { passive: true }); marcar();
})();
