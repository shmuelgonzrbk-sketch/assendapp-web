// Pegatinas de "Todo lo que necesitas": crecen y empujan a las demás al pasar el cursor,
// y cada ícono tiene su propia animación al tocarlo (el reloj se descontrola, la campana suena…).
(function () {
  const listas = document.querySelectorAll('.pegatinas');
  if (!listas.length) return;
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    'i-objetivo': '<circle class="o-1" cx="12" cy="12" r="9"/><circle class="o-2" cx="12" cy="12" r="5"/><circle class="o-3" cx="12" cy="12" r="1"/>'
  };

  listas.forEach((lista) => {
    const items = [...lista.querySelectorAll('li')];
    items.forEach((li) => {
      li.classList.add('vivo');
      const svg = li.querySelector('svg'), use = svg && svg.querySelector('use');
      const id = use && (use.getAttribute('href') || '').replace('#', '');
      if (id && PIEZAS[id]) { svg.setAttribute('viewBox', '0 0 24 24'); svg.innerHTML = PIEZAS[id]; li.dataset.ic = id.slice(2); }
    });
    if (quieto) return;

    let activo = null, soltar = 0;
    const animarIcono = (li) => {
      li.classList.remove('anima'); void li.offsetWidth; li.classList.add('anima');
      clearTimeout(li._t); li._t = setTimeout(() => li.classList.remove('anima'), 1400);
    };
    const empujar = (li) => {
      activo = li;
      const a = li.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
      items.forEach((o) => {
        if (o === li) { o.style.setProperty('--dx', '0px'); o.style.setProperty('--dy', '-4px'); o.style.setProperty('--s', '1.18'); o.style.setProperty('--extra', '0deg'); o.classList.add('arriba'); return; }
        o.classList.remove('arriba');
        const b = o.getBoundingClientRect(), bx = b.left + b.width / 2, by = b.top + b.height / 2;
        const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
        const fuerza = Math.max(0, 230 - d) / 230;          // las cercanas se mueven más
        o.style.setProperty('--dx', (dx / d * fuerza * 26).toFixed(1) + 'px');
        o.style.setProperty('--dy', (dy / d * fuerza * 18).toFixed(1) + 'px');
        o.style.setProperty('--s', (1 - fuerza * 0.1).toFixed(3));                  // se "aplastan" un poco
        o.style.setProperty('--extra', ((dx > 0 ? 1 : -1) * fuerza * 6).toFixed(1) + 'deg');
      });
    };
    const calmar = () => {
      activo = null;
      items.forEach((o) => { ['--dx', '--dy', '--s', '--extra'].forEach((k) => o.style.removeProperty(k)); o.classList.remove('arriba'); });
    };
    const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
    items.forEach((li) => {
      if (fino) li.addEventListener('mouseenter', () => { clearTimeout(soltar); empujar(li); animarIcono(li); });
      li.addEventListener('click', () => {
        animarIcono(li); empujar(li);
        if (!fino) { clearTimeout(soltar); soltar = setTimeout(calmar, 1300); }
      });
    });
    if (fino) lista.addEventListener('mouseleave', () => { soltar = setTimeout(calmar, 80); });
  });
})();
