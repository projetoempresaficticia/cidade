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
  // relativo à origem de #mapa. Arredondado a inteiro: posições
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

// Guarda a caixa que envolve tudo o que já foi colocado, para no fim
// centrar #mapa pelo conteúdo real (não por uma percentagem à mão que
// se desacerta cada vez que a cidade cresce).
const limites = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
function registarLimites(left, top, w, h) {
  limites.minX = Math.min(limites.minX, left);
  limites.minY = Math.min(limites.minY, top);
  limites.maxX = Math.max(limites.maxX, left + w);
  limites.maxY = Math.max(limites.maxY, top + h);
}

function colocarTile(col, row, ficheiro) {
  const p = projetar(col, row);
  const left = Math.round(p.x - TW / 2);
  const el = document.createElement('img');
  el.className = 'tile';
  el.src = ficheiro;
  el.style.width = TW + 'px';
  el.style.height = TH + 'px';
  el.style.left = left + 'px';
  el.style.top = p.y + 'px';
  el.style.zIndex = z(col, row);
  mapa.appendChild(el);
  registarLimites(left, p.y, TW, TH);
}

// col pode ser fracionário (ex.: 3.5) para edifícios com 2 losangos de largura
function colocarPredio(col, row, ficheiro, w, h, app) {
  const p = projetar(col, row);
  const left = Math.round(p.x - w / 2);
  const top = Math.round(p.y + TH - h);
  const el = document.createElement('img');
  el.className = 'predio';
  el.src = ficheiro;
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
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
  registarLimites(left, top, w, h);
}

// ── litoral: ilha 16×7 (cols 1-16, rows 1-7) rodeada de água ────────
// Nota: o kit "Isometric City" tem tiles de transição água/relva
// (cantos e arestas), mas a orientação N/S/E/W deles não bateu com a
// nossa grelha na primeira tentativa (a costa comia terra a mais) —
// para este protótipo fica uma borda limpa; afinar a transição é
// acabamento de uma próxima passagem.
const GRASS = 'web/mapa/tile_ground_grass.png';
const WATER = 'web/mapa/tile_ground_water.png';
const ROAD = 'web/mapa/tile_road_straight_SE_normal.png';

for (let row = 0; row <= 8; row += 1) {
  for (let col = 0; col <= 17; col += 1) {
    const dentro = col >= 1 && col <= 16 && row >= 1 && row <= 7;
    colocarTile(col, row, dentro ? GRASS : WATER);
  }
}

// rua principal: linha 4, colunas 2-15 -- com uma fileira de relva de
// cada lado antes de chegar aos prédios (linhas 2 e 6), para as
// torres ficarem visivelmente recuadas da rua, não coladas a ela.
for (let col = 2; col <= 15; col += 1) colocarTile(col, 4, ROAD);

// ── lotes: um por app real do ecossistema (13/13), torres tipo
// Prepacoin, cada uma na cor de marca real (ver ferramentas/
// gerar_torres.py) ──────────────────────────────────────────────
const APPS = {
  classcard:  { nome: 'ClassCard',  descricao: 'Carteirinha — identidade de pessoas e empresas', cor: '#005ED7', repo: 'classcard' },
  subsight:   { nome: 'Subsight',   descricao: 'Assinatura digital de documentos', cor: '#FF7F00', repo: 'subsight' },
  prepacoin:  { nome: 'Prepacoin',  descricao: 'Banco — faturas, boletos, SAF-T', cor: '#EBFF78', repo: 'prepacoin' },
  cartorio:   { nome: 'Cartório Notarial', descricao: 'Certidões e protocolos', cor: '#69B518', repo: 'cartorio-notarial' },
  at:         { nome: 'Portal das Finanças', descricao: 'AT — e-Fatura, IVA, Modelo 22', cor: '#5B3F8C', repo: 'portal-financas' },
  segsocial:  { nome: 'Segurança Social', descricao: 'Trabalhadores, TSU, carreira contributiva', cor: '#F4B400', repo: 'seguranca-social' },
  dr:         { nome: 'Diário da República', descricao: 'Publicações oficiais, editais', cor: '#69092D', repo: 'diario-republica' },
  emdia:      { nome: 'EmDia',      descricao: 'Contas de água, energia, internet e renda', cor: '#536DFE', repo: 'emdia' },
  openlab:    { nome: 'OpenLab',    descricao: 'Criar uma empresa nova, de uma vez', cor: '#6C3BFF', repo: 'openlab' },
  talentos:   { nome: 'Talentos',   descricao: 'Vagas de emprego e candidaturas', cor: '#B9433F', repo: 'talentos' },
  clientify:  { nome: 'Clientify',  descricao: 'Pedidos dos clientes fictícios', cor: '#E85002', repo: 'clientify' },
  aeromail:   { nome: 'AeroMail',   descricao: 'Correio interno, com anexos', cor: '#0F766E', repo: 'aeromail' },
  pulso:      { nome: 'Pulso',      descricao: 'Mensagens e grupos', cor: '#1F2747', repo: 'pulso' },
};
const urlApp = (repo) => `https://projetoempresaficticia.github.io/${repo}/`;

// fileira norte (row 2) — 7 lotes, cols 2 a 15
colocarPredio(3,    2, 'web/mapa/bld_church_a.png',           256, 156, APPS.classcard); // âncora (2 de largura)
colocarPredio(5,    2, 'web/mapa/bld_torre_subsight.png',     256, 220, APPS.subsight);
colocarPredio(7,    2, 'web/mapa/bld_torre_prepacoin.png',    256, 219, APPS.prepacoin);
colocarPredio(9,    2, 'web/mapa/bld_torre_cartorio.png',     256, 220, APPS.cartorio);
colocarPredio(11,   2, 'web/mapa/bld_torre_at.png',           256, 219, APPS.at);
colocarPredio(13,   2, 'web/mapa/bld_torre_segsocial.png',    256, 220, APPS.segsocial);
colocarPredio(15,   2, 'web/mapa/bld_torre_dr.png',           256, 219, APPS.dr);

// fileira sul (row 6) — 6 lotes, cols 2 a 13 (col 14-15 fica de reserva)
colocarPredio(3,    6, 'web/mapa/bld_torre_emdia.png',        256, 220, APPS.emdia);
colocarPredio(5,    6, 'web/mapa/bld_torre_openlab.png',      256, 219, APPS.openlab);
colocarPredio(7,    6, 'web/mapa/bld_torre_talentos.png',     256, 220, APPS.talentos);
colocarPredio(9,    6, 'web/mapa/bld_torre_clientify.png',    256, 219, APPS.clientify);
colocarPredio(11,   6, 'web/mapa/bld_torre_aeromail.png',     256, 220, APPS.aeromail);
colocarPredio(13,   6, 'web/mapa/bld_torre_pulso.png',        256, 219, APPS.pulso);

// ── centrar #mapa pelo conteúdo real, não por uma percentagem à mão ─
{
  const cx = (limites.minX + limites.maxX) / 2;
  const cy = (limites.minY + limites.maxY) / 2;
  mapa.style.left = `calc(50% - ${cx}px)`;
  mapa.style.top = `calc(50% - ${cy}px)`;
}

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
