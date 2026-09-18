// Cidade — protótipo isométrico clicável (PRD-08, item 3). Cada lote é
// um app real do ecossistema; clicar abre um cartão com nome, cor de
// marca e link — mesmo mecanismo do Campus Virtual SEI-SICITE
// (imagem + pontos clicáveis), só que aqui a "imagem" é montada por
// tiles em vez de ser uma ilustração única, para poder crescer lote a
// lote conforme nascem empresas.

// ── grelha isométrica ──────────────────────────────────────────────
const TW = 128, TH = 64; // largura/altura do losango do chão

function projetar(col, row) {
  // devolve o vértice de topo (N) do losango em (col,row), em px,
  // relativo ao centro de #mapa. Arredondado a inteiro: posições
  // sub-pixel deixam ver um fiapo de vinco entre losangos vizinhos.
  return {
    x: Math.round((col - row) * (TW / 2)),
    y: Math.round((col + row) * (TH / 2)),
  };
}

function z(col, row) {
  return Math.round((col + row) * 100);
}

const mapa = document.getElementById('mapa');

function colocarTile(col, row, ficheiro) {
  const p = projetar(col, row);
  const el = document.createElement('img');
  el.className = 'tile';
  el.src = ficheiro;
  el.style.width = TW + 'px';
  el.style.height = TH + 'px';
  el.style.left = Math.round(p.x - TW / 2) + 'px';
  el.style.top = p.y + 'px';
  el.style.zIndex = z(col, row);
  mapa.appendChild(el);
}

// col pode ser fracionário (ex.: 3.5) para edifícios com 2 losangos de largura
function colocarPredio(col, row, ficheiro, w, h, app) {
  const p = projetar(col, row);
  const el = document.createElement('img');
  el.className = 'predio';
  el.src = ficheiro;
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = Math.round(p.x - w / 2) + 'px';
  el.style.top = Math.round(p.y + TH - h) + 'px';
  el.style.zIndex = z(col, row) + 1;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Abrir ' + app.nome);

  const ponto = document.createElement('div');
  ponto.className = 'ponto';
  ponto.style.left = (w / 2) + 'px';
  ponto.style.top = '14px';
  el.appendChild(ponto);

  el.addEventListener('click', () => abrirCartao(el, p, app));
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrirCartao(el, p, app); }
  });

  mapa.appendChild(el);
}

function colocarLetreiro(col, row, texto) {
  const p = projetar(col, row);
  const el = document.createElement('div');
  el.className = 'letreiro';
  el.textContent = texto;
  el.style.left = p.x + 'px';
  el.style.top = p.y + 'px';
  el.style.zIndex = z(col, row) + 500;
  mapa.appendChild(el);
}

// ── litoral: ilha 7×5 (cols 1-7, rows 1-5) rodeada de água ──────────
// Nota: o kit "Isometric City" tem tiles de transição água/relva (
// cantos e arestas), mas a orientação N/S/E/W deles não bateu com a
// nossa grelha à primeira tentativa (a costa comia terra a mais) —
// nesta primeira versão fica uma borda limpa; afinar a transição é
// acabamento de uma próxima passagem.
const GRASS = 'web/mapa/tile_ground_grass.png';
const WATER = 'web/mapa/tile_ground_water.png';
const ROAD = 'web/mapa/tile_road_straight_SE_normal.png';

for (let row = 0; row <= 6; row += 1) {
  for (let col = 0; col <= 8; col += 1) {
    const dentro = col >= 1 && col <= 7 && row >= 1 && row <= 5;
    colocarTile(col, row, dentro ? GRASS : WATER);
  }
}

// rua principal: linha 3, colunas 2-6
for (let col = 2; col <= 6; col += 1) colocarTile(col, 3, ROAD);

colocarLetreiro(4, 5.85, 'PREPARA PORTUGAL');

