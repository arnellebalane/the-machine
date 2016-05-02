var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var config = require('./config');


var app = express();

var TEMPLATES_DIRECTORY = path.join(__dirname, 'templates');

app.set('views', TEMPLATES_DIRECTORY);
nunjucks.configure(TEMPLATES_DIRECTORY, { express: app });

app.listen(config.get('PORT'), function() {
    console.log('the-machine is now running at localhost:'
        + config.get('PORT'));
});


var STATIC_DIRECTORY = path.join(__dirname, 'static');
var SERVICE_WORKER_PATH = path.join(__dirname, 'static',
    'javascripts', 'service-worker.js');
var MANIFEST_PATH = path.join(__dirname, 'manifest.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/static', express.static(STATIC_DIRECTORY));
app.use('/service-worker.js', express.static(SERVICE_WORKER_PATH));
app.use('/manifest.json', express.static(MANIFEST_PATH));
app.use('/', require('./routes'));
