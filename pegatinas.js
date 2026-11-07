// Cosas vivas de la web: pegatinas, tarjetas y avisos.
// - Cada ícono está dibujado por partes y tiene su propia animación al pasar el cursor o tocarlo.
// - Las piezas de un mismo grupo se empujan entre ellas, como si fueran calcomanías.
(function () {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Íconos dibujados por partes para poder mover cada pieza
  const PIEZAS = {
    'i-persona': '<circle class="p-cabeza" cx="12" cy="8" r="4"/><path class="p-cuerpo" d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    'i-casa': '<path class="c-techo" d="M3 11l9-7 9 7"/><path class="c-base" d="M5 11.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-8.5"/>',
    'i-libro': '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/>',
    'i-reloj': '<circle cx="12" cy="12" r="9"/><path class="r-min" d="M12 12V6.5"/><path class="r-hora" d="M12 12l3.2 2"/>',
    'i-escaner': '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path class="e-linea" d="M7 12h10"/>',
    'i-calendario': '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18"/><path class="k-aros" d="M8 3v4M16 3v4"/><path class="k-hoy" pathLength="1" d="M13.5 13.8l1.8 1.8 3.2-3.4"/>',
    'i-pin': '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    'i-campana': '<g class="b-campana"><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path class="b-badajo" d="M10 21h4"/></g><path class="b-onda" d="M2.5 9.5a8 8 0 0 1 2-4M21.5 9.5a8 8 0 0 0-2-4"/>',
    'i-informe': '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path class="f-l" pathLength="1" d="M9 8h6"/><path class="f-l" pathLength="1" d="M9 12h6"/><path class="f-l" pathLength="1" d="M9 16h4"/>',
    'i-objetivo': '<circle class="o-1" cx="12" cy="12" r="9"/><circle class="o-2" cx="12" cy="12" r="5"/><circle class="o-3" cx="12" cy="12" r="1"/>',
    'i-qr': '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path class="q-p q1" d="M14 14h3v3"/><path class="q-p q2" d="M21 14v.01M14 21h.01"/><path class="q-p q3" d="M18 18h3v3h-3z"/>',
    'i-telefonos': '<rect class="t-a" x="2.5" y="5" width="8" height="15" rx="2"/><rect class="t-b" x="13.5" y="4" width="8" height="15" rx="2"/><path class="t-f" d="M8.5 11.5h7M13 9l2.5 2.5L13 14"/>',
    'i-compartir': '<circle class="s-1" cx="18" cy="5" r="2.5"/><circle class="s-2" cx="6" cy="12" r="2.5"/><circle class="s-3" cx="18" cy="19" r="2.5"/><path class="s-l" pathLength="1" d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
    'i-huella': '<path class="h-l" pathLength="1" d="M12 11v3a8 8 0 0 1-2 5.3"/><path class="h-l" pathLength="1" d="M8 11a4 4 0 0 1 8 0v2a12 12 0 0 1-1 4.8"/><path class="h-l" pathLength="1" d="M5 13v-2a7 7 0 0 1 12.6-4.2"/><path class="h-l" pathLength="1" d="M19.5 10.5c.3 1 .5 2 .5 3a16 16 0 0 1-.6 4"/>',
    'i-luna': '<path class="m-luna" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path class="m-est" d="M17 3.5v3M15.5 5h3"/>',
    'i-descarga': '<path class="d-flecha" d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    'i-sinred': '<path class="w-1" d="M2 8.5a15 15 0 0 1 20 0"/><path class="w-2" d="M5.5 12a10 10 0 0 1 13 0"/><path class="w-3" d="M9 15.5a5 5 0 0 1 6 0"/><path d="M12 19h.01"/><path class="w-x" pathLength="1" d="M3 3l18 18"/>',
    'i-candado': '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path class="l-arco" d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    'i-chat': '<path class="ch-g" d="M4 5h16v11H9l-5 4z"/><path class="ch-l" pathLength="1" d="M8 9.5h8"/><path class="ch-l" pathLength="1" d="M8 12.5h5"/>',
    'i-ojo': '<path class="y-ojo" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle class="y-pupila" cx="12" cy="12" r="3"/>',
    'i-deshacer': '<g class="u-g"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></g>',
    'i-basura': '<path class="x-tapa" d="M4 7h16M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
    'i-escudo': '<path class="z-esc" d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path class="z-ok" pathLength="1" d="M8.5 12l2.5 2.5 4.5-5"/>',
    'i-mic': '<rect class="v-mic" x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/><path class="v-onda" d="M2 9v4M22 9v4"/>',
    'i-estrella': '<path class="st" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };

  // Cambia el <use> por el ícono dibujado por partes
  function preparar(el) {
    if (el.dataset.ic) return;
    const svg = el.querySelector('svg.ic'), use = svg && svg.querySelector('use');
    const id = use && (use.getAttribute('href') || '').replace('#', '');
    if (id && PIEZAS[id]) { svg.setAttribute('viewBox', '0 0 24 24'); svg.innerHTML = PIEZAS[id]; el.dataset.ic = id.slice(2); }
    el.classList.add('vivo');
  }
  function animar(el) {
    if (quieto) return;
    el.classList.remove('anima'); void el.offsetWidth; el.classList.add('anima');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('anima'), 1400);
  }

  // Grupos que se empujan: pegatinas, tarjetas de funciones y avisos
  const grupos = [
    ...[...document.querySelectorAll('.pegatinas')].map((g) => ({ g, items: [...g.children], fuerza: 26, radio: 230, crece: 1.18 })),
    ...[...document.querySelectorAll('[data-empujar]')].map((g) => ({ g, items: [...g.children], fuerza: +g.dataset.empujar || 12, radio: 360, crece: 1.04 }))
  ];

  grupos.forEach(({ g, items, fuerza, radio, crece }) => {
    items.forEach(preparar);
    if (quieto) return;
    let soltar = 0;
    const empujar = (li) => {
      const a = li.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
      items.forEach((o) => {
        if (o === li) { o.style.setProperty('--dx', '0px'); o.style.setProperty('--dy', '-6px'); o.style.setProperty('--s', crece); o.style.setProperty('--extra', '-1.2deg'); o.classList.add('arriba'); return; }
        o.classList.remove('arriba');
        const b = o.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2;
        const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, radio - d) / radio;          // las cercanas se mueven más
        o.style.setProperty('--dx', (dx / d * f * fuerza).toFixed(1) + 'px');
        o.style.setProperty('--dy', (dy / d * f * fuerza * 0.7).toFixed(1) + 'px');
        o.style.setProperty('--s', (1 - f * 0.06).toFixed(3));
        o.style.setProperty('--extra', ((dx > 0 ? 1 : -1) * f * 4).toFixed(1) + 'deg');
      });
    };
    const calmar = () => items.forEach((o) => { ['--dx', '--dy', '--s', '--extra'].forEach((k) => o.style.removeProperty(k)); o.classList.remove('arriba'); });
    items.forEach((li) => {
      if (fino) li.addEventListener('mouseenter', () => { clearTimeout(soltar); empujar(li); animar(li); });
      li.addEventListener('click', () => {
        animar(li); empujar(li);
        if (!fino) { clearTimeout(soltar); soltar = setTimeout(calmar, 1300); }
      });
    });
    if (fino) g.addEventListener('mouseleave', () => { soltar = setTimeout(calmar, 80); });
  });

  // Avisos: van llegando uno por uno y sus íconos se mueven solos de vez en cuando
  document.querySelectorAll('.avisos').forEach((caja) => {
    const lista = [...caja.querySelectorAll('.aviso')];
    lista.forEach(preparar);
    if (quieto || !('IntersectionObserver' in window)) { caja.classList.add('llegaron'); return; }
    let i = 0, reloj = 0;
    new IntersectionObserver((e) => {
      if (e[0].isIntersecting) {
        caja.classList.add('llegaron');
        if (!reloj) reloj = setInterval(() => { animar(lista[i % lista.length]); i++; }, 1700);
      } else { clearInterval(reloj); reloj = 0; }
    }, { threshold: 0.35 }).observe(caja);
  });
})();
