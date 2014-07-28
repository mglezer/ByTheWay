
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');

//Declare route modules here
var index = require('./routes/index');
var trip = require('./routes/trip');

var app = express();

//Set up environment
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


// app.use(express.favicon());
// app.use(express.logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.methodOverride());
// app.use(express.cookieParser('Intro HCI secret key'));
// app.use(express.session());
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//Add routes here
app.get('/', index.view);
app.post('/trip', trip.viewPost);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});