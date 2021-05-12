const fs = require('fs/promises');


const listarProdutos = async (req, res) => {
    const listaDeProdutos = await fs.readFile('../cubos-checkout/data.json').then((resposta) =>{
        const produtos = JSON.parse(resposta);
        return produtos.produtos;
    })
    
    const {categoria, precoInicial, precoFinal} = req.query;
    
    if(categoria && !precoInicial && !precoFinal){
        const produtosCategoria = listaDeProdutos.filter(filtroCategoria => filtroCategoria.categoria.toLowerCase() === categoria.toLowerCase()).filter(estoque => estoque.estoque !== 0);
        if(!produtosCategoria[0]){
            res.status(404).json({mensagem: "Não existe esse produto em estoque"});
        }
        res.status(200).json(produtosCategoria);
    }

    if(precoFinal && precoInicial){
        if(categoria){
            const produtosCategoria2 = listaDeProdutos.filter(filtroCategoria => filtroCategoria.categoria.toLowerCase() === categoria.toLowerCase()).filter(estoque => estoque.estoque !== 0).filter(produto => produto.preco >= Number(precoInicial) && produto.preco <= Number(precoFinal));
            if(!produtosCategoria2[0]){
                res.status(404).json({mensagem: "Não existe este produto em estoque"});
            }
            res.status(200).json(produtosCategoria2);
        }
        const produtosPreco = listaDeProdutos.filter(produto => produto.preco >= Number(precoInicial) && produto.preco <= Number(precoFinal));
            if(!produtosPreco[0]){
                res.status(404).json({mensagem: "Não existe produtos nesta faixa de preço."});
            }
        res.status(200).json(produtosPreco);
    }
}

module.exports = {listarProdutos}