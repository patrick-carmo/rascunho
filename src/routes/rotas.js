const express = require('express')
const rotas = express.Router()
const usuario = require('../controllers/usuario')
const verificarToken = require('../middleware/verificarToken')
const listarCategorias = require('../controllers/categoria')
const transacao = require('../controllers/transacao')

rotas.post('/usuario', usuario.cadastrarUsuario)
rotas.post('/login', usuario.loginUsuario)

rotas.use(verificarToken)

rotas.get('/usuario', usuario.detalharUsuario)
rotas.put('/usuario', usuario.atualizarUsuario)
rotas.get('/categoria', listarCategorias)

rotas.get('/transacao', transacao.listarTransacoes)
rotas.get('/transacao/extrato', transacao.obterExtrato)
rotas.get('/transacao/:id', transacao.detalharTransacao)

rotas.post('/transacao', transacao.cadastrarTransacao)
rotas.put('/transacao/:id', transacao.atualizarTransacao)
rotas.delete('/transacao/:id', transacao.excluirTransacao)

module.exports = rotas
