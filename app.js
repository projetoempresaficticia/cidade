// Cidade — mapa isométrico clicável (PRD-08, item 3). Dois tipos de
// lote: os 13 apps do ecossistema (fixos, hardcoded aqui) e os lotes
// de empresas reais (guardados em cidade_lotes, reclamados por quem
// tem sessão de gerente). Clicar num prédio abre um cartão; arrastar
// move a cidade; "Adicionar o meu prédio" deixa a empresa escolher um
// lote livre e definir o seu.

// ── grelha isométrica ──────────────────────────────────────────────
const TW = 128, TH = 64; // largura/altura do losango do chão

function projetar(col, row) {
  return {
    x: Math.round((col - row) * (TW / 2)),
    y: Math.round((col + row) * (TH / 2)),
  };
}
function z(col, row) { return Math.round((col + row) * 100); }

const mapa = document.getElementById('mapa');
const cena = document.getElementById('cena');

// caixa que envolve tudo, para centrar #mapa pelo conteúdo real
const limites = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
function registarLimites(left, top, w, h) {
  limites.minX = Math.min(limites.minX, left);
  limites.minY = Math.min(limites.minY, top);
  limites.maxX = Math.max(limites.maxX, left + w);
  limites.maxY = Math.max(limites.maxY, top + h);
}

// deslocamento acumulado do arrastar -- soma-se ao left/top base
let deslocX = 0, deslocY = 0;
let baseLeft = 0, baseTop = 0;

function aplicarPosicaoMapa() {
  mapa.style.left = `calc(50% - ${baseLeft - deslocX}px)`;
  mapa.style.top = `calc(50% - ${baseTop - deslocY}px)`;
}

function colocarTile(col, row, ficheiro, classeExtra) {
  const p = projetar(col, row);
  const left = Math.round(p.x - TW / 2);
  const el = document.createElement('img');
  el.className = 'tile' + (classeExtra ? ' ' + classeExtra : '');
  el.src = ficheiro;
  el.style.width = TW + 'px';
  el.style.height = TH + 'px';
  el.style.left = left + 'px';
  el.style.top = p.y + 'px';
  el.style.zIndex = z(col, row);
  mapa.appendChild(el);
  registarLimites(left, p.y, TW, TH);
  return el;
}

// col pode ser fracionário (ex.: 3.5) para edifícios com 2 losangos de largura
function colocarPredio(col, row, ficheiro, w, h, aoClicar, aria) {
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
  el.setAttribute('aria-label', aria);

  const ponto = document.createElement('div');
  ponto.className = 'ponto';
  ponto.style.left = (w / 2) + 'px';
  ponto.style.top = '14px';
  el.appendChild(ponto);

  el.addEventListener('click', (ev) => { ev.stopPropagation(); aoClicar(el, p); });
  el.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); aoClicar(el, p); }
  });

  mapa.appendChild(el);
  registarLimites(left, top, w, h);
  return el;
}

// decoração (árvore, candeeiro, carro, flor...) -- mesma âncora dos
// prédios (base encostada ao chão da célula), mas sem clique nem
// marcador -- só para dar vida às ruas e à praça.
//
// z-index com +5000: um prédio de 256px de largura tem a caixa muito
// mais larga que o seu losango -- uma pessoa/árvore numa célula vizinha
// caía por baixo dele mesmo estando "à frente" pela conta de linha+
// coluna (apanhado a testar: um pedestre ao lado da igreja ficava
// escondido). Decoração é sempre rasteira, nunca faz sentido ficar
// atrás de um prédio, por isso ganha sempre.
function colocarDecoracao(col, row, ficheiro, w, h) {
  const p = projetar(col, row);
  const left = Math.round(p.x - w / 2);
  const top = Math.round(p.y + TH - h);
  const el = document.createElement('img');
  el.className = 'decoracao';
  el.src = ficheiro;
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.zIndex = z(col, row) + 5000;
  mapa.appendChild(el);
  registarLimites(left, top, w, h);
}

