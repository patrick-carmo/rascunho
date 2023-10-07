const { pool } = require('../config/conexao')

const transacao = {
  listarTransacoes: async (req, res) => {
    const id = req.usuario_id

    const query = `
      select
        t.id,
        t.tipo,
        t.descricao,
        t.valor,
        t.data,
        t.usuario_id,
        t.categoria_id,
        c.descricao as categoria_nome
      from
        transacoes t
      join
        categorias c on t.categoria_id = c.id
      where
        t.usuario_id = $1`
    const values = [id]

    try {
      const { rows } = await pool.query(query, values)

      return res.status(200).json(rows)
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  detalharTransacao: async (req, res) => {
    const id = req.usuario_id
    const transacao_id = req.params.id

    const query = `
      select
        t.id,
        t.tipo,
        t.descricao,
        t.valor,
        t.data,
        t.usuario_id,
        t.categoria_id,
        c.descricao as categoria_nome
      from
        transacoes t
      join
        categorias c on t.categoria_id = c.id
      where
        t.id = $1
        and t.usuario_id = $2
    `
    const values = [transacao_id, id]

    try {
      const { rows } = await pool.query(query, values)

      if (rows.length === 0) {
        return res.status(404).json({ mensagem: 'Transação não encontrada.' })
      }

      return res.status(200).json(rows[0])
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  cadastrarTransacao: async (req, res) => {
    const id = req.usuario_id
    const { tipo, descricao, valor, data, categoria_id } = req.body

    if (
      !tipo ||
      !descricao ||
      !valor ||
      !data ||
      !categoria_id ||
      tipo.trim() === '' ||
      descricao.trim() === '' ||
      data.trim() === ''
    ) {
      return res
        .status(400)
        .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
      return res.status(400).json({ mensagem: `Tipo inválido. Insira "entrada" ou "saída"` })
    }

    const categoriaQuery = `
    select id
    from categorias
    where id = $1
  `

    const categoriaValues = [categoria_id]

    try {
      const categoriaResult = await pool.query(categoriaQuery, categoriaValues)

      if (categoriaResult.rowCount === 0) {
        return res.status(400).json({ mensagem: 'Categoria não encontrada.' })
      }

      const query = `
      insert into
        transacoes (tipo, descricao, valor, data, usuario_id, categoria_id)
      values
        ($1, $2, $3, $4, $5, $6)
    `
      const values = [tipo, descricao, valor, data, id, categoria_id]

      await pool.query(query, values)
      return res.status(201).json({ mensagem: 'Transação cadastrada com sucesso.' })
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  atualizarTransacao: async (req, res) => {
    const id = req.usuario_id
    const transacao_id = req.params.id
    const { tipo, descricao, valor, data, categoria_id } = req.body

    if (
      !tipo ||
      !descricao ||
      !valor ||
      !data ||
      !categoria_id ||
      tipo.trim() === '' ||
      descricao.trim() === '' ||
      valor === '' ||
      data.trim() === ''
    ) {
      return res
        .status(400)
        .json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' })
    }

    if (tipo !== 'entrada' && tipo !== 'saida') {
      return res.status(400).json({ mensagem: `Tipo inválido. Insira "entrada" ou "saida"` })
    }

    const categoriaQuery = `
    select id
    from categorias
    where id = $1
  `

    const categoriaValues = [categoria_id]

    try {
      const categoriaResult = await pool.query(categoriaQuery, categoriaValues)

      if (categoriaResult.rowCount === 0) {
        return res.status(400).json({ mensagem: 'Categoria não encontrada.' })
      }

      const query = `
      update
        transacoes
      set
        tipo = $1,
        descricao = $2,
        valor = $3,
        data = $4,
        categoria_id = $5
      where
        id = $6
      and usuario_id = $7
    `

      const values = [tipo, descricao, valor, data, categoria_id, transacao_id, id]

      const { rowCount } = await pool.query(query, values)

      if (rowCount === 0) {
        return res.status(404).json({ mensagem: 'Transação não encontrada.' })
      }

      return res.status(204).json()
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  excluirTransacao: async (req, res) => {
    const id = req.usuario_id
    const transacao_id = req.params.id

    const query = `
      delete from
        transacoes
      where
        id = $1
      and usuario_id = $2
    `
    const values = [transacao_id, id]

    try {
      const { rowCount } = await pool.query(query, values)

      if (rowCount === 0) {
        return res.status(404).json({ mensagem: 'Transação não encontrada.' })
      }

      return res.status(204).json()
    } catch (error) {
      return res.status(500).json({ mensagem: error.message })
    }
  },

  obterExtrato: async (req, res) => {
    const id = req.usuario_id

    const entrada = `
  select sum(valor) as entrada from transacoes where usuario_id = $1
  and tipo = 'entrada'
`
    const saida = `
  select sum(valor) as saida from transacoes where usuario_id = $1
  and tipo = 'saida'
`
    const values = [id]
    try {
      const { rows: somaEntrada } = await pool.query(entrada, values)
      const { rows: somaSaida } = await pool.query(saida, values)

      const extrato = {
        entrada: Number(somaEntrada[0].entrada) || 0,
        saida: Number(somaSaida[0].saida) || 0,
      }

      return res.status(200).json(extrato)
    } catch (error) {
      return res.status(500).json({ mensagem: error })
    }
  },
}

module.exports = transacao
