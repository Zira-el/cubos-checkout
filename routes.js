const express = require('express');
const produtos = require('./controllers/Produtos');
const roteador = express();


roteador.get('/produtos', produtos.listarProdutos);


module.exports = roteador;