// ── litoral orgânico ─────────────────────────────────────────────
// Mapeamento confirmado por teste isolado (ver README): os nomes dos
// ficheiros do kit não correspondem à nossa convenção de grelha --
// testámos cada um a sério (água numa fileira/coluna inteira, não só
// 1 vizinho) antes de usar, para não repetir o erro da v1 (que assumiu
// a orientação e a costa comia terra a mais).
const GRASS = 'web/mapa/tile_ground_grass.png';
const WATER = 'web/mapa/tile_ground_water.png';
const ROAD = 'web/mapa/tile_road_straight_SE_normal.png';
const BORDA_N = 'web/mapa/tile_ground_grass_wateredge_E_clean.png';
const BORDA_S = 'web/mapa/tile_ground_grass_wateredge_W_clean.png';
const BORDA_W = 'web/mapa/tile_ground_grass_wateredge_S_clean.png';
const BORDA_E = 'web/mapa/tile_ground_grass_wateredge_N_clean.png';
const CANTO_NW = 'web/mapa/tile_ground_grass_water_SE_clean.png';
const CANTO_NE = 'web/mapa/tile_ground_grass_water_NE_clean.png';
const CANTO_SE = 'web/mapa/tile_ground_grass_water_NW_clean.png';
const CANTO_SW = 'web/mapa/tile_ground_grass_water_SW_clean.png';

const COL_MIN = 1, COL_MAX = 18, ROW_MIN = 1, ROW_MAX = 11;

for (let row = 0; row <= ROW_MAX + 1; row += 1) {
  for (let col = 0; col <= COL_MAX + 1; col += 1) {
    const dentro = col >= COL_MIN && col <= COL_MAX && row >= ROW_MIN && row <= ROW_MAX;
    if (!dentro) { colocarTile(col, row, WATER); continue; }

    const noN = row === ROW_MIN, noS = row === ROW_MAX, noW = col === COL_MIN, noE = col === COL_MAX;
    let ficheiro = GRASS;
    if (noN && noW) ficheiro = CANTO_NW;
    else if (noN && noE) ficheiro = CANTO_NE;
    else if (noS && noW) ficheiro = CANTO_SW;
    else if (noS && noE) ficheiro = CANTO_SE;
    else if (noN) ficheiro = BORDA_N;
    else if (noS) ficheiro = BORDA_S;
    else if (noW) ficheiro = BORDA_W;
    else if (noE) ficheiro = BORDA_E;
    colocarTile(col, row, ficheiro);
  }
}

// duas ruas horizontais: a institucional (linha 4) e a do novo bairro
// (linha 8) -- e uma rua vertical a cruzar as duas, para a "baixa"
// (linhas 2-6) deixar de ser um bloco único e virar duas quadras de
// verdade, com um cruzamento a sério no meio.
const ROAD_V = 'web/mapa/tile_road_straight_SW_normal.png';
const CRUZAMENTO = 'web/mapa/tile_road_xsing_normal.png';

for (let col = 2; col <= 17; col += 1) colocarTile(col, 4, col === 9 ? CRUZAMENTO : ROAD);
for (let col = 2; col <= 17; col += 1) colocarTile(col, 8, col === 9 ? CRUZAMENTO : ROAD);
for (let row = 2; row <= 9; row += 1) {
  if (row === 4 || row === 8) continue; // já são o cruzamento, acima
  colocarTile(9, row, ROAD_V);
}

// pracinha em frente à igreja (por cima da relva já colocada)
const PLAZA = 'web/mapa/tile_ground_concrete.png';
for (const col of [2, 3, 4]) colocarTile(col, 3, PLAZA);

// ── cartão popup (dois formatos: app do ecossistema / empresa real) ─
let cartaoAtual = null;
let predioAtivo = null;

