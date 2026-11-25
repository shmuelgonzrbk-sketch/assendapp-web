(function () {
  var boton = document.querySelector('.abrir-menu');
  var menu = document.getElementById('menu');
  if (!boton || !menu) return;
  var movil = window.matchMedia('(max-width: 1080px)');
  var menosMov = window.matchMedia('(prefers-reduced-motion: reduce)');

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

  var items = [].slice.call(menu.querySelectorAll(':scope > a'));
  items.forEach(function (a, i) { a.style.setProperty('--i', i); });
  menu.setAttribute('aria-label', 'Principal');

  var fondo = function () { return [].slice.call(document.body.children).filter(function (n) { return n.tagName !== 'HEADER' && n !== velo && n.tagName !== 'SCRIPT'; }); };
  var abierto = false, cerrando = 0, yMenu = 0;

  function poner(abrir) {
    if (abrir === abierto) return;
    abierto = abrir;
    clearTimeout(cerrando);
    boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    boton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    if (abrir) {
      menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true');
      yMenu = window.scrollY; var bar = document.querySelector('.barra'); document.body.style.paddingTop = bar ? bar.offsetHeight + 'px' : ''; document.documentElement.classList.add('menu-bloqueo'); window.scrollTo(0, yMenu);
      fondo().forEach(function (n) { n.inert = true; });
      menu.classList.remove('cerrandose');
      menu.classList.add('abierto'); velo.classList.add('ver');
      setTimeout(function () { (menu.querySelector('a[aria-current="page"]') || items[0] || cerrar).focus({ preventScroll: true }); }, menosMov.matches ? 0 : 120);
    } else {
      menu.classList.add('cerrandose');
      menu.classList.remove('abierto'); velo.classList.remove('ver');
      fondo().forEach(function (n) { n.inert = false; });
      document.documentElement.classList.remove('menu-bloqueo'); document.body.style.paddingTop = ''; window.scrollTo(0, yMenu);
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

    var f = [].slice.call(menu.querySelectorAll('a[href], button')).filter(function (x) { return x.offsetParent !== null && x.tabIndex !== -1; });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });
  (movil.addEventListener ? movil.addEventListener.bind(movil, 'change') : movil.addListener.bind(movil))(function () { if (!movil.matches) poner(false); });
})();

(function () {
  var a = document.getElementById('anio');
  if (a) a.textContent = new Date().getFullYear();
})();

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

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach(function (v) { v.pause(); v.removeAttribute('autoplay'); });
}

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

(function () {
  var raiz = document.getElementById('demoNubi');
  if (!raiz) return;
  var cuerpo = document.getElementById('demoCuerpo'), entrada = document.getElementById('demoEntrada');
  var chips = document.getElementById('demoChips'), barra = raiz.querySelector('.dc-escribir');
  var menosMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

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
        entrada.textContent = 'Escríbele a Orby…'; barra.classList.remove('activa');
        cuerpo.appendChild(nodo('div', 'dc-msg yo', '')).textContent = ej.f;
        var fila = nodo('div', 'dc-fila', avatar() + '<span class="dc-pensando" aria-label="Orby está escribiendo"><i></i><i></i><i></i></span>');
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

  if ('IntersectionObserver' in window && !menosMov) {
    new IntersectionObserver(function (e, ob) { if (e[0].isIntersecting) { ob.disconnect(); mostrar(0); } }, { threshold: 0.45 }).observe(raiz);
  } else mostrar(0);
})();

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

setTimeout(function(){document.querySelectorAll('.movil:not(.con-3d)').forEach(function(m){m.classList.add('sin-3d');});},10000);

