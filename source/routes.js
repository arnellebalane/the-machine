var express = require('express');
var request = require('request');
var datastore = require('./lib/datastore');
var config = require('./config');


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


router.post('/notify', function(req, res) {
    if (subscriptions.length) {
        getRandomPerson().then(function(person) {
            var options = {
                url: 'https://android.googleapis.com/gcm/send',
                headers: {
                    Authorization: 'key=' + config.get('GCM_API_KEY')
                },
                body: {
                    registration_ids: subscriptions,
                    notification: {
                        title: 'We have a new number.',
                        body: person.name,
                        icon: person.image
                    }
                },
                json: true

            };
            request.post(options);
        });
    }
    res.status(200).end();
});


function getRandomPerson() {
    var id = Math.floor(Math.random() * 100) + 1;
    var query = [
        ['filter', 'id', '=', id],
        ['limit', 1]
    ];
    return people.query(query).then(function(results) {
        return results[0];
    });
}


module.exports = router;