function fecharCartao() {
  if (cartaoAtual) cartaoAtual.remove();
  cartaoAtual = null;
  if (predioAtivo) predioAtivo.classList.remove('ativo');
  predioAtivo = null;
}

function posicionarCartao(pontoTopo) {
  const rectMapa = mapa.getBoundingClientRect();
  const rectCena = cena.getBoundingClientRect();
  return {
    x: (rectMapa.left - rectCena.left) + pontoTopo.x,
    y: (rectMapa.top - rectCena.top) + pontoTopo.y,
  };
}

function abrirCartaoComHtml(elPredio, pontoTopo, html) {
  if (predioAtivo === elPredio) { fecharCartao(); return; }
  fecharCartao();
  predioAtivo = elPredio;
  elPredio.classList.add('ativo');
  const pos = posicionarCartao(pontoTopo);
  const el = document.createElement('div');
  el.className = 'cartao';
  el.style.left = pos.x + 'px';
  el.style.top = pos.y + 'px';
  el.innerHTML = html;
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

const urlApp = (repo) => `https://projetoempresaficticia.github.io/${repo}/`;

function abrirCartaoApp(elPredio, pontoTopo, app) {
  abrirCartaoComHtml(elPredio, pontoTopo, `
    <button class="cartao-fechar" aria-label="Fechar">✕</button>
    <div class="cartao-barra" style="background:${app.cor}"></div>
    <b>${esc(app.nome)}</b>
    <p>${esc(app.descricao)}</p>
    <a href="${urlApp(app.repo)}" target="_blank" rel="noopener">Abrir app →</a>
  `);
}

function abrirCartaoEmpresa(elPredio, pontoTopo, lote) {
  const foto = lote.foto_caminho
    ? sb.storage.from('cidade').getPublicUrl(lote.foto_caminho).data.publicUrl
    : null;
  const souDono = MINHA_EMPRESA && MINHA_EMPRESA === lote.empresa_cedula;
  abrirCartaoComHtml(elPredio, pontoTopo, `
    <button class="cartao-fechar" aria-label="Fechar">✕</button>
    ${foto ? `<img class="cartao-foto" src="${esc(foto)}" alt="" />` : ''}
    <b>${esc(lote.nome_empresa || lote.empresa_cedula)}</b>
    ${lote.email_empresa ? `<span class="cartao-linha">✉ ${esc(lote.email_empresa)} — escreva via <a href="${urlApp('aeromail')}" target="_blank" rel="noopener">AeroMail</a></span>` : ''}
    ${lote.link ? `<p><a href="${esc(lote.link)}" target="_blank" rel="noopener">Visitar →</a></p>` : ''}
    ${lote.rede_social ? `<span class="cartao-linha">${esc(lote.rede_social)}</span>` : ''}
    ${souDono ? `<button type="button" class="cartao-editar" id="btn-editar-lote">Editar o meu prédio</button>` : ''}
  `);
  if (souDono) {
    document.getElementById('btn-editar-lote').addEventListener('click', (ev) => {
      ev.stopPropagation();
      fecharCartao();
      abrirFormularioLote(lote);
    });
  }
}

cena.addEventListener('click', (ev) => {
  if (!ev.target.closest('.predio') && !ev.target.closest('.cartao')) fecharCartao();
});

// ── os 13 lotes institucionais (apps do ecossistema) ────────────────
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

function predioApp(col, row, ficheiro, w, h, app) {
  colocarPredio(col, row, ficheiro, w, h, (el, p) => abrirCartaoApp(el, p, app), 'Abrir ' + app.nome);
}

// quadra oeste (a poente da rua vertical, coluna 9)
predioApp(3,    2, 'web/mapa/bld_church_a.png',           256, 156, APPS.classcard);
predioApp(5,    2, 'web/mapa/bld_torre_subsight.png',     256, 220, APPS.subsight);
predioApp(7,    2, 'web/mapa/bld_torre_prepacoin.png',    256, 219, APPS.prepacoin);
// quadra este
predioApp(11,   2, 'web/mapa/bld_torre_cartorio.png',     256, 220, APPS.cartorio);
predioApp(13,   2, 'web/mapa/bld_torre_at.png',           256, 219, APPS.at);
predioApp(15,   2, 'web/mapa/bld_torre_segsocial.png',    256, 220, APPS.segsocial);
predioApp(17,   2, 'web/mapa/bld_torre_dr.png',           256, 219, APPS.dr);

predioApp(3,    6, 'web/mapa/bld_torre_emdia.png',        256, 220, APPS.emdia);
predioApp(5,    6, 'web/mapa/bld_torre_openlab.png',      256, 219, APPS.openlab);
predioApp(7,    6, 'web/mapa/bld_torre_talentos.png',     256, 220, APPS.talentos);
predioApp(11,   6, 'web/mapa/bld_torre_clientify.png',    256, 219, APPS.clientify);
predioApp(13,   6, 'web/mapa/bld_torre_aeromail.png',     256, 220, APPS.aeromail);
predioApp(15,   6, 'web/mapa/bld_torre_pulso.png',        256, 219, APPS.pulso);

// ── vida nas ruas: árvores, candeeiros, flores e carros ─────────────
// (puramente decorativo -- para a cidade não ficar só uma grelha de
// caixas quadradas, sem gente nem verde nenhum)
const ARVORE_M = 'web/mapa/prop_tree_common_medium.png';
const ARVORE_G = 'web/mapa/prop_tree_common_large.png';
const PINHEIRO = 'web/mapa/prop_tree_pine_medium.png';
const CANDEEIRO = 'web/mapa/prop_lightpole_a.png';
const FLOR_ROSA = 'web/mapa/prop_flowers_pink.png';
const FLOR_AMARELA = 'web/mapa/prop_flowers_yellow.png';

// árvores e candeeiros a acompanhar as duas ruas, nas fileiras de
// relva logo antes/depois de cada uma (3 e 5 para a rua institucional,
// 7 e 9 para a do bairro), intercalados para não ficar tudo em fila.
// coluna 9 é a rua vertical -- fica de fora de todas estas listas.
[6, 12].forEach((col) => colocarDecoracao(col, 3, ARVORE_M, 57, 80)); // 2-4 é a pracinha (flores)
[5, 8, 11, 14, 16].forEach((col) => colocarDecoracao(col, 3, CANDEEIRO, 36, 43));
[4, 7, 10, 13, 16].forEach((col) => colocarDecoracao(col, 5, CANDEEIRO, 36, 43));
[6, 12].forEach((col) => colocarDecoracao(col, 5, ARVORE_G, 78, 101));
[4, 8, 12, 16].forEach((col) => colocarDecoracao(col, 7, PINHEIRO, 72, 104));
[6, 10, 14].forEach((col) => colocarDecoracao(col, 7, CANDEEIRO, 36, 43));
[5, 13].forEach((col) => colocarDecoracao(col, 9, ARVORE_M, 57, 80));

// gente a passear -- perto da pracinha e do cruzamento, para a rua
// não ficar só de carros e prédios parados
const PESSOA_A = 'web/mapa/char_a_idle_SE_f01.png';
const PESSOA_A_AND = 'web/mapa/char_a_walk_NE_f02.png';
const PESSOA_B = 'web/mapa/char_b_idle_SW_f01.png';
const PESSOA_B_AND = 'web/mapa/char_b_walk_SE_f02.png';
// Descoberta ao testar: uma torre de 220px é alta o bastante para a
// caixa cobrir umas 5 linhas para cima da sua própria linha -- uma
// torre na linha 6 alcança visualmente até perto da linha 1, por isso
// NENHUMA das linhas-tampão (3,5,7 perto do núcleo) está livre do
// alcance de alguma torre próxima. A única coluna garantidamente sem
// prédio nenhum (norte ou sul) é a 9, a própria rua vertical -- é
// onde a gente fica, como se estivesse a atravessar/à espera.
// linha 7 (a seguir à fileira sul) é que está mesmo livre -- uma
// torre só alcança PARA CIMA da sua própria base, nunca para baixo,
// por isso a linha 7 (a sul da linha 6) fica sempre de fora do
// alcance de qualquer torre do núcleo institucional.
colocarDecoracao(9,  7, PESSOA_A, 24, 32);
colocarDecoracao(9,  9, PESSOA_B, 24, 32);
colocarDecoracao(15, 9, PESSOA_A_AND, 24, 32);
colocarDecoracao(17, 7, PESSOA_B_AND, 24, 32);

// carros nas duas ruas -- mesma orientação SE/NW da estrada, de
// vários modelos e cores para não parecerem clones
colocarDecoracao(4,  4, 'web/mapa/veh_sedan_blue_SE.png', 57, 35);
colocarDecoracao(8,  4, 'web/mapa/veh_sedan_red_NW.png', 57, 35);
colocarDecoracao(12, 4, 'web/mapa/veh_van_white_NW.png', 60, 41);
colocarDecoracao(6,  8, 'web/mapa/veh_pickup_orange_SE.png', 61, 37);
colocarDecoracao(10, 8, 'web/mapa/veh_sedan_white_SE.png', 57, 35);
colocarDecoracao(13, 8, 'web/mapa/veh_pickup_black_NW.png', 61, 37);

// canteiro de flores na pracinha em frente à igreja
colocarDecoracao(2, 3, FLOR_ROSA, 19, 18);
colocarDecoracao(3, 3, FLOR_AMARELA, 19, 18);
colocarDecoracao(4, 3, FLOR_ROSA, 19, 18);

// ── bairro novo: lotes de empresas reais ────────────────────────────
const PALETA = ['coral', 'turquesa', 'violeta', 'dourado', 'verde', 'azul', 'rosa', 'grafite'];
const RESERVAVEIS = [2, 4, 6, 8, 10, 12, 14].map((coluna) => ({ linha: 10, coluna }));

let MINHA_EMPRESA = null;
let MEU_LOTE = null;

function chaveLC(linha, coluna) { return linha + ',' + coluna; }

function colocarMarcaLivre(linha, coluna) {
  const p = projetar(coluna, linha);
  const el = document.createElement('div');
  el.className = 'lote-livre-marca';
  el.style.left = Math.round(p.x) + 'px';
  el.style.top = Math.round(p.y - 20) + 'px';
  el.style.zIndex = z(coluna, linha) + 1;
  el.innerHTML = `<div class="pino">+</div><span>Lote livre</span>`;
  el.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (!emEscolhaDeLote) return;
    escolherLote(linha, coluna);
  });
  mapa.appendChild(el);
}

