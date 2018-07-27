
var app = new Vue({
  el: '#settings',
  data: {
    settings: {
      state: 'off',
      temp: 72,
      fan: "auto",
      swing: 'on'
    }
  },
  watch: {
    settings: {
      handler: function (newSettings, oldSettings){
      console.log("sending state to server")
      fetch('/updateState', {
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8",},
        body: JSON.stringify(this.settings)
      })
      .then(response => response.text())
      .then(textData => console.log(textData))
      .catch(error => console.error(`Fetch Error =\n`, error));
    },
    deep: true
  }
  }
})


//should request current state on load and fill
//on any state change, post to server

// state: {on: "00100100", off: "00000100"},
// mode: {cool: "11000000", eco: "00000001", deh: "01000000", fan: "11100000"},
// fan: {auto: "000", low: "010", med: "110" ,hi: "101"},
// swing: {on: "11100", off: "00000"}
// temp: 62 - 86
