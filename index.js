const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const acIR = require("./utils/acIR.js")
const { spawn } = require('child_process');

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())

app.post('/updateState', (req, res) => {
  console.log(req.body)
  let data = req.body
  if (!data.power && data.state === "off") data.state = 'fan', data.power = 'off'
  else data.power = 'on'

  let irCode = acIR.buildIR(data)

  const light = spawn('./light', [irCode.toString()])
  light.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  light.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });
  light.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  res.send(irCode)
})

app.use(express.static('client'))

app.listen(process.env.PORT || 3000, () => console.log('Server started'))
