// backend/config.js
import dotenv from 'dotenv';
dotenv.config();

// ─── CONFIGURACIÓN PRINCIPAL ─────────────────────────────────────────────────

const config = {
  // 🔑 Autenticación
  apiKey: process.env.GEMINI_API_KEY,

  // 🤖 Modelo
  modelName: 'gemini-2.5-flash',

  // 🎛️ Parámetros de generación
  temperature:     0.1,       // Rango válido: 0.0 – 2.0 (0.1 = respuestas precisas y deterministas)
  maxOutputTokens: 8192,      // Máximo de tokens en la respuesta

  // 💡 Thinking config (optimización para modelos flash)
  // Reduce el "presupuesto" de razonamiento interno para respuestas más rápidas
  thinkingConfig: {
    thinkingBudget: 0,        // 0 = desactivado (ideal para asistente de código directo)
  },

  // 🌍 Entorno
  nodeEnv: process.env.NODE_ENV || 'development',
  port:    process.env.PORT    || 3000,
};

// ─── VALIDACIONES AL INICIAR ─────────────────────────────────────────────────

// 1. API Key obligatoria
if (!config.apiKey) {
  console.error('❌ ERROR CRÍTICO: GEMINI_API_KEY no encontrada.');
  console.error('   👉 Crea un archivo .env en la raíz del proyecto con:');
  console.error('      GEMINI_API_KEY=tu_clave_aqui');
  process.exit(1);
}

// 2. Nombre del modelo no puede estar vacío
if (!config.modelName || config.modelName.trim().length === 0) {
  console.error('❌ ERROR CRÍTICO: modelName no puede estar vacío en config.js');
  process.exit(1);
}

// 3. Temperature dentro del rango válido de Gemini
if (config.temperature < 0 || config.temperature > 2) {
  console.error(`❌ ERROR CRÍTICO: temperature debe estar entre 0.0 y 2.0. Valor actual: ${config.temperature}`);
  process.exit(1);
}

// 4. Confirmación visual al iniciar (solo en desarrollo)
if (config.nodeEnv === 'development') {
  console.log('⚙️  Configuración cargada:');
  console.log(`   Modelo:      ${config.modelName}`);
  console.log(`   Temperature: ${config.temperature}`);
  console.log(`   Max Tokens:  ${config.maxOutputTokens}`);
  console.log(`   Entorno:     ${config.nodeEnv}`);
  console.log(`   API Key:     ${'*'.repeat(8)}...${config.apiKey.slice(-4)}`); // Nunca loguear la key completa
}

export default config;
