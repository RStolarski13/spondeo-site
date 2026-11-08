// Navegação nativa: feedback só depois de 180 ms, sem interceptar pedidos ou dados.
(() => {
  const aviso = document.createElement('div');
  aviso.className = 'carregamento';
  aviso.hidden = true;
  aviso.setAttribute('role', 'status');
  const texto = document.createElement('span');
  texto.textContent = 'Carregando a próxima página…';
  aviso.append(texto);
  const esqueleto = document.createElement('div');
  esqueleto.className = 'skeleton';
  esqueleto.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 3; i++) esqueleto.append(document.createElement('i'));
  aviso.append(esqueleto);
  document.body.append(aviso);
  // Endereços que devolvem arquivo (PDF, XML, CSV, ZIP): o navegador baixa e a página fica.
  const ARQUIVO = /\/(arquivo|pdf|xml)$|\.(csv|zip|pdf|xml)$/;
  let inicio, limite;
  const limpar = () => {
    clearTimeout(inicio);
    clearTimeout(limite);
    aviso.hidden = true;
  };
  const aguardar = () => {
    limpar();
    inicio = setTimeout(() => { aviso.hidden = false; }, 180);
    // Um download ou diálogo cancelado pode deixar a página atual aberta.
    limite = setTimeout(limpar, 10000);
  };
  document.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[href]');
    if (!link || evento.button !== 0 || evento.ctrlKey || evento.metaKey ||
        evento.shiftKey || evento.altKey || link.hasAttribute('download') ||
        (link.target && link.target !== '_self') || link.hasAttribute('data-abrir')) return;  // popup, não navega
    const url = new URL(link.href);
    if (url.origin !== location.origin || ARQUIVO.test(url.pathname) ||
        (url.pathname === location.pathname && url.search === location.search)) return;
    // A decisão de outro handler de cancelar a navegação é respeitada.
    queueMicrotask(() => { if (!evento.defaultPrevented) aguardar(); });
  });
  document.addEventListener('submit', (evento) => {
    const form = evento.target;
    const botao = evento.submitter;
    const target = botao?.getAttribute('formtarget') || form.target;
    const destino = new URL(botao?.getAttribute('formaction') || form.action, location.href);
    // Popup de confirmação ainda aberto (confirmar.js): só navega depois do "Sim".
    if (form.matches('[data-confirmar]:not([data-confirmado])')) return;
    if (botao?.hasAttribute('data-download') || form.method === 'dialog' || (target && target !== '_self') ||
        destino.origin !== location.origin || ARQUIVO.test(destino.pathname)) return;
    queueMicrotask(() => { if (!evento.defaultPrevented) { texto.textContent = 'Aguarde…'; aguardar(); } });
  });
  window.addEventListener('pageshow', limpar);
  window.addEventListener('pagehide', limpar);
  // Downloads retornam o foco à página sem uma nova navegação.
  window.addEventListener('focus', limpar);
})();
