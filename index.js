require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const acIR = require("./utils/acIR.js")
const { spawn } = require('child_process');
const Blynk = require('blynk-library');

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())
let blynk = new Blynk.Blynk(process.env.BLYNK_AUTH_KEY);

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


var v1 = new blynk.VirtualPin(1);
var v9 = new blynk.VirtualPin(9);

v1.on('write', function(param) {
  switch(param[0]) {
    case '1':
        update_send_state({power:"off", state:"cool", temp:74, swing:"off", fan: "auto"})
        break;
    case '2':
        update_send_state({power:"on", state:"cool", temp:74, swing:"off", fan: "auto"})
        break;
    default:
        update_send_state({power:"off", state:"cool", temp:74, swing:"off", fan: "auto"})
}
});

v9.on('read', function() {
  v9.write(new Date().getSeconds());
});

// pin 1 - state: 1=off 2=cool 3=eco 4=deh 5=fan
// pin 2 - temp: 62 - 86
// pin 3 - fan speed: 1=auto 2=low 3=med 4=hi
// pin 4 - swing: 0=off 1=on

let update_send_state = function (data) {
  console.log(data)
  let irCode = acIR.buildIR(data)
  console.log(irCode);

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
}

app.use(express.static('client'))

app.listen(process.env.PORT || 3000, () => console.log('Server started'))