function predioEmpresa(linha, coluna, lote) {
  const ficheiro = `web/mapa/bld_torre_paleta_${lote.tipo_predio}.png`;
  const nome = lote.nome_empresa || lote.empresa_cedula;
  const el = colocarPredio(coluna, linha, ficheiro, 256, 220, (elp, p) => abrirCartaoEmpresa(elp, p, lote), 'Abrir ' + nome);
  el.dataset.loteDeEmpresa = '1';
}

// chamada de novo depois de entrar (a sessão muda quem é "a minha
// empresa"), por isso limpa o que já tinha desenhado antes de refazer
// -- senão duplicava tudo a cada chamada.
async function carregarLotesDeEmpresas() {
  mapa.querySelectorAll('.lote-livre-marca, .predio[data-lote-de-empresa]').forEach((el) => el.remove());
  MEU_LOTE = null;

  const { data, error } = await sb.from('cidade_lotes').select('*');
  if (error) { console.error(error); return; }

  const ocupados = new Set();
  (data || []).forEach((lote) => {
    ocupados.add(chaveLC(lote.linha, lote.coluna));
    predioEmpresa(lote.linha, lote.coluna, lote);
    if (MINHA_EMPRESA && lote.empresa_cedula === MINHA_EMPRESA) MEU_LOTE = lote;
  });

  RESERVAVEIS.forEach(({ linha, coluna }) => {
    if (!ocupados.has(chaveLC(linha, coluna))) colocarMarcaLivre(linha, coluna);
  });

  atualizarBotaoConta();
}

