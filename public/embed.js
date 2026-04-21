/**
 * SindiCalculo - Widget Embed Script
 * 
 * Uso no site do sindicato:
 * <div id="sindicalculo-widget" data-sindicato-id="SEU_UUID_AQUI" data-calculadora="rescisao"></div>
 * <script src="https://seusite.com/embed.js"></script>
 */

(function() {
  const container = document.getElementById('sindicalculo-widget');
  
  if (!container) {
    console.error('SindiCalculo: Container <div id="sindicalculo-widget"> não encontrado no DOM.');
    return;
  }

  const sindicatoId = container.getAttribute('data-sindicato-id');
  const calculadora = container.getAttribute('data-calculadora') || 'rescisao';

  if (!sindicatoId) {
    console.error('SindiCalculo: Atributo data-sindicato-id ausente na div.');
    return;
  }

  // O script em produção deveria ler o domínio atual de onde foi carregado
  // Mas para o dev/MVP, apontaremos para a origem do script
  const scriptTag = document.currentScript;
  const baseUrl = scriptTag ? new URL(scriptTag.src).origin : 'http://localhost:3000';

  const iframeUrl = `${baseUrl}/widget/${sindicatoId}/${calculadora}`;

  const iframe = document.createElement('iframe');
  iframe.src = iframeUrl;
  iframe.style.width = '100%';
  iframe.style.border = 'none';
  iframe.style.minHeight = '800px';
  iframe.style.overflow = 'hidden';
  iframe.setAttribute('scrolling', 'no');
  // Allow downloads for PDF generation in cross-origin iframes
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms allow-downloads');

  container.appendChild(iframe);

  // Escuta mensagens do Iframe para ajustar a altura dinamicamente
  window.addEventListener('message', function(event) {
    if (event.origin !== baseUrl) return;
    
    if (event.data && event.data.type === 'SINDICALCULO_RESIZE') {
      iframe.style.height = `${event.data.height}px`;
    }
  });

})();
