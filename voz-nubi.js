// Animación del modo voz de Orby dibujada en un canvas (pantalla del teléfono
// mientras no exista el video real /video/nubi-voz.mp4). Copia la pantalla "Hablar con Orby" de la app.

const AZUL = '#2443A6', AZUL2 = '#315CF5', TINTA = '#1d2433', GRIS = '#6b7385';
const FUENTE = '"Manrope", "Roboto", system-ui, sans-serif';

// Cada vuelta: escucha → piensa → habla
const GUION = [
  { oye: '¿Qué tengo hoy?', dice: 'Hoy tienes el curso de Ana Lucía a las 11:00 y la visita a José a las 4:00 p. m.' },
  { oye: 'Anota dos horas y media', dice: 'Listo, anoté 2 h 30 min. Llevas 10 h 30 min este mes.' },
  { oye: '¿Cuántas horas me faltan?', dice: 'Te faltan 39 h 30 min para tu meta. Necesitas 1 h 30 min por día.' },
];
const T_OIR = 3.2, T_PENSAR = 1.0, T_HABLAR = 4.2, T_PAUSA = 0.6;
const VUELTA = T_OIR + T_PENSAR + T_HABLAR + T_PAUSA;

export function crearVoz({ ancho = 720, alto = 1600 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = ancho; canvas.height = alto;
  const ctx = canvas.getContext('2d');
  const S = ancho / 360;

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function texto(t, x, y, px, peso, color, alin = 'center') {
    ctx.font = `${peso} ${px * S}px ${FUENTE}`; ctx.fillStyle = color; ctx.textAlign = alin; ctx.textBaseline = 'alphabetic';
    ctx.fillText(t, x * S, y * S);
  }
  function partir(t, max, px, peso) {
    ctx.font = `${peso} ${px * S}px ${FUENTE}`;
    const out = []; let l = '';
    for (const p of t.split(' ')) { const pr = l ? l + ' ' + p : p; if (ctx.measureText(pr).width / S > max && l) { out.push(l); l = p; } else l = pr; }
    if (l) out.push(l); return out;
  }

  // Ícono de la app: calendario con cara, sin contorno negro
  function icono(cx, cy, s) {
    // Igual al logo: cuerpo blanco, franja azul, contorno negro, aros, ojos con brillo, mejillas, sonrisa y 4 cuadritos
    const k = s / 100;
    ctx.save(); ctx.translate(cx * S, cy * S); ctx.scale(k * S, k * S); ctx.translate(-60, -60);
    const N = '#171717';
    rr(12, 22, 96, 88, 22); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.save(); rr(12, 22, 96, 88, 22); ctx.clip(); ctx.fillStyle = '#315CF5'; ctx.fillRect(12, 22, 96, 24); ctx.restore();
    ctx.strokeStyle = N; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(12, 46); ctx.lineTo(108, 46); ctx.stroke();
    rr(12, 22, 96, 88, 22); ctx.stroke();
    [33, 74].forEach((x) => { rr(x, 8, 13, 27, 6.5); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); });
    ctx.fillStyle = N;
    ctx.beginPath(); ctx.ellipse(44, 66, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(76, 66, 6, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(46, 63, 2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(78, 63, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#D9E3FF'; ctx.beginPath(); ctx.ellipse(33, 78, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(87, 78, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(51, 77); ctx.quadraticCurveTo(60, 86, 69, 77); ctx.stroke();
    ctx.lineWidth = 2.5;
    [27, 43, 59, 75].forEach((x, i) => { rr(x, 90, 11, 8, 2.5); ctx.fillStyle = i === 3 ? '#F2C94C' : '#D9E3FF'; ctx.fill(); ctx.stroke(); });
    ctx.restore();
  }


  function pintar(t) {
    const n = Math.floor(t / VUELTA) % GUION.length, g = GUION[n];
    const lt = t % VUELTA;
    const fase = lt < T_OIR ? 'oye' : lt < T_OIR + T_PENSAR ? 'piensa' : lt < T_OIR + T_PENSAR + T_HABLAR ? 'habla' : 'pausa';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const f = ctx.createLinearGradient(0, 0, 0, canvas.height);
    f.addColorStop(0, '#F1F1FA'); f.addColorStop(1, '#E6E7F6');
    ctx.fillStyle = f; ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Barra de estado
    texto('12:33', 24, 21, 12, 700, TINTA, 'left');
    ctx.fillStyle = TINTA;
    [0, 1, 2, 3].forEach((k) => ctx.fillRect((284 + k * 4) * S, (20 - k * 2.5) * S, 2.6 * S, (3 + k * 2.5) * S));
    rr(310 * S, 11 * S, 22 * S, 11 * S, 3 * S); ctx.lineWidth = 1.3 * S; ctx.strokeStyle = TINTA; ctx.stroke();
    rr(312 * S, 13 * S, 14 * S, 7 * S, 1.5 * S); ctx.fill();

    // Cerrar y "Voz rápida"
    ctx.strokeStyle = TINTA; ctx.lineWidth = 2.2 * S; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(22 * S, 64 * S); ctx.lineTo(34 * S, 76 * S); ctx.moveTo(34 * S, 64 * S); ctx.lineTo(22 * S, 76 * S); ctx.stroke();
    rr(236 * S, 55 * S, 108 * S, 30 * S, 15 * S); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
    ctx.beginPath(); ctx.arc(254 * S, 72 * S, 7 * S, Math.PI, 0); ctx.strokeStyle = AZUL; ctx.lineWidth = 2 * S; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(254 * S, 72 * S); ctx.lineTo(258 * S, 67 * S); ctx.stroke();
    texto('Voz rápida', 300, 75, 12.5, 800, TINTA);

    // Círculo de Orby con anillos
    const cx = 180, cy = 330;
    let pulso = 0;
    if (fase === 'habla') pulso = (Math.sin(lt * 9) * 0.5 + 0.5) * 0.7 + (Math.sin(lt * 23) * 0.5 + 0.5) * 0.3;
    if (fase === 'oye') pulso = 0.15 + (Math.sin(lt * 5) * 0.5 + 0.5) * 0.25;
    const r1 = 88 + pulso * 10, r2 = 72 + pulso * 5;
    ctx.beginPath(); ctx.arc(cx * S, cy * S, r1 * S, 0, Math.PI * 2); ctx.fillStyle = 'rgba(70,90,190,.13)'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx * S, cy * S, r2 * S, 0, Math.PI * 2); ctx.fillStyle = 'rgba(60,80,180,.28)'; ctx.fill();
    if (fase === 'habla') {
      // Ondas que salen mientras habla
      for (let k = 0; k < 2; k++) {
        const p = ((lt * 0.8 + k * 0.5) % 1);
        ctx.beginPath(); ctx.arc(cx * S, cy * S, (66 + p * 60) * S, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(49,92,245,${0.35 * (1 - p)})`; ctx.lineWidth = 2 * S; ctx.stroke();
      }
    }
    ctx.beginPath(); ctx.arc(cx * S, cy * S, 62 * S, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    const az = ctx.createLinearGradient((cx - 56) * S, (cy - 56) * S, (cx + 56) * S, (cy + 56) * S);
    az.addColorStop(0, '#3E6BFF'); az.addColorStop(1, '#1E40C8');
    ctx.beginPath(); ctx.arc(cx * S, cy * S, 57 * S, 0, Math.PI * 2); ctx.fillStyle = az; ctx.fill();
    const rebote = fase === 'habla' ? Math.sin(lt * 9) * 1.5 : 0;
    icono(cx, cy + rebote, 90);

    // Estado
    const estado = fase === 'oye' ? 'Te escucho…' : fase === 'piensa' ? 'Pensando…' : 'Orby está hablando';
    texto(estado, 180, 448, 15.5, 800, TINTA);

    // Lo que oye (se va escribiendo) o lo que responde (subtítulo)
    if (fase === 'oye') {
      const k = Math.min(1, Math.max(0, (lt - 0.6) / (T_OIR - 1.2)));
      const parcial = g.oye.slice(0, Math.ceil(g.oye.length * k));
      if (parcial) texto('«' + parcial + (k < 1 ? '' : '»'), 180, 482, 15, 600, AZUL);
      // Barras de voz
      for (let i = 0; i < 5; i++) {
        const h = 6 + (Math.sin(lt * 11 + i * 1.3) * 0.5 + 0.5) * 16 * (lt > 0.4 && k < 1 ? 1 : 0.15);
        rr((162 + i * 8) * S, (520 - h / 2) * S, 4 * S, h * S, 2 * S); ctx.fillStyle = AZUL2; ctx.fill();
      }
    } else if (fase === 'piensa') {
      texto('«' + g.oye + '»', 180, 482, 15, 600, AZUL);
      for (let k = 0; k < 3; k++) {
        const a = (Math.sin(lt * 8 - k * 0.9) + 1) / 2;
        ctx.beginPath(); ctx.arc((166 + k * 14) * S, (520 - a * 3) * S, 4 * S, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(36,67,166,${0.3 + a * 0.6})`; ctx.fill();
      }
    } else {
      const lineas = partir(g.dice, 270, 14, 500);
      const ht = lt - T_OIR - T_PENSAR;
      const visibles = Math.ceil(g.dice.length * Math.min(1, ht / (T_HABLAR * 0.75)));
      let usado = 0;
      ctx.globalAlpha = fase === 'pausa' ? Math.max(0, 1 - (lt - (T_OIR + T_PENSAR + T_HABLAR)) / T_PAUSA) : 1;
      lineas.forEach((l, i) => {
        const resto = Math.max(0, Math.min(l.length, visibles - usado)); usado += l.length + 1;
        texto(l.slice(0, resto), 180, 482 + i * 21, 14, 500, '#3b4257');
      });
      ctx.globalAlpha = 1;
    }

    // Botón de micrófono
    const mic = fase === 'oye';
    if (mic) { ctx.beginPath(); ctx.arc(180 * S, 698 * S, (38 + Math.sin(lt * 6) * 2) * S, 0, Math.PI * 2); ctx.fillStyle = 'rgba(36,67,166,.15)'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(180 * S, 698 * S, 31 * S, 0, Math.PI * 2); ctx.fillStyle = AZUL; ctx.fill();
    rr(175.5 * S, 685 * S, 9 * S, 16 * S, 4.5 * S); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.2 * S;
    ctx.beginPath(); ctx.arc(180 * S, 696 * S, 9 * S, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(180 * S, 705 * S); ctx.lineTo(180 * S, 710 * S); ctx.stroke();
    texto(mic ? 'Habla cuando quieras' : 'Toca a Orby para interrumpirla', 180, 752, 12, 600, GRIS);

    // Barra de gestos
    rr(130 * S, 789 * S, 100 * S, 4 * S, 2 * S); ctx.fillStyle = TINTA; ctx.fill();
  }

  let tiempo = 0;
  return {
    canvas,
    avanzar(dt) { tiempo += Math.max(0, dt || 0); pintar(tiempo); return true; },
    final() { pintar(T_OIR + T_PENSAR + T_HABLAR * 0.8); },
  };
}
