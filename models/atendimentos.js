const moment = require('moment')
const conexao = require ('../infraestrutura/conexao')

class Atendimento {
    adiciona(atendimento, res) {
        // Formatando datas com moment
        const dataCriacao = moment().format('YYYY-MM-DD HH:MM:SS')
        const data = moment(atendimento.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')
        
        // Validando dados da requisição
        const dataEhValida = moment(data).isSameOrAfter(dataCriacao)
        const clienteEhValido = atendimento.cliente.length >= 4

        // Criando array de validações
        const validacoes = [
            {
                nome: 'data',
                valido: dataEhValida,
                mensagem: 'Data deve ser maior ou igual da data atual'
            },
            {
                nome: 'cliente',
                valido: clienteEhValido,
                mensagem: 'Cliente deve ter pelo menos quatro caracteres'
            }
        ]

        // Captura erros
        const erros = validacoes.filter(campo => !campo.valido)
        const existemErros = erros.length
        
        // Verifica se existem erros
        if(existemErros) {
            res.status(400).json(erros)
        } else {
            // Cria query
            const atendimentoDatado = {...atendimento, dataCriacao, data}
            const sql = 'INSERT INTO Atendimentos SET ?'

            // Executa query
            conexao.query(sql, atendimentoDatado, (erro, resultado) => {
                if(erro){
                    res.status(400).json(erro)
                } else {
                    res.status(201).json(resultado)
                }
            })
        }        
    }

    lista(res) {
        const sql = 'SELECT * FROM Atendimentos'

        conexao.query(sql, (erro, resultados) => {
            if(erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json(resultados)
            }
        })
    }

    buscaPorId(id, res) {
        const sql = `SELECT * FROM Atendimentos where id = ${id}`

        conexao.query(sql, (erro, resultado) => {
            const atendimento = resultado[0]
            if(erro){
                res.status(400).json(erro)
            } else {
                res.status(200).json(atendimento)
            }
        })
    }
}

module.exports = new Atendimento
