# Proxy local con OpenCode gratuito

Este proxy se ejecuta exclusivamente en tu ordenador. No se despliega ni requiere servicios externos adicionales.

## Inicio rápido

1. En `chrome://extensions`, activa Modo de desarrollador, carga la carpeta raíz del proyecto y copia el ID de Prompt Optimizer.
2. Abre PowerShell en la raíz y ejecuta:

```powershell
cd .\ai-proxy
npm install
```

3. Genera un token propio:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

4. Calcula su hash; pega el token cuando lo solicite:

```powershell
node -e "const r=require('node:readline').createInterface({input:process.stdin,output:process.stdout});r.question('Token: ',t=>{console.log(require('node:crypto').createHash('sha256').update(t).digest('hex'));r.close()})"
```

5. Crea `ai-proxy/.dev.vars` con esta configuración:

```text
AI_BASE_URL=https://opencode.ai/inference/openai/v1
DEFAULT_PROVIDER=opencode
DEFAULT_MODEL=mimo-v2.5-free
PROVIDER_MODELS={"opencode":["mimo-v2.5-free"]}
ALLOWED_ORIGINS=chrome-extension://PEGA_EL_ID_DE_LA_EXTENSION
MAX_PROMPT_CHARS=12000
REQUEST_TIMEOUT_MS=25000
RATE_LIMIT_PER_DAY=100
CLIENT_TOKEN_HASHES=PEGA_EL_HASH_DEL_TOKEN
```

No añadas `AI_API_KEY`: OpenCode permite llamar a `mimo-v2.5-free` sin ella. El proxy añade `/chat/completions` automáticamente. [Documentación de OpenCode](https://opencode.ai/console/guides/inference)

6. Arranca el proxy:

```powershell
npm run dev
```

Déjalo abierto. El proxy queda disponible en `http://localhost:8787`.

7. En el engranaje de la extensión configura:

```text
Endpoint del proxy: http://localhost:8787/api/generate
Token del proxy: el token original del paso 3
```

Acepta el permiso para `localhost`, vuelve al popup y prueba a optimizar un prompt.

## Comprobar que funciona

En otra terminal:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
npm run typecheck
npm test
```

La primera orden debe devolver `{ "status": "ok" }`.

## Seguridad local

- `.dev.vars` está ignorado por Git y no debe compartirse.
- El token del proxy no es una clave de OpenCode y se puede cambiar cuando quieras: genera otro y sustituye su hash y el valor guardado en la extensión.
- El límite de peticiones vive en memoria y se reinicia al detener `npm run dev`; esto es apropiado para uso local en un único equipo.
- No se guardan prompts ni API keys.

## Modelo de OpenCode con token

Para usar un modelo de OpenCode que requiera token, añade a `.dev.vars`:

```text
AI_API_KEY=TU_TOKEN_DE_OPENCODE
DEFAULT_MODEL=ID_REAL_DEL_MODELO
PROVIDER_MODELS={"opencode":["ID_REAL_DEL_MODELO"]}
```

Conserva `AI_BASE_URL=https://opencode.ai/inference/openai/v1` y `DEFAULT_PROVIDER=opencode`. `AI_API_KEY` es solo para OpenCode y nunca se escribe en Chrome. El **Token del proxy** que configuras en la extensión es distinto y debe coincidir con `CLIENT_TOKEN_HASHES`.

## Usarlo en Linux

El proxy también funciona solo en local en Linux; no requiere despliegue. En una terminal:

```bash
cd /ruta/al/proyecto/ai-proxy
npm install
npm run dev
```

Crea `.dev.vars` con la misma configuración indicada arriba. Si Chrome se ejecuta en ese mismo Linux, configura la extensión con `http://localhost:8787/api/generate` y el token original del proxy.

Para iniciarlo automáticamente al encender Linux, crea `/etc/systemd/system/prompt-optimizer-proxy.service`:

```ini
[Unit]
Description=Prompt Optimizer local proxy
After=network.target

[Service]
User=TU_USUARIO
WorkingDirectory=/ruta/al/proyecto/ai-proxy
ExecStart=/usr/bin/npm run dev
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Actívalo con:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now prompt-optimizer-proxy
```

Este modo es para el mismo ordenador: no expongas el puerto 8787 en la red.

## Usar LiteLLM local u otro servidor OpenAI-compatible

El proxy también funciona con LiteLLM o cualquier servidor compatible con `POST /v1/chat/completions`. Para una configuración con URL `http://172.16.2.193:4000/v1` y modelo `EM-IA-Code`, usa en `.dev.vars`:

```text
AI_BASE_URL=http://172.16.2.193:4000/v1
AI_API_KEY=TU_TOKEN_DE_LITELLM
DEFAULT_PROVIDER=opencode
DEFAULT_MODEL=EM-IA-Code
PROVIDER_MODELS={"opencode":["EM-IA-Code"]}
ALLOWED_ORIGINS=chrome-extension://TU_ID_REAL_DE_CHROME
MAX_PROMPT_CHARS=12000
REQUEST_TIMEOUT_MS=25000
RATE_LIMIT_PER_DAY=100
CLIENT_TOKEN_HASHES=EL_HASH_DE_TU_TOKEN_DEL_PROXY
```

Aunque el proveedor se llame `local` en OpenCode, utiliza `DEFAULT_PROVIDER=opencode` aquí: es el adaptador genérico OpenAI-compatible del proxy y ese nombre no se envía a LiteLLM. La llamada final será `http://172.16.2.193:4000/v1/chat/completions`.

El equipo donde ejecutas `npm run dev` debe poder acceder a esa IP privada. Si has compartido un token real, rótalo en LiteLLM y sustituye el valor local; nunca lo guardes en la extensión ni en Git.
