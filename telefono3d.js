// Teléfono 3D interactivo de la portada (Three.js, geometría hecha aquí mismo).
// Si no hay WebGL o algo falla, se queda el teléfono de CSS que ya está en la página.
import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { crearChat } from './chat-nubi.js';
import { crearVoz } from './voz-nubi.js';

// Cada .movil de la página se vuelve un teléfono 3D.
// data-respaldo="chat" o "voz": mientras no exista su video, la pantalla muestra esa animación.
document.querySelectorAll('.movil').forEach((caja) => iniciar(caja).catch((e) => { caja.classList.add('sin-3d'); console.warn('Teléfono 3D no disponible:', e); }));

// Sin WebGL: el chat animado va dentro del teléfono de CSS
function chatSinWebGL(caja, chat, menosMovimiento) {
  const pant = caja.querySelector('.movil-pantalla');
  if (!pant) return;
  chat.canvas.className = 'movil-chat';
  pant.insertBefore(chat.canvas, pant.firstChild);
  if (menosMovimiento) { chat.final(); return; }
  let ant = performance.now();
  const paso = (t) => { chat.avanzar(Math.min(0.05, (t - ant) / 1000)); ant = t; requestAnimationFrame(paso); };
  requestAnimationFrame(paso);
}

function hayWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

