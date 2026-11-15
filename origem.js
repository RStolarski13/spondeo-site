// Repassa o nome do canal ao cadastro e conta a visita, anônima: sem cookie, sem armazenamento
// no navegador e sem identificador (Claude, 04/11/2026; antes o funil do admin ficava em zero).
(() => {
  const canais = new Set(['google', 'bing', 'instagram', 'facebook', 'whatsapp', 'email', 'ia']);
  const parametros = new URL(location.href).searchParams;
  const aliases = {ig: 'instagram', fb: 'facebook'};
  const utm = (parametros.get('utm_source') || '').toLowerCase();
  let origem = parametros.get('origem') || aliases[utm] || utm;
  if (!canais.has(origem)) {
    let host = '';
    try { host = new URL(document.referrer).hostname; } catch { /* Sem referência. */ }
    origem = {
      'google.com': 'google', 'www.google.com': 'google',
      'google.com.br': 'google', 'www.google.com.br': 'google',
      'www.bing.com': 'bing', 'bing.com': 'bing',
      'www.instagram.com': 'instagram', 'l.instagram.com': 'instagram',
      'www.facebook.com': 'facebook', 'l.facebook.com': 'facebook',
      'lm.facebook.com': 'facebook', 'm.facebook.com': 'facebook',
      'chatgpt.com': 'ia', 'chat.openai.com': 'ia', 'claude.ai': 'ia', 'gemini.google.com': 'ia',
      'perplexity.ai': 'ia', 'www.perplexity.ai': 'ia', 'copilot.microsoft.com': 'ia',
    }[host];
  }
  // Página de entrada: guarda o caminho sem barras, separado do canal (ele vai em `o`).
  const paginas = new Set(['/', '/contabilidades/', '/planos/', '/demonstracao/', '/nota-fiscal-whatsapp/',
    '/nfse-nacional-simples/', '/emissor-nacional-obrigatorio-simples/', '/emitir-nfse-pelo-celular/',
    '/erros-emissor-nacional/', '/nota-fiscal-mei-whatsapp/', '/certificado-digital-nfse/',
    '/nfse-prestador-de-servico-na-rua/']);
  const pagina = paginas.has(location.pathname) ? (location.pathname === '/' ? 'inicio' : location.pathname.replace(/\//g, '')) : undefined;
  const tela = innerWidth < 600 ? 'celular' : innerWidth < 1024 ? 'tablet' : 'computador';
  const veio = ['google', 'bing', 'instagram', 'facebook', 'whatsapp', 'email', 'ia'].includes(origem) ? origem : (origem ? 'outro' : 'direto');
  // Texto simples: pedido sem pré-verificação de CORS; o servidor só aceita o site do Spondeo.
  // Só o site publicado conta: cópia local, ensaio e testes não sujam o funil do admin.
  if (pagina && location.hostname === 'spondeo.com.br') fetch('https://app.spondeo.com.br/m', {method: 'POST', mode: 'no-cors', keepalive: true,
    body: JSON.stringify({p: pagina, o: veio, t: tela})}).catch(() => {});
  if (!canais.has(origem)) return;
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.getAttribute('href').startsWith('#')) return;
    let url;
    try { url = new URL(link.href); } catch { return; } // href malformado não interrompe o resto
    const interna = url.origin === location.origin && paginas.has(url.pathname);
    // Cadastro e qualquer plano (mensal, anual, com A1). Canal conhecido troca o "guia" de reserva.
    const cadastro = url.origin === 'https://app.spondeo.com.br' &&
      (url.pathname === '/cadastro' || url.pathname === '/contador/cadastro' || /^\/assinar\/[a-z0-9_]+$/.test(url.pathname));
    if (interna || cadastro) {
      url.searchParams.set('origem', origem);
      link.href = url.href;
    }
  });
})();

// /planos/?publico=escritorio já abre na aba do escritório.
if (new URLSearchParams(location.search).get('publico') === 'escritorio') {
  addEventListener('DOMContentLoaded', () => {
    const aba = document.getElementById('publico-escritorio');
    if (aba) aba.checked = true;
  });
}