(function () {
  var grupos = [].slice.call(document.querySelectorAll('.menu-nav .menu-grupo'));
  if (!grupos.length) return;
  var escritorio = window.matchMedia('(min-width: 1081px)');
  function poner(g, abrir) {
    g.classList.toggle('abierto', abrir);
    g.querySelector('.menu-desp').setAttribute('aria-expanded', abrir ? 'true' : 'false');
  }
  function cerrarOtros(menos) { grupos.forEach(function (g) { if (g !== menos) poner(g, false); }); }
  grupos.forEach(function (g) {
    var b = g.querySelector('.menu-desp');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var abrir = !g.classList.contains('abierto');
      if (escritorio.matches) cerrarOtros(g);
      poner(g, abrir);
    });

    if (!escritorio.matches && g.querySelector('[aria-current="page"]')) poner(g, true);
  });
  document.addEventListener('click', function (e) { if (escritorio.matches && !e.target.closest('.menu-grupo')) cerrarOtros(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !escritorio.matches) return;
    var a = grupos.filter(function (g) { return g.classList.contains('abierto'); })[0];
    if (a) { poner(a, false); a.querySelector('.menu-desp').focus(); }
  });
  [].slice.call(document.querySelectorAll('#menu > a, #menu > .menu-grupo')).forEach(function (n, i) { n.style.setProperty('--i', i); });
})();

(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || document.querySelector('.co-orbita')) return;
  var calma = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;
  var punto = document.createElement('div'), orbita = document.createElement('div');
  punto.className = 'co-punto'; orbita.className = 'co-orbita';
  orbita.innerHTML = '<span class="co-giro"><i></i></span>';
  [punto, orbita].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); document.body.appendChild(n); });
  var x = -100, y = -100, ox = -100, oy = -100, vivo = false;
  var activo = 'a,button,summary,label,select,[role="button"],.sa-dia,.hd-atajo,.vd-marco';
  var nativo = 'input,textarea,select,[contenteditable],.maplibregl-canvas,.maplibregl-ctrl,.movil-3d,.movil-3d canvas';
  var oscuro = '.pie,.ia,.vd-modal,.btn.azul,.btn.play,.hd-btn,.barra';
  function seguir() {
    var k = calma ? 1 : 0.16;
    ox += (x - ox) * k; oy += (y - oy) * k;
    orbita.style.transform = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)';
    if (Math.abs(x - ox) > 0.1 || Math.abs(y - oy) > 0.1) requestAnimationFrame(seguir); else vivo = false;
  }
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    punto.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    html.classList.add('cursor-orby', 'co-ver');
    if (!vivo) { vivo = true; requestAnimationFrame(seguir); }
  }, { passive: true });
  document.addEventListener('pointerover', function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    html.classList.toggle('co-sobre', !!t.closest(activo));
    html.classList.toggle('co-nativo', !!t.closest(nativo));
    html.classList.toggle('co-claro', !!t.closest(oscuro) && !t.closest('.menu-sub'));
  });
  document.addEventListener('pointerdown', function () { html.classList.add('co-pulsa'); });
  document.addEventListener('pointerup', function () { html.classList.remove('co-pulsa'); });
  html.addEventListener('mouseleave', function () { html.classList.remove('co-ver'); });
  html.addEventListener('mouseenter', function () { html.classList.add('co-ver'); });
})();

