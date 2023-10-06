const pool = require('../config/conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const usuario = {
  cadastrarUsuario: async (req, res) => {
    const { nome, email, senha } = req.body

    if (
      !nome ||
      !email ||
      !senha ||
      nome.trim() === '' ||
      email.trim() === '' ||
      senha.trim() === ''
    ) {
      return res
        .status(400)
        .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }

    let query = 'select * from usuarios where email = $1'
    let values = [email]

    try {
      const { rowCount } = await pool.query(query, values)

      if (rowCount > 0) {
        return res
          .status(400)
          .json({ mensagem: 'Já existe usuário cadastrado com o e-mail informado.' })
      }

      const senhaCriptografada = await bcrypt.hash(senha, 10)

      query = 'insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *'
      values = [nome, email, senhaCriptografada]

      const { rows } = await pool.query(query, values)

      const exibirUsuario = { ...rows[0] }
      delete exibirUsuario.senha

      return res.status(201).json(exibirUsuario)
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  loginUsuario: async (req, res) => {
    const { email, senha } = req.body

    if (!email || !senha || email.trim() === '' || senha.trim() === '') {
      return res
        .status(400)
        .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }

    const query = 'select * from usuarios where email = $1'
    const values = [email]

    try {
      const usuario = await pool.query(query, values)

      if (usuario.rowCount === 0) {
        return res.status(400).json({ mensagem: 'Usuário e/ou senha inválido(s).' })
      }

      const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha)

      if (!senhaValida) {
        return res.status(400).json({ mensagem: 'Usuário e/ou senha inválido(s).' })
      }

      const token = jwt.sign({ id: usuario.rows[0].id }, process.env.token, {
        expiresIn: '1d',
      })

      const exibirUsuario = { ...usuario.rows[0] }
      delete exibirUsuario.senha

      return res.status(200).json({ usuario: exibirUsuario, token })
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  detalharUsuario: async (req, res) => {
    const id = req.usuario_id

    const query = 'select * from usuarios where id = $1'
    const values = [id]

    try {
      const { rows } = await pool.query(query, values)

      const exibirUsuario = { ...rows[0] }
      delete exibirUsuario.senha

      return res.status(200).json(exibirUsuario)
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  atualizarUsuario: async (req, res) => {
    const { nome, email, senha } = req.body

    if (
      !nome ||
      !email ||
      !senha ||
      nome.trim() === '' ||
      email.trim() === '' ||
      senha.trim() === ''
    ) {
      return res
        .status(400)
        .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }

    const id = req.usuario_id

    query = 'select * from usuarios where email = $1 and id <> $2'
    values = [email, id]

    try {
      const verificarEmail = await pool.query(query, values)

      if (verificarEmail.rowCount > 0) {
        return res
          .status(400)
          .json({ mensagem: 'O e-mail informado já está sendo utilizado por outro usuário.' })
      }

      const senhaCriptografada = await bcrypt.hash(senha, 10)

      query = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4'
      values = [nome, email, senhaCriptografada, id]

      await pool.query(query, values)

      return res.status(204).json()
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },
}

module.exports = usuario
