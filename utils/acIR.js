const options = {
  power: {on: "00100100", off: "00000100"},
  state: {cool: "11000000", eco: "00000001", deh: "01000000", fan: "11100000"},
  fan: {auto: "000", low: "010", med: "110" ,hi: "101"},
  swing: {on: "11100", off: "00000"}
}
const header = 3302188160;
const zero = "00000000";

function tempToC (temp, scale) {
  // convert F temp to C and round
  let x = Math.round((temp-32) / 1.8);
  // return: binary to string, flip bits, reverse word, pad to 8 bits
  return x.toString(2).replace(/[01]/g,function(n) {return 1-n;}).split("").reverse().join("").padEnd(8, "0");
}

function tempToF (temp, scale) {
  // return: temp + 128, reverse word, pad to 8 bits
  return (temp + 128).toString(2).split("").reverse().join("").padEnd(8, "0");
}

function checksum (data) {
  // reverse data
  let dataset = data.split("").reverse();
  let sum = 0;
  // create bytes and sum
  for(let i = 0; i = dataset.length/8; i++){
    sum += parseInt(dataset.splice(0,8).join(""),2);
  }
  // reverse binary sum and remove overflow
  return sum.toString(2).split("").reverse().join("").substr(0,8)
}

 exports.buildIR = function (p) {
  let data = String.prototype.concat(header.toString(2),zero,
                                options.power[p.power],
                                options.state[p.state],
                                tempToC(p.temp),
                                options.fan[p.fan],
                                options.swing[p.swing],
                                zero,zero,zero,
                                tempToF(p.temp));
  return data.concat(checksum(data));
}
