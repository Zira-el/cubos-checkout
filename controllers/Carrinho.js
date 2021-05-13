const fs = require('fs/promises');
const addBusinessDays = require('date-fns/addBusinessDays');
const format = require('date-fns/format');

let temNoCarrinho = 0;
const carrinho = {
    subtotal: 0,
    dataDeEntrega: null,
    valorDoFrete: 0,
    totalAPagar: 0,
    produtos: []
}

const detalharCarrinho = async (req, res) => {
    try {
        const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho.json').then((resposta) => {
        const carrinho = JSON.parse(resposta);
        return res.status(200).json(carrinho);
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

    if(!quantidade || quantidade <=0){
        return res.status(400).json({mensagem: "Necessário a quantidade de produto"});
    }

    const listaDeProdutos = await fs.readFile('../cubos-checkout/data.json').then((resposta) =>{
        const produtos = JSON.parse(resposta);
        return produtos.produtos;
    })

    const adicionarAoCarrinho = listaDeProdutos.find(produto => id === produto.id);
    if(adicionarAoCarrinho.estoque < quantidade || adicionarAoCarrinho.estoque===0){
        res.status(200).json({mensagem: "Quantidade insuficiente do produto no estoque."});
    }
    try {
        const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho.json').then((resposta) => {
        const carrinho = JSON.parse(resposta);
        const produtosDoCarrinho = carrinho.produtos;
        for (const temProduto of produtosDoCarrinho){
            if(temProduto.id === id){
                if(temProduto.quantidade+quantidade > adicionarAoCarrinho.estoque){
                    res.status(200).json({mensagem: "Quantidade insulficiente em estoque"});
                } else {
                    temNoCarrinho++;
                    temProduto.quantidade+=quantidade;
                    carrinho.subtotal += adicionarAoCarrinho.preco*quantidade;
                    carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? 0 : 5000;
                    carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
                }
            }
        }
        if(adicionarAoCarrinho.estoque >= quantidade && adicionarAoCarrinho.estoque !== 0 && temNoCarrinho === 0){
            carrinho.subtotal += adicionarAoCarrinho.preco*quantidade;
            carrinho.dataDeEntrega =  format(addBusinessDays(new Date(), 15), "dd-MM-yyyy");
            carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? 0 : 5000;
            carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
            Object.defineProperty(adicionarAoCarrinho, 'quantidade', {configurable: true, writable: true, value: quantidade, enumerable: true});
            delete adicionarAoCarrinho.estoque;
            carrinho.produtos.push(adicionarAoCarrinho);
        }
        const novoConteudo = JSON.stringify(carrinho, null, 2);
        res.status(201).json(JSON.parse(novoConteudo));
        fs.writeFile("carrinho.json", novoConteudo)
        })
    } catch (error) {
        if(adicionarAoCarrinho.estoque >= quantidade && adicionarAoCarrinho.estoque !== 0){
            carrinho.subtotal += adicionarAoCarrinho.preco*quantidade;
            carrinho.dataDeEntrega =  format(addBusinessDays(new Date(), 15), "dd-MM-yyyy");
            carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? 0 : 5000;
            carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
            Object.defineProperty(adicionarAoCarrinho, 'quantidade', {configurable: true, writable: true, value: quantidade, enumerable: true});
            delete adicionarAoCarrinho.estoque;
            carrinho.produtos.push(adicionarAoCarrinho);
        }     
        const novoConteudo = JSON.stringify(carrinho, null, 2);
        res.status(201).json(JSON.parse(novoConteudo));
        fs.writeFile("carrinho.json", novoConteudo)
    }
}


module.exports = {detalharCarrinho, adicionarProdutos}