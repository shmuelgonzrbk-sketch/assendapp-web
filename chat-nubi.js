// Animación del chat de Nubi dibujada en un canvas (se usa como pantalla
// del teléfono mientras no exista el video real /video/nubi-chat.mp4).
// Copia el diseño del chat de la app: cabecera, burbujas, chips y barra para escribir.

const AZUL = '#2443A6', TINTA = '#1d2433', GRIS = '#6b7385', FONDO = '#F3F4FA';
const FUENTE = '"Manrope", "Roboto", system-ui, sans-serif';

const GUION = [
  ['pausa', 0.8],
  ['yo', 'Hola'],
  ['nubi', '¡Hola! ¿En qué te ayudo hoy?'],
  ['chips', ['Ayúdame con mi horario', 'Agrega una revisita', '¿Cuántas horas me faltan?', '¿Qué tengo hoy?']],
  ['pausa', 1.6],
  ['yo', 'Cambia la visita de Rosa al sábado a las 5'],
  ['nubi', 'Listo, la pasé al sábado 15 a las 5:00 p. m. También moví su aviso.'],
  ['deshacer', 'Visita movida'],
  ['pausa', 1.6],
  ['yo', 'Pásame el contacto de Pedro'],
  ['nubi', 'Aquí tienes a Pedro Ramírez:'],
  ['botones', ['Llamar', 'WhatsApp', 'Cómo llegar']],
  ['pausa', 4],
];

