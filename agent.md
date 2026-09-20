# Arquitectura local

El proyecto usa una extensión Chrome y un proxy local de Node.js.

```text
Extensión Chrome → http://localhost:8787 → OpenCode Inference
```

La extensión no conoce claves de proveedores. El proxy se configura mediante `ai-proxy/.dev.vars`, ignorado por Git, y se inicia con `npm run dev`.

El proxy valida entradas, limita solicitudes en memoria, controla CORS para el ID exacto de la extensión, exige un token propio y no guarda prompts. Como es uso local, el límite se reinicia al detener el proceso y no está pensado para publicarse en Internet.

El adaptador por defecto es OpenCode con `mimo-v2.5-free`; los demás adaptadores siguen disponibles si se configuran sus variables locales.
