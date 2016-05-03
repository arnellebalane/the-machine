var CACHE_NAME = 'the-machine';


self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            cache.addAll([
                '/',
                '/message',
                '/static/stylesheets/main.css',
                '/static/javascripts/main.js',
                '/manifest.json'
            ]);
        })
    );
});


self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(key) {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});


self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(function(fetchedResponse) {
                if (event.request.method === 'GET'
                && event.request.url.indexOf('swcache=false') === -1) {
                    var clonedResponse = fetchedResponse.clone();
                    return caches.open(CACHE_NAME)
                        .then(function(cache) {
                            return cache.put(event.request, clonedResponse);
                        })
                        .then(function() {
                            return fetchedResponse;
                        });
                }
                return fetchedResponse;
            });
        })
    );
});


self.addEventListener('push', function(event) {
    event.waitUntil(
        self.registration.showNotification('The Machine', {
            body: 'We have a new number',
            icon: '/static/images/logo.png'
        })
    );
});


self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow('/'));
});


self.addEventListener('sync', function(event) {
    event.waitUntil(
        getAllMessages()
            .then(function(messages) {
                return Promise.all(messages.map(function(message) {
                    var request = new Request('/message', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ message: message.message })
                    });
                    return fetch(request).catch(function(error) {
                        console.error('Error sending message', error);
                    });
                }));
            })
            .then(function() {
                deleteAllMessages();
            })
            .catch(function(error) {
                console.log('Background sync error', error);
            })
    );
});





var DB_NAME = 'message-storage';

var idb = indexedDB.open(DB_NAME, 1);
var db;

idb.onsuccess = function(e) {
    db = e.target.result;
};


function getAllMessages() {
    return new Promise(function(resolve, reject) {
        var transaction = db.transaction(['messages'], 'readonly');
        var objectStore = transaction.objectStore('messages');
        var cursorRequest = objectStore.openCursor();
        var items = [];

        cursorRequest.onsuccess = function(e) {
            var cursor = e.target.result;
            if (cursor) {
                items.push(cursor.value);
                cursor.continue();
            } else {
                resolve(items);
            }
        };
    });
}


function deleteAllMessages() {
    return new Promise(function(resolve, reject) {
        var transaction = db.transaction(['messages'], 'readwrite');
        var objectStore = transaction.objectStore('messages');
        var request = objectStore.clear();
        request.onsuccess = resolve;
    });
}
