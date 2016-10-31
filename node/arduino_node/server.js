var five = require("johnny-five");
var board = new five.Board();
var plotly = require('plotly')('matheus.neia','kw2qzq0ny3');
var token = 'ou1ppsix3d';
var filenameGraph = 'cervejaRn';
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

//configuracoes do arduino
var pin_lm35 = "A0";
var pin_aquecedor = 8;
var pin_bomba_agua = 10;
var pin_led_aquecedor = 13;

//configuracoes temperatura
var temp_min = 29;
var temp_max = 35;

//perifericos
var aquecedor;
var bomba_agua; // por enquanto é um led
var temperature; //lm35
var led_aquecedor; 


//configuracoes webserver
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = process.env.PORT || 8080;        // set our port
var router = express.Router();


//variaveis de controle
var temp_atual = 0.0;

//graficos plotly
var initData = [{x:[], y:[], stream:{token:token, maxpoints:200}}];
var initGraphOptions = {fileopt : "extend", filename : filenameGraph};
var stream1;

//inicia os graficos para plotagem da temperatura
plotly.plot(initData, initGraphOptions, function (err, msg) {
  if (err) return console.log("Erro ao plotar: " + err)
  console.log(msg);

   stream1 = plotly.stream(token, function (err, res) {
    console.log(err, res);
  });
   console.log('Plotagem iniciada');
});

//inicia o arduino
board.on("ready", function() {
  aquecedor = new five.Relay(pin_aquecedor);
  bomba_agua = new five.Pin(pin_bomba_agua);
  led_aquecedor = new five.Led(pin_led_aquecedor);

  //temperature
   temperature = new five.Thermometer({
  	controller : "LM35",
  	pin : pin_lm35,
  	freq : 1000
  });

   console.log('Arduino Iniciado');

   ligaBombaAgua();
   ligaAquecedor();
   setTimeout(function () {
   		desligaAquecedor();
   		console.log("terminou");
   }, 10000)
  

	temperature.on("change", function() {
		temp_atual = this.celsius;
	  	console.log("Temperatura Mudou para: " + this.celsius + " ˚C ");
	});

});


board.on("exit", function() {
  	desligaAquecedor();
  	desligaBombaAgua();
});




// middleware to use for all requests
router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/temperature')
	.post(function (req, res) {
		console.log('There is no implementation for temperature post!!!');
		res.json({message : 'There is no implementation for temperature post'});
	})

	.get(function(req, res) {
		res.json({temperature : temp_atual});
	});

router.route('/water_bomb/:state')
	.post(function(req, res) {
		var state = req.params.state;
		if (state == 'on') {
			ligaBombaAgua();
		} else if (state == 'off') {
			desligaBombaAgua();
		} else {
			console.log('State ' + state + ' doesn\'t implemented');
		}
	});

router.route('/heater/:state')
	.post(function(req, res) {
		var state = req.body.state;
		if (state == 'on') {
			ligaAquecedor();
		} else if (state == 'off') {
			desligaAquecedor();
		} else {
			console.log('State ' + state + ' doesn\'t implemented');
		}
	});

//webserver
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


// START THE SERVER
app.listen(port);
console.log('webserver iniciado');


function ligaAquecedor() {
	console.log("Ligando aquecedor");
	aquecedor.on();
	led_aquecedor.on();
}

function desligaAquecedor() {
	console.log("Desligando aquecedor");
	aquecedor.off();
	led_aquecedor.off();
}

function ligaBombaAgua() {
	console.log("Ligando bomba agua");
	bomba_agua.high();
}

function desligaBombaAgua() {
	console.log("Desligando bomba agua");
	bomba_agua.low();
}

// helper function to get a nicely formatted date string
function getDateString() {
    var time = new Date().getTime();
    // 32400000 is (GMT+9 Japan)
    // for your timezone just multiply +/-GMT by 36000000
    var datestr = new Date(time +32400000).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}
