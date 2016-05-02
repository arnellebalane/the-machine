var express = require('express');
var datastore = require('./lib/datastore');


var router = express.Router();
var people = datastore('people');


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


module.exports = router;