export function crearChat({ ancho = 720, alto = 1600 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = ancho; canvas.height = alto;
  const ctx = canvas.getContext('2d');
  const S = ancho / 360;            // diseño en 360 × 800
  const AREA_TOP = 96, AREA_FIN = 722;

  // Arma la línea de tiempo una vez
  let eventos = [], t = 0;
  for (const [tipo, v] of GUION) {
    if (tipo === 'pausa') { t += v; continue; }
    if (tipo === 'yo') {
      const dur = 0.35 + v.length * 0.045;
      eventos.push({ tipo: 'escribe', texto: v, ini: t, fin: t + dur });
      t += dur + 0.15;
      eventos.push({ tipo: 'yo', texto: v, ini: t });
      t += 0.5;
      eventos.push({ tipo: 'pensando', ini: t, fin: t + 1.0 });
      t += 1.0;
      continue;
    }
    eventos.push({ tipo, v, texto: typeof v === 'string' ? v : null, ini: t });
    t += tipo === 'nubi' ? 0.45 : 0.6;
  }
  const DURACION = t;

  const medir = (txt, px, peso) => { ctx.font = `${peso} ${px * S}px ${FUENTE}`; return ctx.measureText(txt).width / S; };
  function partir(txt, max, px, peso) {
    const palabras = txt.split(' '), lineas = []; let l = '';
    for (const p of palabras) {
      const prueba = l ? l + ' ' + p : p;
      if (medir(prueba, px, peso) > max && l) { lineas.push(l); l = p; } else l = prueba;
    }
    if (l) lineas.push(l);
    return lineas;
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function texto(txt, x, y, px, peso, color, alin = 'left') {
    ctx.font = `${peso} ${px * S}px ${FUENTE}`; ctx.fillStyle = color; ctx.textAlign = alin; ctx.textBaseline = 'alphabetic';
    ctx.fillText(txt, x * S, y * S);
  }
  function nubiMini(x, y, s) {
    const k = s / 120;
    ctx.save(); ctx.translate(x * S, y * S); ctx.scale(k * S, k * S);
    ctx.lineWidth = 6; ctx.strokeStyle = '#171717';
    rr(12, 22, 96, 88, 22); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.save(); rr(12, 22, 96, 88, 22); ctx.clip(); ctx.fillStyle = '#315CF5'; ctx.fillRect(12, 22, 96, 24); ctx.restore();
    rr(12, 22, 96, 88, 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12, 46); ctx.lineTo(108, 46); ctx.stroke();
    [33, 74].forEach((rx) => { rr(rx, 8, 13, 27, 6.5); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); });
    ctx.fillStyle = '#171717';
    ctx.beginPath(); ctx.ellipse(44, 68, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(76, 68, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.moveTo(51, 80); ctx.quadraticCurveTo(60, 89, 69, 80); ctx.stroke();
    ctx.restore();
  }

  // Cada elemento del chat con su altura (en unidades de diseño)
  function bloque(ev) {
    if (ev._b) return ev._b;
    let b;
    if (ev.tipo === 'yo') { const l = partir(ev.texto, 214, 14, 500); b = { h: l.length * 20 + 20, l }; }
    else if (ev.tipo === 'nubi') { const l = partir(ev.texto, 226, 14, 500); b = { h: l.length * 20 + 22, l }; }
    else if (ev.tipo === 'chips') b = { h: ev.v.length * 38 - 6 };
    else if (ev.tipo === 'botones') b = { h: 34 };
    else if (ev.tipo === 'deshacer') b = { h: 38 };
    else b = { h: 40 };
    return (ev._b = b);
  }

  let desplazamiento = 0;

  function pintar(ahora, dt) {
    const tl = ahora % (DURACION + 0.8);
    const apagado = tl > DURACION ? Math.min(1, (tl - DURACION) / 0.5) : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = FONDO; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, 'rgba(217,227,255,.55)'); g.addColorStop(.35, 'rgba(243,244,250,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Qué se ve ahora
    const visibles = [];
    let escribiendo = '';
    for (const ev of eventos) {
      if (ev.ini > tl) break;
      if (ev.tipo === 'escribe') { if (tl < ev.fin) escribiendo = ev.texto.slice(0, Math.ceil(ev.texto.length * (tl - ev.ini) / (ev.fin - ev.ini - 0.2))); continue; }
      if (ev.tipo === 'pensando') { if (tl < ev.fin) visibles.push(ev); continue; }
      visibles.push(ev);
    }
    // Alto total y desplazamiento suave
    let total = 0; visibles.forEach((ev) => { total += bloque(ev).h + 10; });
    const meta = Math.max(0, AREA_TOP + 8 + total - AREA_FIN);
    desplazamiento += (meta - desplazamiento) * Math.min(1, dt * 7);
    if (tl < 0.2) desplazamiento = 0;

    // Mensajes
    ctx.save(); ctx.beginPath(); ctx.rect(0, AREA_TOP * S, canvas.width, (AREA_FIN - AREA_TOP) * S); ctx.clip();
    let y = AREA_TOP + 8 - desplazamiento;
    visibles.forEach((ev, i) => {
      const b = bloque(ev), a = Math.min(1, (tl - ev.ini) / 0.3), dy = (1 - a) * 10;
      ctx.globalAlpha = a * (1 - apagado);
      const yy = y + dy;
      const siguienteEsNubi = visibles[i + 1] && ['nubi', 'chips', 'botones', 'deshacer', 'pensando'].includes(visibles[i + 1].tipo);
      if (ev.tipo === 'yo') {
        const w = Math.max(...b.l.map((l) => medir(l, 14, 500))) + 28;
        rr((346 - w) * S, yy * S, w * S, b.h * S, 18 * S); ctx.fillStyle = AZUL; ctx.fill();
        b.l.forEach((l, k) => texto(l, 346 - w + 14, yy + 25 + k * 20, 14, 500, '#fff'));
      } else if (ev.tipo === 'nubi' || ev.tipo === 'pensando') {
        const w = ev.tipo === 'pensando' ? 64 : Math.max(...b.l.map((l) => medir(l, 14, 500))) + 28;
        rr(50 * S, yy * S, w * S, b.h * S, 16 * S); ctx.fillStyle = '#fff'; ctx.fill();
        ctx.lineWidth = 1.2 * S; ctx.strokeStyle = '#E2E5EF'; ctx.stroke();
        if (ev.tipo === 'pensando') {
          for (let k = 0; k < 3; k++) {
            const f = (Math.sin(tl * 8 - k * 0.9) + 1) / 2;
            ctx.beginPath(); ctx.arc((68 + k * 14) * S, (yy + 20 - f * 3) * S, 3.6 * S, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(36,67,166,${0.3 + f * 0.6})`; ctx.fill();
          }
        } else b.l.forEach((l, k) => texto(l, 64, yy + 26 + k * 20, 14, 500, TINTA));
        if (!siguienteEsNubi) nubiMini(14, yy + b.h - 30, 30);
      } else if (ev.tipo === 'chips') {
        ev.v.forEach((c, k) => {
          const ck = Math.min(1, Math.max(0, (tl - ev.ini - k * 0.12) / 0.3));
          ctx.globalAlpha = ck * (1 - apagado);
          const w = medir(c, 12.5, 600) + 26, cy = yy + k * 38 + (1 - ck) * 6;
          rr(50 * S, cy * S, w * S, 32 * S, 11 * S); ctx.fillStyle = '#E8EBF7'; ctx.fill();
          ctx.lineWidth = 1.2 * S; ctx.strokeStyle = '#B9C1E0'; ctx.stroke();
          texto(c, 63, cy + 21, 12.5, 600, '#2E3B73');
        });
        if (!siguienteEsNubi) nubiMini(14, yy + b.h - 30, 30);
      } else if (ev.tipo === 'deshacer') {
        const w = 196;
        rr(50 * S, yy * S, w * S, 36 * S, 12 * S); ctx.fillStyle = TINTA; ctx.fill();
        ctx.lineWidth = 2.4 * S; ctx.strokeStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(63 * S, (yy + 18) * S); ctx.lineTo(68 * S, (yy + 23) * S); ctx.lineTo(77 * S, (yy + 13) * S); ctx.stroke();
        texto(ev.v, 86, yy + 23, 12.5, 600, '#fff');
        rr(176 * S, (yy + 6) * S, 64 * S, 24 * S, 8 * S); ctx.fillStyle = '#F2C94C'; ctx.fill();
        texto('Deshacer', 208, yy + 22, 11.5, 800, TINTA, 'center');
      } else if (ev.tipo === 'botones') {
        let x = 50;
        ev.v.forEach((c, k) => {
          const w = medir(c, 12.5, 700) + 26;
          rr(x * S, yy * S, w * S, 32 * S, 16 * S);
          ctx.fillStyle = k === 0 ? '#E4F4EA' : k === 1 ? '#E3F5E9' : '#E3EBFD'; ctx.fill();
          texto(c, x + 13, yy + 21, 12.5, 700, k === 2 ? '#2F66E8' : '#1E8A4C');
          x += w + 6;
        });
        if (!siguienteEsNubi) nubiMini(14, yy + b.h - 30, 30);
      }
      y += b.h + 10;
    });
    ctx.restore(); ctx.globalAlpha = 1;

    // Barra de estado
    texto('12:07', 24, 21, 12, 700, TINTA);
    ctx.fillStyle = TINTA;
    [0, 1, 2, 3].forEach((k) => ctx.fillRect((284 + k * 4) * S, (20 - k * 2.5) * S, 2.6 * S, (3 + k * 2.5) * S));
    rr(310 * S, 11 * S, 22 * S, 11 * S, 3 * S); ctx.lineWidth = 1.3 * S; ctx.strokeStyle = TINTA; ctx.stroke();
    rr(312 * S, 13 * S, 14 * S, 7 * S, 1.5 * S); ctx.fill();

    // Cabecera
    ctx.lineWidth = 2.2 * S; ctx.strokeStyle = TINTA; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(14 * S, 55 * S); ctx.lineTo(19 * S, 60 * S); ctx.lineTo(24 * S, 55 * S); ctx.stroke();
    nubiMini(32, 40, 38);
    texto('Nubi', 78, 56, 17, 800, TINTA);
    ctx.beginPath(); ctx.arc(81 * S, 69 * S, 2.6 * S, 0, Math.PI * 2); ctx.fillStyle = '#9aa0b0'; ctx.fill();
    texto('Modo básico', 88, 73, 11.5, 600, GRIS);
    // altavoz silenciado
    ctx.strokeStyle = TINTA; ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.moveTo(250 * S, 55 * S); ctx.lineTo(255 * S, 55 * S); ctx.lineTo(261 * S, 50 * S); ctx.lineTo(261 * S, 66 * S); ctx.lineTo(255 * S, 61 * S); ctx.lineTo(250 * S, 61 * S); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(266 * S, 53 * S); ctx.lineTo(274 * S, 63 * S); ctx.moveTo(274 * S, 53 * S); ctx.lineTo(266 * S, 63 * S); ctx.stroke();
    // botón de voz
    ctx.beginPath(); ctx.arc(302 * S, 58 * S, 17 * S, 0, Math.PI * 2); ctx.fillStyle = AZUL; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2 * S;
    [[-7, 3], [-3.5, 6], [0, 9], [3.5, 6], [7, 3]].forEach(([dx, h]) => { ctx.beginPath(); ctx.moveTo((302 + dx) * S, (58 - h) * S); ctx.lineTo((302 + dx) * S, (58 + h) * S); ctx.stroke(); });
    // reiniciar
    ctx.strokeStyle = TINTA; ctx.lineWidth = 2 * S;
    ctx.beginPath(); ctx.arc(338 * S, 58 * S, 7 * S, -Math.PI * 0.35, Math.PI * 1.45); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(340 * S, 49 * S); ctx.lineTo(344 * S, 52 * S); ctx.lineTo(340 * S, 55 * S); ctx.stroke();

    // Barra para escribir
    rr(14 * S, 730 * S, 284 * S, 44 * S, 22 * S); ctx.fillStyle = '#E9EBF3'; ctx.fill();
    if (escribiendo) {
      ctx.save(); rr(14 * S, 730 * S, 284 * S, 44 * S, 22 * S); ctx.clip();
      let mostrar = escribiendo; while (medir(mostrar, 14, 500) > 250) mostrar = mostrar.slice(1);
      texto(mostrar, 30, 757, 14, 500, TINTA);
      if (Math.floor(tl * 2.5) % 2 === 0) { ctx.fillStyle = AZUL; ctx.fillRect((31 + medir(mostrar, 14, 500)) * S, 743 * S, 1.6 * S, 19 * S); }
      ctx.restore();
    } else texto('Escríbele a Nubi…', 30, 757, 14, 500, '#8a91a3');
    ctx.beginPath(); ctx.arc(326 * S, 752 * S, 22 * S, 0, Math.PI * 2); ctx.fillStyle = AZUL; ctx.fill();
    if (escribiendo) {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4 * S;
      ctx.beginPath(); ctx.moveTo(318 * S, 752 * S); ctx.lineTo(334 * S, 752 * S); ctx.moveTo(328 * S, 746 * S); ctx.lineTo(334 * S, 752 * S); ctx.lineTo(328 * S, 758 * S); ctx.stroke();
    } else {
      rr(322.5 * S, 741 * S, 7 * S, 13 * S, 3.5 * S); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 * S;
      ctx.beginPath(); ctx.arc(326 * S, 751 * S, 7.5 * S, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(326 * S, 758.5 * S); ctx.lineTo(326 * S, 763 * S); ctx.stroke();
    }
    // Barra de gestos
    rr(130 * S, 789 * S, 100 * S, 4 * S, 2 * S); ctx.fillStyle = TINTA; ctx.fill();
  }

  let tiempo = 0;
  return {
    canvas,
    // Avanza la animación; devuelve true si redibujó
    avanzar(dt) { tiempo += dt; pintar(tiempo, dt); return true; },
    final() { tiempo = DURACION - 4.2; desplazamiento = 1e4; pintar(tiempo, 1); desplazamiento = 0; },
  };
}
