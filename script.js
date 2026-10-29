// Header ganha fundo sólido ao rolar a página
var header = document.getElementById('siteHeader');
function onScroll(){
  if (window.scrollY > 12) header.classList.add('is-scrolled');
  else header.classList.remove('is-scrolled');
}
window.addEventListener('scroll', onScroll, { passive:true });
onScroll();
 
// Menu mobile (hamburguer)
var toggle = document.getElementById('menuToggle');
toggle.addEventListener('click', function(){
  var open = document.body.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
document.getElementById('navLinks').addEventListener('click', function(e){
  if (e.target.tagName === 'A') {
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});
 
// ---------- Carrinho ----------
var carrinho = []; // { id, nome, preco, qtd }
 
var cartBtn = document.getElementById('cartBtn');
var cartDrawer = document.getElementById('cartDrawer');
var cartOverlay = document.getElementById('cartOverlay');
var cartClose = document.getElementById('cartClose');
var cartItems = document.getElementById('cartItems');
var cartEmpty = document.getElementById('cartEmpty');
var cartCount = document.getElementById('cartCount');
var cartTotal = document.getElementById('cartTotal');
var cartFeedback = document.getElementById('cartFeedback');
 
function formatarPreco(valor){
  return 'R$ ' + valor.toFixed(2).replace('.', ',');
}
 
function abrirCarrinho(){
  cartOverlay.hidden = false;
  // força um reflow para a transição de opacidade acontecer
  void cartOverlay.offsetWidth;
  cartOverlay.classList.add('is-visible');
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  cartBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('cart-open');
  cartClose.focus();
}
 
function fecharCarrinho(){
  cartOverlay.classList.remove('is-visible');
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  cartBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('cart-open');
  setTimeout(function(){ cartOverlay.hidden = true; }, 280);
}
 
function renderizarCarrinho(){
  cartItems.innerHTML = '';
 
  var totalItens = 0;
  var totalValor = 0;
 
  carrinho.forEach(function(item){
    totalItens += item.qtd;
    totalValor += item.qtd * item.preco;
 
    var li = document.createElement('li');
    li.className = 'cart-item';
 
    var corPacote = item.id === 'graos' ? '#0B0805' : '#F3EDE0';
    var corEtiqueta = item.id === 'graos' ? '#F3EDE0' : '#0B0805';
 
    li.innerHTML =
      '<svg class="cart-item-bag" viewBox="0 0 140 180" aria-hidden="true">' +
        '<rect x="34" y="8" width="72" height="16" rx="4" fill="' + corPacote + '" stroke="#372D22"/>' +
        '<rect x="18" y="20" width="104" height="150" rx="14" fill="' + corPacote + '" stroke="#372D22" stroke-width="1.5"/>' +
        '<rect x="39" y="55" width="62" height="60" rx="3" fill="' + corEtiqueta + '"/>' +
      '</svg>' +
      '<div class="cart-item-info">' +
        '<p class="cart-item-name">' + item.nome + '</p>' +
        '<p class="cart-item-price">' + formatarPreco(item.preco) + ' cada</p>' +
        '<div class="cart-item-controls">' +
          '<div class="qty-group">' +
            '<button class="qty-btn" data-acao="menos" data-id="' + item.id + '" aria-label="Diminuir quantidade">−</button>' +
            '<span class="qty-value">' + item.qtd + '</span>' +
            '<button class="qty-btn" data-acao="mais" data-id="' + item.id + '" aria-label="Aumentar quantidade">+</button>' +
          '</div>' +
          '<button class="cart-remove" data-acao="remover" data-id="' + item.id + '">Remover</button>' +
        '</div>' +
      '</div>';
 
    cartItems.appendChild(li);
  });
 
  cartEmpty.hidden = carrinho.length > 0;
  cartTotal.textContent = formatarPreco(totalValor);
  if (typeof etapaAtual !== 'undefined' && etapaAtual === 1) {
    cartNext.disabled = carrinho.length === 0;
  }
 
  if (totalItens > 0) {
    cartCount.textContent = totalItens;
    cartCount.hidden = false;
  } else {
    cartCount.hidden = true;
  }
 
  cartFeedback.hidden = true;
}
 
function adicionarAoCarrinho(id, nome, preco){
  var existente = null;
  carrinho.forEach(function(item){ if (item.id === id) existente = item; });
 
  if (existente) existente.qtd += 1;
  else carrinho.push({ id:id, nome:nome, preco:preco, qtd:1 });
 
  renderizarCarrinho();
  if (typeof irParaEtapa === 'function') irParaEtapa(1);
  abrirCarrinho();
}
 
document.querySelectorAll('[data-add-to-cart]').forEach(function(botao){
  botao.addEventListener('click', function(){
    adicionarAoCarrinho(
      botao.dataset.id,
      botao.dataset.nome,
      parseFloat(botao.dataset.preco)
    );
  });
});
 
cartItems.addEventListener('click', function(e){
  var botao = e.target.closest('[data-acao]');
  if (!botao) return;
 
  var id = botao.dataset.id;
  var acao = botao.dataset.acao;
 
  carrinho = carrinho.filter(function(item){
    if (item.id !== id) return true;
    if (acao === 'mais') item.qtd += 1;
    if (acao === 'menos') item.qtd -= 1;
    if (acao === 'remover') return false;
    return item.qtd > 0;
  });
 
  renderizarCarrinho();
});
 
cartBtn.addEventListener('click', abrirCarrinho);
cartClose.addEventListener('click', fecharCarrinho);
cartOverlay.addEventListener('click', fecharCarrinho);
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape' && cartDrawer.classList.contains('is-open')) fecharCarrinho();
});
 
// ---------- Checkout em etapas ----------
var etapaAtual = 1;
var totalEtapas = 5;
 
var cartTitle = document.getElementById('cartTitle');
var cartSteps = document.getElementById('cartSteps');
var cartNext = document.getElementById('cartNext');
var cartBack = document.getElementById('cartBack');
var cartNote = document.getElementById('cartNote');
var cartTotalWrap = document.getElementById('cartTotalWrap');
var camposEndereco = document.getElementById('camposEndereco');
var erroEntrega = document.getElementById('erroEntrega');
var resumoPedido = document.getElementById('resumoPedido');
var pedidoCodigo = document.getElementById('pedidoCodigo');
 
var pedido = {
  entrega: 'Entrega',
  pagamento: 'Pix',
  nome: '', telefone: '', cep: '', numero: '', endereco: '', cidade: '', obs: '',
  codigo: ''
};
 
var titulos = {
  1: 'Seu carrinho',
  2: 'Dados de entrega',
  3: 'Forma de pagamento',
  4: 'Revise seu pedido',
  5: 'Tudo certo!'
};
 
var rotulosBotao = {
  1: 'Finalizar pedido',
  2: 'Ir para pagamento',
  3: 'Revisar pedido',
  4: 'Enviar pedido',
  5: 'Voltar ao início'
};
 
function irParaEtapa(n){
  etapaAtual = n;
 
  document.querySelectorAll('.cart-step').forEach(function(painel){
    painel.classList.toggle('is-active', Number(painel.dataset.step) === n);
  });
 
  Array.prototype.forEach.call(cartSteps.children, function(li, i){
    li.classList.toggle('is-active', i + 1 === n);
    li.classList.toggle('is-done', i + 1 < n);
  });
 
  cartTitle.textContent = titulos[n];
  cartNext.textContent = rotulosBotao[n];
  cartBack.hidden = (n === 1 || n === 5);
  cartSteps.hidden = (n === 5);
  cartTotalWrap.hidden = (n === 5);
  cartNote.hidden = (n === 5);
  cartNext.disabled = (n === 1 && carrinho.length === 0);
  erroEntrega.hidden = true;
  cartBody.scrollTop = 0;
 
  if (n === 4) montarResumo();
}
 
function selecionarOpcao(grupo, atributo, chave){
  grupo.forEach(function(botao){
    botao.addEventListener('click', function(){
      grupo.forEach(function(b){
        b.classList.remove('is-selected');
        b.setAttribute('aria-checked', 'false');
      });
      botao.classList.add('is-selected');
      botao.setAttribute('aria-checked', 'true');
      pedido[chave] = botao.dataset[atributo];
 
      if (chave === 'entrega') {
        camposEndereco.hidden = (pedido.entrega === 'Retirada');
        cartNote.textContent = pedido.entrega === 'Retirada'
          ? 'Combinamos o ponto e o horário de retirada por mensagem.'
          : 'O frete é combinado por mensagem, conforme o seu endereço.';
      }
    });
  });
}
 
selecionarOpcao(Array.prototype.slice.call(document.querySelectorAll('[data-entrega]')), 'entrega', 'entrega');
selecionarOpcao(Array.prototype.slice.call(document.querySelectorAll('[data-pagamento]')), 'pagamento', 'pagamento');
 
function coletarDados(){
  pedido.nome = document.getElementById('checkoutNome').value.trim();
  pedido.telefone = document.getElementById('checkoutTelefone').value.trim();
  pedido.cep = document.getElementById('checkoutCep').value.trim();
  pedido.numero = document.getElementById('checkoutNumero').value.trim();
  pedido.endereco = document.getElementById('checkoutEndereco').value.trim();
  pedido.cidade = document.getElementById('checkoutCidade').value.trim();
  pedido.obs = document.getElementById('checkoutObs').value.trim();
}
 
function validarEntrega(){
  coletarDados();
  var faltando = [];
 
  if (!pedido.nome) faltando.push('nome');
  if (!pedido.telefone) faltando.push('WhatsApp');
 
  if (pedido.entrega === 'Entrega') {
    if (!pedido.cep) faltando.push('CEP');
    if (!pedido.numero) faltando.push('número');
    if (!pedido.endereco) faltando.push('endereço');
    if (!pedido.cidade) faltando.push('cidade');
  }
 
  if (faltando.length > 0) {
    erroEntrega.textContent = 'Preencha: ' + faltando.join(', ') + '.';
    erroEntrega.hidden = false;
    return false;
  }
 
  // O número aceita qualquer formato (120, 120A, s/n), mas o CEP precisa ter 8 dígitos
  if (pedido.entrega === 'Entrega' && pedido.cep.replace(/\D/g, '').length !== 8) {
    erroEntrega.textContent = 'O CEP precisa ter 8 dígitos.';
    erroEntrega.hidden = false;
    return false;
  }
 
  return true;
}
 
// Formata o CEP enquanto a pessoa digita (00000-000)
document.getElementById('checkoutCep').addEventListener('input', function(){
  var digitos = this.value.replace(/\D/g, '').slice(0, 8);
  this.value = digitos.length > 5 ? digitos.slice(0, 5) + '-' + digitos.slice(5) : digitos;
});
 
function calcularTotal(){
  var total = 0;
  carrinho.forEach(function(item){ total += item.qtd * item.preco; });
  return total;
}
 
function gerarCodigo(){
  var data = new Date();
  var dia = String(data.getDate()).padStart(2, '0');
  var mes = String(data.getMonth() + 1).padStart(2, '0');
  var aleatorio = String(Math.floor(Math.random() * 900) + 100);
  return 'UC-' + dia + mes + '-' + aleatorio;
}
 
function montarResumo(){
  var linhasItens = carrinho.map(function(item){
    return '<div class="resumo-linha"><span>' + item.qtd + 'x ' + item.nome + '</span>' +
           '<span>' + formatarPreco(item.qtd * item.preco) + '</span></div>';
  }).join('');
 
  var blocoEntrega = pedido.entrega === 'Retirada'
    ? '<p class="resumo-texto">Retirada combinada por mensagem<br><em>' + pedido.nome + ' · ' + pedido.telefone + '</em></p>'
    : '<p class="resumo-texto">' + pedido.nome + '<br><em>' + pedido.telefone + '</em><br>' +
      pedido.endereco + (pedido.numero ? ', ' + pedido.numero : '') + '<br>' +
      pedido.cidade + (pedido.cep ? ' · ' + pedido.cep : '') + '</p>';
 
  var blocoObs = pedido.obs
    ? '<div class="resumo-bloco"><p class="resumo-titulo">Observações' +
      '<button type="button" class="resumo-editar" data-goto="2">Editar</button></p>' +
      '<p class="resumo-texto">' + pedido.obs + '</p></div>'
    : '';
 
  resumoPedido.innerHTML =
    '<div class="resumo-bloco">' +
      '<p class="resumo-titulo">Itens' +
        '<button type="button" class="resumo-editar" data-goto="1">Editar</button>' +
      '</p>' + linhasItens +
      '<div class="resumo-linha" style="margin-top:12px"><span><strong>Subtotal</strong></span>' +
      '<span><strong>' + formatarPreco(calcularTotal()) + '</strong></span></div>' +
      '<div class="resumo-linha"><span>Frete</span><span>a combinar</span></div>' +
    '</div>' +
    '<div class="resumo-bloco">' +
      '<p class="resumo-titulo">' + (pedido.entrega === 'Retirada' ? 'Retirada' : 'Entrega') +
        '<button type="button" class="resumo-editar" data-goto="2">Editar</button>' +
      '</p>' +
      blocoEntrega +
    '</div>' +
    '<div class="resumo-bloco">' +
      '<p class="resumo-titulo">Pagamento' +
        '<button type="button" class="resumo-editar" data-goto="3">Editar</button>' +
      '</p>' +
      '<p class="resumo-texto">' + pedido.pagamento + '</p>' +
    '</div>' +
    blocoObs;
}
 
function montarMensagem(){
  var linhas = ['Olá! Quero fazer um pedido na Under Coffee.', ''];
  linhas.push('Pedido ' + pedido.codigo);
  linhas.push('');
 
  carrinho.forEach(function(item){
    linhas.push('• ' + item.qtd + 'x ' + item.nome + ' — ' + formatarPreco(item.qtd * item.preco));
  });
 
  linhas.push('Subtotal: ' + formatarPreco(calcularTotal()) + ' (+ frete a combinar)');
  linhas.push('');
  linhas.push('Nome: ' + pedido.nome);
  linhas.push('WhatsApp: ' + pedido.telefone);
 
  if (pedido.entrega === 'Retirada') {
    linhas.push('Recebimento: retirada');
  } else {
    linhas.push('Endereço: ' + pedido.endereco + (pedido.numero ? ', ' + pedido.numero : ''));
    linhas.push('Cidade: ' + pedido.cidade + (pedido.cep ? ' · CEP ' + pedido.cep : ''));
  }
 
  linhas.push('Pagamento: ' + pedido.pagamento);
  if (pedido.obs) linhas.push('Observações: ' + pedido.obs);
 
  return linhas.join('\n');
}
 
function copiarPedido(){
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(montarMensagem()).catch(function(){});
  }
}
 