// ── centrar #mapa pelo conteúdo real ─────────────────────────────
function centrarMapa() {
  baseLeft = (limites.minX + limites.maxX) / 2;
  baseTop = (limites.minY + limites.maxY) / 2;
  aplicarPosicaoMapa();
}
centrarMapa();

// ── arrastar (clicar e segurar) ─────────────────────────────────────
let aArrastar = false, arrastou = false, inicioX = 0, inicioY = 0, deslocInicioX = 0, deslocInicioY = 0;

cena.addEventListener('pointerdown', (ev) => {
  if (ev.target.closest('.predio') || ev.target.closest('.lote-livre-marca') || ev.target.closest('.cartao')) return;
  aArrastar = true; arrastou = false;
  inicioX = ev.clientX; inicioY = ev.clientY;
  deslocInicioX = deslocX; deslocInicioY = deslocY;
  cena.setPointerCapture(ev.pointerId);
  cena.classList.add('a-arrastar');
});
cena.addEventListener('pointermove', (ev) => {
  if (!aArrastar) return;
  const dx = ev.clientX - inicioX, dy = ev.clientY - inicioY;
  if (Math.abs(dx) > 6 || Math.abs(dy) > 6) arrastou = true;
  deslocX = deslocInicioX + dx;
  deslocY = deslocInicioY + dy;
  aplicarPosicaoMapa();
});
function soltarArrasto(ev) {
  if (!aArrastar) return;
  aArrastar = false;
  cena.classList.remove('a-arrastar');
  if (cena.hasPointerCapture(ev.pointerId)) cena.releasePointerCapture(ev.pointerId);
  if (arrastou) {
    // engo
    const bloquear = (e) => { e.stopPropagation(); cena.removeEventListener('click', bloquear, true); };
    cena.addEventListener('click', bloquear, true);
  }
}
cena.addEventListener('pointerup', soltarArrasto);
cena.addEventListener('pointercancel', soltarArrasto);

