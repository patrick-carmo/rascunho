const express = require('express')
const app = express()
const rotas = require('./routes/rotas')
require('dotenv').config()

const port = process.env.porta || 3000

app.use(express.json())

app.use(rotas)

app.listen(3000, () => {
  console.log(`Server rodando na porta ${port}`)
})
