// backend/ia.js
import { GoogleGenAI } from '@google/genai';
import config from './config.js';

const ai = new GoogleGenAI({ apiKey: config.apiKey });

// ─── Constantes reutilizables ────────────────────────────────────────────────

const SYSTEM_INSTRUCTION = `Eres un asistente experto en programación.
Responde siempre en español.
Cuando generes código, usa bloques de código con el lenguaje correspondiente.
Sé claro, preciso y didáctico.`;

// Configuración de generación centralizada (DRY)
const GENERATION_CONFIG = {
  temperature:      config.temperature,
  maxOutputTokens:  config.maxOutputTokens,
  systemInstruction: SYSTEM_INSTRUCTION,
};

// ─── Utilidad: validación de prompt ─────────────────────────────────────────

function validarPrompt(prompt) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('El prompt no puede estar vacío o ser inválido.');
  }
}

// ─── Consulta completa (respuesta de una sola vez) ───────────────────────────

export async function consultarIA(prompt) {
  validarPrompt(prompt);

  const inicio = Date.now(); // 📊 Benchmarking

  try {
    const response = await ai.models.generateContent({
      model:    config.modelName,
      contents: prompt,
      config:   GENERATION_CONFIG,
    });

    const latencia = Date.now() - inicio;
    console.log(`[consultarIA] ✅ Respuesta recibida en ${latencia}ms`);

    return response.text;

  } catch (error) {
    console.error('[consultarIA] ❌ Error al consultar la IA:', error.message);
    throw new Error(`Fallo en consultarIA: ${error.message}`);
  }
}

// ─── Streaming (respuesta token a token) ────────────────────────────────────

export async function consultarIAStream(prompt) {
  validarPrompt(prompt);

  const inicio = Date.now(); // 📊 Benchmarking

  try {
    const stream = await ai.models.generateContentStream({
      model:    config.modelName,
      contents: prompt,
      config:   GENERATION_CONFIG,
    });

    const latencia = Date.now() - inicio;
    console.log(`[consultarIAStream] ✅ Stream iniciado en ${latencia}ms`);

    return stream;

  } catch (error) {
    console.error('[consultarIAStream] ❌ Error al iniciar el stream:', error.message);
    throw new Error(`Fallo en consultarIAStream: ${error.message}`);
  }
}