// Rectángulo con esquinas redondeadas centrado en el origen
function forma(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

// Plano con forma redondeada y UV de 0 a 1 (para poner el video)
function planoRedondo(w, h, r) {
  const g = new THREE.ShapeGeometry(forma(w, h, r), 24);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
  return g;
}

function bloque(w, h, d, r, bisel) {
  const g = new THREE.ExtrudeGeometry(forma(w, h, r), {
    depth: d, bevelEnabled: true, bevelThickness: bisel, bevelSize: bisel, bevelSegments: 8, curveSegments: 24,
  });
  g.translate(0, 0, -d / 2);
  return g;
}

function texturaSombra() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(23,23,23,.55)'); gr.addColorStop(.55, 'rgba(23,23,23,.18)'); gr.addColorStop(1, 'rgba(23,23,23,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

async function iniciar(caja) {
  const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let chat = caja.dataset.respaldo === 'chat' ? crearChat() : caja.dataset.respaldo === 'voz' ? crearVoz() : null;
  if (!hayWebGL()) { caja.classList.add('sin-3d'); if (chat) chatSinWebGL(caja, chat, menosMovimiento); return; }

  // ── Escenario ──
  const escenario = document.createElement('div');
  escenario.className = 'movil-3d';
  escenario.innerHTML = `
    <canvas tabindex="0" aria-label="Teléfono con la app Orby. Arrástralo o usa las flechas del teclado para girarlo."></canvas>
    <p class="movil-pista" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>Arrastra para explorar</p>
    <button class="movil-reiniciar" type="button" aria-label="Volver el teléfono a su posición inicial" hidden>
      <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>Volver al frente</button>`;
  const canvas = escenario.querySelector('canvas');
  const pista = escenario.querySelector('.movil-pista');
  const reiniciar = escenario.querySelector('.movil-reiniciar');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camara = new THREE.PerspectiveCamera(24, 1, 20, 160); // capas separadas: más precisión de profundidad en celulares
  camara.position.set(0, 4.5, 46);

  const luz = new THREE.DirectionalLight(0xffffff, 1.6); luz.position.set(-12, 18, 20); escena.add(luz);
  const contra = new THREE.DirectionalLight(0xd9e3ff, 1.1); contra.position.set(14, -4, -16); escena.add(contra);

  // ── Pantalla: primero la portada o el chat animado; el video entra cuando de verdad se reproduce ──
  const fuente = caja.querySelector('video source')?.src;
  const portada = caja.querySelector('video')?.poster;
  let mapa = null;
  if (chat) { mapa = new THREE.CanvasTexture(chat.canvas); if (menosMovimiento) chat.final(); else chat.avanzar(0); }
  else if (portada) mapa = new THREE.TextureLoader().load(portada);
  if (mapa) { mapa.colorSpace = THREE.SRGBColorSpace; mapa.anisotropy = 4; }
  const video = document.createElement('video');
  if (fuente) {
    Object.assign(video, { src: fuente, muted: true, loop: true, playsInline: true, preload: 'auto' });
    video.setAttribute('playsinline', '');
    video.addEventListener('playing', () => {
      const vt = new THREE.VideoTexture(video); vt.colorSpace = THREE.SRGBColorSpace;
      pantallaMat.map = vt; pantallaMat.color.set(0xffffff); pantallaMat.needsUpdate = true;
      chat = null;
    }, { once: true });
    video.addEventListener('error', () => { /* sin video: se queda la portada o el chat */ });
    video.play().catch(() => {});
  }

  // ── Teléfono (medidas en mm/10: 7,2 × 15,6 × 0,82 cm) ──
  const W = 7.2, H = 15.6, D = 0.62, R = 1.05, B = 0.1;
  const telefono = new THREE.Group();
  escena.add(telefono);

  const metal = new THREE.MeshPhysicalMaterial({ color: 0x3b3e44, metalness: 1, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.25 });
  const vidrioNegro = new THREE.MeshPhysicalMaterial({ color: 0x060607, metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03 });
  const traseraMat = new THREE.MeshPhysicalMaterial({ color: 0x24272c, metalness: 0.2, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 });
  const oscuro = new THREE.MeshStandardMaterial({ color: 0x0d0e10, metalness: 0.3, roughness: 0.6 });

  // Marco metálico
  telefono.add(new THREE.Mesh(bloque(W - 2 * B, H - 2 * B, D, R, B), metal));

  const zFrente = D / 2 + B, zAtras = -(D / 2 + B);
  // Cristal frontal (negro, con reflejos)
  const frente = new THREE.Mesh(planoRedondo(W - 0.16, H - 0.16, R - 0.08), vidrioNegro);
  frente.position.z = zFrente + 0.02; telefono.add(frente);
  // Pantalla con el video
  const SW = W - 0.42, SH = SW * 20 / 9 > H - 0.42 ? H - 0.42 : SW * 20 / 9;
  const pantallaMat = new THREE.MeshBasicMaterial({ map: mapa || null, color: mapa ? 0xffffff : 0x111111, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -8 });
  const pantalla = new THREE.Mesh(planoRedondo(SW, SH, R - 0.22), pantallaMat);
  pantalla.position.z = zFrente + 0.05; pantalla.renderOrder = 1; telefono.add(pantalla);
  // Capa de vidrio encima: solo aporta reflejos suaves
  const brillo = new THREE.Mesh(planoRedondo(W - 0.16, H - 0.16, R - 0.08),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, roughness: 0.02, metalness: 0, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false }));
  brillo.position.z = zFrente + 0.09; brillo.renderOrder = 2; telefono.add(brillo);
  // Cámara frontal
  const perforacion = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), new THREE.MeshPhysicalMaterial({ color: 0x020203, roughness: 0.1, clearcoat: 1 }));
  perforacion.position.set(0, SH / 2 - 0.42, zFrente + 0.07); perforacion.renderOrder = 2; telefono.add(perforacion);

  // Tapa trasera de vidrio esmerilado
  const atras = new THREE.Mesh(planoRedondo(W - 0.16, H - 0.16, R - 0.08), traseraMat);
  atras.rotation.y = Math.PI; atras.position.z = zAtras - 0.02; telefono.add(atras);

  // Módulo de cámaras traseras
  const modulo = new THREE.Mesh(bloque(2.5, 3.4, 0.08, 0.55, 0.06), new THREE.MeshPhysicalMaterial({ color: 0x1b1d21, metalness: 0.6, roughness: 0.25, clearcoat: 1 }));
  modulo.rotation.y = Math.PI; modulo.position.set(W / 2 - 1.65, H / 2 - 2.15, zAtras - 0.09); telefono.add(modulo);
  const anillo = new THREE.MeshPhysicalMaterial({ color: 0x8d9198, metalness: 1, roughness: 0.18 });
  const lente = new THREE.MeshPhysicalMaterial({ color: 0x0a0c14, metalness: 0.2, roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.02 });
  const zm = zAtras - 0.24;
  [[0.62], [-0.85]].forEach(([dy]) => {
    const cx = W / 2 - 1.65, cy = H / 2 - 2.15 + dy;
    const aro = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.6, 0.2, 48), anillo);
    aro.rotation.x = Math.PI / 2; aro.position.set(cx, cy, zm); telefono.add(aro);
    const vid = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.22, 48), lente);
    vid.rotation.x = Math.PI / 2; vid.position.set(cx, cy, zm - 0.02); telefono.add(vid);
    const pupila = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), new THREE.MeshPhysicalMaterial({ color: 0x1c2a55, roughness: 0.05, clearcoat: 1 }));
    pupila.rotation.y = Math.PI; pupila.position.set(cx, cy, zm - 0.135); telefono.add(pupila);
  });
  const flash = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), new THREE.MeshStandardMaterial({ color: 0xf3ead2, roughness: 0.4, emissive: 0x3a3320 }));
  flash.rotation.y = Math.PI; flash.position.set(W / 2 - 2.55, H / 2 - 2.15, zAtras - 0.135); telefono.add(flash);

  // Botones laterales (derecha: volumen y encendido)
  const boton = (y, largo) => {
    const g = bloque(0.16, largo, 0.18, 0.07, 0.03);
    const m = new THREE.Mesh(g, metal); m.position.set(W / 2 + 0.04, y, 0); telefono.add(m);
  };
  boton(3.4, 2.1); boton(0.9, 1.1);

  // Bordes inferiores: puerto USB-C, parlante y micrófono
  const usb = new THREE.Mesh(bloque(0.9, 0.26, 0.02, 0.12, 0.01), oscuro);
  usb.rotation.x = Math.PI / 2; usb.position.set(0, -H / 2 - 0.005, 0); telefono.add(usb);
  for (let i = 0; i < 6; i++) {
    const h = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), oscuro);
    h.rotation.x = Math.PI / 2; h.position.set(1.15 + i * 0.26, -H / 2 - 0.006, 0); telefono.add(h);
  }
  const mic = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), oscuro);
  mic.rotation.x = Math.PI / 2; mic.position.set(-1.3, -H / 2 - 0.006, 0); telefono.add(mic);
  // Líneas de antena en el marco
  [[W / 2 + 0.005, H / 2 - 1.6, 0, Math.PI / 2], [-W / 2 - 0.005, H / 2 - 1.6, 0, -Math.PI / 2],
   [W / 2 + 0.005, -H / 2 + 1.6, 0, Math.PI / 2], [-W / 2 - 0.005, -H / 2 + 1.6, 0, -Math.PI / 2]].forEach(([x, y, z, ry]) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(D + 0.1, 0.07), new THREE.MeshStandardMaterial({ color: 0x77797e, roughness: 0.5 }));
    l.position.set(x, y, z); l.rotation.y = ry; telefono.add(l);
  });

  // Sombra de contacto en el piso (cambia con la orientación)
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texturaSombra(), transparent: true, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2; sombra.position.y = -H / 2 - 0.45; escena.add(sombra);

  // ── Movimiento ──
  const REPOSO_Y = -0.38, REPOSO_X = 0.07, LIM_X = 0.55;
  let rotY = REPOSO_Y, rotX = REPOSO_X, velY = 0, velX = 0;
  let arrastrando = false, ultimoToque = -1e9, ultimoX = 0, ultimoY = 0, ultimoT = 0, volviendo = false;
  let tiempo = 0;

  const idaAlReposo = () => {
    // El reposo más cercano a la vuelta actual, para no dar media vuelta de regreso
    const k = Math.round((rotY - REPOSO_Y) / (Math.PI * 2));
    return REPOSO_Y + k * Math.PI * 2;
  };

  canvas.addEventListener('pointerdown', (e) => {
    arrastrando = true; volviendo = false; velY = velX = 0;
    ultimoX = e.clientX; ultimoY = e.clientY; ultimoT = performance.now();
    canvas.setPointerCapture?.(e.pointerId);
    escenario.classList.add('agarrado');
    pista.classList.add('oculta');
    reiniciar.hidden = false;
  });
  const mover = (e) => {
    if (!arrastrando) return;
    const ahora = performance.now(), dt = Math.max(1, ahora - ultimoT);
    const dx = e.clientX - ultimoX, dy = e.clientY - ultimoY;
    const fx = 0.0095, fy = 0.006;
    rotY += dx * fx;
    // Resistencia tipo goma al pasar el límite de inclinación
    const fuera = Math.abs(rotX) > LIM_X ? 0.3 : 1;
    rotX += dy * fy * fuera;
    velY = (dx * fx) * (16 / dt); velX = (dy * fy * fuera) * (16 / dt);
    ultimoX = e.clientX; ultimoY = e.clientY; ultimoT = ahora;
  };
  const soltar = () => {
    if (!arrastrando) return;
    arrastrando = false; ultimoToque = performance.now();
    escenario.classList.remove('agarrado');
    if (menosMovimiento) velY = velX = 0;
  };
  canvas.addEventListener('pointermove', mover);
  canvas.addEventListener('pointerup', soltar);
  canvas.addEventListener('pointercancel', soltar);
  canvas.addEventListener('lostpointercapture', soltar);

  canvas.addEventListener('keydown', (e) => {
    const paso = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] }[e.key];
    if (!paso) return;
    e.preventDefault(); pista.classList.add('oculta'); reiniciar.hidden = false;
    velY += paso[0] * 0.18; velX += paso[1] * 0.18; ultimoToque = performance.now();
  });

  reiniciar.addEventListener('click', () => {
    volviendo = true; velY = velX = 0; ultimoToque = -1e9; reiniciar.hidden = true;
    canvas.focus({ preventScroll: true });
  });

  // ── Tamaño ──
  const ajustar = () => {
    const r = escenario.getBoundingClientRect();
    if (!r.width) return;
    renderer.setSize(r.width, r.height, false);
    camara.aspect = r.width / r.height;
    // Que el teléfono quepa a lo alto con un margen
    const alto = H * 1.2;
    const dist = (alto / 2) / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2));
    camara.position.z = Math.max(dist, (W * 1.35 / 2) / Math.tan(THREE.MathUtils.degToRad(camara.fov / 2)) / camara.aspect);
    camara.position.y = camara.position.z * 0.1;
    camara.lookAt(0, -0.6, 0);
    camara.updateProjectionMatrix();
  };
  new ResizeObserver(ajustar).observe(escenario);

  // ── Bucle: solo mientras se ve ──
  let visible = true, anterior = performance.now(), idBucle = 0;
  const reloj = (ahora) => {
    idBucle = requestAnimationFrame(reloj);
    const dt = Math.min(0.05, (ahora - anterior) / 1000); anterior = ahora; tiempo += dt;
    const f = dt * 60;

    if (!arrastrando) {
      // Inercia con desaceleración progresiva
      rotY += velY * f; rotX += velX * f;
      const roce = Math.pow(0.935, f);
      velY *= roce; velX *= roce;
      // Rebote suave en el límite de inclinación
      if (Math.abs(rotX) > LIM_X) {
        const borde = Math.sign(rotX) * LIM_X;
        velX += (borde - rotX) * 0.12 * f; velX *= Math.pow(0.82, f);
      }
      const quieto = Math.abs(velY) < 0.0008 && Math.abs(velX) < 0.0008;
      const pausa = performance.now() - ultimoToque;
      // Volver con calma a una orientación bonita tras unos segundos sin tocar
      if (volviendo || (quieto && pausa > 3500)) {
        const meta = idaAlReposo();
        const vaiven = menosMovimiento ? 0 : Math.sin(tiempo * 0.55) * 0.16;
        const suave = 1 - Math.pow(menosMovimiento ? 0.8 : 0.955, f);
        rotY += (meta + vaiven - rotY) * suave;
        rotX += (REPOSO_X + (menosMovimiento ? 0 : Math.sin(tiempo * 0.4) * 0.03) - rotX) * suave;
        if (volviendo && Math.abs(meta - rotY) < 0.02) volviendo = false;
        if (pausa > 3500 && Math.abs(meta - rotY) < 0.25) reiniciar.hidden = true;
      }
    }
    telefono.rotation.set(rotX, rotY, 0, 'YXZ');
    telefono.position.y = menosMovimiento ? 0 : Math.sin(tiempo * 0.9) * 0.12;

    // La sombra se ensancha o se angosta según cuánto del frente se ve
    const ancho = Math.abs(Math.cos(rotY)) * W + Math.abs(Math.sin(rotY)) * (D + 0.4);
    sombra.scale.set(ancho * 1.6 + 1.5, 3.2 + Math.abs(Math.sin(rotY)) * 1.5, 1);
    sombra.material.opacity = 0.75 - Math.abs(rotX) * 0.5;

    if (chat && !menosMovimiento) { chat.avanzar(dt); mapa.needsUpdate = true; }
    renderer.render(escena, camara);
  };

  const empezar = () => { if (!idBucle) { anterior = performance.now(); idBucle = requestAnimationFrame(reloj); if (fuente) video.play().catch(() => {}); } };
  const parar = () => { cancelAnimationFrame(idBucle); idBucle = 0; if (fuente) video.pause(); };
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible && !document.hidden ? empezar() : parar(); }).observe(escenario);
  document.addEventListener('visibilitychange', () => { document.hidden ? parar() : visible && empezar(); });

  // Cambiar el teléfono de CSS por el 3D
  caja.appendChild(escenario);
  caja.classList.add('con-3d');
  caja.querySelector('.movil-cuerpo video')?.pause();
  ajustar();
  renderer.render(escena, camara);
  empezar();
}
