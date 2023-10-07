const express = require('express')
const app = express()
const rotas = require('./routes/rotas')

const port = 3000

app.use(express.json())

app.use(rotas)

app.listen(3000, () => {
  console.log(`Server rodando na porta ${port}`)
})
