const form = document.querySelector('#settingsForm');
const endpoint = document.querySelector('#aiEndpoint');
const proxyToken = document.querySelector('#proxyToken');
const message = document.querySelector('#message');

chrome.storage.local.get({ aiEndpoint: '', proxyToken: '' }).then((settings) => { endpoint.value = settings.aiEndpoint; proxyToken.value = settings.proxyToken; });

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  let url;
  try { url = new URL(endpoint.value); } catch { message.textContent = 'Introduce una URL válida.'; return; }
  if (!['https:', 'http:'].includes(url.protocol)) { message.textContent = 'Usa una URL HTTP o HTTPS.'; return; }
  const granted = await chrome.permissions.request({ origins: [`${url.origin}/*`] });
  if (!granted) { message.textContent = 'Debes conceder acceso al servidor para guardar la configuración.'; return; }
  await chrome.storage.local.set({ aiEndpoint: url.href, proxyToken: proxyToken.value.trim() });
  message.textContent = 'Configuración guardada.';
});