(function () {
  var b = document.querySelector('.barra');
  if (!b) return;
  var f = function () { b.classList.toggle('con-sombra', window.scrollY > 8); };
  window.addEventListener('scroll', f, { passive: true }); f();
})();
(function () {
  var html = document.documentElement;
  var barra = document.querySelector('.barra .ancho');
  if (!barra || document.querySelector('.tema-btn')) return;
  var b = document.createElement('button');
  b.type = 'button'; b.className = 'tema-btn';
  b.innerHTML = '<svg class="t-sol" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg><svg class="t-luna" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z"/></svg>';
  var hamb = barra.querySelector('.abrir-menu');
  barra.insertBefore(b, hamb || null);
  var meta = document.querySelector('meta[name="theme-color"]');
  function poner(t, guardar, sinAnim) {
    if (!sinAnim) html.classList.add('tema-cambia');
    html.dataset.tema = t;
    var oscuro = t === 'oscuro';
    b.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    b.title = oscuro ? 'Modo claro' : 'Modo oscuro';
    b.setAttribute('aria-pressed', oscuro ? 'true' : 'false');
    if (meta) meta.setAttribute('content', oscuro ? '#0B1020' : '#FAF9F6');
    if (guardar) { try { localStorage.setItem('orby-tema', t); } catch (e) {} }
    setTimeout(function () { html.classList.remove('tema-cambia'); }, 400);
  }
  poner(html.dataset.tema === 'oscuro' ? 'oscuro' : 'claro', false);
  function ondas(x, y, t) {
    for (var i = 0; i < 3; i++) {
      var o = document.createElement('span');
      o.className = 'tema-onda' + (t === 'oscuro' ? ' noche' : '');
      o.style.left = x + 'px'; o.style.top = y + 'px'; o.style.animationDelay = (i * 150) + 'ms';
      o.setAttribute('aria-hidden', 'true');
      document.body.appendChild(o);
      o.addEventListener('animationend', function (e) { e.target.remove(); });
    }
  }
  b.addEventListener('click', function () {
    var nuevo = html.dataset.tema === 'oscuro' ? 'claro' : 'oscuro';
    var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { poner(nuevo, true); return; }
    if (!document.startViewTransition) { ondas(x, y, nuevo); poner(nuevo, true); return; }
    var radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(function () { poner(nuevo, true, true); ondas(x, y, nuevo); });
    vt.ready.then(function () {
      html.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radio + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 1000, easing: 'cubic-bezier(.22,.61,.36,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(function () {});
  });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var cambio = function (e) { var g = null; try { g = localStorage.getItem('orby-tema'); } catch (x) {} if (!g) poner(e.matches ? 'oscuro' : 'claro', false); };
  if (mq.addEventListener) mq.addEventListener('change', cambio); else if (mq.addListener) mq.addListener(cambio);
})();

(function () {
  var pie = document.querySelector('.pie');
  var navs = pie ? [].slice.call(pie.querySelectorAll('nav[aria-labelledby^="pie-"]')) : [];
  if (!navs.length) return;
  var mq = window.matchMedia('(max-width: 600px)');
  navs.forEach(function (nav, i) {
    var h = nav.querySelector('h2'), ul = nav.querySelector('ul');
    if (!h || !ul || h.querySelector('.pie-tog')) return;
    ul.id = ul.id || 'pie-lista-' + i;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'pie-tog'; b.setAttribute('aria-controls', ul.id);
    b.innerHTML = '<span>' + h.textContent + '</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>';
    h.textContent = ''; h.appendChild(b);
    b.addEventListener('click', function () {
      if (!mq.matches) return;
      b.setAttribute('aria-expanded', nav.classList.toggle('abierto'));
    });
  });
  function aplicar() {
    pie.classList.toggle('pie-plegable', mq.matches);
    navs.forEach(function (nav) {
      var b = nav.querySelector('.pie-tog'); if (!b) return;
      if (mq.matches) b.setAttribute('aria-expanded', nav.classList.contains('abierto'));
      else b.removeAttribute('aria-expanded');
    });
  }
  if (mq.addEventListener) mq.addEventListener('change', aplicar); else mq.addListener(aplicar);
  aplicar();
})();
(function () {
  var v = document.querySelector('.movil-pantalla video');
  if (!v) return;
  var base = v.currentSrc || (v.querySelector('source') || v).src || '';
  if (!base) return;
  var dia = base.replace('nubi-app-noche.mp4', 'nubi-app.mp4'), noche = dia.replace('nubi-app.mp4', 'nubi-app-noche.mp4');
  var pDia = v.poster, pNoche = pDia ? pDia.replace('nubi-app.jpg', 'nubi-app-noche.jpg') : '';
  var ok = true, prueba = document.createElement('video');
  prueba.preload = 'metadata'; prueba.muted = true;
  prueba.addEventListener('error', function () { ok = false; });
  prueba.src = noche;
  function aplicar() {
    if (document.querySelector('.movil.con-3d')) return;
    var quiero = document.documentElement.dataset.tema === 'oscuro' && ok ? noche : dia;
    if ((v.currentSrc || v.src) === quiero) return;
    var t = v.currentTime, sonaba = !v.paused;
    v.poster = quiero === noche && pNoche ? pNoche : pDia;
    v.src = quiero;
    v.addEventListener('loadedmetadata', function () { if (v.duration) v.currentTime = t % v.duration; if (sonaba) v.play().catch(function () {}); }, { once: true });
  }
  new MutationObserver(aplicar).observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema'] });
  prueba.addEventListener('loadedmetadata', aplicar, { once: true });
})();
