const chave = '2565'

const pool = new Pool ({
  user: 'postgres',
  host: 'localhost',
  database: 'dindin',
  password: '0000',
  port: 5432,
})

module.exports = { pool, chave }