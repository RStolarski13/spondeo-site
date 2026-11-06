// Repassa o nome do canal ao cadastro e conta a visita, anônima: sem cookie, sem armazenamento
// no navegador e sem identificador (Claude, 04/11/2026; antes o funil do admin ficava em zero).
(() => {
  const canais = new Set(['google', 'bing', 'instagram', 'facebook', 'whatsapp', 'email']);
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
    }[host];
  }
  const pagina = {'/': 'inicio', '/contabilidades/': 'contabilidades', '/nota-fiscal-whatsapp/': 'nota-fiscal-whatsapp',
    '/nfse-nacional-simples/': 'nfse-nacional-simples', '/demonstracao/': 'demonstracao'}[location.pathname];
  const tela = innerWidth < 600 ? 'celular' : innerWidth < 1024 ? 'tablet' : 'computador';
  const veio = ['google', 'instagram', 'facebook', 'whatsapp'].includes(origem) ? origem : (origem ? 'outro' : 'direto');
  // Texto simples: pedido sem pré-verificação de CORS; o servidor só aceita o site do Spondeo.
  // Só o site publicado conta: cópia local, ensaio e testes não sujam o funil do admin.
  if (pagina && location.hostname === 'spondeo.com.br') fetch('https://app.spondeo.com.br/m', {method: 'POST', mode: 'no-cors', keepalive: true,
    body: JSON.stringify({p: pagina, o: veio, t: tela})}).catch(() => {});
  if (!canais.has(origem)) return;
  const paginas = new Set(['/', '/contabilidades/', '/nota-fiscal-whatsapp/', '/nfse-nacional-simples/']);
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.getAttribute('href').startsWith('#')) return;
    const url = new URL(link.href);
    const interna = url.origin === location.origin && paginas.has(url.pathname);
    const cadastro = url.origin === 'https://app.spondeo.com.br' &&
      (url.pathname === '/cadastro' || /^\/assinar\/(essencial|profissional|completo)$/.test(url.pathname));
    if (cadastro && url.searchParams.get('origem') === 'guia') return;
    if (interna || cadastro) {
      url.searchParams.set('origem', origem);
      link.href = url.href;
    }
  });
})();
