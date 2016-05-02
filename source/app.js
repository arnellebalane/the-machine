var path = require('path');
var express = require('express');
var nunjucks = require('nunjucks');
var config = require('./config');


var app = express();

var TEMPLATES_DIRECTORY = path.join(__dirname, 'templates');
var STATIC_DIRECTORY = path.join(__dirname, 'static');

app.set('views', TEMPLATES_DIRECTORY);
nunjucks.configure(TEMPLATES_DIRECTORY, { express: app });

app.listen(config.get('PORT'), function() {
    console.log('the-machine is now running at localhost:'
        + config.get('PORT'));
});


app.use('/static', express.static(STATIC_DIRECTORY));
app.use('/', require('./routes'));
