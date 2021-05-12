const fs = require('fs/promises');

const detalharCarrinho = async (req, res) => {
    const detalheDoCarrinho = await fs.readFile('../cubos-checkout/carrinho-teste.json').then((resposta) => {
        const carrinho = JSON.parse(resposta);
        return carrinho;
    })
    res.status(200).json(detalheDoCarrinho);
}



module.exports = {detalharCarrinho}