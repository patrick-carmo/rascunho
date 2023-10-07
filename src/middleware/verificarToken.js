const jwt = require('jsonwebtoken')
const { pool, chave } = require('../config/conexao')

const verificarToken = async (req, res, next) => {
  const { authorization } = req.headers
  
  if (!authorization) {
    return res.status(401).json({
      mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.',
    })
  }

  try {
    const token = authorization.split(' ')[1].trim()

    const { id } = jwt.verify(token, chave)
  
    const usuario = await pool.query('select * from usuarios where id = $1', [id])

    if (usuario.rowCount === 0) {
      return res.status(401).json({
        mensagem: 'Para acessar este recurso um token de autenticação válido deve ser enviado.',
      })
    }

    req.usuario_id = id

    next()
  } catch (error) {
    return res.status(401).json({mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado."})
  }
}

module.exports = verificarToken
