# Prompt_Optimizer.ia

Extensión de Chrome (Manifest V3) para convertir un texto en un prompt Markdown claro y estructurado con ayuda de IA.

## Arquitectura

- `manifest.json`: declara el popup, la página de configuración y permisos mínimos.
- `popup.html`, `popup.css`, `popup.js`: interfaz y comportamiento principal.
- `options.html`, `options.css`, `options.js`: configuración del endpoint de IA.

El popup no guarda los prompts. La única preferencia persistida es la URL del endpoint. No hay claves API en el código ni se solicitan al usuario: el endpoint debe ser un proxy propio que guarde la credencial de su proveedor de IA de forma segura en el servidor.

## Contrato del endpoint

El proxy debe aceptar `POST` con JSON:

```json
{ "instructions": "…", "prompt": "Texto del usuario" }
```

Y responder JSON con uno de estos campos:

```json
{ "result": "# Rol\\n…" }
```

o:

```json
{ "markdown": "# Rol\\n…" }
```

Debe permitir solicitudes CORS desde extensiones Chrome (`chrome-extension://...`).

## Instalación

1. Abre `chrome://extensions` en Google Chrome.
2. Activa **Modo de desarrollador**.
3. Pulsa **Cargar descomprimida** y selecciona la carpeta descargada **Prompt Optimizer**.
4. Abre los detalles de Prompt Optimizer y pulsa **Opciones de extensión** (o el icono de engranaje del popup).
5. Introduce la URL HTTPS de tu proxy y acepta el permiso para ese origen.

## Prueba

1. Abre el icono de la extensión.
2. Pega un prompt y pulsa **Optimizar prompt** (también funciona `Ctrl/Cmd + Enter`).
3. Comprueba que se muestra el Markdown, usa **Copiar** y verifica el portapapeles.
4. Usa **Limpiar** para eliminar el contenido actual.

Si no hay texto, endpoint o conexión, la interfaz muestra un mensaje claro sin perder el contenido introducido.

## Proxy IA incluido

La carpeta [`ai-proxy/`](ai-proxy/README.md) contiene el proxy local: `POST /api/generate`, `GET /api/health`, adaptadores aislados, CORS estricto por ID de extensión, rate limiting local por IP + ID de instalación, validación, timeout y respuestas de error seguras.

El popup guarda únicamente la URL del proxy y un UUID aleatorio de instalación; no persiste prompts ni claves API. Configura en las opciones una URL como `https://mi-proxy.example.com/api/generate`. Las instrucciones de desarrollo, prueba y despliegue están en el [README del proxy](ai-proxy/README.md); las decisiones de arquitectura y las fases restantes, en [`agent.md`](agent.md).

Las opciones de la extensión también solicitan un **token del proxy**. Es un token propio y revocable del servidor; no es ni debe ser una clave de OpenAI, Gemini u otro proveedor.
