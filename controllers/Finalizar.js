const fs = require('fs/promises');

let index = 0;
let semEstoque = 0;

const finalizarCompra = async (req, res) => {
    const tipo = req.body.type;
    const country = req.body.country;
    const name = req.body.name.split(" ").filter(x => x!=="");
    const { type, number } = req.body.documents[0];

    console.log(number.length);

    if(tipo.toLowerCase() !== "individual"){
        return res.status(400).json({mensagem: "O campo type precisa ser 'individual'"});
    }

    if(country.length !== 2 || Number(country)){
        return res.status(400).json({mensagem: "País inválido"});
    }

    if(name.length < 2){
        return res.status(400).json({mensagem: "Nome e sobrenome são obrigatórios"});
    }

    if(type.toLowerCase() !== "cpf"){
        return res.status(400).json({mensagem: "O documento precisa ser o cpf"});
    }

    if(number.length !== 11 || !Number(number)){
        return res.status(400).json({mensagem: "CPF inválido"});
    }

    const listaDeProdutos = await fs.readFile('../cubos-checkout/data.json').then((resposta) =>{
        const produtos = JSON.parse(resposta);
        return produtos;
    })

    try {
        const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho.json').then((resposta) => {
            const carrinho = JSON.parse(resposta);
            const produtosDoCarrinho = carrinho.produtos;
            for(const produto of listaDeProdutos.produtos){
                index++;
                for(const noCarrinho of produtosDoCarrinho){
                    if(produto.id === noCarrinho.id){
                        if(noCarrinho.quantidade > produto.estoque){
                            semEstoque++;
                            return res.status(200).json(`Estoque insulficiente do produto ${noCarrinho.nome}`);
                        } else {
                            listaDeProdutos.produtos[index-1].estoque = produto.estoque - noCarrinho.quantidade;
                        }
                    }
                }
            } if(!semEstoque){
                console.log(`Compra realizada com sucesso!`, carrinho);
                res.status(200).json({mensagem: "Compra realizada com sucesso!", carrinho});
                fs.unlink('../cubos-checkout/carrinho.json');
                fs.writeFile("data.json", JSON.stringify(listaDeProdutos, null, 2));
            }
        })
    } catch (error) {
        res.status(200).json({mensagem: "O carrinho está vazio."});
    }
}

module.exports = {finalizarCompra}