// ── sessão + "adicionar o meu prédio" ───────────────────────────────
const crachaConta = document.getElementById('crachá-conta');
const btnEntrar = document.getElementById('btn-entrar');
const btnMeuLote = document.getElementById('btn-meu-lote');
const janelaEntrar = document.getElementById('janela-entrar');
const janelaLote = document.getElementById('janela-lote');

// O <dialog> modal do formulário BLOQUEIA cliques no mapa por baixo
// (é assim que showModal() funciona) -- por isso a escolha do lote
// tem de acontecer ANTES de o formulário abrir, não ao mesmo tempo.
// Fluxo para um lote novo: botão → sem diálogo nenhum, só ativa o modo
// de escolha no mapa → clicar numa marca livre é que abre o formulário
// (já com a posição definida). Editar um lote existente salta direto
// para o formulário, porque a posição já está definida.
let emEscolhaDeLote = false;
const dicaEl = document.getElementById('dica');
const dicaOriginal = dicaEl.textContent;

function ativarEscolhaDeLote() {
  emEscolhaDeLote = true;
  cena.classList.add('a-escolher-lote');
  dicaEl.textContent = 'Clique num lote livre (a piscar) para colocar o seu prédio ali.';
  btnMeuLote.textContent = 'Cancelar escolha';
}
function desativarEscolhaDeLote() {
  emEscolhaDeLote = false;
  cena.classList.remove('a-escolher-lote');
  dicaEl.textContent = dicaOriginal;
  atualizarBotaoConta();
}
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && emEscolhaDeLote) desativarEscolhaDeLote();
});

