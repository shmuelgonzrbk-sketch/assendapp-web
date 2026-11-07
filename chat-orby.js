// «Habla con Orby»: un chat de verdad, que corre en tu navegador con datos de ejemplo.
// Entiende lo básico (horas, personas, visitas, agenda y asignaciones). La IA de la app,
// que vive en el teléfono, entiende mucho más. Aquí nada se envía a ningún lado.
(function () {
  const raiz = document.getElementById('chatOrby');
  if (!raiz) return;
  const cuerpo = raiz.querySelector('.dc-cuerpo'), form = raiz.querySelector('form'), entrada = raiz.querySelector('input');
  const menosMov = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const DIAS_B = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const en = (n) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return d; };
  const proximo = (dow) => { let n = (dow - hoy.getDay() + 7) % 7; if (n === 0) n = 7; return en(n); };

  // Datos de ejemplo (inventados)
  const S = {
    meta: 50, horas: 8,
    personas: [
      { nombre: 'Rosa Quispe', tipo: 'revisita', fecha: proximo(5), hora: '16:00', tema: '¿Qué pasa cuando morimos?', dir: 'Jr. Bolívar 812', tel: '987 654 321' },
      { nombre: 'Pedro Ramírez', tipo: 'revisita', fecha: proximo(1), hora: '18:00', tema: 'El Reino de Dios', dir: 'Av. España 230', tel: '912 345 678' },
      { nombre: 'Ana Lucía Vargas', tipo: 'curso', fecha: en(0), hora: '11:00', tema: 'Lección 27', dir: 'Calle Lima 145', tel: '934 111 222' }
    ],
    asig: [{ parte: 'Lectura de la Biblia', fecha: proximo(4), hora: '19:00' }]
  };
  let ultimaPersona = null, ultimoTema = null;
  const pila = [];                                     // para Deshacer

  // ── Utilidades de texto ──
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[¿?¡!.,;]/g, ' ').replace(/\s+/g, ' ').trim();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtH = (h) => { const t = Math.round(h * 60), a = Math.floor(t / 60), m = t % 60; return a ? (m ? a + ' h ' + m + ' min' : a + ' h') : m + ' min'; };
  const fmtF = (d) => {
    const n = Math.round((d - hoy) / 864e5);
    if (n === 0) return 'hoy'; if (n === 1) return 'mañana';
    return DIAS_B[d.getDay()] + ' ' + d.getDate() + (n > 6 ? ' de ' + MESES[d.getMonth()] : '');
  };
  const fmtHora = (h) => { const [a, m] = h.split(':').map(Number); const p = a >= 12 ? 'p. m.' : 'a. m.'; return ((a + 11) % 12 + 1) + ':' + String(m).padStart(2, '0') + ' ' + p; };
  const punto = (s) => s.replace(/\.\.(\s|$)/g, '.$1');
  const NUM = { una: 1, un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };
  const numero = (s) => (s in NUM ? NUM[s] : parseFloat(s.replace(',', '.')));

  function leerFecha(t) {
    if (/\bpasado manana\b/.test(t)) return en(2);
    if (/\bmanana\b/.test(t) && !/\b(en|por) la manana\b/.test(t)) return en(1);
    if (/\banteayer\b/.test(t)) return en(-2);
    if (/\bayer\b/.test(t)) return en(-1);
    if (/\bhoy\b/.test(t)) return en(0);
    for (let i = 0; i < 7; i++) if (new RegExp('\\b' + DIAS[i] + '\\b').test(t)) return proximo(i);
    const m = t.match(/\bel (\d{1,2})\b(?! de la)/);
    if (m) { const d = new Date(hoy); d.setDate(+m[1]); if (d < hoy) d.setMonth(d.getMonth() + 1); return d; }
    return null;
  }
  function leerHora(t) {
    let m = t.match(/\b(\d{1,2})[:h](\d{2})\b/);
    if (m) return String(+m[1]).padStart(2, '0') + ':' + m[2];
    m = t.match(/\b(?:a las|a la|como a las|tipo)\s+(\d{1,2}|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?:\s+y media)?(?:\s+de la (manana|tarde|noche)|\s*(am|pm|a m|p m))?/);
    if (m) {
      let h = numero(m[1]); const fr = m[2] || '', ap = (m[3] || '').replace(' ', '');
      if (fr === 'tarde' || fr === 'noche' || ap === 'pm') { if (h < 12) h += 12; } else if (!fr && !ap && h <= 7) h += 12;
      return String(h).padStart(2, '0') + (/y media/.test(m[0]) ? ':30' : ':00');
    }
    if (/en la tarde|por la tarde/.test(t)) return '16:00';
    if (/en la manana|por la manana/.test(t)) return '10:00';
    if (/en la noche|por la noche/.test(t)) return '19:00';
    return null;
  }
  function buscarPersona(t) {
    let mejor = null;
    S.personas.forEach((p) => {
      const partes = norm(p.nombre).split(' ');
      if (partes.some((x) => x.length > 2 && new RegExp('\\b' + x + '\\b').test(t))) mejor = p;
    });
    if (!mejor && /\b(lo|la|le|su|el|ella)\b|muevelo|muevela|cambiala|cambialo|pasala|pasalo/.test(t)) mejor = ultimaPersona;
    return mejor;
  }

  // ── Entender ──
  function entender(texto) {
    const t = norm(texto), r = [];          // r: lista de respuestas { txt, tags, botones, deshacer }
    if (!t) return r;

    // Biblia y doctrina: no es su tema
    if (/\b(biblia dice|significa|apocalipsis|genesis|versiculo|texto biblico|doctrina|profecia|que dice la biblia)\b/.test(t) && !/lectura de la biblia/.test(t)) {
      r.push({ txt: 'De la Biblia prefiero no opinar. Para eso te recomiendo jw.org, JW Library o hablar con un anciano.' }); return r;
    }
    if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)\b/.test(t) && t.split(' ').length <= 4) {
      r.push({ txt: '¡Hola! ¿En qué te ayudo? Puedo anotar tus horas, agregar personas o contarte qué tienes hoy.' }); return r;
    }
    if (/\b(gracias|grax|genial|perfecto|excelente)\b/.test(t) && t.split(' ').length <= 4) { r.push({ txt: '¡Con gusto! Aquí estoy si necesitas algo más.' }); return r; }
    if (/quien eres|que eres|como te llamas/.test(t)) { r.push({ txt: 'Soy Orby. En la app vivo dentro de tu teléfono y te ayudo con tu agenda del ministerio. Esta es una demo: aquí uso datos de ejemplo.' }); return r; }
    if (/que (puedes|sabes) hacer|ayuda|como funcionas/.test(t)) {
      r.push({ txt: 'Puedo anotar tus horas, decirte cuánto te falta, agregar personas, mover una visita, contarte tu semana y registrar una asignación. Escríbelo como te salga.' }); return r;
    }
    if (/^deshace|^deshaz|^cancela lo ultimo/.test(t)) { r.push(deshacer()); return r; }

    let hecho = false, hipo = false;
    // Horas: anotar o quitar
    const mH = t.match(/(\d+(?:[.,]\d+)?|una|un|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(horas?|horitas?|hr?s?)\b(\s+y\s+media)?|\b(media hora)\b|(\d+)\s*(min|minutos)\b/);
    const quiere = /\b(anota|anotame|apunta|apuntame|suma|sumale|agrega|agregame|registra|ponme|pon|hice|sali|predique|estuve|meti|llevo hoy)\b/.test(t);
    const quitar = /\b(quita|quitame|resta|restale|borra|me equivoque)\b/.test(t);
    if (mH && (quiere || quitar)) {
      let h = mH[4] ? 0.5 : mH[5] ? +mH[5] / 60 : numero(mH[1]) + (mH[3] ? 0.5 : 0);
      if (/\by media\b/.test(t) && !mH[3] && !mH[4] && !mH[5]) h += 0.5;
      if (quitar) h = -Math.min(h, S.horas);
      const f = leerFecha(t) || hoy;
      if (h) {
        S.horas += h; pila.push(() => { S.horas -= h; });
        r.push({ txt: (h > 0 ? 'Listo, anoté ' : 'Listo, quité ') + fmtH(Math.abs(h)) + ' de ' + fmtF(f) + '.', tags: [[(h > 0 ? '+' : '−') + fmtH(Math.abs(h)), ''], ['Este mes: ' + fmtH(S.horas), 'dato']], deshacer: true });
        ultimoTema = 'horas'; hecho = true;
      }
    } else if (mH && !quiere && !quitar && /\b(si|y)\b.*\b(hago|hiciera|saliera)\b/.test(t)) {
      const h = mH[4] ? 0.5 : numero(mH[1] || '0') + (mH[3] ? 0.5 : 0), falta = Math.max(0, S.meta - S.horas - h);
      r.push({ txt: 'Si haces ' + fmtH(h) + ' más, llegarías a ' + fmtH(S.horas + h) + '. Te quedarían ' + fmtH(falta) + ' para tu meta.' }); hecho = hipo = true;
    }
    // Horas: consultas
    if (!hipo && /cuant[oa]s? (horas )?(llevo|tengo|hice|me faltan?|falta)|como voy|como va mi (mes|meta)|mi meta|y cuanto me falta|cuanto me falta/.test(t) || (!hipo && /\bfalta\b/.test(t) && ultimoTema === 'horas')) {
      const falta = Math.max(0, S.meta - S.horas), dias = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate() - hoy.getDate() + 1;
      r.push({ txt: 'Llevas ' + fmtH(S.horas) + ' de ' + S.meta + ' h este mes. ' + (falta ? 'Te faltan ' + fmtH(falta) + ', unas ' + fmtH(falta / dias) + ' por día.' : '¡Ya llegaste a tu meta!'),
        tags: [['Progreso: ' + Math.round(S.horas / S.meta * 100) + '%', 'dato']] });
      ultimoTema = 'horas'; hecho = true;
    }
    // Nueva persona
    const mNueva = t.match(/(?:conoci a|agrega a|agregame a|anade a|nueva revisita|nuevo curso|agrega una revisita|agrega un curso|empece un curso con|empece a estudiar con|se llama)\s+(?:una? (?:senora|senor|joven|chica|chico|persona)\s+(?:que se llama\s+|llamad[ao]\s+)?)?(?:que se llama\s+|llamad[ao]\s+|se llama\s+)?([a-z]+(?:\s+(?!en\b|de\b|y\b|el\b|la\b|a\b|vive\b|que\b|para\b|como\b|lo\b|le\b)[a-z]+)?)/);
    if (!hecho && mNueva && !/^(una?|la|el|mi)$/.test(mNueva[1])) {
      const nombre = mNueva[1].split(' ').map((x) => x[0].toUpperCase() + x.slice(1)).join(' ');
      const curso = /curso|estudi/.test(t), f = leerFecha(t), h = leerHora(t);
      const dirM = t.match(/\b(?:vive en|en (?:la )?(?:calle|av|avenida|jiron|jr|pasaje))\s+([a-z0-9 ]+?)(?=,| y | vuelvo| la visito| el | a las|$)/);
      const p = { nombre, tipo: curso ? 'curso' : 'revisita', fecha: f, hora: h || (f ? '16:00' : null), tema: null, dir: dirM ? dirM[1].replace(/^(.)/, (c) => c.toUpperCase()) : null, tel: null };
      S.personas.push(p); ultimaPersona = p; pila.push(() => { S.personas.splice(S.personas.indexOf(p), 1); });
      const tags = [['Persona nueva: ' + nombre, ''], [curso ? 'Curso bíblico' : 'Revisita', 'dato']];
      if (p.dir) tags.push([p.dir, 'dato']);
      if (f) tags.push([fmtF(f) + ' ' + fmtHora(p.hora), 'dato']); else tags.push(['Falta el día de la visita', 'falta']);
      r.push({ txt: 'Guardé a ' + nombre + (curso ? ' en tus cursos' : ' en tus revisitas') + (f ? ', con visita el ' + fmtF(f) + ' a las ' + fmtHora(p.hora) + '. Te aviso antes.' : '. ¿Cuándo vuelves a visitarla?'), tags, deshacer: true });
      hecho = true;
    } else if (!hecho && /\b(agrega|agregar|nueva|nuevo|anade)\b.*\b(revisita|persona|curso)\b/.test(t)) {
      r.push({ txt: 'Dale. ¿Cómo se llama y cuándo vuelves a visitarla?' }); hecho = true;
    }
    // Mover una visita
    if (!hecho && /\b(cambia|mueve|muevelo|muevela|pasa|pasala|pasalo|cambiala|cambialo|reprograma|posterga)\b/.test(t)) {
      const p = buscarPersona(t), f = leerFecha(t), h = leerHora(t);
      if (!p) r.push({ txt: '¿De quién es la visita que quieres mover? Tengo a ' + S.personas.map((x) => x.nombre.split(' ')[0]).join(', ') + '.' });
      else if (!f) r.push({ txt: '¿Para qué día muevo la visita de ' + p.nombre.split(' ')[0] + '?' });
      else {
        const antes = [p.fecha, p.hora]; p.fecha = f; if (h) p.hora = h; ultimaPersona = p;
        pila.push(() => { p.fecha = antes[0]; p.hora = antes[1]; });
        r.push({ txt: 'Listo, pasé la visita de ' + p.nombre.split(' ')[0] + ' al ' + fmtF(f) + ' a las ' + fmtHora(p.hora) + '. También moví su aviso.', tags: [['Visita movida', '']], deshacer: true });
      }
      hecho = true;
    }
    // Asignación
    const mAsig = t.match(/\b(lectura de la biblia|lectura|discurso|empiece conversaciones|haga revisitas|haga discipulos|perlas escondidas|perlas|presidente|oracion)\b/);
    if (!hecho && mAsig && /\b(tengo|me toca|me dieron|me asignaron|anota|agrega)\b/.test(t)) {
      const NOMBRES = { 'lectura de la biblia': 'Lectura de la Biblia', lectura: 'Lectura de la Biblia', 'perlas escondidas': 'Perlas escondidas', perlas: 'Perlas escondidas', oracion: 'Oración' };
      const f = leerFecha(t), nombre = NOMBRES[mAsig[1]] || mAsig[1][0].toUpperCase() + mAsig[1].slice(1);
      if (!f) r.push({ txt: '¿Qué día te toca ' + mAsig[1] + '?' });
      else {
        const a = { parte: nombre, fecha: f, hora: leerHora(t) || '19:00' }; S.asig.push(a); pila.push(() => { S.asig.splice(S.asig.indexOf(a), 1); });
        r.push({ txt: 'Anoté tu asignación: ' + nombre + ', el ' + fmtF(f) + ' a las ' + fmtHora(a.hora) + '. Te aviso un día antes.', tags: [['Asignación nueva', ''], [fmtF(f), 'dato']], deshacer: true });
      }
      hecho = true;
    }
    // Agenda
    const mAg = t.match(/que (tengo|hay|me toca)\s*(para\s+)?(hoy|manana|esta semana|la semana|el \w+|\w+)?/);
    if (!hecho && (mAg || /a quien me toca|mi agenda|mi semana/.test(t))) {
      let desde = 0, hasta = 0, etiqueta = 'hoy';
      if (/manana/.test(t)) { desde = hasta = 1; etiqueta = 'mañana'; }
      else if (/semana|a quien me toca/.test(t)) { desde = 0; hasta = 6; etiqueta = 'esta semana'; }
      else { const f = leerFecha(t); if (f) { desde = hasta = Math.round((f - hoy) / 864e5); etiqueta = 'el ' + fmtF(f); } }
      const dentro = (d) => { const n = Math.round((d - hoy) / 864e5); return n >= desde && n <= hasta; };
      const items = [
        ...S.personas.filter((p) => p.fecha && dentro(p.fecha)).map((p) => [p.fecha, p.hora, 'Visita a ' + p.nombre.split(' ')[0]]),
        ...S.asig.filter((a) => dentro(a.fecha)).map((a) => [a.fecha, a.hora, a.parte])
      ].sort((a, b) => a[0] - b[0] || a[1].localeCompare(b[1]));
      r.push(items.length
        ? { txt: 'Para ' + etiqueta + ' tienes:\n' + items.map((x) => '· ' + (hasta ? fmtF(x[0]) + ', ' : '') + fmtHora(x[1]) + ' — ' + x[2]).join('\n') }
        : { txt: 'No tienes nada para ' + etiqueta + '. Buen momento para salir a predicar.' });
      hecho = true;
    }
    // Ficha de una persona
    if (!hecho && /dime todo de|quien es|donde vive|telefono de|numero de|cuando (vuelvo|veo|visito)|su (direccion|telefono|numero)|que tema/.test(t)) {
      const p = buscarPersona(t);
      if (!p) r.push({ txt: 'No encontré a esa persona. Tengo a ' + S.personas.map((x) => x.nombre).join(', ') + '.' });
      else {
        ultimaPersona = p;
        const l = [p.nombre + ' (' + (p.tipo === 'curso' ? 'curso bíblico' : 'revisita') + ')'];
        if (p.dir) l.push('Vive en ' + p.dir); if (p.tel) l.push('Teléfono: ' + p.tel);
        if (p.tema) l.push('Tema: ' + p.tema); if (p.fecha) l.push('Próxima visita: ' + fmtF(p.fecha) + ', ' + fmtHora(p.hora));
        r.push({ txt: l.join('\n'), botones: p.tel ? ['Llamar', 'WhatsApp', 'Cómo llegar'] : ['Cómo llegar'] });
      }
      hecho = true;
    }
    if (!hecho && /\b(borra|borrame|elimina)\b/.test(t)) { r.push({ txt: 'Por seguridad no borro personas desde aquí. En la app lo haces desde su ficha, y siempre te pido confirmar.' }); hecho = true; }
    if (!hecho && /mis (revisitas|cursos|personas)/.test(t)) {
      const c = /cursos/.test(t), lista = S.personas.filter((p) => /personas/.test(t) || (c ? p.tipo === 'curso' : p.tipo === 'revisita'));
      r.push({ txt: (lista.length ? 'Tienes ' + lista.length + ':\n' + lista.map((p) => '· ' + p.nombre + (p.fecha ? ', ' + fmtF(p.fecha) : '')).join('\n') : 'Todavía no tienes ninguna.') });
      hecho = true;
    }
    if (!hecho && /horario|organizar mi semana|organizarme/.test(t)) { r.push({ txt: 'En la app te armo un horario según los días y horas que tengas libres. Aquí, en la demo, todavía no puedo hacerlo.' }); hecho = true; }

    if (!r.length) r.push({ txt: 'No estoy segura de haber entendido. En esta demo entiendo lo básico: prueba con «anota dos horas», «¿qué tengo mañana?» o «conocí a Marta, vuelvo el sábado a las 10».' });
    return r;
  }
  function deshacer() {
    const f = pila.pop();
    if (!f) return { txt: 'No hay nada que deshacer.' };
    f(); return { txt: 'Listo, lo deshice.', tags: [['Cambio deshecho', 'dato']] };
  }

  // ── Pintar ──
  const fila = (html) => { const d = document.createElement('div'); d.innerHTML = html; const n = d.firstElementChild; cuerpo.appendChild(n); cuerpo.scrollTop = cuerpo.scrollHeight; return n; };
  const AV = '<svg class="dc-av" viewBox="0 0 120 120" aria-hidden="true"><use href="#nubi"/></svg>';
  function responder(lista) {
    lista.forEach((x) => {
      fila('<div class="dc-fila">' + AV + '<div class="dc-msg el">' + esc(punto(x.txt)) + '</div></div>');
      if (x.tags && x.tags.length) fila('<div class="dc-acciones">' + x.tags.map(([s, k]) => '<span class="dc-acc ' + k + '">' + (k ? '' : OK) + esc(s) + '</span>').join('') + '</div>');
      if (x.botones) fila('<div class="dc-botones">' + x.botones.map((b, i) => '<span' + (i ? '' : ' class="prin"') + '>' + esc(b) + '</span>').join('') + '</div>');
      if (x.deshacer) {
        const b = fila('<div class="dc-botones"><button type="button" class="dc-deshacer">Deshacer</button></div>').querySelector('button');
        b.addEventListener('click', () => { b.disabled = true; enviar('Deshacer', true); });
      }
    });
  }
  let ocupado = false;
  function enviar(texto, directo) {
    texto = texto.trim(); if (!texto || ocupado) return;
    ocupado = true;
    fila('<div class="dc-msg yo">' + esc(texto) + '</div>');
    const pens = fila('<div class="dc-fila">' + AV + '<div class="dc-pensando"><i></i><i></i><i></i></div></div>');
    const r = directo ? [deshacer()] : entender(texto);
    setTimeout(() => { pens.remove(); responder(r); ocupado = false; entrada.focus({ preventScroll: true }); }, menosMov ? 0 : 450 + Math.random() * 450);
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); const v = entrada.value; entrada.value = ''; enviar(v); });
  responder([{ txt: '¡Hola! Soy Orby. Escríbeme como le hablarías a alguien: «hoy salí dos horas y media», «¿qué tengo esta semana?» o «pasa lo de Rosa al sábado».' }]);
})();
