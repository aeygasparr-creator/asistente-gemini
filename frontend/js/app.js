// frontend/js/app.js

const chat      = document.getElementById('chat');
const prompt    = document.getElementById('prompt');
const btnEnviar = document.getElementById('btnEnviar');
const statusDot = document.getElementById('statusDot');
const modoBtns  = document.querySelectorAll('.modo-btn');

// ✅ Persistir modo preferido entre sesiones
let modoActual = localStorage.getItem('modoPreferido') || 'explicar';

// ─── MODOS ───────────────────────────────────────────────────────────────────

modoBtns.forEach(btn => {
  // Restaurar modo activo visualmente al cargar
  if (btn.dataset.modo === modoActual) btn.classList.add('activo');

  btn.addEventListener('click', () => {
    modoBtns.forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    modoActual = btn.dataset.modo;
    localStorage.setItem('modoPreferido', modoActual); // ✅ Persistencia
  });
});

// ─── STATUS ──────────────────────────────────────────────────────────────────

async function verificarStatus() {
  try {
    const res = await fetch('/api/status');
    statusDot.className = res.ok
      ? 'ml-auto w-3 h-3 rounded-full bg-green-500'
      : 'ml-auto w-3 h-3 rounded-full bg-red-500';
  } catch {
    statusDot.className = 'ml-auto w-3 h-3 rounded-full bg-red-500';
  }
}

// ✅ Verificar estado cada 30 segundos (detección de caídas en tiempo real)
verificarStatus();
setInterval(verificarStatus, 30_000);

// ─── HISTORIAL ───────────────────────────────────────────────────────────────

function guardarHistorial(rol, texto) {
  try {
    const historial = JSON.parse(localStorage.getItem('historial') || '[]');
    historial.push({ rol, texto: texto.slice(0, 2000), fecha: new Date().toISOString() }); // ✅ Límite por entrada
    if (historial.length > 50) historial.shift();
    localStorage.setItem('historial', JSON.stringify(historial));
  } catch (e) {
    // localStorage lleno (QuotaExceededError) — falla silenciosamente sin romper la UI
    console.warn('[historial] ⚠️ No se pudo guardar en localStorage:', e.message);
  }
}

// ─── CHAT UI ─────────────────────────────────────────────────────────────────

// ✅ Configurar marked con sanitización básica
marked.setOptions({
  breaks: true,    // Saltos de línea con \n
  gfm: true,       // GitHub Flavored Markdown
});

// ✅ Sanitizador simple: elimina atributos de eventos inline (onclick, onerror, etc.)
function sanitizarHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('*').forEach(el => {
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
    });
    if (el.tagName === 'SCRIPT') el.remove();
  });
  return template.innerHTML;
}

function agregarMensaje(rol, texto, esError = false) {
  const div = document.createElement('div');

  if (esError) {
    div.className = 'burbuja-error'; // ✅ Estilo diferenciado para errores
  } else {
    div.className = rol === 'usuario' ? 'burbuja-usuario' : 'burbuja-ia';
  }

  if (rol === 'ia' || esError) {
    div.innerHTML = sanitizarHTML(marked.parse(texto)); // ✅ Sanitizado antes de insertar
    div.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
  } else {
    div.textContent = texto; // textContent es seguro por defecto
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (!esError) guardarHistorial(rol, texto);
  return div;
}

function mostrarTyping() {
  const div = document.createElement('div');
  div.className = 'burbuja-ia typing';
  div.id = 'typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function quitarTyping() {
  document.getElementById('typing')?.remove();
}

// ─── CONSTRUIR PROMPT ────────────────────────────────────────────────────────

function construirPrompt(texto) {
  const prefijos = {
    explicar: `Explica detalladamente el siguiente código o concepto:\n\n${texto}`,
    corregir: `Encuentra y corrige los errores del siguiente código. Explica qué estaba mal:\n\n${texto}`,
    generar:  `Genera código limpio y bien comentado para lo siguiente:\n\n${texto}`,
  };
  return prefijos[modoActual] ?? texto; // ✅ Fallback si modoActual es inválido
}

// ─── ENVIAR ──────────────────────────────────────────────────────────────────

async function enviar() {
  const texto = prompt.value.trim();
  if (!texto) return;

  agregarMensaje('usuario', texto);
  prompt.value = '';
  btnEnviar.disabled = true;
  modoBtns.forEach(b => b.disabled = true); // ✅ Bloquear modos durante la respuesta
  mostrarTyping();

  const promptFinal = construirPrompt(texto);

  try {
    const res = await fetch('/api/stream', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ prompt: promptFinal }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`); // ✅ Validar res.ok

    quitarTyping();

    const burbujaIA    = agregarMensaje('ia', '');
    let   textoCompleto = '';

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lineas = decoder.decode(value, { stream: true }).split('\n'); // ✅ stream:true para chunks partidos
      for (const linea of lineas) {
        if (!linea.startsWith('data: ')) continue;
        const data = linea.slice(6);
        if (data === '[DONE]') break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) throw new Error(parsed.error); // ✅ Manejar errores del servidor en el stream

          if (parsed.texto) {
            textoCompleto += parsed.texto;
            // ✅ Actualizar HTML durante streaming (highlight solo al finalizar)
            burbujaIA.innerHTML = sanitizarHTML(marked.parse(textoCompleto));
            chat.scrollTop = chat.scrollHeight;
          }
        } catch (e) {
          console.warn('[stream] ⚠️ Chunk inválido:', e.message); // ✅ No silencioso
        }
      }
    }

    // ✅ Highlight.js solo una vez al finalizar (no en cada chunk)
    burbujaIA.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    guardarHistorial('ia', textoCompleto);

  } catch (error) {
    quitarTyping();
    console.error('[enviar] ❌', error.message);
    agregarMensaje('ia', `❌ **Error:** ${error.message}`, true); // ✅ Usa burbuja-error
  } finally {
    btnEnviar.disabled = false;
    modoBtns.forEach(b => b.disabled = false); // ✅ Restaurar modos
    prompt.focus();
  }
}

// ─── EVENTOS ─────────────────────────────────────────────────────────────────

btnEnviar.addEventListener('click', enviar);

prompt.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') enviar();
});

// ─── INIT ────────────────────────────────────────────────────────────────────

agregarMensaje('ia', '👋 ¡Hola! Soy tu asistente de código. Puedes **explicarme**, pedirme que **corrija** o que **genere** código. ¿En qué te ayudo hoy?');
