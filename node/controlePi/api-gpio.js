// rpi-gpio.js
// arquivo de node para controlar a GPIO do Raspberry Pi

var pin = 7
var gpio = require('rpi-gpio');
gpio.setup(pin, gpio.DIR_IN, isLeadOn);

function isLeadOn() {
	gpio.read(pin, function(err, value) {
		console.log('The Value is ' + value)
		return value
	});
}

function ledOn() {
	
}