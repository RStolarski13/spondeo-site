// Landing do Spondeo (Claude). Sem este arquivo a página fica completa e parada.
// 1) "Experimente": o resumo responde ao pedido digitado (funciona sempre).
// 2) Movimento: seções entram em partes ao rolar, o pedido do passo 1 é digitado e os
//    números do painel contam até o valor (só sem "reduzir movimento").
(() => {
  const real = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  // Mesmas ideias das regras do produto: "850", "1.200", "1,5 mil", "2 mil".
  const lerValor = (texto) => {
    const m = texto.match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?\s*(mil\b)?/i);
    if (!m) return null;
    let valor = Number(m[1].replace(/\./g, '') + (m[2] ? '.' + m[2] : ''));
    if (m[3]) valor *= 1000;
    return valor > 0 ? valor : null;
  };
  const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  const entrada = document.getElementById('pedido');
  const pedido = document.getElementById('sim-pedido');
  const resposta = document.getElementById('sim-resposta');
  if (entrada && pedido && resposta) {
    const botoes = resposta.querySelector('.respostas');
    const negrito = (t) => { const b = document.createElement('b'); b.textContent = t; return b; };
    const responder = () => {
      const texto = entrada.value.trim();
      pedido.textContent = texto || '…';
      const valor = lerValor(texto);
      // O serviço é o que vem depois do cliente: a vírgula de "1,5 mil" não conta.
      const partes = texto.match(/\bpara\s+(?:a|o|as|os)?\s*([^,.;]+)[,.;]?\s*(.*)$/i) || [];
      const cliente = partes[1];
      const servico = (partes[2] || '').trim();
      // Texto montado com nós, nunca com HTML vindo do visitante.
      resposta.replaceChildren();
      if (!valor) {
        resposta.append('Qual é o valor da nota? Por exemplo: nota de 850 para a Clínica Bem Estar.');
      } else if (!cliente) {
        resposta.append('Para qual cliente é a nota de ', negrito(real.format(valor)), '?');
      } else {
        resposta.append('Confere antes de eu emitir: ', negrito(real.format(valor)), ' para ',
          negrito(maiuscula(cliente.trim())), '.');
        if (servico) resposta.append(' ' + maiuscula(servico.replace(/[.\s]+$/, '')) + '.');
        resposta.append(botoes);
      }
    };
    entrada.addEventListener('input', responder);
    responder();
  }

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Com "reduzir movimento", o vídeo não toca sozinho: fica parado, com controles.
  const video = document.querySelector('.video-como video');
  if (video && reduzir) { video.pause(); video.removeAttribute('autoplay'); video.controls = true; }

  if (!('IntersectionObserver' in window) || reduzir) return;
  document.documentElement.classList.add('js');

  const contar = (el) => {
    const fim = Number(el.dataset.contar);
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / 1000);
      el.textContent = real.format(fim * (1 - (1 - t) ** 3));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  const digitar = (el) => {
    const texto = el.textContent.trim();
    let i = 0;
    el.textContent = '';
    const id = setInterval(() => {
      el.textContent = texto.slice(0, ++i);
      if (i >= texto.length) clearInterval(id);
    }, 32);
  };

  const ver = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      ver.unobserve(e.target);
      e.target.classList.add('visivel');
      e.target.querySelectorAll('[data-contar]').forEach(contar);
      e.target.querySelectorAll('[data-digitar]').forEach(digitar);
    }
  }, { threshold: 0.18 });
  document.querySelectorAll('.revelar').forEach((s) => ver.observe(s));
})();
