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
  // Botão ocupado ao enviar (auditoria de estados, 19/11/2026): texto "Enviando…" ou
  // "Gerando o arquivo…" e o segundo clique não reenvia. O disabled entra no setTimeout: se
  // entrasse já no submit, o navegador tiraria o name/value do botão dos dados enviados.
  const ocupados = new Map();  // botão -> nós originais (texto e ícone), devolvidos sem montar HTML
  const ocupar = (form, botao, rotulo) => {
    form.dataset.enviando = '';
    if (!botao) return;
    setTimeout(() => {
      ocupados.set(botao, [...botao.childNodes]);
      botao.textContent = rotulo;
      botao.disabled = true;
      botao.setAttribute('aria-busy', 'true');
    }, 0);
  };
  const liberar = () => {
    document.querySelectorAll('form[data-enviando]').forEach((f) => delete f.dataset.enviando);
    ocupados.forEach((nos, b) => {
      b.replaceChildren(...nos); b.disabled = false; b.removeAttribute('aria-busy');
    });
    ocupados.clear();
  };
  document.addEventListener('submit', (evento) => {
    const form = evento.target;
    const botao = evento.submitter;
    const target = botao?.getAttribute('formtarget') || form.target;
    const destino = new URL(botao?.getAttribute('formaction') || form.action, location.href);
    // Popup de confirmação ainda aberto (confirmar.js): só navega depois do "Sim".
    if (form.matches('[data-confirmar]:not([data-confirmado])')) return;
    if (form.method === 'dialog' || (target && target !== '_self')) return;
    if (form.hasAttribute('data-enviando')) { evento.preventDefault(); return; }  // clique duplo
    // Sem internet: fica na tela, com o que foi digitado, e o aviso de erro padrão (aviso.js).
    if (!navigator.onLine) {
      evento.preventDefault();
      document.dispatchEvent(new CustomEvent('spondeo:aviso', {
        detail: { texto: 'Sem internet. Confira a conexão e tente de novo.', tipo: 'erro' },
      }));
      return;
    }
    if (botao?.hasAttribute('data-download') || ARQUIVO.test(destino.pathname)) {
      queueMicrotask(() => {
        if (evento.defaultPrevented) return;
        ocupar(form, botao, 'Gerando o arquivo…');
        setTimeout(liberar, 10000);  // o download não troca de página
      });
      return;
    }
    if (destino.origin !== location.origin) return;
    queueMicrotask(() => {
      if (!evento.defaultPrevented) { texto.textContent = 'Aguarde…'; aguardar(); ocupar(form, botao, 'Enviando…'); }
    });
  });
  window.addEventListener('pageshow', liberar);
  window.addEventListener('pageshow', limpar);
  window.addEventListener('pagehide', limpar);
  // Downloads retornam o foco à página sem uma nova navegação.
  window.addEventListener('focus', limpar);
  window.addEventListener('focus', () => setTimeout(liberar, 1500));  // volta de um download
})();
