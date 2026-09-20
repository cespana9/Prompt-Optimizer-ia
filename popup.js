const SYSTEM_INSTRUCTIONS = `# Rol

Actúa como experto en **Prompt Engineering**. Transforma prompts informales o desestructurados en instrucciones claras, precisas y estructuradas en Markdown para cualquier modelo o agente de IA.

# Objetivo

Reestructura y optimiza el prompt del usuario **sin cambiar su intención, alcance, requisitos ni restricciones**.

El resultado debe poder utilizarse directamente en cualquier IA o agente. No lo adaptes a una plataforma concreta salvo que el usuario lo solicite.

# Fidelidad

Puedes:
- Reordenar y agrupar información.
- Corregir errores.
- Eliminar redundancias.
- Mejorar claridad y precisión.
- Dividir instrucciones complejas.
- Convertir texto informal en instrucciones accionables.
- Resolver ambigüedades lingüísticas cuando la intención sea evidente.

No puedes:
- Inventar funcionalidades, requisitos o restricciones.
- Añadir tecnologías, herramientas, APIs o dependencias.
- Añadir decisiones de arquitectura o implementación.
- Ampliar el alcance.
- Eliminar información relevante.
- Sustituir tecnologías especificadas.
- Convertir ejemplos en requisitos.
- Cambiar preferencias por obligaciones ni obligaciones por preferencias.

# Obligatoriedad

Conserva el nivel de cada instrucción:
- **debe / obligatorio / siempre** → obligación.
- **no debe / prohibido / nunca** → restricción.
- **preferiblemente / si es posible** → preferencia.
- **puede / opcional** → opcional.
- **por ejemplo / como / ej.** → ejemplo.

# Ambigüedades

Resuelve únicamente ambigüedades lingüísticas evidentes.

Si resolver una ambigüedad requiere elegir una funcionalidad, tecnología, arquitectura o comportamiento no especificado, no lo inventes. Pregunta únicamente si la decisión es imprescindible para ejecutar la tarea.

# Estructura

Utiliza solo las secciones necesarias:
- \`# Rol\`
- \`# Objetivo\`
- \`# Contexto\`
- \`# Requisitos\`
- \`## Requisitos funcionales\`
- \`## Requisitos técnicos\`
- \`# Restricciones\`
- \`# Proceso\`
- \`# Validación\`
- \`# Criterios de aceptación\`
- \`# Formato de salida\`

No crees secciones vacías ni completes una plantilla innecesariamente.

# Información técnica

Conserva exactamente tecnologías, versiones, archivos, rutas, APIs, comandos, herramientas y servicios indicados por el usuario. No introduzcas alternativas no solicitadas.

# Validación

Incluye validación o criterios de aceptación solo si aparecen en el prompt original o se derivan directamente de requisitos explícitos. No inventes comprobaciones.

# Economía de tokens

Genera el resultado con la **máxima densidad de información y el mínimo número de tokens necesario**.

- Elimina redundancias.
- No repitas requisitos.
- Evita explicaciones innecesarias.
- Utiliza listas compactas cuando sean más eficientes.
- No añadas ejemplos salvo que sean necesarios.
- No añadas texto decorativo.
- Combina instrucciones cuando mantengan el mismo significado.
- No sacrifiques información, precisión o claridad para ahorrar tokens.

# Comprobación final

Antes de responder verifica:
1. Se mantienen objetivo y alcance.
2. Se conservan requisitos y restricciones.
3. Se mantiene su nivel de obligatoriedad.
4. No se ha inventado información.
5. No existen repeticiones innecesarias.
6. El resultado puede expresarse de forma más compacta sin perder claridad.

Corrige cualquier problema detectado.

# Salida

Devuelve **únicamente el prompt final en Markdown**, sin análisis, explicaciones, introducciones ni conclusiones.

El usuario ya ha proporcionado el prompt en el campo de entrada. No vuelvas a preguntarlo.`;

const input = document.querySelector('#promptInput');
const output = document.querySelector('#resultOutput');
const optimizeButton = document.querySelector('#optimizeButton');
const copyButton = document.querySelector('#copyButton');
const clearButton = document.querySelector('#clearButton');
const settingsButton = document.querySelector('#settingsButton');
const status = document.querySelector('#status');

function showStatus(message, kind = '') {
  status.textContent = message;
  status.className = kind;
}

function setLoading(isLoading) {
  optimizeButton.disabled = isLoading;
  optimizeButton.classList.toggle('is-loading', isLoading);
}

async function getSettings() {
  const settings = await chrome.storage.local.get({
    aiEndpoint: '',
    installationId: '',
    proxyToken: ''
  });

  if (!settings.installationId) {
    settings.installationId = crypto.randomUUID();

    await chrome.storage.local.set({
      installationId: settings.installationId
    });
  }

  return settings;
}

async function optimize() {
  const userPrompt = input.value.trim();

  if (!userPrompt) {
    showStatus('Escribe un prompt antes de optimizar.', 'error');
    input.focus();
    return;
  }

  const {
    aiEndpoint,
    installationId,
    proxyToken
  } = await getSettings();

  if (!aiEndpoint) {
    showStatus('Configura el servicio de IA para continuar.', 'error');
    return;
  }

  if (!proxyToken) {
    showStatus('Configura el token del proxy para continuar.', 'error');
    return;
  }

  setLoading(true);
  showStatus('Optimizando…');

  try {
    const response = await fetch(aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Installation-Id': installationId,
        'Authorization': `Bearer ${proxyToken}`
      },
      body: JSON.stringify({
        instructions: SYSTEM_INSTRUCTIONS,
        prompt: userPrompt
      })
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      // La respuesta no contiene JSON válido.
    }

    if (!response.ok) {
      const errorMessage =
        data?.error ||
        data?.message ||
        `El servicio respondió con el estado ${response.status}.`;

      throw new Error(errorMessage);
    }

    const result = data?.result ?? data?.markdown;

    if (typeof result !== 'string' || !result.trim()) {
      throw new Error('El servicio no devolvió un resultado válido.');
    }

    output.value = result.trim();
    copyButton.disabled = false;

    showStatus('Prompt optimizado correctamente.', 'success');
  } catch (error) {
    if (error instanceof TypeError) {
      showStatus('No se pudo conectar con el servicio de IA.', 'error');
    } else {
      showStatus(
        error?.message || 'Se produjo un error inesperado.',
        'error'
      );
    }
  } finally {
    setLoading(false);
  }
}

async function copyResult() {
  const result = output.value.trim();

  if (!result) {
    return;
  }

  try {
    await navigator.clipboard.writeText(result);
  } catch {
    output.focus();
    output.select();
    document.execCommand('copy');
  }

  showStatus('Resultado copiado al portapapeles.', 'success');
}

function clearForm() {
  input.value = '';
  output.value = '';

  copyButton.disabled = true;

  showStatus('');

  input.focus();
}

optimizeButton.addEventListener('click', optimize);
copyButton.addEventListener('click', copyResult);
clearButton.addEventListener('click', clearForm);

settingsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

input.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    optimize();
  }
});
