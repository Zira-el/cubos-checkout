const express = require('express');
const produtos = require('./controllers/Produtos');
const carrinho = require('./controllers/Carrinho'); 
const finalizar = require('./controllers/Finalizar');
const roteador = express();


roteador.get('/produtos', produtos.listarProdutos);
roteador.get('/carrinho', carrinho.detalharCarrinho);
roteador.post('/carrinho/produtos', carrinho.adicionarProdutos);
roteador.patch('/carrinho/produtos/:idProduto', carrinho.atualizarCarrinho);
roteador.delete('/carrinho/produtos/:idProduto', carrinho.deletarUmItem);
roteador.delete('/carrinho', carrinho.deletarCarrinho);
roteador.post('/finalizar-compra', finalizar.finalizarCompra);


module.exports = roteador;