let loteEscolhidoLinha = null, loteEscolhidoColuna = null, tipoEscolhido = null, ficheiroFotoEscolhido = null;

function escolherLote(linha, coluna) {
  loteEscolhidoLinha = linha; loteEscolhidoColuna = coluna;
  desativarEscolhaDeLote();
  abrirFormularioLote(null, { linha, coluna });
}

function mostrarMsg(el, texto, tipo) {
  el.textContent = texto || '';
  el.className = 'msg' + (tipo ? ' ' + tipo : '');
}

function montarPaleta(tipoAtual) {
  const cont = document.getElementById('paleta-tipos');
  cont.innerHTML = '';
  PALETA.forEach((chave) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'paleta-item' + (chave === tipoAtual ? ' selecionada' : '');
    btn.innerHTML = `<img src="web/mapa/bld_torre_paleta_${chave}.png" alt="${chave}" />`;
    btn.addEventListener('click', () => {
      tipoEscolhido = chave;
      cont.querySelectorAll('button').forEach((b) => b.classList.remove('selecionada'));
      btn.classList.add('selecionada');
    });
    cont.appendChild(btn);
  });
}

// loteExistente: o lote já gravado (edição) -- posição não muda.
// posicaoEscolhida: {linha,coluna} recém-escolhida no mapa (lote novo).
async function abrirFormularioLote(loteExistente, posicaoEscolhida) {
  const ctx = await quemSou();
  document.getElementById('lote-nome-empresa').textContent = (ctx && ctx.empresa && ctx.empresa.nome) || '—';
  document.getElementById('lote-email-empresa').textContent = (ctx && ctx.empresa && ctx.empresa.email_empresa) || '—';

  tipoEscolhido = loteExistente ? loteExistente.tipo_predio : PALETA[0];
  montarPaleta(tipoEscolhido);
  document.getElementById('lote-link').value = loteExistente ? (loteExistente.link || '') : '';
  document.getElementById('lote-rede').value = loteExistente ? (loteExistente.rede_social || '') : '';
  ficheiroFotoEscolhido = null;
  document.getElementById('lote-foto').value = '';
  const preview = document.getElementById('lote-foto-preview');
  if (loteExistente && loteExistente.foto_caminho) {
    preview.src = sb.storage.from('cidade').getPublicUrl(loteExistente.foto_caminho).data.publicUrl;
    preview.hidden = false;
  } else {
    preview.hidden = true;
  }

  const btn = document.getElementById('lote-guardar');
  btn.disabled = false;
  btn.textContent = 'Guardar';
  if (loteExistente) {
    loteEscolhidoLinha = loteExistente.linha;
    loteEscolhidoColuna = loteExistente.coluna;
    document.getElementById('lote-titulo').textContent = 'Editar o meu prédio';
    document.getElementById('lote-instrucao').textContent = 'O lote fica onde já estava — só muda o que preencher aqui.';
  } else {
    loteEscolhidoLinha = posicaoEscolhida.linha;
    loteEscolhidoColuna = posicaoEscolhida.coluna;
    document.getElementById('lote-titulo').textContent = 'O meu prédio';
    document.getElementById('lote-instrucao').textContent = 'Escolha o tipo e preencha o que quiser.';
  }
  mostrarMsg(document.getElementById('msg-lote'), '');
  janelaLote.showModal();
}

document.getElementById('lote-cancelar').addEventListener('click', () => janelaLote.close());
janelaLote.addEventListener('close', atualizarBotaoConta);

document.getElementById('lote-foto').addEventListener('change', (ev) => {
  const arquivo = ev.target.files[0];
  ficheiroFotoEscolhido = arquivo || null;
  const preview = document.getElementById('lote-foto-preview');
  if (arquivo) {
    preview.src = URL.createObjectURL(arquivo);
    preview.hidden = false;
  }
});

