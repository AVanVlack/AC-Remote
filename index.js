const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const acIR = require("./utils/acIR.js")

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())

app.post('/updateState', (req, res) => {
  console.log(req.body)
  let data = req.body
  if (!data.power && data.state === "off") data.state = 'fan', data.power = 'off'
  else data.power = 'on'
  let irCode = acIR.buildIR(data)
  res.send(irCode)
})

app.use(express.static('client'))

app.listen(process.env.PORT || 3000, () => console.log('Server started'))
