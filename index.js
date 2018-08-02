require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const acIR = require("./utils/acIR.js")
const { spawn } = require('child_process')
const Blynk = require('blynk-library')
const level = require('level')

const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())
let db = level('./db', {valueEncoding:'json'});
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


let blynkState = new blynk.VirtualPin(1);
let blynkTemp = new blynk.VirtualPin(2);
let blynkFan = new blynk.VirtualPin(3);
let blynkSwing = new blynk.VirtualPin(4);

blynkState.on('write', function(state) {
  if(state[0] == 1){
    updateState({power: 'off'})
  }
  else{
    let unitStates = ['cool', 'eco', 'deh', 'fan']
    updateState({power: 'on', state: unitStates[Number.parseInt(state[0]) - 2]})
  }
});
blynkTemp.on('write', function(temp){
  updateState({temp: Number.parseInt(temp[0])})
})
blynkFan.on('write', function(fan){
  let fanStates = ['auto', 'low', 'med', 'hi']
  updateState({fan: fanStates[Number.parseInt(fan[0]) - 1]})
})
blynkSwing.on('write', function(swing){
  if(swing[0] == 1) updateState({swing: 'on'})
  else updateState({swing: 'off'})
})

// pin 1 - state: 1=off 2=cool 3=eco 4=deh 5=fan
// pin 2 - temp: 62 - 86
// pin 3 - fan speed: 1=auto 2=low 3=med 4=hi
// pin 4 - swing: 0=off 1=on

let updateState = function (newState) {
  let defaultState = {power: 'off', state: 'cool', temp: 74, fan: 'auto', swing: 'off'}
  db.get('acUnit', function(err, value){
    if(err){
      db.put('acUnit', defaultState)
    } 
    else{
      db.put('acUnit', {...value, ...newState})
    }
  })
}

db.on('put', function (key, value) {
  if(key = 'acUnit'){
    let irCode = acIR.buildIR(value)
    console.log(value)
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
})


let update_send_state = function (data) {

  let irCode = acIR.buildIR(data)
  console.log(data)
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

//db.put('temp', '22', err => {});
//db.put('temp', '24', err => {});



app.use(express.static('client'))

app.listen(process.env.PORT || 3000, () => console.log('Server started'))
