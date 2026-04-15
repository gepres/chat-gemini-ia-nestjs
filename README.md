# Gemini Backend

Backend API construido con [NestJS](https://nestjs.com/) que integra la API de **Google Gemini** para ofrecer funcionalidades de inteligencia artificial: generacion de texto, chat conversacional con historial y generacion/edicion de imagenes.

Disenado como backend para una aplicacion movil en React Native.

## Caracteristicas

- **Prompt basico** - Enviar un prompt y recibir una respuesta de texto completa.
- **Prompt con streaming** - Enviar un prompt (con archivos adjuntos opcionales) y recibir la respuesta en tiempo real via streaming.
- **Chat con historial** - Conversaciones con contexto persistente en memoria, identificadas por `chatId`.
- **Generacion/edicion de imagenes** - Generar o editar imagenes usando el modelo `gemini-2.5-flash-image`. Las imagenes generadas se guardan en `public/ai-images/`.
- **Subida de archivos** - Soporte para multiples tipos de archivos (imagenes, PDFs, documentos Office) que se envian a Gemini como contexto.

## Tecnologias

- [NestJS](https://nestjs.com/) v11
- [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (`@google/genai`)
- [Sharp](https://sharp.pixelplumbing.com/) - Procesamiento de imagenes
- TypeScript

## Requisitos previos

- Node.js >= 18
- Una API Key de Google Gemini ([obtener aqui](https://aistudio.google.com/apikey))

## Instalacion

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd gemini-backend

# Instalar dependencias
npm install
```

## Configuracion

Crear un archivo `.env` en la raiz del proyecto basandose en `.env.template`:

```bash
GEMINI_API_KEY=tu-api-key-de-gemini
API_URL=http://localhost:3000
```

| Variable         | Descripcion                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `GEMINI_API_KEY` | API Key de Google Gemini                                                    |
| `API_URL`        | URL base del servidor (usada para generar URLs de imagenes generadas)       |

## Ejecucion

```bash
# Modo desarrollo (con hot reload)
npm run start:dev

# Modo produccion
npm run build
npm run start:prod
```

El servidor se inicia en `http://localhost:3000` (o el puerto definido en la variable de entorno `PORT`).

## Endpoints

Todos los endpoints tienen el prefijo `/api/gemini`.

### POST `/api/gemini/basic-prompt`

Enviar un prompt y recibir la respuesta completa.

**Body (JSON):**
```json
{
  "prompt": "Explica que es TypeScript"
}
```

**Respuesta:**
```json
{
  "message": "TypeScript es..."
}
```

---

### POST `/api/gemini/basic-prompt-stream`

Enviar un prompt con archivos opcionales y recibir la respuesta en streaming (`text/plain`).

**Body (multipart/form-data):**
| Campo    | Tipo     | Requerido | Descripcion              |
| -------- | -------- | --------- | ------------------------ |
| `prompt` | string   | Si        | Texto del prompt         |
| `files`  | file[]   | No        | Archivos adjuntos        |

**Respuesta:** `text/plain` (streaming)

---

### POST `/api/gemini/chat-prompt-stream`

Chat conversacional con historial. Cada conversacion se identifica con un `chatId` (UUID).

**Body (multipart/form-data):**
| Campo    | Tipo     | Requerido | Descripcion              |
| -------- | -------- | --------- | ------------------------ |
| `prompt` | string   | Si        | Mensaje del usuario      |
| `chatId` | string   | Si        | UUID de la conversacion  |
| `files`  | file[]   | No        | Archivos adjuntos        |

**Respuesta:** `text/plain` (streaming)

---

### GET `/api/gemini/chat-history/:chatId`

Obtener el historial de una conversacion.

**Respuesta:**
```json
[
  { "role": "user", "parts": "Hola, como estas?" },
  { "role": "model", "parts": "Hola! Estoy bien..." }
]
```

---

### POST `/api/gemini/image-generation`

Generar o editar imagenes. Se pueden enviar imagenes existentes para editarlas.

**Body (multipart/form-data):**
| Campo    | Tipo     | Requerido | Descripcion                          |
| -------- | -------- | --------- | ------------------------------------ |
| `prompt` | string   | Si        | Descripcion de la imagen a generar   |
| `files`  | file[]   | No        | Imagenes base para edicion           |

**Respuesta:**
```json
{
  "imageUrl": "http://localhost:3000/ai-images/uuid.png",
  "text": "Descripcion de la imagen generada"
}
```

## Estructura del proyecto

```
src/
├── main.ts                              # Bootstrap de la aplicacion
├── app.module.ts                        # Modulo raiz
└── gemini/
    ├── gemini.module.ts                 # Modulo Gemini
    ├── gemini.controller.ts             # Controlador con los endpoints
    ├── gemini.service.ts                # Servicio principal
    ├── dtos/
    │   ├── basic-prompt.dto.ts          # DTO para prompts basicos
    │   ├── chat-prompt.dto.ts           # DTO para chat
    │   └── image-generation.dto.ts      # DTO para generacion de imagenes
    ├── helpers/
    │   └── gemini-upload-file.ts        # Helper para subir archivos a Gemini
    └── use-cases/
        ├── basic-prompt.use-case.ts     # Caso de uso: prompt basico
        ├── basic-prompt-stream.use-case.ts  # Caso de uso: prompt con streaming
        ├── chat-prompt-stream.use-case.ts   # Caso de uso: chat con streaming
        └── image-generation.use-case.ts     # Caso de uso: generacion de imagenes
public/
└── ai-images/                           # Imagenes generadas por la IA
```

## Archivos soportados

El sistema acepta los siguientes tipos de archivos para enviar como contexto a Gemini:

| Tipo       | Extensiones                    |
| ---------- | ------------------------------ |
| Imagenes   | `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg` |
| Documentos | `.pdf`, `.doc`, `.docx`        |
| Hojas      | `.xls`, `.xlsx`                |
| Presentaciones | `.ppt`, `.pptx`            |

## Scripts disponibles

| Comando              | Descripcion                        |
| -------------------- | ---------------------------------- |
| `npm run start`      | Iniciar en modo desarrollo         |
| `npm run start:dev`  | Iniciar con hot reload             |
| `npm run start:prod` | Iniciar en modo produccion         |
| `npm run build`      | Compilar el proyecto               |
| `npm run lint`       | Ejecutar linter                    |
| `npm run test`       | Ejecutar tests unitarios           |
| `npm run test:e2e`   | Ejecutar tests end-to-end          |

## Notas

- El historial de chat se mantiene **en memoria** (se pierde al reiniciar el servidor).
- Las imagenes generadas se almacenan en la carpeta `public/ai-images/` y se sirven como archivos estaticos.
- Las respuestas de texto estan configuradas para responder en espanol y formato markdown.
