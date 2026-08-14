// backend/server.js
import express from 'express';
import cors from 'cors';
import { consultarIA, consultarIAStream } from './ia.js';

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ✅ Requerido para Railway, Render, Docker

// ─── MIDDLEWARES ─────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

// ─── RUTAS ───────────────────────────────────────────────────────────────────

// GET - Health check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    mensaje: '🤖 Asistente Gemini activo de ALEJANDRO.GR',
    timestamp: new Date().toISOString(), // 📅 Útil para monitoreo
  });
});

// POST - Consulta normal (respuesta completa)
app.post('/api/consultar', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'El campo prompt es requerido y no puede estar vacío.' });
  }

  const inicio = Date.now(); // 📊 Benchmarking

  try {
    const respuesta = await consultarIA(prompt);
    const latencia = Date.now() - inicio;

    console.log(`[/api/consultar] ✅ Respondido en ${latencia}ms`);
    res.json({ respuesta, latencia }); // Opcional: exponer latencia al frontend

  } catch (error) {
    console.error('[/api/consultar] ❌ Error:', error.message);
    res.status(500).json({ error: 'Error al consultar la IA. Intenta nuevamente.' });
  }
});

// POST - Consulta con streaming (SSE)
app.post('/api/stream', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'El campo prompt es requerido y no puede estar vacío.' });
  }

  // Headers para Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const inicio = Date.now(); // 📊 Benchmarking del stream completo
  let clienteDesconectado = false;

  // ✅ Detectar si el cliente cierra la conexión antes de que termine el stream
  req.on('close', () => {
    clienteDesconectado = true;
    console.warn('[/api/stream] ⚠️ Cliente desconectado antes de finalizar.');
  });

  try {
    const stream = await consultarIAStream(prompt);

    for await (const chunk of stream) {
      // Si el cliente se fue, no tiene sentido seguir procesando
      if (clienteDesconectado) break;

      const texto = chunk.text;
      if (texto) {
        res.write(`data: ${JSON.stringify({ texto })}\n\n`);
      }
    }

    if (!clienteDesconectado) {
      const latencia = Date.now() - inicio;
      console.log(`[/api/stream] ✅ Stream completo en ${latencia}ms`);

      res.write(`data: ${JSON.stringify({ latencia })}\n\n`); // Opcional
      res.write('data: [DONE]\n\n');
    }

    res.end();

  } catch (error) {
    console.error('[/api/stream] ❌ Error:', error.message);

    if (!clienteDesconectado) {
      res.write(`data: ${JSON.stringify({ error: 'Error en el streaming. Intenta nuevamente.' })}\n\n`);
    }
    res.end();
  }
});

// ─── RUTA 404 CATCH-ALL ──────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Ruta '${req.path}' no encontrada.` });
});

// ─── INICIO DEL SERVIDOR ─────────────────────────────────────────────────────

app.listen(PORT, HOST, () => {
  console.log(`✅ Servidor corriendo en http://${HOST}:${PORT}`);
  console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`);
});
