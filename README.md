[README — asistente-géminis.md](https://github.com/user-attachments/files/31112014/README.asistente-geminis.md)
<div align="center">

# 🤖 Asistente de Código con Gemini

### IA para generación y explicación de código en tiempo real

[![Deploy](https://img.shields.io/badge/🚀_Demo_en_vivo-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://asistente-gemini-production.up.railway.app)
[![Node](https://img.shields.io/badge/Node.js-20.20.2-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> Aplicación web que usa **Google Gemini 2.5 Flash** para generar y explicar código en tiempo real mediante **Server-Sent Events (SSE)** — sin recargar la página.

</div>

---

## ✨ Demo en vivo

🌐 **[https://asistente-gemini-production.up.railway.app](https://asistente-gemini-production.up.railway.app)**

---

## 🚀 Características

- ⚡ **Streaming en tiempo real** con Server-Sent Events (SSE)
- 🤖 **Gemini 2.5 Flash** — modelo de Google de última generación
- 💬 Genera y explica código en múltiples lenguajes
- 🎨 Interfaz web limpia, moderna y responsiva
- 🚀 Deploy en producción con **Railway** (US West)
- 🔒 Variables de entorno seguras para la API Key

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Runtime** | Node.js 20.20.2 |
| **Framework** | Express.js 5 |
| **IA** | Google Gemini 2.5 Flash SDK |
| **Streaming** | Server-Sent Events (SSE) |
| **Frontend** | HTML5 · CSS3 · JavaScript Vanilla |
| **Deploy** | Railway (US West) |

---

## 📁 Estructura del Proyecto

```
asistente-géminis/
├── 📂 backend/          # Servidor Node.js + Express
│   ├── server.js        # Punto de entrada del servidor
│   └── routes/          # Rutas de la API y SSE
├── 📂 Interfaz/         # Frontend estático
│   ├── index.html       # Interfaz principal
│   ├── style.css        # Estilos
│   └── app.js           # Lógica del cliente
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Instalación local

### 1. Clonar el repositorio
```bash
git clone https://github.com/aeygasparr-creador/asistente-geminis.git
cd asistente-geminis
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
# Crear archivo .env en la raíz
cp .env.example .env
```

Edita el archivo `.env`:
```env
GEMINI_API_KEY=tu_api_key_de_google_gemini
PORT=3000
```

> 🔑 Obtén tu API Key gratis en [Google AI Studio](https://aistudio.google.com/app/apikey)

### 4. Ejecutar en desarrollo
```bash
npm start
```

Abre tu navegador en: **http://localhost:3000**

---

## 🔄 ¿Cómo funciona el Streaming?

```
Cliente (Browser)          Servidor (Node.js)         Google Gemini API
     │                           │                           │
     │── POST /chat ────────────>│                           │
     │                           │── generateContentStream ->│
     │                           │<─ chunk 1 ────────────────│
     │<─ SSE: data chunk 1 ──────│                           │
     │                           │<─ chunk 2 ────────────────│
     │<─ SSE: data chunk 2 ──────│                           │
     │                           │<─ chunk N ────────────────│
     │<─ SSE: [DONE] ────────────│                           │
```

El servidor usa `generateContentStream` del SDK de Gemini y reenvía cada fragmento al cliente mediante **SSE**, logrando la experiencia de escritura en tiempo real.

---

## 🌐 Deploy en Railway

Este proyecto está desplegado en **Railway** con las siguientes configuraciones:

- 🖥️ **Región:** US West
- 🔄 **Réplicas:** 1
- 📦 **Node version:** 20.20.2
- 🔁 **Auto-deploy:** activado desde GitHub

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

---

## 👨‍💻 Autor

**Alejandro Eduardo Gaspar Rivera**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gaspar-rivera-alejandro)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat-square&logo=github&logoColor=white)](https://github.com/aeygasparr-creador)

> 🎓 Estudiante de Ingeniería de Sistemas — UNAC | Full Stack Developer

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

⭐ **¡Si te fue útil, dale una estrella al repo!** ⭐

</div>
