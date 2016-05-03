self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('the-machine').then(function(cache) {
            cache.addAll([
                '/',
                '/static/stylesheets/main.css',
                '/static/javascripts/main.js',
                '/service-worker.js',
                '/manifest.json'
            ]);
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
                if (event.request.url.indexOf('swcache=false') === -1) {
                    console.log('CACHING REQUEST', event.request);
                    var clonedResponse = fetchedResponse.clone();
                    return caches.open('the-machine')
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
