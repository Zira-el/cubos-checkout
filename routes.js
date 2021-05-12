const express = require('express');
const produtos = require('./controllers/Produtos');
const carrinho = require('./controllers/Carrinho')
const roteador = express();


roteador.get('/produtos', produtos.listarProdutos);
roteador.get('/carrinho', carrinho.detalharCarrinho);


module.exports = roteador;