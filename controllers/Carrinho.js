const fs = require('fs/promises');
const addBusinessDays = require('date-fns/addBusinessDays');
const format = require('date-fns/format');

let temNoCarrinho = 0;
let zerouQuantidade = 0;
let index = 0;
let achouID = 0;

const carrinho = {
    subtotal: 0,
    dataDeEntrega: null,
    valorDoFrete: 0,
    totalAPagar: 0,
    produtos: []
}
const carrinhoSet = carrinho;

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

const atualizarCarrinho = async (req,res) => {
    const id = Number(req.params.idProduto);
    const quantidade = req.body.quantidade;
    if(id <= 0){
        res.status(400).json({mensagem: "Não existe este produto em estoque."});
    }
    const listaDeProdutos = await fs.readFile('../cubos-checkout/data.json').then((resposta) =>{
        const produtos = JSON.parse(resposta);
        return produtos.produtos;
    })

    const adicionarAoCarrinho = listaDeProdutos.find(produto => id === produto.id);

    try {
        const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho.json').then((resposta) => {
            const carrinho = JSON.parse(resposta);
            const produtosDoCarrinho = carrinho.produtos;
            for (const temProduto of produtosDoCarrinho){
                if(!achouID){
                    index++;
                }
                if(temProduto.id === id){
                    achouID++;
                    if(temProduto.quantidade+quantidade > adicionarAoCarrinho.estoque){
                        res.status(200).json({mensagem: "Quantidade insulficiente em estoque"});
                    } else if (temProduto.quantidade+quantidade < 0){
                        res.status(400).json({mensagem: "Quantidade inválida"});
                    } else if(temProduto.quantidade+quantidade === 0){
                        zerouQuantidade++;
                    } else {
                        temProduto.quantidade+=quantidade;
                        carrinho.subtotal += adicionarAoCarrinho.preco*quantidade;
                        carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? 0 : 5000;
                        carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
                    }
                }
            } 
            if(!achouID){
                res.status(400).json({mensagem: "Não existe este produto adicionado ao carrinho."});
            }
            if(zerouQuantidade > 0){
                zerouQuantidade = 0;
                carrinho.subtotal += adicionarAoCarrinho.preco*quantidade;
                carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? 0 : 5000;
                carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
                carrinho.produtos.splice(index-1, 1);
            }
            if(!carrinho.produtos.length){
                fs.unlink('../cubos-checkout/carrinho.json');
                res.status(200).json(carrinhoSet);
            }
            const novoConteudo = JSON.stringify(carrinho, null, 2);
            res.status(201).json(JSON.parse(novoConteudo));
            fs.writeFile("carrinho.json", novoConteudo)
            })
        } catch (error) {
            res.status(400).json({mensagem: "Não existe produto adicionado ao carrinho."});
        }     
}

const deletarUmItem = async (req,res) => {
    const id = Number(req.params.idProduto);
    try {
        const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho.json').then((resposta) => {
            const carrinho = JSON.parse(resposta);
            const produtosDoCarrinho = carrinho.produtos;
            for (const temProduto of produtosDoCarrinho){
                index++;
                if(temProduto.id === id){
                    achouID++;
                    carrinho.subtotal -= temProduto.preco*temProduto.quantidade;
                    carrinho.valorDoFrete = carrinho.subtotal >= 20000 ? 0 : 5000;
                    carrinho.totalAPagar = carrinho.subtotal + carrinho.valorDoFrete;
                    carrinho.produtos.splice(index-1, 1);
            }}
            if(!achouID){
                res.status(400).json({mensagem: "Não existe este produto adicionado ao carrinho."});
            }
            if(!carrinho.produtos.length){
                fs.unlink('../cubos-checkout/carrinho.json');
                res.status(200).json(carrinhoSet);
            }
            const novoConteudo = JSON.stringify(carrinho, null, 2);
            res.status(201).json(JSON.parse(novoConteudo));
            fs.writeFile("carrinho.json", novoConteudo)
            })
        } catch (error) {
            console.log("o erro é", error);
            res.status(400).json({mensagem: "Não existe produto adicionado ao carrinho."});
        }     
}

const deletarCarrinho = async (req,res) => {
    fs.unlink('../cubos-checkout/carrinho.json');
    res.status(200).json({mensagem: "Carrinho limpado com sucesso"});
}

module.exports = {detalharCarrinho, adicionarProdutos, atualizarCarrinho, deletarUmItem, deletarCarrinho}