// ── lotes: cada edifício é um app real do ecossistema ──────────────
const APPS = [
  { nome: 'ClassCard', descricao: 'Carteirinha — identidade de pessoas e empresas', cor: '#005ED7', repo: 'classcard' },
  { nome: 'Prepacoin', descricao: 'Banco — faturas, boletos, SAF-T', cor: '#EBFF78', repo: 'prepacoin' },
  { nome: 'AeroMail', descricao: 'Correio interno, com anexos', cor: '#0F766E', repo: 'aeromail' },
  { nome: 'Subsight', descricao: 'Assinatura digital de documentos', cor: '#FF7F00', repo: 'subsight' },
  { nome: 'Clientify', descricao: 'Pedidos dos clientes fictícios', cor: '#E85002', repo: 'clientify' },
  { nome: 'OpenLab', descricao: 'Criar uma empresa nova, de uma vez', cor: '#6C3BFF', repo: 'openlab' },
  { nome: 'EmDia', descricao: 'Contas de água, energia, internet e renda', cor: '#536DFE', repo: 'emdia' },
  { nome: 'Talentos', descricao: 'Vagas de emprego e candidaturas', cor: '#B9433F', repo: 'talentos' },
];
const urlApp = (repo) => `https://projetoempresaficticia.github.io/${repo}/`;

colocarPredio(2, 2, 'web/mapa/bld_house_medium_brickwhite_a.png', 128, 85, APPS[2]); // AeroMail
colocarPredio(3, 2, 'web/mapa/bld_church_a.png', 256, 156, APPS[0]);                 // ClassCard (2 de largura)
colocarPredio(5, 2, 'web/mapa/bld_house_tall_brickwhite_a.png', 128, 105, APPS[3]);  // Subsight
colocarPredio(6, 2, 'web/mapa/bld_house_small_red_a.png', 128, 76, APPS[4]);         // Clientify

colocarPredio(2, 4, 'web/mapa/bld_house_tall_brickwhite_b.png', 128, 106, APPS[5]);  // OpenLab
colocarPredio(3, 4, 'web/mapa/bld_house_medium_blue_a.png', 128, 85, APPS[6]);       // EmDia
colocarPredio(4.5, 4, 'web/mapa/bld_apartments_brickwhite_a.png', 256, 220, APPS[1]);// Prepacoin (2 de largura)
colocarPredio(6, 4, 'web/mapa/bld_house_small_brickred_a.png', 128, 76, APPS[7]);    // Talentos

// ── cartão popup ────────────────────────────────────────────────
const cena = document.getElementById('cena');
let cartaoAtual = null;
let predioAtivo = null;

function fecharCartao() {
  if (cartaoAtual) cartaoAtual.remove();
  cartaoAtual = null;
  if (predioAtivo) predioAtivo.classList.remove('ativo');
  predioAtivo = null;
}

function abrirCartao(elPredio, pontoTopo, app) {
  if (predioAtivo === elPredio) { fecharCartao(); return; }
  fecharCartao();
  predioAtivo = elPredio;
  elPredio.classList.add('ativo');

  const rectMapa = mapa.getBoundingClientRect();
  const rectCena = cena.getBoundingClientRect();
  const x = (rectMapa.left - rectCena.left) + pontoTopo.x;
  const y = (rectMapa.top - rectCena.top) + pontoTopo.y;

  const el = document.createElement('div');
  el.className = 'cartao';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  el.innerHTML = `
    <button class="cartao-fechar" aria-label="Fechar">✕</button>
    <div class="cartao-barra" style="background:${app.cor}"></div>
    <b>${esc(app.nome)}</b>
    <p>${esc(app.descricao)}</p>
    <a href="${urlApp(app.repo)}" target="_blank" rel="noopener">Abrir app →</a>
  `;
  el.querySelector('.cartao-fechar').addEventListener('click', (ev) => { ev.stopPropagation(); fecharCartao(); });
  cena.appendChild(el);
  requestAnimationFrame(() => el.classList.add('aberto'));
  cartaoAtual = el;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

cena.addEventListener('click', (ev) => {
  if (!ev.target.closest('.predio') && !ev.target.closest('.cartao')) fecharCartao();
});
