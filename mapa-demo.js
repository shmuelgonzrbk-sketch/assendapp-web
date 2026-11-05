// Mapa de demostración de la portada: calles reales (OpenFreeMap, igual que la app),
// personas inventadas alrededor de donde está quien visita la página.
// La ubicación solo se usa aquí, en el navegador, para centrar el mapa.

const caja = document.getElementById('mapaDemo');
if (caja) {
  new IntersectionObserver((e, ob) => {
    if (!e[0].isIntersecting) return;
    ob.disconnect();
    cargar().then(iniciar).catch((err) => { caja.classList.add('sin-mapa'); console.warn('Mapa de demostración no disponible:', err); });
    setTimeout(() => { if (!caja.classList.contains('mapa-listo')) caja.classList.add('sin-mapa'); }, 15000);
  }, { rootMargin: '3000px' }).observe(caja);
}

const ESTILO = window.NUBI_ESTILO_MAPA || 'https://tiles.openfreemap.org/styles/liberty';
const RESPALDO = [-79.0288, -8.1116];          // Trujillo, si no hay permiso de ubicación
const menosMov = matchMedia('(prefers-reduced-motion: reduce)').matches;

const PERSONAS = [
  { n: 'Rosa Pérez', t: 'revisita', c: '#E4572E', tema: '¿Por qué existe el sufrimiento?', prox: 'Hoy, 6:00 p. m.', tel: '999 111 201' },
  { n: 'Pedro Ramírez', t: 'revisita', c: '#2E8B57', tema: 'El Reino de Dios', prox: 'Mañana, 10:30 a. m.', tel: '999 111 202' },
  { n: 'María López', t: 'revisita', c: '#4F5BD5', tema: 'La familia feliz', prox: 'Sábado, 4:00 p. m.', tel: '999 111 204' },
  { n: 'José Mendoza', t: 'revisita', c: '#D9A21B', tema: 'La esperanza del futuro', prox: 'Lunes, 7:00 p. m.', tel: '999 111 206' },
  { n: 'Lucía Torres', t: 'revisita', c: '#C0392B', tema: 'El propósito de la vida', prox: 'Viernes, 11:00 a. m.', tel: '999 111 207' },
  { n: 'Ana Lucía Vargas', t: 'estudio', c: '#8E44AD', tema: 'Lección 27', prox: 'Hoy, 11:00 a. m.', tel: '999 111 203', prog: 'Lección 27 de 60' },
  { n: 'Carmen Ruiz', t: 'estudio', c: '#D35454', tema: 'Lección 14', prox: 'Domingo, 10:00 a. m.', tel: '999 111 205', prog: 'Lección 14 de 60' },
  { n: 'Miguel Flores', t: 'estudio', c: '#16A085', tema: 'Lección 8', prox: 'Miércoles, 5:30 p. m.', tel: '999 111 208', prog: 'Lección 8 de 60' },
];

function cargar() {
  if (window.maplibregl) return Promise.resolve();
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = '/vendor/maplibre-gl.css';
  document.head.appendChild(css);
  return new Promise((ok, mal) => {
    const s = document.createElement('script'); s.src = '/vendor/maplibre-gl.js';
    s.onload = ok; s.onerror = mal; document.head.appendChild(s);
  });
}

function hayWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

const PIN = (color, letra, estrella) => `
  <svg viewBox="0 0 40 52" aria-hidden="true"><ellipse cx="20" cy="49" rx="7" ry="2.6" fill="rgba(0,0,0,.25)"/>
  <path d="M20 47C17 40 4 32 4 19a16 16 0 1 1 32 0c0 13-13 21-16 28z" fill="${color}" stroke="#fff" stroke-width="2.5"/>
  <text x="20" y="25" text-anchor="middle" font-family="Manrope,Roboto,sans-serif" font-weight="800" font-size="15" fill="#fff">${letra}</text>
  ${estrella ? '<g transform="translate(31,7)"><circle r="7" fill="#F2C94C" stroke="#fff" stroke-width="2"/><path d="M0-3.8l1.1 2.3 2.5.4-1.8 1.7.4 2.5L0 1.9-2.2 3.1l.4-2.5L-3.6-1.1l2.5-.4z" fill="#7a5a00"/></g>' : ''}</svg>`;

