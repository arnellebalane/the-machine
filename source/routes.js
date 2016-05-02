var express = require('express');
var datastore = require('./lib/datastore');


var router = express.Router();
var people = datastore('people');

var subscriptions = [];


router.get('/', function(req, res) {
    res.render('index.html');
});


router.get('/admin', function(req, res) {
    res.render('admin.html');
});


router.get('/person/:id', function(req, res) {
    var query = [['filter', 'id', '=', parseInt(req.params.id)]];
    people.query(query).then(function(results) {
        res.render('person.html', { person: results[0] });
    });
});


router.post('/subscribe', function(req, res) {
    var id = req.body.id;
    if (subscriptions.indexOf(id) === -1) {
        subscriptions.push(id);
    }
    res.status(200).end();
});


module.exports = router;
