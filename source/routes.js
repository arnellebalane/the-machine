var express = require('express');
var request = require('request');
var datastore = require('./lib/datastore');
var config = require('./config');


var router = express.Router();
var people = datastore('people');
var subscriptions = datastore('subscriptions');
var messages = datastore('messages');


router.get('/', function(req, res) {
    res.render('index.html');
});


router.get('/admin', function(req, res) {
    res.render('admin.html');
});


router.get('/search', function(req, res) {
    var query = [['filter', 'name', '=', humanize(req.query.query)]];
    people.query(query).then(function(results) {
        if (results.length) {
            res.redirect('/person/' + results[0].id);
        } else {
            res.redirect('/');
        }
    });
});


router.get('/person/:id', function(req, res) {
    var query = [['filter', 'id', '=', parseInt(req.params.id)]];
    people.query(query).then(function(results) {
        res.render('person.html', { person: results[0] });
    });
});


router.get('/subscribe', function(req, res) {
    var id = req.query.id;
    var query = [['filter', 'id', '=', id]];
    subscriptions.query(query)
        .then(function(results) {
            if (results.length === 0) {
                return subscriptions.create({ id: id });
            }
            return results[0];
        })
        .then(function(subscription) {
            res.status(200).end();
        });
});


router.get('/unsubscribe', function(req, res) {
    var query = [['filter', 'id', '=', req.query.id]];
    subscriptions.query(query)
        .then(function(results) {
            if (results.length) {
                return subscriptions.delete(results[0].key.id);
            }
            return {};
        })
        .then(function(key) {
            res.status(200).end();
        });
});


router.post('/notify', function(req, res) {
    subscriptions.all().then(function(results) {
        if (results.length > 0) {
            var registrationIds = results.map(function(subscription) {
                return subscription.id;
            });

            getRandomPerson().then(function(person) {
                var options = {
                    url: 'https://android.googleapis.com/gcm/send',
                    headers: {
                        Authorization: 'key=' + config.get('GCM_API_KEY')
                    },
                    body: {
                        registration_ids: registrationIds,
                        notification: {
                            title: 'We have a new number',
                            body: person.name,
                            icon: '/static/images/logo.png'
                        }
                    },
                    json: true

                };
                request.post(options);
            });
        }
    });
    res.status(200).end();
});


router.get('/message', function(req, res) {
    res.render('message.html');
});


router.post('/message', function(req, res) {
    var message = { message: req.body.message };
    messages.create(message).then(function() {
        res.redirect('/message');
    });
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


function humanize(string) {
    return string.split(/\s+/g)
        .map(function(word) {
            return word[0].toUpperCase() + word.substring(1).toLowerCase();
        })
        .join(' ');
}


module.exports = router;