function enviarPedido(){
  pedido.codigo = gerarCodigo();
  pedidoCodigo.textContent = 'Código do pedido: ' + pedido.codigo;
  copiarPedido();
  window.open('https://ig.me/m/undercoffeeco', '_blank', 'noopener');
  irParaEtapa(5);
}
 
cartNext.addEventListener('click', function(){
  if (etapaAtual === 1) {
    if (carrinho.length === 0) return;
    irParaEtapa(2);
  } else if (etapaAtual === 2) {
    if (validarEntrega()) irParaEtapa(3);
  } else if (etapaAtual === 3) {
    irParaEtapa(4);
  } else if (etapaAtual === 4) {
    enviarPedido();
  } else {
    carrinho = [];
    renderizarCarrinho();
    fecharCarrinho();
    setTimeout(function(){ irParaEtapa(1); }, 300);
  }
});
 
cartBack.addEventListener('click', function(){
  if (etapaAtual > 1) irParaEtapa(etapaAtual - 1);
});
 
// Voltar para qualquer etapa já concluída (pelo indicador no topo ou pelo "Editar" da revisão)
function ligarAtalhos(container){
  container.addEventListener('click', function(e){
    var botao = e.target.closest('[data-goto]');
    if (!botao) return;
    var destino = Number(botao.dataset.goto);
    if (destino < etapaAtual) irParaEtapa(destino);
  });
}
ligarAtalhos(cartSteps);
ligarAtalhos(resumoPedido);
 
document.getElementById('copiarNovamente').addEventListener('click', function(){
  copiarPedido();
  this.textContent = 'Copiado!';
  var botao = this;
  setTimeout(function(){ botao.textContent = 'Copiar o pedido de novo'; }, 2000);
});
 
renderizarCarrinho();
irParaEtapa(1);
 
// Formulário de contato -> abre o cliente de e-mail com os dados preenchidos
document.getElementById('formulario').addEventListener('submit', function(e){
  e.preventDefault();
  var nome = document.getElementById('nome').value.trim();
  var email = document.getElementById('email').value.trim();
  var mensagem = document.getElementById('mensagem').value.trim();
 
  var subject = encodeURIComponent('Contato pelo site — ' + nome);
  var body = encodeURIComponent(mensagem + '\n\nE-mail para resposta: ' + email);
  var mailtoLink = 'mailto:ola@undercoffee.com.br?subject=' + subject + '&body=' + body;
 
  document.getElementById('contatoForm').classList.add('is-sent');
  document.getElementById('formSuccess').classList.add('is-visible');
  window.location.href = mailtoLink;
});