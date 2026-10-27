// Só repassa o nome do canal. Não envia rede nem usa armazenamento no navegador.
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
  if (!canais.has(origem)) return;
  const paginas = new Set(['/', '/contabilidades/', '/nota-fiscal-whatsapp/', '/nfse-nacional-simples/']);
  document.querySelectorAll('a[href]').forEach(link => {
    if (link.getAttribute('href').startsWith('#')) return;
    const url = new URL(link.href);
    const interna = url.origin === location.origin && paginas.has(url.pathname);
    const cadastro = url.origin === 'https://app.spondeo.com.br' &&
      (url.pathname === '/cadastro' || /^\/assinar\/(essencial|profissional|completo)$/.test(url.pathname));
    if (interna || cadastro) {
      url.searchParams.set('origem', origem);
      link.href = url.href;
    }
  });
})();