const NUBI = `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="12" y="22" width="96" height="88" rx="22" fill="#fff"/><path d="M12 46v-2a22 22 0 0 1 22-22h52a22 22 0 0 1 22 22v2z" fill="#315CF5"/><path d="M12 46h96" stroke="#171717" stroke-width="6"/><rect x="12" y="22" width="96" height="88" rx="22" fill="none" stroke="#171717" stroke-width="6"/><rect x="33" y="8" width="13" height="27" rx="6.5" fill="#fff" stroke="#171717" stroke-width="6"/><rect x="74" y="8" width="13" height="27" rx="6.5" fill="#fff" stroke="#171717" stroke-width="6"/><ellipse cx="44" cy="66" rx="6.5" ry="8" fill="#171717"/><ellipse cx="76" cy="66" rx="6.5" ry="8" fill="#171717"/><path d="M50 78q10 10 20 0" fill="none" stroke="#171717" stroke-width="5" stroke-linecap="round"/></svg>`;

function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function iniciar() {
  if (!hayWebGL() || !window.maplibregl) { caja.classList.add('sin-mapa'); return; }
  const ml = window.maplibregl;

  // ── Estructura dentro de la tarjeta ──
  caja.classList.add('con-mapa');
  const marco = el('div', 'md-marco');
  marco.innerHTML = `
    <div class="md-mapa" role="region" aria-label="Mapa de demostración con personas inventadas"></div>
    <div class="md-filtros" role="group" aria-label="Filtrar personas">
      <button type="button" data-f="todos" aria-pressed="true">Todos <b>8</b></button>
      <button type="button" data-f="revisita" aria-pressed="false">Revisitas <b>5</b></button>
      <button type="button" data-f="estudio" aria-pressed="false">Cursos <b>3</b></button>
    </div>
    <div class="md-zoom"><button type="button" data-z="1" aria-label="Acercar">+</button><button type="button" data-z="-1" aria-label="Alejar">−</button></div>
    <button class="md-yo" type="button" aria-label="Ir a mi ubicación"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg></button>
    <p class="md-pista">Arrastra para moverte y pellizca para acercar. Toca un pin para ver a la persona o un punto para agregar a alguien.</p>
    <div class="md-ficha" hidden></div>
    <p class="md-aviso" hidden></p>`;
  caja.appendChild(marco);
  const nodoMapa = marco.querySelector('.md-mapa');
  const ficha = marco.querySelector('.md-ficha');
  const aviso = marco.querySelector('.md-aviso');
  const pista = marco.querySelector('.md-pista');

  const map = new ml.Map({
    container: nodoMapa, style: ESTILO, center: RESPALDO, zoom: 14.6,
    attributionControl: false, cooperativeGestures: false, pitchWithRotate: false, dragRotate: false,
    fadeDuration: menosMov ? 0 : 300,
    locale: {
      'CooperativeGesturesHandler.WindowsHelpText': 'Usa Ctrl + rueda del mouse para acercar el mapa',
      'CooperativeGesturesHandler.MacHelpText': 'Usa ⌘ + rueda para acercar el mapa',
      'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
    },
  });
  map.addControl(new ml.AttributionControl({ compact: true }), 'bottom-left');
  map.touchZoomRotate.disableRotation();
  // En la PC la rueda sigue bajando la página; con Ctrl (o el gesto de pellizcar del trackpad) acerca el mapa
  map.scrollZoom.disable();
  nodoMapa.addEventListener('wheel', (e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    map.zoomTo(map.getZoom() - e.deltaY * 0.01, { duration: 0, around: map.unproject([e.offsetX, e.offsetY]) });
  }, { passive: false });

  let centro = RESPALDO, marcadorYo = null, nuevo = null, personas = [], filtro = 'todos';
  const ir = (o) => (menosMov ? map.jumpTo(o) : map.easeTo({ ...o, duration: 700 }));

  // ── Nombres de calles reales a partir de lo que ya está dibujado ──
  function calles() {
    const fs = map.queryRenderedFeatures();
    const out = [];
    for (const f of fs) {
      const nombre = f.properties && (f.properties['name:es'] || f.properties.name);
      const g = f.geometry;
      if (!nombre || !g || !/LineString/.test(g.type)) continue;
      if (f.sourceLayer && !/transportation/.test(f.sourceLayer)) continue;
      const lineas = g.type === 'LineString' ? [g.coordinates] : g.coordinates;
      for (const l of lineas) for (const p of l) out.push({ p, nombre });
    }
    return out;
  }
  function masCercana(lista, lng, lat, usados = []) {
    let mejor = null, d = Infinity;
    for (const c of lista) {
      if (usados.some((u) => Math.abs(u[0] - c.p[0]) < 0.0012 && Math.abs(u[1] - c.p[1]) < 0.0012)) continue;
      const dx = (c.p[0] - lng) * Math.cos(lat * Math.PI / 180), dy = c.p[1] - lat, dd = dx * dx + dy * dy;
      if (dd < d) { d = dd; mejor = c; }
    }
    return mejor;
  }
  const numero = () => 100 + Math.floor(Math.random() * 14) * 100 + Math.floor(Math.random() * 90);
  function direccion(lng, lat, lista = calles()) {
    const c = masCercana(lista, lng, lat);
    return c ? `${c.nombre} ${numero()}` : 'Cerca de aquí';
  }

  // ── Marcadores ──
  function ponerYo(lngLat) {
    if (marcadorYo) { marcadorYo.setLngLat(lngLat); return; }
    const e = el('div', 'md-nubi', `<span class="halo"></span>${NUBI}`);
    e.setAttribute('aria-label', 'Tu ubicación');
    marcadorYo = new ml.Marker({ element: e, anchor: 'center' }).setLngLat(lngLat).addTo(map);
    e.setAttribute('aria-label', 'Tu ubicación');
  }

  function crearPersonas() {
    personas.forEach((p) => p.m.remove());
    const lista = calles(), usados = [];
    personas = PERSONAS.map((d, i) => {
      // Alrededor del centro, entre 150 y 900 m, repartidas en círculo
      const ang = (i / PERSONAS.length) * Math.PI * 2 + Math.random() * 0.6;
      const dist = (180 + Math.random() * 520) / 111320;
      let lng = centro[0] + Math.cos(ang) * dist / Math.cos(centro[1] * Math.PI / 180), lat = centro[1] + Math.sin(ang) * dist;
      const c = masCercana(lista, lng, lat, usados);
      if (c) { lng = c.p[0]; lat = c.p[1]; }
      usados.push([lng, lat]);
      const dir = c ? `${c.nombre} ${numero()}` : 'Cerca de aquí';
      const e = el('button', 'md-pin', PIN(d.c, d.n[0], d.t === 'estudio'));
      e.type = 'button'; e.setAttribute('aria-label', `${d.n}, ${d.t === 'estudio' ? 'curso bíblico' : 'revisita'}`);
      if (!menosMov) e.firstElementChild.style.animationDelay = (0.08 * i) + 's';
      const m = new ml.Marker({ element: e, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);
      e.setAttribute('aria-label', `${d.n}, ${d.t === 'estudio' ? 'curso bíblico' : 'revisita'}`);
      const p = { ...d, dir, lng, lat, m, e };
      e.addEventListener('click', (ev) => { ev.stopPropagation(); mostrarFicha(p); });
      return p;
    });
    aplicarFiltro();
  }

  function aplicarFiltro() {
    personas.forEach((p) => { p.e.hidden = !(filtro === 'todos' || p.t === filtro); });
  }
  marco.querySelectorAll('.md-filtros button').forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.f;
    marco.querySelectorAll('.md-filtros button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    aplicarFiltro(); cerrarFicha();
  }));
  marco.querySelectorAll('.md-zoom button').forEach((b) => b.addEventListener('click', () => (menosMov ? map.setZoom(map.getZoom() + +b.dataset.z) : map.zoomTo(map.getZoom() + +b.dataset.z, { duration: 300 }))));
  marco.querySelector('.md-yo').addEventListener('click', () => { pedirUbicacion(true); });

  // ── Ficha de una persona (solo muestra información) ──
  function mostrarFicha(p) {
    quitarNuevo();
    pista.hidden = true;
    const curso = p.t === 'estudio';
    ficha.innerHTML = `
      <button class="md-cerrar" type="button" aria-label="Cerrar">×</button>
      <div class="md-cab"><span class="md-av" style="background:${p.c}">${esc(p.n[0])}</span>
        <div><b>${esc(p.n)}</b><small>${curso ? 'Curso bíblico' : 'Revisita'} · ${esc(p.prox)}</small></div></div>
      <dl>
        <div><dt>Dirección</dt><dd>${esc(p.dir)}</dd></div>
        <div><dt>${curso ? 'Progreso' : 'Tema'}</dt><dd>${esc(curso ? p.prog : p.tema)}</dd></div>
        <div><dt>Teléfono</dt><dd>${esc(p.tel)}</dd></div>
      </dl>
      <div class="md-acc"><span class="v">Llamar</span><span class="a">Cómo llegar</span><span class="l">Ver ficha</span></div>
      <p class="md-demo">Persona inventada para la demostración.</p>`;
    ficha.hidden = false;
    requestAnimationFrame(() => ficha.classList.add('abierta'));
    ficha.querySelector('.md-cerrar').addEventListener('click', cerrarFicha);
    ficha.querySelectorAll('.md-acc span').forEach((s) => s.addEventListener('click', () => toast('En la app, este botón abre la acción de verdad.')));
    ir({ center: [p.lng, p.lat], offset: [0, -70] });
  }
  function cerrarFicha() { ficha.classList.remove('abierta'); setTimeout(() => { if (!ficha.classList.contains('abierta')) ficha.hidden = true; }, 250); }

  // ── Tocar el mapa: pin para agregar a alguien aquí ──
  function quitarNuevo() { if (nuevo) { nuevo.remove(); nuevo = null; } }
  function ponerNuevo(lngLat) {
    cerrarFicha(); pista.hidden = true;
    const dir = direccion(lngLat.lng, lngLat.lat);
    if (!nuevo) {
      const e = el('div', 'md-nuevo', `<div class="md-globo"><span class="md-dir"></span><button type="button">Agregar persona aquí</button></div>${PIN('#F2C94C', '+', false)}`);
      e.querySelector('button').addEventListener('click', (ev) => { ev.stopPropagation(); toast('En la app se abre el formulario con esta dirección ya puesta.'); });
      e.addEventListener('click', (ev) => ev.stopPropagation());
      nuevo = new ml.Marker({ element: e, anchor: 'bottom', draggable: true }).setLngLat(lngLat).addTo(map);
      nuevo.on('drag', () => { e.querySelector('.md-dir').textContent = 'Buscando dirección…'; });
      nuevo.on('dragend', () => { const ll = nuevo.getLngLat(); e.querySelector('.md-dir').textContent = direccion(ll.lng, ll.lat); });
    } else nuevo.setLngLat(lngLat);
    nuevo.getElement().querySelector('.md-dir').textContent = dir;
  }
  map.on('click', (e) => { if (ficha.classList.contains('abierta')) { cerrarFicha(); return; } ponerNuevo(e.lngLat); });
  marco.addEventListener('keydown', (e) => { if (e.key === 'Escape') { cerrarFicha(); quitarNuevo(); } });

  let tt;
  function toast(t) { aviso.textContent = t; aviso.hidden = false; aviso.classList.add('ver'); clearTimeout(tt); tt = setTimeout(() => { aviso.classList.remove('ver'); setTimeout(() => (aviso.hidden = true), 300); }, 2600); }

  // ── Ubicación de quien visita ──
  function centrarEn(ll, animar) {
    centro = ll; ponerYo(ll);
    animar ? ir({ center: ll, zoom: 15 }) : map.jumpTo({ center: ll, zoom: 15 });
    map.once('idle', crearPersonas);
  }
  function pedirUbicacion(desdeBoton) {
    if (!('geolocation' in navigator)) { if (desdeBoton) toast('Tu navegador no comparte la ubicación.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => centrarEn([pos.coords.longitude, pos.coords.latitude], true),
      () => { if (desdeBoton) toast('Activa la ubicación del navegador para ver tu zona.'); else toast('Te mostramos Trujillo. Activa tu ubicación para ver tu zona.'); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 });
    if (desdeBoton && marcadorYo) ir({ center: marcadorYo.getLngLat(), zoom: Math.max(map.getZoom(), 15) });
  }

  new ResizeObserver(() => map.resize()).observe(nodoMapa);
  map.on('load', () => {
    caja.classList.add('mapa-listo');
    map.resize();
    centrarEn(RESPALDO, false);
    pedirUbicacion(false);
  });
  map.on('error', (e) => { if (!caja.classList.contains('mapa-listo')) console.warn(e && e.error); });
}
