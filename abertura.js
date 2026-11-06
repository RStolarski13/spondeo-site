// Logo da abertura só na primeira página vista em cada sessão (Claude, 29/10/2026).
// Carregado no <head>, sem defer, para decidir antes da primeira pintura.
try {
  if (sessionStorage.getItem('spondeo-abertura')) document.documentElement.classList.add('sem-abertura');
  else sessionStorage.setItem('spondeo-abertura', '1');
} catch { /* sem armazenamento: mostra o logo */ }
