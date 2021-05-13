const fs = require('fs/promises');

const carrinho = {
    subtotal: 0,
    dataDeEntrega: null,
    valorDoFrete: 0,
    totalAPagar: 0,
    produtos: []
}

const detalharCarrinho = async (req, res) => {
    try {
        const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho-teste.json').then((resposta) => {
        const carrinho = JSON.parse(resposta);
        return res.status(200).json(detalheDoCarrinho);
        })
    } catch (error) {
        res.status(200).json(carrinho);
    }
    
}

const adicionarProdutos = async (req,res) => {
    const id = req.body.id;  
    const quantidade = req.body.quantidade;
    if(!id){
        return res.status(400).json({mensagem: "Necessário a ID do produto"});
    }

    if(!quantidade){
        return res.status(400).json({mensagem: "Necessário a quantidade de produto"});
    }


    const listaDeProdutos = await fs.readFile('../cubos-checkout/data.json').then((resposta) =>{
        const produtos = JSON.parse(resposta);
        return produtos.produtos;
    })

    const adicionarAoCarrinho = listaDeProdutos.find(produto => id === produto.id);
    if(adicionarAoCarrinho.estoque >= quantidade && adicionarAoCarrinho.estoque !== 0){
        carrinho.subtotal += adicionarAoCarrinho.preco*quantidade;
        carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? "Frete Grátis" : 5000;
        carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
        Object.defineProperty(adicionarAoCarrinho, 'quantidade', {configurable: true, writable: true, value: quantidade, enumerable: true});
        delete adicionarAoCarrinho.estoque;
        carrinho.produtos.push(adicionarAoCarrinho);
    }

    const novoConteudo = JSON.stringify(carrinho, null, 2);
    res.status(201).json(JSON.parse(novoConteudo));
    await fs.writeFile("carrinho.json", novoConteudo);
}


module.exports = {detalharCarrinho, adicionarProdutos}