const moment = require('moment')
const conexao = require ('../infraestrutura/database/conexao')
const axios = require('axios')
const repositorio = require('../repositorios/atendimentos')

class Atendimento {
    constructor() {
        // Validando dados da requisição
        this.dataEhValida = ({data, dataCriacao}) => moment(data).isSameOrAfter(dataCriacao)
        this.clienteEhValido = ({tamanho}) => tamanho >= 4

        // Função de validação
        this.valida = parametros => this.validacoes.filter(campo => {
            const { nome } = campo
            const parametro = parametros[nome]

            return !campo.valido(parametro)
        })

         // Criando array de validações
         this.validacoes = [
            {
                nome: 'data',
                valido: this.dataEhValida,
                mensagem: 'Data deve ser maior ou igual da data atual'
            },
            {
                nome: 'cliente',
                valido: this.clienteEhValido,
                mensagem: 'Cliente deve ter pelo menos quatro caracteres'
            }
        ]
    }

    adiciona(atendimento) {
        // Formatando datas com moment
        const dataCriacao = moment().format('YYYY-MM-DD HH:MM:SS')
        const data = moment(atendimento.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')
        const parametros = {
            data: { data, dataCriacao },
            cliente: { tamanho: atendimento.cliente.length }
        }

        const erros = this.valida(parametros)
        const existemErros = erros.length
        
        // Verifica se existem erros
        if(existemErros) {
            return new Promise((resolve, reject) => reject(erros))
        } else {
            const atendimentoDatado = {...atendimento, dataCriacao, data}

            return repositorio.adiciona(atendimentoDatado)
                .then(resultados => {
                    const id = resultados.insertId
                    return { ...atendimento, id }
                })
        }        
    }

    lista() {
        return repositorio.lista()
    }

    buscaPorId(id, res) {
        const sql = `SELECT * FROM Atendimentos where id = ${id}`

        conexao.query(sql, async (erro, resultado) => {
            const atendimento = resultado[0]
            const cpf = atendimento.cliente
            if(erro){
                res.status(400).json(erro)
            } else {
                const { data } = await axios.get(`http://localhost:8082/${cpf}`)
                atendimento.cliente = data

                res.status(200).json(atendimento)
            }
        })
    }

    altera(id, valores, res) {
        if(valores.data) {
            valores.data = moment(valores.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:MM:SS')
        }

        const sql = 'UPDATE Atendimentos SET ? WHERE id = ?'

        conexao.query(sql, [valores, id], (erro, resultados) => {
            if(erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json({...valores, id})
            }
        })
    }

    deleta(id, res) {
        const sql = "DELETE FROM Atendimentos where id = ? "

        conexao.query(sql, id, (erro, resultados) => {
            if(erro) {
                res.status(400).json(erro)
            } else {
                res.status(200).json({id})
            }
        })
    }
}

module.exports = new Atendimento