document.getElementById('form-lote').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const msg = document.getElementById('msg-lote');
  const btn = document.getElementById('lote-guardar');
  if (loteEscolhidoLinha == null || loteEscolhidoColuna == null) {
    mostrarMsg(msg, 'Escolha um lote no mapa primeiro.', 'erro');
    return;
  }
  btn.disabled = true;
  mostrarMsg(msg, 'A guardar…');

  let caminhoFoto = MEU_LOTE ? MEU_LOTE.foto_caminho : null;
  if (ficheiroFotoEscolhido) {
    const ext = (ficheiroFotoEscolhido.name.split('.').pop() || 'jpg').toLowerCase();
    const caminho = `${MINHA_EMPRESA}/foto.${ext}`;
    const { error: erroUpload } = await sb.storage.from('cidade')
      .upload(caminho, ficheiroFotoEscolhido, { upsert: true, contentType: ficheiroFotoEscolhido.type });
    if (erroUpload) { mostrarMsg(msg, 'Não foi possível guardar a foto: ' + erroUpload.message, 'erro'); btn.disabled = false; return; }
    caminhoFoto = caminho;
  }

  const r = await api('cidade_definir_lote', {
    p_tipo_predio: tipoEscolhido,
    p_linha: loteEscolhidoLinha,
    p_coluna: loteEscolhidoColuna,
    p_foto_caminho: caminhoFoto,
    p_link: document.getElementById('lote-link').value.trim() || null,
    p_rede_social: document.getElementById('lote-rede').value.trim() || null,
  });
  btn.disabled = false;
  if (!r.ok) { mostrarMsg(msg, r.erro, 'erro'); return; }

  janelaLote.close();
  window.location.reload();
});

function atualizarBotaoConta() {
  if (!MINHA_EMPRESA) {
    btnEntrar.hidden = false;
    btnMeuLote.hidden = true;
    return;
  }
  btnEntrar.hidden = true;
  btnMeuLote.hidden = false;
  btnMeuLote.textContent = MEU_LOTE ? 'Editar o meu prédio' : 'Adicionar o meu prédio';
}

btnEntrar.addEventListener('click', () => {
  mostrarMsg(document.getElementById('msg-entrar'), '');
  janelaEntrar.showModal();
});
document.getElementById('entrar-cancelar').addEventListener('click', () => janelaEntrar.close());
document.getElementById('form-entrar').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const msg = document.getElementById('msg-entrar');
  mostrarMsg(msg, 'A entrar…');
  const { error } = await sb.auth.signInWithPassword({
    email: document.getElementById('entrar-email').value,
    password: document.getElementById('entrar-senha').value,
  });
  if (error) { mostrarMsg(msg, 'Email ou senha errados.', 'erro'); return; }
  janelaEntrar.close();
  await iniciarSessao();
});

btnMeuLote.addEventListener('click', () => {
  if (emEscolhaDeLote) { desativarEscolhaDeLote(); return; }
  if (MEU_LOTE) { abrirFormularioLote(MEU_LOTE); return; }
  ativarEscolhaDeLote();
});

// quemSou() vem de comum.js (pp-base) -- devolve {pessoa, empresa}.
// Aqui também queremos email_empresa, que não vem nessa consulta
// básica, por isso buscamos à parte.
async function quemSou() {
  const { data } = await sb.auth.getSession();
  if (!data.session) return null;
  const { data: pessoa } = await sb.from('pessoas').select('cedula, nome, papel, empresa_id').eq('id', data.session.user.id).single();
  if (!pessoa || !pessoa.empresa_id) return { pessoa, empresa: null };
  const { data: empresa } = await sb.from('empresas').select('cedula, nome, email_empresa').eq('id', pessoa.empresa_id).single();
  return { pessoa, empresa };
}

async function iniciarSessao() {
  const ctx = await quemSou();
  MINHA_EMPRESA = (ctx && ctx.empresa) ? ctx.empresa.cedula : null;
  await carregarLotesDeEmpresas();
}

iniciarSessao();
