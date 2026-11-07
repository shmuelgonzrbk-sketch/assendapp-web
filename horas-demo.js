// «Tus horas, sin sacar cuentas»: la pantalla de Horas de la app, de verdad.
// Usa la fecha de hoy, guarda lo que anotas solo en este navegador y no hace nada más.
(function () {
  const raiz = document.getElementById('horasDemo');
  if (!raiz) return;
  const $ = (s) => raiz.querySelector(s);
  const META = 50;
  const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hoy = new Date();
  const clave = 'orbyHorasDemo-' + hoy.toISOString().slice(0, 10);
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const diaSemana = ((hoy.getDay() + 6) % 7) + 1;                 // lunes = 1 … domingo = 7
  const metaSemana = Math.round(META * 7 / diasMes * 2) / 2;
  const esperadoHoy = metaSemana * diaSemana / 7;
  // Lo que «ya llevabas» antes de hoy: un poco atrasado, para que se note el cambio al anotar
  const semanaAntes = Math.max(0, Math.round((esperadoHoy - 2.5) * 2) / 2);
  const mesAntes = Math.max(semanaAntes, Math.round(META * (hoy.getDate() - 1) / diasMes * 0.8 * 2) / 2);

  let horasHoy = 0;
  try { horasHoy = Math.max(0, parseFloat(localStorage.getItem(clave)) || 0); } catch (e) {}

  const fmt = (h) => {
    const t = Math.round(h * 60), hh = Math.floor(t / 60), mm = t % 60;
    if (!hh) return mm + ' min';
    return mm ? hh + ' h ' + mm + ' min' : hh + ' h';
  };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  $('#hdMes').textContent = cap(MES[hoy.getMonth()]) + ' ' + hoy.getFullYear();
  $('#hdFecha').textContent = DIA[hoy.getDay()] + ' ' + hoy.getDate() + ' ' + MES[hoy.getMonth()].slice(0, 3);

  let mostrado = mesAntes + horasHoy, animando = 0;
  function contar(desde, hasta) {
    cancelAnimationFrame(animando);
    const t0 = performance.now(), dur = 520;
    const paso = (t) => {
      const k = Math.min(1, (t - t0) / dur), v = desde + (hasta - desde) * (1 - Math.pow(1 - k, 3));
      $('#hdTotal').textContent = (Math.round(v * 2) / 2).toString().replace('.5', ',5');
      if (k < 1) animando = requestAnimationFrame(paso);
    };
    animando = requestAnimationFrame(paso);
  }

  function pintar(cambio) {
    const total = mesAntes + horasHoy, semana = semanaAntes + horasHoy;
    if (cambio) contar(mostrado, total); else $('#hdTotal').textContent = String(total).replace('.5', ',5');
    mostrado = total;
    const falta = Math.max(0, META - total), dias = diasMes - hoy.getDate() + 1;
    $('#hdBarra').style.width = Math.min(100, total / META * 100) + '%';
    $('#hdFalta').textContent = falta > 0 ? 'Te faltan ' + fmt(falta) + ' · unas ' + fmt(falta / dias) + ' por día' : '¡Llegaste a tu meta del mes!';
    $('#hdHoy').textContent = fmt(horasHoy);
    $('#hdMenos').disabled = horasHoy <= 0;
    // Franja de la semana
    const banda = $('#hdSemana'), vaBien = semana >= esperadoHoy;
    banda.classList.toggle('bien', vaBien);
    $('#hdSemTit').textContent = vaBien ? 'Vas bien con tu meta semanal' : 'Vas atrasado esta semana';
    $('#hdSemSub').textContent = vaBien ? 'Llevas ' + fmt(semana) + ' de ' + fmt(metaSemana) + ' esta semana'
      : 'Te faltan ' + fmt(esperadoHoy - semana) + ' para ir al día con tu horario';
    const p = Math.min(1, semana / metaSemana);
    $('#hdAro').style.strokeDashoffset = (1 - p).toFixed(3);
    if (cambio && vaBien !== banda._antes) { banda.classList.remove('salta'); void banda.offsetWidth; banda.classList.add('salta'); }
    banda._antes = vaBien;
    try { localStorage.setItem(clave, horasHoy); } catch (e) {}
  }

  function sumar(x, boton) {
    const nuevo = Math.max(0, Math.min(16, horasHoy + x));
    if (nuevo === horasHoy) return;
    horasHoy = nuevo;
    const n = $('#hdHoy'); n.classList.remove('sube', 'baja'); void n.offsetWidth; n.classList.add(x > 0 ? 'sube' : 'baja');
    if (boton) { boton.classList.remove('toque'); void boton.offsetWidth; boton.classList.add('toque'); }
    pintar(true);
  }
  $('#hdMenos').addEventListener('click', (e) => sumar(-0.5, e.currentTarget));
  $('#hdMas').addEventListener('click', (e) => sumar(0.5, e.currentTarget));
  raiz.querySelectorAll('[data-sumar]').forEach((b) => b.addEventListener('click', () => sumar(+b.dataset.sumar, b)));
  pintar(false);
})();
