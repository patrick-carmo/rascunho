const { pool } = require('../config/conexao')

const listarCategorias = async (req, res) => {
  const query = 'select * from categorias'

  try {
    const categorias = await pool.query(query)
    return res.status(200).json(categorias.rows)
  } catch (error) {
    return res.status(500).json({ mensagem: error.message })
  }
}

module.exports = listarCategorias